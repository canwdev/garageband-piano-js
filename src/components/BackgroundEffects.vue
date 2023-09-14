<script lang="ts">
import {defineComponent, onBeforeUnmount, onMounted, ref, shallowRef, watch} from 'vue'
// import canvasVisualizer from '@/utils/visualizer'
import {useLocalStorageBoolean} from '@/hooks/use-local-storage.ts'

export default defineComponent({
  name: 'BackgroundEffects',
  setup() {
    const canvasRef = ref()
    const visualizerOn = useLocalStorageBoolean('visualizerOn', false)
    // watch(visualizerOn, (val) => {
    //   if (val) {
    //     canvasVisualizer.start()
    //   } else {
    //     canvasVisualizer.stop()
    //   }
    //   visualizerOn.value = val
    // })

    // onMounted(() => {
    //   // TODO:初始化可视化背景
    //   setTimeout(() => {
    //     canvasVisualizer.init(canvasRef.value, window.audioAnalyser)
    //     if (visualizerOn.value) canvasVisualizer.start()
    //   }, 500)
    // })
    //
    // onBeforeUnmount(() => {
    //   canvasVisualizer.stop()
    // })
    return {
      canvasRef,
      visualizerOn,
    }
  },
})
</script>

<template>
  <div class="background-effects">
    <canvas ref="canvasRef"></canvas>
    <!--    <div class="config-wrap">-->
    <!--      <button @click="visualizerOn = !visualizerOn">-->
    <!--        背景特效：{{ visualizerOn ? '开' : '关' }}-->
    <!--      </button>-->
    <!--    </div>-->
  </div>
</template>

<style lang="scss" scoped>
.background-effects {
  position: absolute;
  z-index: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  & > .config-wrap {
    position: absolute;
    right: 10px;
    bottom: 10px;

    button {
      border-radius: 5px;
      padding: 5px;
      font-size: 12px;
      background: rgba(0, 0, 0, 0.51);
      color: #fff;
      border: none;
    }
  }

  & > canvas {
    width: 100%;
    height: 100%;
    margin-bottom: -10px;
  }
}
</style>
