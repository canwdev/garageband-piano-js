import axios from 'axios'
import {setupCache} from 'axios-cache-adapter'
// 使用缓存，加快下次加载速度？
const cache = setupCache({
  maxAge: 15 * 60 * 1000
})

const api = axios.create({
  adapter: cache.adapter
})

export function getAudioBuffer(audioContext, url) {
  return new Promise((resolve, reject) => {

    api.get(url, {
      responseType: 'arraybuffer'
    }).then(res => {
      audioContext.decodeAudioData(res.data, buffer => {
        buffer ? resolve(buffer) : reject()
      })
    }).catch(e => {
      reject(e)
    })

  })
}


export function setDraggable(el, dragTargetEl) {
  const docEl = document.documentElement
  let deltaX = 0;
  let deltaY = 0;

  function start(event) {
    deltaX = event.clientX - dragTargetEl.getBoundingClientRect().left;
    deltaY = event.clientY - dragTargetEl.getBoundingClientRect().top;

    docEl.addEventListener('mousemove', move);
    docEl.addEventListener('mouseup', stop);

    // 防止拖动图片
    return false;
  }

  function move(event) {
    let x = event.clientX - deltaX
    let y = event.clientY - deltaY

    const docWidth = docEl.clientWidth - dragTargetEl.clientWidth
    const docHeight = docEl.clientHeight - dragTargetEl.clientHeight

    dragTargetEl.style.left = Math.min(docWidth, Math.max(0, x)) + 'px'
    dragTargetEl.style.top =Math.min(docHeight, Math.max(0, y)) + 'px'
    // dragTargetEl.style.opacity = '0.8'

    // return false;
  }

  function stop() {
    docEl.removeEventListener('mousemove', move);
    docEl.removeEventListener('mouseup', stop);

    // dragTargetEl.style.opacity = '1'
  }

  el.addEventListener('mousedown', start);

}
