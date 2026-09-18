import { Hover } from "@/components/animation/springs/hover";
import { RevealLines } from "@/components/ui/reveal-lines";
import type { TestimonialContent } from "@/data/mocks/home";
import { PORTRAIT_HOVER } from "@/lib/springs/presets";

export interface TestimonialProps {
  item: TestimonialContent;
}

/**
 * One client story — a grayscale portrait and the quote, laid so the quote's
 * foot lines up with the photograph's (the source nudged both by hand).
 */
export const Testimonial = ({ item }: TestimonialProps) => (
  <figure className="o-grid o-h-full o-items-center o-gap-10 cb-md-grid-cols-12-5rem-1fr cb-lg-grid-cols-23-75rem-1fr">
    <div className="o-relative cb-aspect-3-4 o-w-full o-overflow-hidden cb-bg-surface-inverse-sunken cb-max-md-max-w-60 cb-md-translate-y-17-5">
      <Hover
        tag="span"
        from={{ scale: 1 }}
        to={{ scale: 1.05 }}
        config={PORTRAIT_HOVER}
        className="o-absolute o-inset-0 o-block"
      >
        <img
          src={item.portrait.src}
          alt={item.portrait.alt}
          className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover o-grayscale"
        />
      </Hover>
    </div>

    <div className="o-flex o-flex-col cb-md-translate-y-18">
      <span
        aria-hidden
        className="o-mb-4 cb-font-display cb-text-quote-mark-phone cb-leading-0-5 md:o-mb-10 cb-md-translate-x-5 cb-md-translate-y-40 cb-md-text-quote-mark"
      >
        “
      </span>
      <blockquote className="o-mb-10">
        <RevealLines
          tag="p"
          lines={[item.quote]}
          active
          clip={false}
          timing="quote"
          rootMargin="0px 0px -15% 0px"
          className="cb-font-display o-italic cb-text-headline-phone cb-leading-heading cb-tracking-title cb-sm-text-headline"
        />
      </blockquote>
      <figcaption className="cb-md-translate-y-10">
        <p className="cb-text-lead o-font-medium o-uppercase cb-tracking-copy">{item.author}</p>
        <p className="o-mt-2 cb-text-body cb-leading-copy cb-tracking-copy cb-text-foreground-inverse-70">
          {item.role}
        </p>
      </figcaption>
    </div>
  </figure>
);
