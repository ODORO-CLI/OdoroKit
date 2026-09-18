/**
 * Home view.
 *
 * The page is compositions + one Style + assets (see getlayers.json): the
 * `loopstack` hero over the film, two `negantropy` chapters travelling over
 * it, an `artist-statement` manifesto, a `vexon-showcase` collection, the
 * `carousel-spotlight` lookbook, an `ai-studio-cta` closing screen over the
 * Onyx Cubes scene, and an `artist-footer` on the accent plane.
 *
 * Le partage robot / lecteur se faisait sur le serveur, avant meme qu un
 * script soit choisi. Il n y a plus de serveur : la chaine d agent se lit au
 * premier rendu, dans le navigateur, et le resultat est le meme — un robot n a
 * pas de rideau, recoit la page deja ouverte, et n attend ni le film ni la
 * scene.
 *
 * La vue n est donc plus `async`. React ne rend pas une fonction asynchrone
 * cote navigateur : il leve, et la page reste blanche.
 *
 * 📖 Docs: obsidian/workflows/new-page.md
 */

import { SiteChrome } from "@/components/common/chrome/site-chrome";
import { ClosingStage } from "@/components/common/closing/closing-stage";
import { Collection } from "@/components/common/collection/collection";
import { SiteFooter } from "@/components/common/footer/site-footer";
import { Chapter } from "@/components/common/hero/chapter";
import { HeroFilm } from "@/components/common/hero/hero-film";
import { HeroStage } from "@/components/common/hero/hero-stage";
import { SpotlightCarousel } from "@/components/common/lookbook/spotlight-carousel";
import { Manifesto } from "@/components/common/manifesto/manifesto";
import { Preloader } from "@/components/common/preloader/preloader";
import { homeMocks } from "@/data/mocks/home";
import { isBot } from "@/utils/is-bot";

/** Where the floating pill stays away: sections with their own foot controls, and the footer. */
const QUIET_IDS = ["lookbook", "atelier", "site-footer"] as const;

export const HomeView = () => {
  const bot = isBot();
  const {
    header,
    pill,
    preloader,
    hero,
    chapters,
    manifesto,
    collection,
    lookbook,
    closing,
    footer,
  } = homeMocks;

  return (
    <>
      {/* The opening curtain, and only for a reader: a crawler is served the
          page already released, so nothing has to tell a curtain to leave. */}
      {bot ? null : <Preloader {...preloader} />}

      <SiteChrome
        header={header}
        pill={pill}
        quietIds={QUIET_IDS}
        released={bot}
      />

      <main className="o-relative at-bg-background">
        {/* The film is pinned for the first screen and one more per chapter;
            the copy travels over it at the page's own speed. */}
        <HeroFilm film={hero.film} screens={1 + chapters.length} released={bot}>
          <HeroStage content={hero} />
          {chapters.map((chapter, index) => (
            <Chapter key={chapter.index} {...chapter} screen={index + 1} />
          ))}
        </HeroFilm>

        <Manifesto content={manifesto} />
        <Collection content={collection} />
        <SpotlightCarousel content={lookbook} />
        <ClosingStage content={closing} />
      </main>

      <SiteFooter content={footer} />
    </>
  );
};
