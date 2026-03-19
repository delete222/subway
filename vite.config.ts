import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

import { miaodaDevPlugin } from "miaoda-sc-plugin";

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(), 
    svgr({
      svgrOptions: {
        icon: true, exportType: 'named', namedExport: 'ReactComponent', 
      }, 
    }), 
    miaodaDevPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "地铁班次查询",
        short_name: "地铁班次",
        description: "昌平线地铁班次实时查询工具",
        theme_color: "#3b82f6",
        background_color: "#0f172a",
        display: "standalone",
        icons: [
          {
            src: "favicon.png",
            sizes: "96x96",
            type: "image/png"
          },
          {
            src: "apple-touch-icon.jpg",
            sizes: "192x192",
            type: "image/jpeg"
          },
          {
            src: "apple-touch-icon.jpg",
            sizes: "512x512",
            type: "image/jpeg"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
