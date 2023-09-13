import {ref, Ref, watch} from 'vue'

export const useLocalStorageBoolean = (key, defaultValue = false): Ref<boolean> => {
  const updateInitValue = () =>
    defaultValue ? !Boolean(localStorage.getItem(key)) : Boolean(localStorage.getItem(key))

  const val = ref<boolean>(updateInitValue())

  watch(val, (val) => {
    if (!defaultValue) {
      val = !val
    }
    if (val) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, '1')
    }
  })

  return val
}

export const useLocalStorageString = (key, defaultValue = ''): Ref<string> => {
  const val = ref<string>(localStorage.getItem(key) || defaultValue)
  watch(val, (val) => {
    if (val) {
      localStorage.setItem(key, val)
    } else {
      localStorage.removeItem(key)
    }
  })
  return val
}

export const useLocalStorageNumber = (key, defaultValue = 0): Ref<number> => {
  const val = ref<number>(Number(localStorage.getItem(key)) || defaultValue)
  watch(val, (val) => {
    if (val) {
      localStorage.setItem(key, String(val))
    } else {
      localStorage.removeItem(key)
    }
  })
  return val
}

export const useLocalStorageObject = (key, defaultValue = {}): Ref<any> => {
  const val = ref<object>(JSON.parse(localStorage.getItem(key) || 'null') || defaultValue)
  watch(val, (val) => {
    if (val) {
      localStorage.setItem(key, JSON.stringify(val))
    } else {
      localStorage.removeItem(key)
    }
  })
  return val
}
