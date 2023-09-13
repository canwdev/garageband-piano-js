type FileDropType = {
  cbFiles?: Function
  cb?: Function
}

export const useFileDrop = ({cbFiles, cb}: FileDropType) => {
  const showDropzone = ref(false)
  return {
    showDropzone,
    // 拖拽上传
    fileDragover(e) {
      showDropzone.value = true
      e.preventDefault()
    },
    async fileDrop(e) {
      e.preventDefault()
      showDropzone.value = false

      if (typeof cb === 'function') {
        cb(e)
      }
      const files = Array.from(e.dataTransfer.files)
      if (typeof cbFiles === 'function') {
        cbFiles(files)
      }
    },
  }
}
