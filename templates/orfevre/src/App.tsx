import { useCallback, useEffect, useState } from "react";

import { Atelier } from "@/components/atelier";
import { Contact } from "@/components/contact";
import { FactsRail } from "@/components/facts-rail";
import { Film } from "@/components/film";
import { HeroChrome } from "@/components/hero-chrome";
import { Loader } from "@/components/loader";
import { Pieces } from "@/components/pieces";
import { Services } from "@/components/services";
import {
  HAND_CHAPTERS,
  HAND_FILM_END,
  HERO_CHAPTERS,
  HERO_FILM_END,
} from "@/data/content";
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
          the reveal, and each film's track exists before scroll is released, so
          progress is never seeded from a zero-height document. */}
      <main>
        <Film
          id="film"
          src="/video/odoro-hero.mp4"
          src720="/video/odoro-hero-720.mp4"
          poster="/assets/film-poster.jpg"
          chapters={HERO_CHAPTERS}
          filmEnd={HERO_FILM_END}
          side="left"
          gatesLoader
          chrome={(show) => <HeroChrome ready={ready} show={show} />}
        />
        <FactsRail />
        <Pieces />
        <Film
          id="essai"
          src="/video/odoro-main.mp4"
          src720="/video/odoro-main-720.mp4"
          poster="/assets/main-poster.jpg"
          chapters={HAND_CHAPTERS}
          filmEnd={HAND_FILM_END}
          /* The hand sits in the left half of this film and the empty white is
             on the right — so the copy stands on the right, or it lands on the
             fingers. */
          side="right"
        />
        <Atelier />
        <Services />
      </main>
      <Contact />
    </>
  );
}
