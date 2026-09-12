// 📖 Docs: obsidian/frontend/components/common.md

/**
 * Le sigle ODORO — un coin carré en haut à gauche prolongé par un arc de 270°,
 * en trait d'épaisseur constante.
 *
 * Le tracé est **géométrique, pas vectorisé** : dans une boîte de 100 × 100, le
 * contour extérieur est un rayon de 50 centré sur (50, 50) et l'intérieur un
 * rayon de 35, ce qui donne les 15 unités d'épaisseur du logo fourni. Il reste
 * donc net à toute échelle, et la même définition sert au sigle 3D
 * (`public/assets/Mark/odoro-mark.glb`) — les deux ne peuvent pas diverger.
 *
 * `fill-rule: evenodd` creuse le contour intérieur : sans lui les deux
 * sous-tracés se remplissent et le sigle devient une goutte pleine.
 */
export interface BrandMarkProps {
  className?: string;
  /** Rendered decoratively next to a text label by default. */
  title?: string;
}

/** Le tracé, partagé avec `icon.tsx`, `apple-icon.tsx` et `opengraph-image.tsx`. */
export const BRAND_MARK_PATH =
  "M0 0H50A50 50 0 1 1 0 50Z M15 15H50A35 35 0 1 1 15 50Z";

export const BrandMark = ({ className, title }: BrandMarkProps) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : "true"}
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
  >
    {title ? <title>{title}</title> : null}
    <path fillRule="evenodd" clipRule="evenodd" d={BRAND_MARK_PATH} fill="currentColor" />
  </svg>
);
