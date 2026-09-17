/* The loader gates on things that actually happened, not on a timer. The film
   element is mounted by `Film`, so it reports its own first decoded frame
   here and the loader awaits it alongside the fonts and the poster. */
let resolve: (() => void) | null = null;

export const filmReady = new Promise<void>((r) => {
  resolve = r;
});

export function markFilmReady() {
  resolve?.();
  resolve = null;
}
