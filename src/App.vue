<template>
  <div id="app">
    <ForkMeRibbon/>
    <div class="background-effects">
      <canvas ref="canvasVisualizer"></canvas>
      <div class="config-wrap">
        <button @click="toogleEffect">背景特效：{{ visualizerOn ? '开' : '关' }}</button>
      </div>
    </div>
    <div v-show="loadingCount+1 <= AUDIO_COUNT" class="piano-loading">
      <p>加载音频素材 {{ loadingCount }}/{{ AUDIO_COUNT }}</p>
    </div>
    <div class="piano-body">
      <h5 ref="dragBar">音乐键入 - 大钢琴</h5>

      <div class="info-wrap">
        <div class="desc">音量：{{ volume.toFixed(2) * 100 }}%</div>
        <div class="desc">偏移：{{ keyOffset }} / {{ keyCount }}</div>
        <div class="desc pro">八度音程：{{ octave }}</div>
        <div class="desc pro2">按下：{{ keyPressed.join(' ') }}</div>
      </div>

      <div class="keyboard-wrap-full">
        <div v-for="(oct, index) in pianoNoteTable" :key="index" class="octave">
          <PianoKey
              small
              v-for="(v, i) in Object.entries(oct)"
              :key="i"
              :label="v[0]"
              :extra-label="index.toString()"
              :key-type="v[0].length === 1 ? 0 : 1"
          />
        </div>
      </div>

      <div class="keyboard-wrap-lite">
        <PianoKey
            v-for="(v, i) in keyboard18Keys"
            :key="i"
            :label="v.label"
            :key-type="v.type"
            :active="keyPressed.indexOf(v.label) !== -1"
            @handle-click="playAudio(i)"
        />
      </div>
      <div class="control-wrap">
        <PianoKey
            v-for="(v, i) in controlKeys"
            :key="i"
            :label="v.label"
            :key-type="v.type"
            :extra-label="v.extraLabel"
            :active="keyPressed.indexOf(v.label) !== -1"
            @handle-click="setSettings(v.label)"
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
      keyOffset: KEY_OFFSET,
      volume: VOLUME,
      audioSourceTypeMP3: false,  // 音频素材是MP3或是使用createOscillator生成
      pianoNoteTable,
      keyboard18Keys: [
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
        {label: 'Z', extraLabel: '-', type: 3},
        {label: 'X', extraLabel: '+', type: 3},
        {label: 'C', extraLabel: '-', type: 3},
        {label: 'V', extraLabel: '+', type: 3},
      ],
      keyPressed: [], // 维护按下按键的数组
      visualizerOn: JSON.parse(localStorage.getItem('visualizerOn') || true)
    }),
    computed: {
      // 八度音程表示
      octave() {

        return 'C' + (Math.floor(this.keyOffset / SEMITONE) + 1)
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
      },
      visualizerOn(nv) {
        if (nv) {
          canvasVisualizer.start()
        } else {
          canvasVisualizer.stop()
        }
        localStorage.setItem('visualizerOn', nv)
      }
    },
    mounted() {
      console.log(pianoNoteTable)
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
          alert('您的浏览器不支持 Web Audio API，程序能无法正常运作')
          return
        }

        // 创建音频上下文对象
        this.audioContext = new AudioContext()
        // 创建增益节点
        this.gainNode = this.audioContext.createGain()
        // 设置初始音量
        this.gainNode.gain.value = VOLUME
        this.keyAudiosData = []

        // 创建化可视化分析器节点（此节点直接连接到音频出口）
        this.audioAnalyser = this.audioContext.createAnalyser()
        // 通过管道（connect）把节点和出口（destination）连接
        this.audioAnalyser.connect(this.audioContext.destination)
        // 初始化可视化背景
        canvasVisualizer.init(this.$refs.canvasVisualizer, this.audioAnalyser)

        // 获取所有音频
        if (this.audioSourceTypeMP3) {
          // 加载MP3数据为buffer
          for (let i = 1; i <= AUDIO_COUNT; i++) {
            const buffer = await getAudioBuffer(this.audioContext, require(`@/assets/pianoKeyAudio/${i}.mp3`)).catch(e => {
              console.error(e)
            })

            this.keyAudiosData[i] = buffer
            this.loadingCount = i
          }
        } else {
          // 加载pianoNoteTable
          let tI = 1
          pianoNoteTable.forEach(i => {
            const t = Object.entries(i)
            t.forEach(v => {
              this.keyAudiosData[tI] = v[1]
              this.loadingCount = tI
              tI++
            })
          })

        }

        if (this.visualizerOn) canvasVisualizer.start()

        window.addEventListener('keydown', this.handleKey)
        window.addEventListener('keyup', this.handleKey)
      },
      destroyPiano() {
        window.removeEventListener('keydown', this.handleKey)
        window.removeEventListener('keyup', this.handleKey)

        canvasVisualizer.stop()
      },
      handleKey(evt) {
        const key = evt.key.toUpperCase()

        // 遍历键盘数组
        const i = this.keyboard18Keys.findIndex(v => {
          return v.label === key
        })
        // 遍历功能键数组
        const fnI = this.controlKeys.findIndex(v => {
          return v.label === key
        })

        if (i !== -1 || fnI !== -1) { // 处理功能键及键按下状态
          const ki = this.keyPressed.indexOf(key) // 是否在按下的列表中

          if (evt.type === 'keydown') {
            // 增加这个按键
            if (ki === -1) {
              this.keyPressed.push(key)
            } else {
              // 防止重复触发
              return
            }
            // console.log(key, i)
          } else { // keyup
            // 移除按键
            if (ki !== -1) {
              this.keyPressed.splice(ki, 1)
            }
          }
        }

        if (i !== -1) { // 仅处理声音播放
          if (evt.type === 'keydown') {
            this.playAudio(i)
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
      },
      playAudio(i) {
        i += this.keyOffset

        const data = this.keyAudiosData[i]
        console.log(data)
        if (data) {
          // 由于 AudioBufferSourceNode.start() 只能使用一次，所以每次播放时都要重新创建
          let src = null

          if (this.audioSourceTypeMP3) {
            src = this.audioContext.createBufferSource()
            src.buffer = data
          } else {
            src = this.audioContext.createOscillator()
            src.type = 'square'
            src.frequency.value = data
          }

          // 连接增益节点
          src.connect(this.gainNode)
          // 连接可视化分析节点
          this.gainNode.connect(this.audioAnalyser)
          // 音频流出
          src.start()

          return src
        }

      },
      toogleEffect() {
        this.visualizerOn = !this.visualizerOn
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
        margin-bottom: 10px

        .desc
          display inline-block
          padding 3px 4px
          background $color_blue
          color: #fff
          font-size 12px
          border-radius 3px

          &.pro
            background $color_purple

          &.pro2
            background $color_green

          & + .desc
            margin-left: 5px

      .key + .key
        margin-left: 2px

      .keyboard-wrap-lite {
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


      .keyboard-wrap-full {
        margin-top: 10px
        margin-bottom: 10px
        width auto
        height 50px
        overflow-x auto
        overflow-y hidden
        white-space nowrap
        .octave {
          display inline-block
          &+.octave {
            padding-left: 5px
          }
        }
      }
  /**/
</style>
