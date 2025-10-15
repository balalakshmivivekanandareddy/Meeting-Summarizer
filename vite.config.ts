import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load environment variables from .env.* files
    const env = loadEnv(mode, '.', '');
    
    // We only need to expose one key.
    const apiKey = env.GEMINI_API_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // FIX: Explicitly map the loaded GEMINI_API_KEY value to the
        // specific variable the application checks for (process.env.API_KEY).
        'process.env.API_KEY': JSON.stringify(apiKey),
        // We can keep the GEMINI_API_KEY mapping for redundancy, but API_KEY is the critical one.
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey) 
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
