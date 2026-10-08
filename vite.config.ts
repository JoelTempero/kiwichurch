import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

function gitSha(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

function appVersion(): string {
  try {
    return JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')).version || 'unknown'
  } catch {
    return 'unknown'
  }
}

function renameSpaEntry(): import('vite').Plugin {
  return {
    name: 'rename-spa-entry',
    apply: 'build',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist')
      const src = path.join(dist, 'index.html')
      const dest = path.join(dist, 'app.html')
      if (fs.existsSync(src)) {
        fs.renameSync(src, dest)
      }
    },
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __GIT_SHA__: JSON.stringify(gitSha()),
  },
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        { src: 'homepage.html', dest: '' },
        { src: 'communities.html', dest: '' },
        { src: 'calendar.html', dest: '' },
        { src: 'kete.html', dest: '' },
        { src: 'resources.html', dest: '' },
        { src: 'post.html', dest: '' },
        { src: 'portal.html', dest: '' },
        { src: 'css', dest: '' },
        { src: 'js', dest: '' },
        { src: 'KiwiChurch_Old_White.png', dest: '' },
        { src: 'KiwiChurch_Old_White_Shadow.png', dest: '' },
      ],
    }),
    renameSpaEntry(),
    VitePWA({
      registerType: 'autoUpdate',
      // Own service worker (src/sw.ts) so it can receive web push. It keeps
      // the old generateSW behaviour (precache, app-shell fallback, fonts) but
      // deliberately no longer caches firestore.googleapis.com.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['assets/**/*.{js,css}', 'app.html', 'icons/**/*.png'],
        globIgnores: ['js/**', 'css/**'],
      },
      manifest: {
        id: '/kiwichurch/',
        name: 'Kiwi Church',
        short_name: 'Kiwi Church',
        description: 'Welcome to the table - A network of small group Christian communities',
        start_url: '/home',
        display: 'standalone',
        background_color: '#1a3a2f',
        theme_color: '#1a3a2f',
        orientation: 'portrait-primary',
        icons: [
          { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcuts: [
          {
            name: 'Events',
            url: '/events',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Communities',
            url: '/groups',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
