import { useCallback, useEffect, useState } from "react";

import { Contact } from "@/components/contact";
import { Film } from "@/components/film";
import { Fleet } from "@/components/fleet";
import { Garage } from "@/components/garage";
import { HeroChrome } from "@/components/hero-chrome";
import { Loader } from "@/components/loader";
import { Services } from "@/components/services";
import {
  DETAIL_CHAPTERS,
  DETAIL_FILM_END,
  HERO_CHAPTERS,
  HERO_FILM_END,
} from "@/data/content";
import { startClock, stopClock } from "@/lib/scroll";

export function HomeView() {
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
          see the copy, text is measured behind the cover rather than during the
          reveal, and each film's track exists before scroll is released, so
          progress is never seeded from a zero-height document. */}
      <main>
        <Film
          id="film"
          src="/video/odoro-flotte.mp4"
          src720="/video/odoro-flotte-720.mp4"
          poster="/assets/film-poster.jpg"
          chapters={HERO_CHAPTERS}
          filmEnd={HERO_FILM_END}
          side="left"
          gatesLoader
          chrome={(show) => <HeroChrome ready={ready} show={show} />}
        />
        <Fleet />
        <Film
          id="details"
          src="/video/odoro-details.mp4"
          src720="/video/odoro-details-720.mp4"
          poster="/assets/details-poster.jpg"
          chapters={DETAIL_CHAPTERS}
          filmEnd={DETAIL_FILM_END}
          side="right"
        />
        <Garage />
        <Services />
      </main>
      <Contact />
    </>
  );
}
