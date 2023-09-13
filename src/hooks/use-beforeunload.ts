/**
 * 防止页面关闭
 * @param checkIsChanged 回调函数
 */
export const useBeforeUnload = (checkIsChanged) => {
  const handleBeforeUnload = (e) => {
    if (checkIsChanged()) {
      e.preventDefault()
      e.returnValue = 'There is unsaved data.'
      return true
    }
    return undefined
  }
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })
}

export const useUnSavedChanges = () => {
  const isChanged = ref(false)
  useBeforeUnload(() => isChanged.value)
  return {
    isChanged,
  }
}

// replace ctrl+s save action
export const useSaveShortcut = (saveFn) => {
  const handleSave = (event) => {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault() // 阻止默认的保存操作

      if (typeof saveFn === 'function') {
        saveFn()
      }
    }
  }
  onMounted(() => {
    document.addEventListener('keydown', handleSave)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleSave)
  })
}
