import React, { useEffect, useRef, useState } from 'react';

/**
 * Le curseur maison — un point instantané, plus un anneau qui traîne sur un
 * ressort et gonfle au-dessus des éléments interactifs.
 *
 * Purement décoratif : les événements de pointeur natifs continuent de partir,
 * donc la répulsion des sphères par le curseur, dans la scène 3D, n'est pas
 * affectée. Masqué sur les pointeurs grossiers (tactile).
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;
    setEnabled(true);

    // La cible est la vraie position du pointeur ; l'anneau l'interpole pour
    // obtenir une traîne douce. C'est ce RETARD qui donne son poids au curseur.
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      const interactive = (e.target as HTMLElement)?.closest(
        'a, button, [role="button"], input, .cursor-pointer, [data-cursor="hover"]'
      );
      if (ringRef.current) {
        ringRef.current.dataset.hover = interactive ? 'true' : 'false';
      }
    };

    const loop = () => {
      ring.x += (target.x - ring.x) * 0.18;
      ring.y += (target.y - ring.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px)`;
      }
      raf = requestAnimationFrame(loop);
    };

    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };
    const onEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = '1';
      if (ringRef.current) ringRef.current.style.opacity = '1';
    };

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div ref={ringRef} className="cursor-ring" data-hover="false" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}
