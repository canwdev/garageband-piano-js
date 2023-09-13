<script lang="ts">
import {defineComponent} from 'vue'
import ForkMeRibbon from "./components/ForkMeRibbon.vue";
import PianoKey from "@/components/PianoKey.vue";
import '@/styles/main.scss'
import pianoNoteTable from "@/utils/pianoNoteTable.ts";
import {getAudioBuffer, setDraggable} from "@/utils/index.ts"
import canvasVisualizer from "@/utils/visualizer"

const KEY_OFFSET = parseFloat(localStorage.getItem('KEY_OFFSET')) || 52 // 初始音频偏移量
const VOLUME = parseFloat(localStorage.getItem('VOLUME')) || 1 // 初始音量
const SEMITONE = 12 // 两个半音的距离
const AUDIO_COUNT = 88

export default defineComponent({
  name: 'App',
  components: {
    ForkMeRibbon,
    PianoKey
  },
  data: () => ({
    AUDIO_COUNT,
    loadingCount: 0,
    keyCount: AUDIO_COUNT,
    keyOffset: null,
    volume: VOLUME,
    selectedToneType: localStorage.getItem('selectedToneType') || 'sine',
    optionsToneTypes: [ // https://codepen.io/gregh/pen/LxJEaj
      { isMP3: false ,value: 'sine', label: '正弦波(sine)'},
      { isMP3: false ,value: 'square', label: '方波(square)'},
      { isMP3: false ,value: 'sawtooth', label: '锯齿波(sawtooth)'},
      { isMP3: false ,value: 'triangle', label: '三角波(triangle)'},
      { isMP3: true ,value: 'pianoKeyAudio', label: '钢琴原声(LowRes)'},
      { isMP3: true ,value: 'pianoKeyAudioFL', label: '钢琴原声(FL)'},
    ],
    toneSourceTypeMP3: false,  // 音频素材是MP3或是使用createOscillator生成
    pianoNoteTable, // 由JS定义的频率列表，可用于定义全尺寸钢琴键盘（88键）
    liteKeyboardKeys: [
      {label: 'A', type: 0},
      {label: 'W', type: 1},
      {label: 'S', type: 0},
      {label: 'E', type: 1},
      {label: 'D', type: 0},
      {label: 'F', type: 0},
      {label: 'T', type: 1},
      {label: 'G', type: 0},
      {label: 'Y', type: 1},
      {label: 'H', type: 0},
      {label: 'U', type: 1},
      {label: 'J', type: 0},
      {label: 'K', type: 0},
      {label: 'O', type: 1},
      {label: 'L', type: 0},
      {label: 'P', type: 1},
      {label: ';', type: 0},
      {label: '\'', type: 0},
    ],
    controlKeys: [
      {label: 'Z', extraLabel: '﹣', type: 2},
      {label: 'X', extraLabel: '﹢', type: 2},
      {label: 'C', extraLabel: '﹣', type: 2},
      {label: 'V', extraLabel: '﹢', type: 2},
    ],
    keyPressedPC: [], // 维护按下PC键盘按键的数组
    visualizerOn: JSON.parse(localStorage.getItem('visualizerOn') || true)
  }),
  computed: {
    // 八度音程表示
    octave() {
      return Math.floor(this.keyOffset / SEMITONE) + 1
    }
  },
  watch: {
    volume(nv) {
      const vol = nv.toFixed(1)
      // 设置音量
      this.gainNode.gain.value = vol

      // 保存设置
      localStorage.setItem('VOLUME', vol)
    },
    keyOffset(nv) {
      localStorage.setItem('KEY_OFFSET', nv)

      // 滚动到相应八度
      const fullKeyboard = this.$refs.fullKeyboard
      const octaveEl = this.$refs.fullKeyboardOctaves[this.octave]
      //.scrollIntoView({ block: 'end',  behavior: 'smooth' })
      fullKeyboard.scrollTo({
        left: octaveEl.offsetLeft - 50,
        behavior: "smooth" // instant
      })

    },
    visualizerOn(nv) {
      if (nv) {
        canvasVisualizer.start()
      } else {
        canvasVisualizer.stop()
      }
      localStorage.setItem('visualizerOn', nv)
    },
    selectedToneType(nv) {
      localStorage.setItem('selectedToneType', nv)

      this.toneSourceTypeMP3 = this.optionsToneTypes.filter(v => v.value === this.selectedToneType)[0].isMP3 || false

      this.destroyPiano()
      this.initPiano()
    }
  },
  mounted() {
    const isTouch = ('ontouchstart' in window)
    if (isTouch) {
      alert('请使用鼠标或键盘输入')
    }

    this.keyOffset = KEY_OFFSET

    this.toneSourceTypeMP3 = this.optionsToneTypes.filter(v => v.value === this.selectedToneType)[0].isMP3 || false

    // 额外的功能键
    const eKeys = [1, 2, 3, 4, 5, 6, 7]
    eKeys.forEach(v => {
      this.controlKeys.push({
        label: v.toString(),
        type: -1
      })
    })

    this.initPiano()
    setDraggable(this.$refs.dragBar, this.$refs.dragBar.parentElement)
  },
  beforeDestroy() {
    this.destroyPiano()
  },
  methods: {
    async initPiano() {
      const AudioContext = window.AudioContext // Default
        || window.webkitAudioContext // Safari and old versions of Chrome
        || false;

      if (!AudioContext) {
        alert('您的浏览器不支持 Web Audio API，程序无法正常运作')
      }

      // 创建音频上下文对象
      this.audioContext = new AudioContext()
      // 创建增益节点，它可以控制音频的总音量
      this.gainNode = this.audioContext.createGain()
      // 设置初始音量
      this.gainNode.gain.value = VOLUME
      // 钢琴键盘音源列表，从1开始，一共有88个
      this.keyToneList = []
      // 维护正在播放音调的列表，用于控制短按
      this.playingTone = []
      this.stopToneTimeout = null

      // 创建化可视化分析器节点（此节点直接连接到音频出口）
      this.audioAnalyser = this.audioContext.createAnalyser()
      // 通过管道（connect）把节点和出口（destination）连接
      this.audioAnalyser.connect(this.audioContext.destination)
      // 初始化可视化背景
      canvasVisualizer.init(this.$refs.canvasVisualizer, this.audioAnalyser)

      // 获取所有音频
      if (this.toneSourceTypeMP3) {
        // 加载MP3数据为buffer
        for (let i = 1; i <= AUDIO_COUNT; i++) {
          const buffer = await getAudioBuffer(this.audioContext, require(`@/assets/${this.selectedToneType}/${i}.mp3`)).catch(e => {
            console.error(e)
          })

          this.keyToneList[i] = buffer
          this.loadingCount = i
        }
      } else {
        // 加载pianoNoteTable
        let number = 1
        pianoNoteTable.forEach(i => {
          const t = Object.entries(i)
          t.forEach(v => {
            this.keyToneList[number] = v[1]
            this.loadingCount = number
            number++
          })
        })

      }

      if (this.visualizerOn) canvasVisualizer.start()

      window.addEventListener('keydown', this.handlePCKeyboard)
      window.addEventListener('keyup', this.handlePCKeyboard)
    },
    destroyPiano() {
      window.removeEventListener('keydown', this.handlePCKeyboard)
      window.removeEventListener('keyup', this.handlePCKeyboard)

      canvasVisualizer.stop()
    },
    handlePCKeyboard(evt) {
      const key = evt.key.toUpperCase()

      // 遍历键盘数组
      const i = this.liteKeyboardKeys.findIndex(v => {
        return v.label === key
      })
      // 遍历功能键数组
      const fnI = this.controlKeys.findIndex(v => {
        return v.label === key
      })

      if (i !== -1 || fnI !== -1) { // 处理功能键及键按下状态
        const ki = this.keyPressedPC.indexOf(key) // 是否在按下的列表中

        if (evt.type === 'keydown') {
          // 增加这个按键
          if (ki === -1) {
            this.keyPressedPC.push(key)
            // console.log(this.keyPressedPC)
          } else {
            // 防止重复触发(重要！)
            return
          }
          // console.log(key, i)
        } else { // keyup
          // 移除按键
          if (ki !== -1) {
            this.keyPressedPC.splice(ki, 1)
          }
        }
      }

      if (i !== -1) { // 仅处理声音播放
        if (evt.type === 'keydown') {
          this.handleLiteKeyboardPress(i)
        } else {
          this.stopTone(i)
        }
      }

      if (fnI !== -1 && evt.type === 'keyup') { // 仅处理功能键
        this.setSettings(key)
      }
    },
    setSettings(keyLabel) { // 调整设置
      switch (keyLabel) {
        case 'Z':
          this.keyOffset = Math.max(4, this.keyOffset - SEMITONE)
          break;
        case 'X':
          this.keyOffset = Math.min(76, this.keyOffset + SEMITONE)
          break;
        case 'C':
          this.volume = Math.max(0, this.volume - 0.1)
          break;
        case 'V':
          this.volume = Math.min(1, this.volume + 0.1)
          break;
      }
      if (/[1-9]/.test(keyLabel)) {
        // 直接跳转相应的八度音程
        this.keyOffset = (Number(keyLabel) - 1) * SEMITONE + 4
      }
    },
    playTone(data, name) {
      clearTimeout(this.stopToneTimeout)
      // 由于 AudioBufferSourceNode.start() 只能使用一次，所以每次播放时都要重新创建
      let src = null
      const audioContext = this.audioContext

      if (this.toneSourceTypeMP3) {
        src = audioContext.createBufferSource()
        src.buffer = data
      } else {
        // 创建一个OscillatorNode, 它表示一个周期性波形（振荡），基本上来说创造了一个音调
        src = audioContext.createOscillator()
        // 指定音调的类型，其他还有 sine|square|sawtooth|triangle 等
        src.type = this.selectedToneType
        // 设置当前播放声音的频率，也就是最终播放声音的调调
        src.frequency.value = data
      }

      // 创建当前音调的增益节点，用于 stopTone 淡出效果
      const currentGain = audioContext.createGain()
      src.connect(currentGain)

      if (!this.toneSourceTypeMP3) { // 仅为生成的波形制造淡入淡出效果
        // 第0秒时音量为0（下面这行需要注释，否则 Firefox 会报错）
        // currentGain.gain.setValueAtTime(0, audioContext.currentTime)
        // 淡入
        currentGain.gain.exponentialRampToValueAtTime(1, audioContext.currentTime)
        // 1.5秒内声音慢慢降低，淡出
        currentGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.5);
      }

      // 连接总增益节点
      currentGain.connect(this.gainNode)
      // 连接可视化分析节点
      this.gainNode.connect(this.audioAnalyser)
      // 音频流出
      src.start(audioContext.currentTime)

      // 维护正在播放的列表
      this.playingTone[name] = {audio: src, gainNode: currentGain}
      return src
    },
    stopTone(name) { // 停止播放
      clearTimeout(this.stopToneTimeout)

      const tone = this.playingTone[name]

      if (tone) {
        // TODO: 延音踏板 TAB
        // 淡出效果
        tone.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 1);
        this.stopToneTimeout = setTimeout(() => {
          tone.audio.stop()
          this.playingTone[name] = null
        }, 1000)
      } else {
        console.warn('stopTone: named tone not exist: ' + name)
      }
    },
    toggleVisualizerOn() {
      this.visualizerOn = !this.visualizerOn
    },
    handleLiteKeyboardPress(index) {
      let toneIndex = index + this.keyOffset
      const data = this.keyToneList[toneIndex]
      if (data) {
        this.playTone(data, index)
      } else {
        console.warn('handleLiteKeyboardPress: index tone not exist: ' + toneIndex + ', The name is ' + index)
      }
    },
    handleFullKeyboardPress(el, label, octaveIndex) {
      // const octave = Object.assign({}, this.pianoNoteTable[[octaveIndex]])
      // const freq = octave[label]

      const index = this.getFullKeyboardPressedIndex(el) + 1
      const data = this.keyToneList[index]

      if (data) {
        this.playTone(data, index)
      } else {
        console.warn('handleFullKeyboardPress: index tone not exist: ' + index)
      }
    },
    handleFullKeyboardRelease(el) {
      const index = this.getFullKeyboardPressedIndex(el) + 1
      this.stopTone(index)
    },
    getFullKeyboardPressedIndex(pressedEl) {
      // 获取当前按键在 keyToneList 的索引
      const keys = this.$refs.fullKeyboardKeys.map(v => {
        return v.$el
      })
      return keys.indexOf(pressedEl)
    }
  }
})
</script>

