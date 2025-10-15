import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load environment variables. Vercel requires them to be set in the dashboard.
    const env = loadEnv(mode, '.', '');
    
    // Use the GEMINI_API_KEY value, falling back to an empty string if not found.
    const apiKey = env.GEMINI_API_KEY || '';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // CRITICAL FIX: Explicitly define only the GEMINI_API_KEY variable 
        // which the service file will now check for.
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey) 
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
