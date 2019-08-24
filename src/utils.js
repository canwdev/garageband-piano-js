import axios from 'axios'
import { setupCache } from 'axios-cache-adapter'
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
