export enum PianoConstant {
  SEMITONE = 12, // 两个半音的距离
  KEY_COUNT = 88,
}

export enum KeyType {
  HIDDEN = -1, // 隐藏
  WHITE = 0, // 白键
  BLACK = 1, // 黑键
  CUSTOM = 2, // 自定义键
}

export const ToneTypesOptions = [
  // https://codepen.io/gregh/pen/LxJEaj
  {isMP3: false, value: 'sine', label: '正弦波(sine)'},
  {isMP3: false, value: 'square', label: '方波(square)'},
  {isMP3: false, value: 'sawtooth', label: '锯齿波(sawtooth)'},
  {isMP3: false, value: 'triangle', label: '三角波(triangle)'},
  {isMP3: true, value: 'pianoKeyAudio', label: '钢琴原声(LowRes)'},
  {isMP3: true, value: 'pianoKeyAudioFL', label: '钢琴原声(FL)'},
]

export const MainKeyboardKeys = [
  {label: 'A', type: 0},
  {label: 'W', type: 1},
  {label: 'S', type: 0},
  {label: 'E', type: 1},
  {label: 'D', type: 0},
  {label: 'F', type: 0},
  {label: 'T', type: 1},
  {label: 'G', type: 0},
  {label: 'Y', type: 1},
  {label: 'H', type: 0},
  {label: 'U', type: 1},
  {label: 'J', type: 0},
  {label: 'K', type: 0},
  {label: 'O', type: 1},
  {label: 'L', type: 0},
  {label: 'P', type: 1},
  {label: ';', type: 0},
  {label: "'", type: 0},
]

export const ControlKeys = [
  {label: 'Z', extraLabel: '﹣', type: 2},
  {label: 'X', extraLabel: '﹢', type: 2},
  {label: 'C', extraLabel: '﹣', type: 2},
  {label: 'V', extraLabel: '﹢', type: 2},
]

// 额外的功能键
;[1, 2, 3, 4, 5, 6, 7].forEach((v) => {
  ControlKeys.push({
    label: v.toString(),
    extraLabel: '',
    type: -1,
  })
})

export * from './notes.ts'
