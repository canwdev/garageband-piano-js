# GarageBand Piano JS

> 用 Vue + WebAudioAPI 实现的库乐队网页钢琴，灵感来自 GarageBand 钢琴窗口
> 现已用 Vite+Vue3+TS 重构！

- [ ] 迁移到Vue3，组件重构拆分
- [ ] 组合键

## 功能特性

- [X] 实现 GarageBand UI
- [X] 基本交互以及弹奏功能
- [X] 使用 Web Audio API
- [X] 窗口可拖动
- [X] 背景 Canvas 可视化效果
- [X] 多种音色（createOscillator）
- [X] 根据短按时长播放音频
- [ ] 节拍器
- [ ] 滤波器、延音踏板（createBiquadFilter）
- [ ] 乐谱录制及播放

## 开发

```shell
yarn
yarn dev
```

## 参考

- [HTMLAudioElement](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLAudioElement)（仅在v1.0的tag中使用）
- [Web Audio API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API)
    - [AudioContext](https://developer.mozilla.org/zh-CN/docs/Web/API/AudioContext)
    - [深入浅出 Web Audio Api](https://juejin.im/post/599e35f5f265da246c4a1910)
    - [利用HTML5 Web Audio API给网页JS交互增加声音](https://www.zhangxinxu.com/wordpress/2017/06/html5-web-audio-api-js-ux-voice/)
    - [MDN Simple_synth](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Simple_synth)
- [Music Visualizer (Bars)](https://github.com/gg-1414/music-visualizer)
