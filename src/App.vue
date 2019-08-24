<template>
  <div id="app" class="piano-body">
    <h5>音乐键入 - 无名大钢琴</h5>

    <div class="info-wrap">
      <div class="desc">音量：{{ volume.toFixed(2) * 100 }}%</div>
      <div class="desc">偏移：{{ keyOffset }} / {{ keyCount }}</div>
      <div class="desc pro">八度音程：{{ octave }}</div>
      <div class="desc pro2">按下：{{ keyPressed.join(' ') }}</div>
    </div>

    <div class="keyboard-wrap">
      <PianoKey
          v-for="(v, i) in keyboardLayout"
          :key="i"
          :label="v.label"
          :key-type="v.type"
          :active="keyPressed.indexOf(v.label) !== -1"
          @mousedown.native="playAudio(i)"
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
          @mousedown.native="setSettings(v.label)"
      />
    </div>
  </div>
</template>

<script>
  import PianoKey from '@/components/PianoKey'

  const KEY_OFFSET = parseFloat(localStorage.getItem('KEY_OFFSET')) || 52 // 初始音频偏移量
  const VOLUME = parseFloat(localStorage.getItem('VOLUME')) || 0.5 // 初始音量
  const SEMITONE = 12 // 两个半音的距离
  const AUDIO_COUNT = 88
  const keyAudios = [] // 加载音频文件
  for (let i = 1; i <= AUDIO_COUNT; i++) {
    let audio = keyAudios[i] = new Audio(require(`@/assets/pianoKeyAudio/${i}.mp3`))
    audio.preload = 'auto'
    audio.volume = VOLUME
  }
  console.log('加载音频完成', {keyAudios})

  export default {
    components: {
      PianoKey,
    },
    data: () => ({
      keyCount: AUDIO_COUNT,
      keyOffset: KEY_OFFSET,
      volume: VOLUME,
      keyboardLayout: [
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
        {label: 'C', extraLabel: '🔈-', type: 3},
        {label: 'V', extraLabel: '🔈+', type: 3},
      ],
      keyPressed: [] // 维护按下按键的数组
    }),
    computed: {
      // 八度音程表示
      octave() {

        return 'C' + Math.floor(this.keyOffset/SEMITONE)
      }
    },
    watch: {
      volume(nv) {
        const vol = nv.toFixed(1)
        // 更新每一个音的音量
        for (let i = 1; i <= AUDIO_COUNT; i++) {
          keyAudios[i].volume = vol
        }
        // 保存设置
        localStorage.setItem('VOLUME', vol)
      },
      keyOffset(nv) {
        localStorage.setItem('KEY_OFFSET', nv)
      }
    },
    mounted() {
      window.addEventListener('keydown', this.handleKey)
      window.addEventListener('keyup', this.handleKey)
    },
    methods: {
      handleKey(evt) {
        const key = evt.key.toUpperCase()

        // 遍历键盘数组
        const i = this.keyboardLayout.findIndex(v => {
          return v.label === key
        })
        // 遍历功能键数组
        const fnI = this.controlKeys.findIndex(v => {
          return v.label === key
        })

        if (i !== -1) { // 仅处理声音播放
          if (evt.type === 'keydown') {
            this.playAudio(i)
          }
        }

        if (i !== -1 || fnI !== -1) { // 处理功能键及键按下状态
          const ki = this.keyPressed.indexOf(key) // 是否在按下的列表中

          if (evt.type === 'keydown') {
            // 增加这个按键
            if (ki === -1) {
              this.keyPressed.push(key)
            }
            // console.log(key, i)
          } else { // keyup
            // 移除按键
            if (ki !== -1) {
              this.keyPressed.splice(ki, 1)
            }
          }
        }

        if (fnI !== -1 && evt.type === 'keyup') { // 仅处理功能键
          this.setSettings(key)
        }


      },
      // 调整设置
      setSettings(keyLabel) {
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

        const audio = keyAudios[i]
        if (audio.currentTime !== 0) {
          audio.pause()
          audio.currentTime = 0
        }
        audio.play()
      },
    }
  }
</script>

<style lang="stylus" scoped>
  $color_blue = #2EB1D0
  $color_purple = #AF55D7
  $color_green = #4DD584
  $color_yellow = #DFD565
  $color_orange = #E8A44A

  .piano-body
    border-radius 8px
    box-shadow 0 10px 40px rgba(0, 0, 0, 0.4)
    width 515px
    padding 50px
    padding-top: 0
    margin 0 auto
    background $piano_background

    & > h5
      text-align: center
      font-size 13px
      font-weight: 600
      padding 5px 0 10px

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

    .keyboard-wrap
      position: relative

      .key.black
        position: absolute
        transform translateX(-15px)

    .control-wrap
      margin-top: 2px
      padding-left: 25px

      .key:nth-child(1), .key:nth-child(2)
        background $color_yellow

        &:active, &.active
          background darken($color_yellow, 10)

      .key:nth-child(3), .key:nth-child(4)
        background $color_orange

        &:active, &.active
          background darken($color_orange, 10)

  /**/
</style>
