import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/_variables.scss";`,
      },
    },
  },
  plugins: [
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.png', 'favicon-192.png', 'favicon-512.png'],
    //   manifest: {
    //     name: 'Garageband Piano',
    //     short_name: 'Garageband Piano',
    //     description: '',
    //     theme_color: '#83B253',
    //     icons: [
    //       {
    //         src: 'favicon-192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: 'favicon-512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //     ],
    //   },
    // }),
    vue(),
  ],
})
