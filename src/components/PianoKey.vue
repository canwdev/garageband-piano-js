<script lang="ts">
import {KeyType} from '@/enum/index'
import {onMounted, ref, toRefs, watch} from 'vue'

export default {
  props: {
    keyType: {
      type: Number,
      default: KeyType.WHITE,
    },
    label: {
      type: String,
      default: '',
    },
    extraLabel: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['onPress', 'onRelease'],
  setup(props, {emit}) {
    const {active} = toRefs(props)
    const buttonRef = ref()
    const pressed = ref(false)
    watch(active, (val) => {
      pressed.value = val
    })

    const keyPressed = (event) => {
      if (event.buttons === 1) {
        if (!pressed.value) {
          emit('onPress', buttonRef.value)
          pressed.value = true
        }
      }
    }
    const keyReleased = () => {
      if (pressed.value) {
        emit('onRelease', buttonRef.value)
        pressed.value = false
      }
    }
    onMounted(() => {
      // const isTouch = ('ontouchstart' in window)
      const btn = buttonRef.value

      btn.addEventListener('mousedown', keyPressed)
      btn.addEventListener('mouseup', keyReleased)

      btn.addEventListener('mouseover', keyPressed)
      btn.addEventListener('mouseleave', keyReleased)
    })
    return {
      pressed,
      buttonRef,
    }
  },
}
</script>

<template>
  <button
    ref="buttonRef"
    class="key"
    :class="{
      black: keyType === 1,
      custom: keyType === 2,
      hidden: keyType === -1,
      pressed: pressed,
      small,
    }"
  >
    <span class="inner">
      {{ label }} <sub>{{ extraLabel }}</sub>
    </span>
  </button>
</template>

<style lang="scss" scoped>
$key_color_white: #dddddd;
$key_color_black: #2e2e2e;

@mixin keyStyle() {
  display: inline-block;
  border: 1px solid $key_color_border;
  background: $key_color_white;
  color: #000;
  font-weight: 500;
  width: 45px;
  height: 96px;
  border-radius: 3px;
  padding: 2px 5px;
  box-sizing: border-box;
  user-select: none;
  outline: none;
}

.key {
  @include keyStyle();

  &.small {
    height: 40px;
    width: 30px;

    &.black {
      height: 30px;
      transform: translate(-15px, -53%);

      &::before {
        width: 30px;
      }
    }

    .inner {
      font-size: 12px;
      transform: scale(0.7);
      transform-origin: left bottom;

      sub {
        transform: scale(0.8);
      }
    }
  }

  &.custom {
    height: 45px;
  }

  &.hidden {
    display: none;
  }

  &:active,
  &.pressed {
    background: darken($key_color_white, 10);
  }

  &.black {
    width: 0;
    height: 51px;
    padding: 0;
    border: none;
    position: relative;
    z-index: 2;
    color: #fff;
    transform: translate(-23px, -86%);
    margin-left: 0 !important;

    .inner {
      padding: 2px 5px;
      box-sizing: border-box;
    }

    &::before {
      content: ' ';
      position: absolute;
      top: 0;
      left: 0;
      @include keyStyle();
      background: $key_color_black;
      border-color: $key_color_black;
      height: 100%;
    }

    &:active,
    &.pressed {
      &::before {
        background: lighten($key_color_black, 10);
      }
    }
  }

  .inner {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;

    sub {
      font-size: 14px;
      bottom: 5px;
    }
  }
}
</style>
