// Powered by: https://github.com/gg-1414/music-visualizer
// noinspection TypeScriptValidateTypes

/**
 * 使用方式：
 * import canvasVisualizer from "@/utils/visualizer"
 * canvasVisualizer.init(this.$refs.canvasVisualizer, this.audioAnalyser)
 * canvasVisualizer.start()
 * canvasVisualizer.stop()
 */
/*
export default {
  visualizerInterval: null,
  renderFrame: null,
  canvas: null,
  init(canvas, analyser) {
    this.canvas = canvas

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')

    /////////////// ANALYSER FFTSIZE ////////////////////////
    // analyser.fftSize = 32;
    // analyser.fftSize = 64;
    // analyser.fftSize = 128;
    // analyser.fftSize = 256;
    // analyser.fftSize = 512;
    // analyser.fftSize = 1024;
    // analyser.fftSize = 2048;
    // analyser.fftSize = 4096;
    // analyser.fftSize = 8192;
    analyser.fftSize = 8192 //16384;
    // analyser.fftSize = 32768;

    // (FFT) is an algorithm that samples a signal over a period of time
    // and divides it into its frequency components (single sinusoidal oscillations).
    // It separates the mixed signals and shows what frequency is a violent vibration.

    // (FFTSize) represents the window size in samples that is used when performing a FFT

    // Lower the size, the less bars (but wider in size)
    ///////////////////////////////////////////////////////////

    const bufferLength = analyser.frequencyBinCount // (read-only property)
    // Unsigned integer, half of fftSize (so in this case, bufferLength = 8192)
    // Equates to number of data values you have to play with for the visualization

    // The FFT size defines the number of bins used for dividing the window into equal strips, or bins.
    // Hence, a bin is a spectrum sample, and defines the frequency resolution of the window.

    const dataArray = new Uint8Array(bufferLength) // Converts to 8-bit unsigned integer array
    // At this point dataArray is an array with length of bufferLength but no values
    // console.log('DATA-ARRAY: ', dataArray) // Check out this array of frequency values!

    const WIDTH = canvas.width
    const HEIGHT = canvas.height
    // console.log('WIDTH: ', WIDTH, 'HEIGHT: ', HEIGHT)

    const barWidth = (WIDTH / bufferLength) * 38
    // console.log('BARWIDTH: ', barWidth)

    // console.log('TOTAL WIDTH: ', (117 * 10) + (118 * barWidth)) // (total space between bars)+(total width of all bars)

    let barHeight
    let x = 0

    this.renderFrame = function renderFrame() {
      x = 0

      analyser.getByteFrequencyData(dataArray) // Copies the frequency data into dataArray
      // Results in a normalized array of values between 0 and 255
      // Before this step, dataArray's values are all zeros (but with length of 8192)

      ctx.clearRect(0, 0, WIDTH, HEIGHT)
      ctx.fillStyle = 'rgba(0,0,0,0.2)' // Clears canvas before rendering bars (black with opacity 0.2)
      ctx.fillRect(0, 0, WIDTH, HEIGHT) // Fade effect, set opacity to 1 for sharper rendering of bars

      let r, g, b
      let bars = 88 // Set total number of bars you want per frame

      for (let i = 0; i < bars; i++) {
        barHeight = dataArray[i] * 2.5
        let color

        if (dataArray[i] > 210) {
          // pink
          color = 'rgba(244,67,54, 0.9)'
        } else if (dataArray[i] > 200) {
          color = 'rgba(255,235,59, 0.8)'
        } else if (dataArray[i] > 190) {
          color = 'rgba(139,195,74, 0.7)'
        } else if (dataArray[i] > 180) {
          color = 'rgba(0,219,131, 0.6)'
        } else {
          // color = "rgba(0, 188, 212, 0.6)"
          color = 'rgba(255,255,255,0.6)'
        }

        // if (i === 0){
        //   console.log(dataArray[i])
        // }

        ctx.fillStyle = color
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight)
        // (x, y, i, j)
        // (x, y) Represents start point
        // (i, j) Represents end point

        x += barWidth + 3 // Gives 10px space between each bar
      }
    }
  },
  start: function () {
    clearInterval(this.visualizerInterval)
    this.visualizerInterval = setInterval(() => {
      requestAnimationFrame(this.renderFrame)
    }, 20)
  },
  stop() {
    const ctx = this.canvas.getContext('2d')
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    clearInterval(this.visualizerInterval)
  },
}
*/
