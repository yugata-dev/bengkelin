import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or vue(), svelte(), etc
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/react-refresh'

export default defineConfig({
  plugins: [react(), tailwindcss()], base: '/nama-repositori-kamu/',
})
