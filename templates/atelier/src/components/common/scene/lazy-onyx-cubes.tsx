// 📖 Docs: obsidian/frontend/components/common.md
/**
 * The scene's lazy boundary.
 *
 * `three` and `cannon-es` are the heaviest code on the page and the swarm sits
 * at its foot, so the chunk is not even requested until the reader is a
 * viewport away from it — the host div is observed, and the canvas mounts
 * (and the import resolves) only then.
 *
 * L autre cadre demandait ici `ssr: false` — il n y avait pas de scene a
 * serialiser. Il n y a plus de rendu serveur du tout : la page est construite
 * dans le navigateur, et le chargement differe se fait avec `React.lazy`.
 */

import { lazy, Suspense, useEffect, useRef, useState } from "react";

const OnyxCubesCanvas = lazy(() =>
  import("./onyx-cubes-canvas").then((module) => ({
    default: module.OnyxCubesCanvas,
  })),
);

export interface LazyOnyxCubesProps {
  className?: string;
}

export const LazyOnyxCubes = ({ className }: LazyOnyxCubesProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className={className}>
      {near ? (
        <Suspense fallback={null}>
          <OnyxCubesCanvas className="o-absolute o-inset-0 o-h-full o-w-full" />
        </Suspense>
      ) : null}
    </div>
  );
};
