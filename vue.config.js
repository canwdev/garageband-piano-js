var path = require('path');
module.exports = {
  publicPath: './',
  css: {
    loaderOptions: {
      // 引入 stylus 全局变量
      stylus: {
        import: [path.resolve(__dirname, "src/assets/styles/variables.styl")]
      },
    }
  }
}
