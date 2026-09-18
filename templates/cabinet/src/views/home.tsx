import { homeContent } from "@/data/mocks/home";
import { Dock } from "@/views/home/dock/dock";
import { SiteFooter } from "@/views/home/footer/site-footer";
import { Preloader } from "@/views/home/preloader/preloader";
import { Reviews } from "@/views/home/reviews/reviews";
import { HouseScene } from "@/views/home/scene/house-scene";

/**
 * Home view — Cabinet Odoro, built on the GetLayers "House" template.
 *
 * A Server Component: it only assembles the page and hands each client leaf
 * its content. The pinned scene and the reviews are the `<main>`; the reveal
 * footer and the floating dock sit outside it as their own landmarks.
 */
export const HomeView = () => {
  const { preloader, sceneLabel, poster, quoteCta, hero, echo, details, reviews, footer, dock } =
    homeContent;

  return (
    <>
      <Preloader label={preloader.label} />
      <main id="main">
        <HouseScene
          label={sceneLabel}
          poster={poster}
          quoteCta={quoteCta}
          hero={hero}
          echo={echo}
          details={details}
        />
        <Reviews content={reviews} />
      </main>
      <SiteFooter content={footer} />
      <Dock content={dock} />
    </>
  );
};
