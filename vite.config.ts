import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), tailwindcss()],
    define: {
      // Only public config is embedded. No AI / Gemini API keys in browser bundle.
      __VITE_VAPI_PUBLIC_KEY__: JSON.stringify(env.VITE_VAPI_PUBLIC_KEY || env.VAPI_PUBLIC_KEY || ''),
      __VITE_VAPI_FRONT_DESK_ASSISTANT_ID__: JSON.stringify(env.VITE_VAPI_FRONT_DESK_ASSISTANT_ID || env.VAPI_FRONT_DESK_ASSISTANT_ID || ''),
      __VITE_VAPI_DISPATCH_ASSISTANT_ID__: JSON.stringify(env.VITE_VAPI_DISPATCH_ASSISTANT_ID || env.VAPI_DISPATCH_ASSISTANT_ID || ''),
      __VITE_BOOKING_API_ENDPOINT__: JSON.stringify(env.VITE_BOOKING_API_ENDPOINT || env.BOOKING_API_ENDPOINT || '/api/book')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
