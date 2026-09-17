import React from 'react';

/**
 * Le sigle ODORO — un coin carré en haut à gauche prolongé par un arc de 270°,
 * en trait d'épaisseur constante.
 *
 * Le tracé est GÉOMÉTRIQUE, pas vectorisé : dans une boîte de 100 × 100, le
 * contour extérieur est un rayon de 50 centré sur (50, 50) et l'intérieur un
 * rayon de 35, ce qui donne les 15 unités d'épaisseur du logo fourni. Il reste
 * donc net à toute échelle.
 *
 * Cette même définition sert au sigle 3D (`public/assets/mark/odoro-mark.glb`)
 * ET au prédicat `inMark` de FestivityCanvas, qui est la silhouette que le champ
 * de sphères vient réassembler. Les trois ne peuvent pas diverger — si le tracé
 * bouge ici, il doit bouger là-bas.
 *
 * `fill-rule: evenodd` creuse le contour intérieur : sans lui les deux
 * sous-tracés se remplissent et le sigle devient une goutte pleine.
 */
export const BRAND_MARK_PATH =
  'M0 0H50A50 50 0 1 1 0 50Z M15 15H50A35 35 0 1 1 15 50Z';

export interface BrandMarkProps {
  className?: string;
  /** Rendu décoratif à côté d'un libellé texte par défaut. */
  title?: string;
  style?: React.CSSProperties;
}

export default function BrandMark({ className, title, style }: BrandMarkProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 100 100"
      fill="none"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" clipRule="evenodd" d={BRAND_MARK_PATH} fill="currentColor" />
    </svg>
  );
}

/**
 * Le lockup complet — sigle + mot-symbole « odoro ».
 * Le mot est en bas de casse et posé sur la même couleur que le sigle : c'est
 * un seul objet, pas un sigle accompagné d'un titre.
 */
export function BrandLockup({
  className = '',
  markClassName = '',
  wordClassName = '',
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
}) {
  return (
    <span className={`o-inline-flex o-items-center ${className}`} aria-label="odoro" role="img">
      <BrandMark className={markClassName} />
      <span className={wordClassName} aria-hidden="true">
        odoro
      </span>
    </span>
  );
}
