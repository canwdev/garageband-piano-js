import {defineStore} from "pinia";

type MainStore = {
  theme: string
}

enum PianoTheme {
  DEFAULT = 'theme-default',
  DARK_LITE = 'theme-dark-lite',
}

export const useMainStore = defineStore('mainStore', {
  state: (): MainStore => {
    return {
      theme: PianoTheme.DARK_LITE,
    }
  },
})