<template>
  <div class="app-root">
    <ForkMeRibbon/>
    <div class="background-effects">
      <canvas ref="canvasVisualizer"></canvas>
      <div class="config-wrap">
        <button @click="toggleVisualizerOn">背景特效：{{ visualizerOn ? '开' : '关' }}</button>
      </div>
    </div>
    <div v-show="loadingCount+1 <= AUDIO_COUNT" class="piano-loading">
      <p>加载音频素材 {{ loadingCount }}/{{ AUDIO_COUNT }}</p>
    </div>
    <div class="piano-body">
      <h5 ref="dragBar">音乐键入 - {{ this.optionsToneTypes.filter(v => v.value === this.selectedToneType)[0].label }}</h5>

      <div class="info-wrap">
        <div>
          <div class="desc">音量：{{ volume.toFixed(2) * 100 }}%</div>
          <div class="desc">偏移：{{ keyOffset }} / {{ keyCount }}</div>
          <div class="desc pro">八度音程：C{{ octave }}</div>
          <div class="desc pro2" v-show="keyPressedPC.length>0">按下：{{ keyPressedPC.join(' ') }}</div>
        </div>

        <div class="desc pro3">音色：
          <select v-model="selectedToneType">
            <option v-for="v in optionsToneTypes" :value="v.value">{{ v.label }}</option>
          </select>
        </div>

      </div>

      <div class="full-keyboard-wrap" ref="fullKeyboard">
        <div
          ref="fullKeyboardOctaves"
          v-for="(oct, index) in pianoNoteTable"
          :key="index"
          class="octave"
          :class="{active: index === octave}"
        >
          <PianoKey
            ref="fullKeyboardKeys"
            small
            v-for="(v, subIndex) in Object.entries(oct)"
            :key="subIndex"
            :label="v[0]"
            :extra-label="index.toString()"
            :key-type="v[0].length === 1 ? 0 : 1"
            @handle-pressed="handleFullKeyboardPress"
            @handle-released="handleFullKeyboardRelease"
          />
        </div>
      </div>

      <div class="lite-keyboard-wrap">
        <PianoKey
          v-for="(v, i) in liteKeyboardKeys"
          :key="i"
          :label="v.label"
          :key-type="v.type"
          :active="keyPressedPC.indexOf(v.label) !== -1"
          @handle-pressed="handleLiteKeyboardPress(i)"
          @handle-released="stopTone(i)"
        />
      </div>

      <div class="control-wrap">
        <PianoKey
          v-for="(v, i) in controlKeys"
          :key="i"
          :label="v.label"
          :key-type="v.type"
          :extra-label="v.extraLabel"
          :active="keyPressedPC.indexOf(v.label) !== -1"
          @handle-pressed="setSettings(v.label)"
        />
      </div>

    </div>
  </div>
</template>

