/*
 * @Description: 
 * @Author: tianyi
 * @Date: 2025-02-23 15:20:38
 * @LastEditors: tianyi
 * @LastEditTime: 2025-02-23 15:41:15
 * @FilePath: \muflow\vite.config.ts
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
