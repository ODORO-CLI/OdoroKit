/**
 * Typographie : echelle, graisses, decorations, surlignage et effets.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { DemoBlock, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Tailles de l'echelle typographique montrees dans la demo. */
const SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const

/** Graisses disponibles, de la plus fine a la plus lourde. */
const WEIGHTS = [
  'thin',
  'extralight',
  'light',
  'normal',
  'medium',
  'semibold',
  'bold',
  'extrabold',
  'black',
] as const

/** Typographie : echelles, decorations, surlignage, line-clamp et degrades. */
export function Typographie(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro-cli/libs/styles"
        title="Typographie"
        lead="Une echelle de tailles avec hauteur de ligne associee, neuf graisses, et tout l'attirail : decorations, surlignage, troncature, ombres et texte en degrade."
      />

      <Section
        title="Echelle des tailles"
        lead="Chaque classe o-text-* regle la taille et la hauteur de ligne qui lui correspond."
      >
        <DemoBlock
          center={false}
          code={SIZES.map((size) => `<p className="o-text-${size}">Odoro</p>`).join('\n')}
        >
          <div className="o-flex o-flex-col o-gap-2">
            {SIZES.map((size) => (
              <div key={size} className="o-flex o-items-baseline o-gap-4">
                <span className="o-w-12 o-shrink-0 o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-500">
                  {size}
                </span>
                <span className={`o-text-${size}`}>Odoro</span>
              </div>
            ))}
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Graisses"
        lead="De o-font-thin a o-font-black, selon ce que la police chargee propose."
      >
        <DemoBlock
          center={false}
          code={WEIGHTS.map((weight) => `<p className="o-font-${weight}">Odoro</p>`).join(
            '\n',
          )}
        >
          <div className="o-flex o-flex-col o-gap-2">
            {WEIGHTS.map((weight) => (
              <div key={weight} className="o-flex o-items-baseline o-gap-4">
                <span className="o-w-24 o-shrink-0 o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-500">
                  {weight}
                </span>
                <span className={`o-text-lg o-font-${weight}`}>
                  Construire des interfaces
                </span>
              </div>
            ))}
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Decorations"
        lead="Soulignement, style de trait, epaisseur et decalage se combinent librement."
      >
        <DemoBlock
          center={false}
          code={`<p className="o-underline">souligne</p>
<p className="o-underline o-decoration-wavy">ondule</p>
<p className="o-underline o-decoration-dotted">pointille</p>
<p className="o-underline o-decoration-dashed">tirets</p>
<p className="o-underline o-decoration-2">epaisseur 2</p>
<p className="o-underline o-decoration-4 o-decoration-brand-600 dark:o-decoration-brand-400">epaisseur 4, colore</p>
<p className="o-underline o-underline-offset-4">decale de 4</p>
<p className="o-line-through">barre</p>
<p className="o-overline">ligne au-dessus</p>`}
        >
          <div className="o-flex o-flex-wrap o-gap-6 o-text-lg">
            <span className="o-underline">souligne</span>
            <span className="o-underline o-decoration-wavy">ondule</span>
            <span className="o-underline o-decoration-dotted">pointille</span>
            <span className="o-underline o-decoration-dashed">tirets</span>
            <span className="o-underline o-decoration-2">epaisseur 2</span>
            <span className="o-underline o-decoration-4 o-decoration-brand-600 dark:o-decoration-brand-400">
              epaisseur 4, colore
            </span>
            <span className="o-underline o-underline-offset-4">decale de 4</span>
            <span className="o-line-through">barre</span>
            <span className="o-overline">ligne au-dessus</span>
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Surlignage"
        lead="o-highlight pose un fond translucide qui laisse lire le texte, sur n'importe quel fond. Les tons semantiques sont declines, et la balise mark native est stylee d'office."
      >
        <DemoBlock
          center={false}
          code={`<p>Un passage <span className="o-highlight">surligne</span> au ton par defaut.</p>
<p>Ou aux teintes <span className="o-highlight-brand">brand</span>,{' '}
<span className="o-highlight-emerald">emerald</span>,{' '}
<span className="o-highlight-amber">amber</span>,{' '}
<span className="o-highlight-red">red</span> et{' '}
<span className="o-highlight-sky">sky</span>.</p>
<p>La balise <mark>mark</mark> native est stylee d'office.</p>`}
        >
          <div className="o-flex o-flex-col o-gap-2 o-text-lg">
            <p>
              Un passage <span className="o-highlight">surligne</span> au ton par defaut.
            </p>
            <p>
              Ou aux teintes <span className="o-highlight-brand">brand</span>,{' '}
              <span className="o-highlight-emerald">emerald</span>,{' '}
              <span className="o-highlight-amber">amber</span>,{' '}
              <span className="o-highlight-red">red</span> et{' '}
              <span className="o-highlight-sky">sky</span>.
            </p>
            <p>
              La balise <mark>mark</mark> native est stylee d'office.
            </p>
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Line-clamp"
        lead="Tronque un bloc a un nombre de lignes donne, points de suspension compris."
      >
        <DemoBlock
          center={false}
          code={`<p className="o-line-clamp-2 o-max-w-md">
  Un long paragraphe qui deborde largement de deux lignes...
</p>`}
        >
          <p className="o-line-clamp-2 o-max-w-md o-text-zinc-500 dark:o-text-zinc-400">
            Un long paragraphe qui deborde largement de deux lignes : la troncature coupe
            le texte a la deuxieme ligne et ajoute des points de suspension, sans
            JavaScript ni mesure manuelle. Redimensionnez la fenetre : la coupe suit
            toujours la largeur disponible.
          </p>
        </DemoBlock>
      </Section>

      <Section
        title="Ombres de texte"
        lead="Trois intensites, calees sur l'echelle des ombres portees."
      >
        <DemoBlock
          center={false}
          code={`<p className="o-text-shadow-sm">ombre legere</p>
<p className="o-text-shadow-md">ombre moyenne</p>
<p className="o-text-shadow-lg">ombre marquee</p>`}
        >
          <div className="o-flex o-flex-wrap o-gap-8 o-text-2xl o-font-semibold">
            <span className="o-text-shadow-sm">ombre legere</span>
            <span className="o-text-shadow-md">ombre moyenne</span>
            <span className="o-text-shadow-lg">ombre marquee</span>
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Casse et variantes"
        lead="Transformations de casse, petites capitales et chiffres tabulaires — precieux pour aligner des colonnes de nombres."
      >
        <DemoBlock
          center={false}
          code={`<p className="o-uppercase o-tracking-wide">majuscules espacees</p>
<p className="o-small-caps">Petites Capitales</p>
<p className="o-tabular-nums">1 111 111 / 8 888 888</p>`}
        >
          <div className="o-flex o-flex-col o-gap-2 o-text-lg">
            <span className="o-uppercase o-tracking-wide">majuscules espacees</span>
            <span className="o-small-caps">Petites Capitales</span>
            <span className="o-tabular-nums">1 111 111 / 8 888 888</span>
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Texte en degrade"
        lead="o-text-gradient decoupe un fond en degrade a la forme des lettres — a combiner avec les utilitaires from/via/to."
      >
        <DemoBlock
          code={`<h2 className="o-text-4xl o-font-extrabold o-text-gradient o-bg-gradient-to-r o-from-brand-600 dark:o-from-brand-400 o-to-fuchsia-600 dark:o-to-fuchsia-400">
  Interfaces vivantes
</h2>`}
        >
          <h2 className="o-text-4xl o-font-extrabold o-text-gradient o-bg-gradient-to-r o-from-brand-600 dark:o-from-brand-400 o-to-fuchsia-600 dark:o-to-fuchsia-400">
            Interfaces vivantes
          </h2>
        </DemoBlock>
      </Section>
    </article>
  )
}
