// @ts-ignore

import { defineConfig, loadEnv } from 'vite';

import path from 'path';
import react from '@vitejs/plugin-react';

export default ({ mode }: { mode: string }) => {
  process.env = { ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    plugins: [
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler']
        }
      })
    ],
    resolve: {
      alias: {
        // @ts-ignore
        '@': path.resolve(__dirname, './src')
      }
    },
    build: {
      target: 'esnext',
      sourcemap: process.env.VITE_ENV === 'localhost',
      rollupOptions: {
        treeshake: true,
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            map: ['@vis.gl/react-google-maps'],
            form: ['react-hook-form', 'zod', '@hookform/resolvers']
          }
        }
      },
      // Split chunks for better caching
      chunkSizeWarningLimit: 1000,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 2
        }
      },
      cssMinify: 'lightningcss'
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@mui/material', '@tanstack/react-query']
    }
  });
};
