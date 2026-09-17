import { useCallback, useEffect, useState } from "react";

import { Contact } from "@/components/contact";
import { Film } from "@/components/film";
import { Loader } from "@/components/loader";
import { Penthouses } from "@/components/penthouses";
import { Services } from "@/components/services";
import { TowerParallax } from "@/components/tower-parallax";
import { startClock, stopClock } from "@/lib/scroll";

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    startClock();
    return stopClock;
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  return (
    <>
      <Loader onReady={onReady} />
      {/* Everything below is mounted at first paint and sits at its `from`
          value — never withheld from the document. Crawlers and screen readers
          see the copy, text is measured behind the curtain rather than during
          the reveal, and the film's track exists before scroll is released, so
          progress is never seeded from a zero-height document. */}
      <main>
        <Film ready={ready} />
        <TowerParallax />
        <Penthouses />
        <Services />
      </main>
      <Contact />
    </>
  );
}
