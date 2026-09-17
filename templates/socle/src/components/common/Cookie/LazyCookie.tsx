// 📖 Docs: obsidian/frontend/components/common.md
/**
 * Lazy client wrapper for the Cookie banner + preferences modal.
 *
 * `dynamic({ ssr: false })` keeps the Cookie banner / preferences modal /
 * zustand store out of the page's first-load JS manifest. The chunk only
 * fetches when this wrapper actually mounts on the client — i.e. for real
 * users. Bots / lab UAs aren't rendered (gated upstream by the layout)
 * so they never load the chunk at all (~3.7 KB gz off the bot bundle).
 */

import { lazy, Suspense } from "react";

/*
 * `lazy` tient ici le role de l import dynamique de l autre cadre : le paquet
 * du bandeau et de sa modale ne part qu au montage de ce composant. Le repli
 * est vide — il n y a rien a montrer pendant qu il arrive.
 */
const Cookie = lazy(() =>
  import("./Cookie").then((m) => ({ default: m.Cookie })),
);

export function LazyCookie() {
  return (
    <Suspense fallback={null}>
      <Cookie />
    </Suspense>
  );
}
