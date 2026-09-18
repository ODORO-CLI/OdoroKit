/**
 * Home view — a Server Component. Every section is a client leaf: the hero
 * and the film because they are driven by a clock and the scroll, the rest
 * because they reveal on entering the viewport. Each takes all of its copy and
 * media through props from `src/data/mocks/home.ts`.
 *
 * Page order is the rhythm (getlayers.json → `placed`):
 * hero (dense chrome over footage) → manifesto (sparse) → collection
 * (balanced) → film (sparse, three chapters) → atelier (the one inverted band)
 * → editions (balanced) → reserve (sparse) → footer.
 */

import { Preloader } from "@/components/common/preloader";
import {
  atelierContent,
  collectionContent,
  editionsContent,
  filmContent,
  footerContent,
  heroContent,
  manifestoContent,
  reserveContent,
} from "@/data/mocks/home";

import { Atelier } from "./atelier";
import { Collection } from "./collection";
import { Editions } from "./editions";
import { Film } from "./film";
import { SiteFooter } from "./footer";
import { Hero } from "./hero";
import { Manifesto } from "./manifesto";
import { Reserve } from "./reserve";

/**
 * What the preloader waits for: the hero clip having *frames*, not being
 * downloaded (see `use-media-ready`). The film's clip is far below the fold
 * and loads on its own.
 */
const CRITICAL_MEDIA = ["hero-video.mp4"] as const;

export const HomeView = () => {
  return (
    <>
      <Preloader wordmark={heroContent.wordmark} assets={CRITICAL_MEDIA} />
      <main>
        <Hero content={heroContent} />
        <Manifesto content={manifestoContent} />
        <Collection content={collectionContent} />
        <Film content={filmContent} />
        <Atelier content={atelierContent} />
        <Editions content={editionsContent} />
        <Reserve content={reserveContent} />
      </main>
      <SiteFooter content={footerContent} />
    </>
  );
};
