<template>
  <button
      ref="button"
      class="key"
      :class="{black: keyType === 1, custom: keyType === 3, active: active}"
  >
    <div class="inner">
      {{ label }}
      <span v-if="extraLabel" class="extra-label">{{extraLabel}}</span>
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

  .key
    display inline-block
    border: 1px solid $key_color_border
    background $key_color_white
    color: #000
    font-weight: 500
    width 45px
    height 96px
    border-radius 3px
    padding 2px 5px
    box-sizing border-box
    user-select none
    z-index 1
    &.custom
      height 45px

    &:active, &.active
      background darken($key_color_white, 10)
    &.black
      background $key_color_black
      border-color $key_color_black
      color #fff
      height 51px
      z-index 2
      &:active, &.active
        background lighten($key_color_black, 10)
    .inner
      position: relative
      width 100%
      height 100%
      display flex
      align-items flex-end
      justify-content flex-start
      .extra-label
        position: absolute
        right 0
        top 0
        font-size 12px

  /**/
</style>
