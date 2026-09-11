import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Le HMR se désactive via la variable d'environnement DISABLE_HMR.
      // La surveillance de fichiers est coupée avec lui, pour éviter le
      // scintillement pendant qu'un agent édite les fichiers.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Couper la surveillance quand DISABLE_HMR vaut true, pour épargner le CPU.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
