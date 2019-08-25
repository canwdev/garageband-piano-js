<template>
  <button
      ref="button"
      class="key"
      :class="{black: keyType === 1, custom: keyType === 3, active: active, small}"
  >
    <div class="inner">
      {{ label }} <sub>{{extraLabel}}</sub>
    </div>
  </button>
</template>

<script>
  export default {
    props: {
      keyType: {
        type: Number,
        default: 0  // 0 为白键，1 为黑键
      },
      label: {
        type: String,
        default: 'A'
      },
      extraLabel: {
        type: String,
        default: ''
      },
      active: {
        type: Boolean,
        default: false
      },
      small: {
        type: Boolean,
        default: false
      }
    },
    mounted() {
      const isTouch = ('ontouchstart' in window)

      this.$refs.button.addEventListener(isTouch ? 'touchstart' : 'mousedown', () => {
        this.$emit('handle-click')
      })
    }
  }
</script>

<style lang="stylus" scoped>
  $key_color_white = #DDDDDD
  $key_color_black = #2E2E2E

  $keyStyle()
    display inline-block
    border 1px solid $key_color_border
    background $key_color_white
    color #000
    font-weight 500
    width 45px
    height 96px
    border-radius 3px
    padding 2px 5px
    box-sizing border-box
    user-select none

  .key
    $keyStyle()

    &.small
      height: 40px
      width 30px

      &.black
        height: 30px
        transform translate(-15px, -53%)

        &::before
          width: 30px;

      .inner
        font-size 12px
        transform scale(0.7)
        transform-origin left bottom

    &.custom
      height 45px

    &:active, &.active
      background darken($key_color_white, 10)

    &.black
      width 0
      height 51px
      padding 0
      border: none
      position: relative
      z-index 2
      color #fff
      transform translate(-23px, -86%)
      margin-left: 0 !important

      .inner
        padding 2px 5px
        box-sizing border-box


      &::before
        content " "
        position: absolute
        top: 0
        left: 0
        $keyStyle()
        background $key_color_black
        border-color $key_color_black
        height 100%

      &:active, &.active
        &::before
          background lighten($key_color_black, 10)

    .inner
      position: relative
      width 100%
      height 100%
      display flex
      align-items flex-end
      justify-content flex-start
      sub
        font-size 12px
        bottom 5px
  /**/
</style>
