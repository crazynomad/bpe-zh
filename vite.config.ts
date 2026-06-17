import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// 部署到 GitHub Pages 项目站（crazynomad.github.io/bpe-zh/）需要设置 base，
// 否则打包后资源的绝对路径会 404。本地 dev（base 默认 /）不受影响。
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/bpe-zh/' : '/',
})
