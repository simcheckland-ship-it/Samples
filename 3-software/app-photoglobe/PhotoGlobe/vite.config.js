import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import cesium from "vite-plugin-cesium";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), cesium()],
  // server: {
  //   watch: {
  //     usePolling: true,
  //   },
  //   host: true, // Needed for Docker tracking
  //   strictPort: true,
  //   port: 5173,
  // },
  server: {
    host: '0.0.0.0', 
    port: 5173,
    allowedHosts: ['sw-jar.co.uk', 'www.sw-jar.co.uk'],
    // Vite intercepts these paths locally and forwards them to the real backend
    proxy: {
      '/api/v2': {
        target: 'https://sw-jar.co.uk:443', // Points to your domain/local DNS
        changeOrigin: true,
        secure: false, // Bypasses the self-signed certificate on NGINX
      },
      '/uploads': {
        target: 'https://sw-jar.co.uk:443', // Points to your domain/local DNS
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
