import { defineConfig } from 'odoro'

export default defineConfig({
  server: {
    port: 5190,
  },
  build: {
    /*
     * Les classes que la documentation assemble a l'execution.
     *
     * L'elagage lit le JavaScript produit : une classe ecrite `o-text-${taille}`
     * n'y figure sous aucune forme finale, et disparaitrait sans que rien ne le
     * signale — du CSS absent ne casse rien, il ne peint rien. Les pages de
     * typographie sont les seules du site a composer ainsi.
     */
    safelist: [
      'o-text-xs',
      'o-text-sm',
      'o-text-base',
      'o-text-lg',
      'o-text-xl',
      'o-text-2xl',
      'o-text-3xl',
      'o-text-4xl',
      'o-text-5xl',
      'o-text-6xl',
      'o-font-thin',
      'o-font-extralight',
      'o-font-light',
      'o-font-normal',
      'o-font-medium',
      'o-font-semibold',
      'o-font-bold',
      'o-font-extrabold',
      'o-font-black',
    ],
  },
})
