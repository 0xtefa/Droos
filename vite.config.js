import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    build: {
        // Enable code splitting
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunk for React and related libraries
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    // Axios in separate chunk
                    api: ['axios'],
                },
            },
        },
        // Generate source maps for production debugging
        sourcemap: false,
        // Optimize chunk size warnings
        chunkSizeWarningLimit: 500,
    },
    // Optimize dependencies
    optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    },
    // Server configuration
    server: {
        host: true,
        port: 5173,
    },
});
