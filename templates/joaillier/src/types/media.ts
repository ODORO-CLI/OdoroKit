/**
 * A photograph as the sections take it through props: the file under
 * `public/assets/<section>/`, its accessible description, and its intrinsic
 * size so le navigateur puisse reserver la boite avant que les octets arrivent.
 */
export interface MediaImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * A clip as a section takes it: the file, its poster (shown before the first
 * frame and under reduced motion), and the same accessible description a
 * `<video>` carries on `aria-label` since it has no `alt`.
 */
export interface MediaVideo {
  src: string;
  poster: string;
  alt: string;
  width: number;
  height: number;
}
