import axios from 'axios'

export function getAudioBuffer(audioContext, url) {
  return new Promise((resolve, reject) => {

    axios.get(url, {
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
