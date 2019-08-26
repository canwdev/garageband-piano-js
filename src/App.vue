<template>
  <div id="app">
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
      <h5 ref="dragBar">音乐键入 - Web Audio API 大钢琴</h5>

      <div class="info-wrap">
        <div>
          <div class="desc">音量：{{ volume.toFixed(2) * 100 }}%</div>
          <div class="desc">偏移：{{ keyOffset }} / {{ keyCount }}</div>
          <div class="desc pro">八度音程：C{{ octave }}</div>
          <div class="desc pro2">按下：{{ keyPressedPC.join(' ') }}</div>
        </div>

        <div class="desc">MP3音色：<input type="checkbox" v-model="toneSourceTypeMP3"></div>

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

<script>
  import PianoKey from '@/components/PianoKey'
  import ForkMeRibbon from '@/components/ForkMeRibbon'
  import {getAudioBuffer, setDraggable} from "@/utils/index"
  import canvasVisualizer from "@/utils/visualizer"

  const KEY_OFFSET = parseFloat(localStorage.getItem('KEY_OFFSET')) || 52 // 初始音频偏移量
  const VOLUME = parseFloat(localStorage.getItem('VOLUME')) || 1 // 初始音量
  const SEMITONE = 12 // 两个半音的距离
  const AUDIO_COUNT = 88

  import pianoNoteTable from '@/utils/pianoNoteTable'

  export default {
    components: {
      PianoKey,
      ForkMeRibbon
    },
    data: () => ({
      AUDIO_COUNT,
      loadingCount: 0,
      keyCount: AUDIO_COUNT,
      keyOffset: null,
      volume: VOLUME,
      toneSourceTypeMP3: JSON.parse(localStorage.getItem('toneSourceTypeMP3') || false),  // 音频素材是MP3或是使用createOscillator生成
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

        // 平滑滚动到相应八度
        const fullKeyboard = this.$refs.fullKeyboard
        const octaveEl = this.$refs.fullKeyboardOctaves[this.octave]
        //.scrollIntoView({ block: 'end',  behavior: 'smooth' })
        fullKeyboard.scrollTo({
          left: octaveEl.offsetLeft - 50,
          behavior: "smooth"
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
      toneSourceTypeMP3(nv) {
        localStorage.setItem('toneSourceTypeMP3', nv)

        this.destroyPiano()
        this.initPiano()
      }
    },
    mounted() {
      this.keyOffset = KEY_OFFSET

      // 额外的功能键
      const eKeys = [1,2,3,4,5,6,7]
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
            const buffer = await getAudioBuffer(this.audioContext, require(`@/assets/pianoKeyAudio/${i}.mp3`)).catch(e => {
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
          this.keyOffset = (Number(keyLabel)-1) * SEMITONE + 4
        }
      },
      playTone(data, name) {
        clearTimeout(this.stopToneTimeout)
        // 由于 AudioBufferSourceNode.start() 只能使用一次，所以每次播放时都要重新创建
        let src = null
        const audioContext =  this.audioContext

        if (this.toneSourceTypeMP3) {
          src = audioContext.createBufferSource()
          src.buffer = data
        } else {
          // 创建一个OscillatorNode, 它表示一个周期性波形（振荡），基本上来说创造了一个音调
          src = audioContext.createOscillator()
          // 指定音调的类型，其他还有 sine|square|sawtooth|triangle 等
          src.type = 'triangle'
          // 设置当前播放声音的频率，也就是最终播放声音的调调
          src.frequency.value = data
        }

        // 创建当前音调的增益节点，用于 stopTone 淡出效果
        const currentGain = audioContext.createGain()
        src.connect(currentGain)

        if (!this.toneSourceTypeMP3) { // 仅为生成的波形制造淡入淡出效果
          // 第0秒时音量为0
          currentGain.gain.setValueAtTime(0, audioContext.currentTime)
          // 第0.1秒时音量为1，淡入
          // AudioParam.linearRampToValueAtTime()
          currentGain.gain.exponentialRampToValueAtTime(1, audioContext.currentTime + 0.05)
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
      handleFullKeyboardPress(el ,label, octaveIndex) {
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
        return  keys.indexOf(pressedEl)
      }
    }
  }
</script>

<style lang="stylus" scoped>
  $color_blue = #2EB1D0
  $color_purple = #AF55D7
  $color_green = #4DD584
  $color_yellow = #DFD565
  $color_orange = #E8A44A

  $window_radius = 8px

  #app
    min-width 700px
    height 100%
    display: flex;
    align-items center;
    justify-content center;
    position: relative

    .background-effects
      position: absolute
      z-index 0
      background url("~@/assets/images/bg.jpg") no-repeat center / cover
      top 0
      left 0
      right 0
      bottom 0

      & > .config-wrap
        position: absolute
        right 10px
        bottom 10px

        button
          border-radius 5px
          padding 5px
          font-size 12px
          background rgba(0, 0, 0, 0.51)
          color: #fff
          border: none

      & > canvas
        width 100%
        height 100%
        background rgba(0, 0, 0, 0.09)
        margin-bottom: -10px

    .piano-loading
      position: fixed
      top 0
      left 0
      right 0
      bottom 0
      background rgba(0, 0, 0, 0.7)
      z-index 999
      color #fff
      font-weight: bold
      display flex
      align-items center
      justify-content center
      flex-direction column

    .piano-body
      position: absolute
      z-index 1
      flex-shrink: 0
      border-radius $window_radius
      width 515px
      padding 50px
      padding-top: 0
      margin 0 auto
      background $piano_background
      backdrop-filter: saturate(180%) blur(20px)
      user-select none
      $macBoxShadow()

      & > h5
        user-select none
        background linear-gradient(180deg, #fff, #ddd)
        border 1px solid $key_color_border
        border-top: none
        border-radius $window_radius
        border-top-left-radius 0
        border-top-right-radius 0
        margin 0
        text-align: center
        font-size 13px
        font-weight: 600
        padding 5px 0
        margin-bottom: 30px

      .info-wrap
        display flex
        align-items center
        justify-content space-between
        margin-bottom: 10px

        .desc
          display inline-block
          padding 3px 4px
          background $color_blue
          color: #fff
          font-size 12px
          border-radius 3px

          input
            height: 12px
            padding 0

          &.pro
            background $color_purple

          &.pro2
            background $color_green

          & + .desc
            margin-left: 5px

      .key + .key
        margin-left: 2px

      .lite-keyboard-wrap {
        position: relative
        .key.black {
        //  position: absolute
        //  transform translateX(-15px)
        }
      }

      .control-wrap {
        margin-top: 2px
        padding-left: 25px

        .key:nth-child(1), .key:nth-child(2) {
          background $color_yellow
          &:active, &.active {
            background darken($color_yellow, 10)
          }
        }

        .key:nth-child(3), .key:nth-child(4) {
          background $color_orange
          &:active, &.active {
            background darken($color_orange, 10)
          }
        }
      }


      .full-keyboard-wrap {
        margin-top: 10px
        margin-bottom: 10px
        width auto
        height 53px
        overflow-x auto
        overflow-y hidden
        white-space nowrap
        .octave {
          display inline-block
          border 1px solid transparent
          border-radius 3px
          overflow: hidden;
          &+.octave {
            margin-left: 4px
          }
          &.active {
            border-color #ffeb3b
          }
        }
      }
  /**/
</style>
