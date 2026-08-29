/**
 * La bibliotheque d'animations transverses.
 *
 * Six effets installes par la CLI : pointeur, bordures, defilement, glissement,
 * carrousel. Chacun dans un atelier, avec ses reglages.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { BorderBeam } from '@/odoro/effect/BorderBeam.jsx'
import { Carousel } from '@/odoro/effect/Carousel.jsx'
import { Magnetic } from '@/odoro/effect/Magnetic.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { Parallax } from '@/odoro/effect/Parallax.jsx'
import { Spotlight } from '@/odoro/effect/Spotlight.jsx'
import { Atelier } from '../components/Atelier.jsx'
import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Cadre centre, pour les effets qui se jugent sur un seul element. */
function Stage({ children }: { children: ReactElement }): ReactElement {
  return (
    <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-p-8">
      {children}
    </div>
  )
}

/** Page de la bibliotheque d'animations. */
export function MotionsLibrairie(): ReactElement {
  return (
    <>
      <PageHeader
        module="odoro-bits"
        title="Bibliotheque d animations"
        lead="Les effets transverses — pointeur, bordures, defilement, glissement, carrousel. Ceux qui servent dans tous les projets."
      />

      <Callout>
        Trois d entre eux n executent <strong>aucun</strong> JavaScript par image : le
        trait de bordure, le bandeau et le halo. Le compositeur du navigateur les anime
        seul. Les trois autres prennent la boucle du moteur, et la page dit pourquoi a
        chaque fois.
      </Callout>

      <Section
        title="Attraction"
        lead="Un element attire par le pointeur, qui revient a sa place des qu'il s'eloigne. L'evenement deplace une cible ; c'est la boucle qui rejoint la cible."
      >
        <Atelier
          demoByDefault={false}
          height="o-h-64"
          controls={[
            {
              kind: 'range',
              name: 'strength',
              label: 'Force',
              min: 0,
              max: 1,
              step: 0.05,
              value: 0.35,
            },
            {
              kind: 'range',
              name: 'radius',
              label: 'Rayon',
              min: 40,
              max: 400,
              step: 10,
              value: 120,
              unit: ' px',
            },
            {
              kind: 'range',
              name: 'ease',
              label: 'Rattrapage',
              min: 1,
              max: 20,
              step: 0.5,
              value: 8,
            },
          ]}
        >
          {(values) => (
            <Stage>
              <Magnetic
                strength={values['strength'] as number}
                radius={values['radius'] as number}
                ease={values['ease'] as number}
              >
                <span className="o-inline-flex o-h-12 o-items-center o-rounded-full o-border-w-1 o-border-current o-px-6 o-text-sm o-font-medium">
                  Approchez le pointeur
                </span>
              </Magnetic>
            </Stage>
          )}
        </Atelier>

        <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
          Le rattrapage est exponentiel et exprime en fonction du temps ecoule. Une
          fraction constante ferait varier la vitesse avec la cadence de l ecran — deux
          fois plus rapide a cent vingt images par seconde — et le meme reglage ne
          donnerait pas le meme resultat chez deux personnes.
        </p>
      </Section>

      <Section
        title="Halo de pointeur"
        lead="Un halo suit le curseur sur une carte. Deux variables CSS ecrites au deplacement, aucun rendu React : le degrade se deplace tout seul."
      >
        <Atelier
          demoByDefault={false}
          height="o-h-72"
          controls={[
            {
              kind: 'range',
              name: 'size',
              label: 'Diametre',
              min: 80,
              max: 600,
              step: 20,
              value: 320,
              unit: ' px',
            },
            { kind: 'switch', name: 'border', label: 'Bordure', value: true },
          ]}
        >
          {(values) => (
            <Stage>
              <Spotlight
                size={values['size'] as number}
                border={values['border'] === true}
                className="o-w-full o-max-w-sm o-rounded-xl o-border-w-1 o-border-current o-p-6"
              >
                <h4 className="o-text-lg o-font-semibold">Une carte</h4>
                <p className="o-mt-2 o-text-sm o-opacity-70">
                  Promenez le pointeur : le halo suit sans amortissement. Il est sous le
                  curseur, et tout retard se verrait comme un decalage.
                </p>
              </Spotlight>
            </Stage>
          )}
        </Atelier>
      </Section>

      <Section
        title="Trait de bordure"
        lead="Un trait lumineux parcourt le contour. Un degrade conique tourne autour du centre : la bande balaie tout le contour, quelle que soit la forme."
      >
        <Atelier
          demoByDefault={false}
          height="o-h-72"
          controls={[
            {
              kind: 'range',
              name: 'duration',
              label: 'Duree',
              min: 800,
              max: 12000,
              step: 200,
              value: 4000,
              unit: ' ms',
            },
            {
              kind: 'range',
              name: 'width',
              label: 'Epaisseur',
              min: 1,
              max: 8,
              step: 1,
              value: 2,
              unit: ' px',
            },
            {
              kind: 'range',
              name: 'trail',
              label: 'Trainee',
              min: 5,
              max: 50,
              step: 1,
              value: 25,
              unit: ' %',
            },
          ]}
        >
          {(values, frame) => (
            <Stage>
              <BorderBeam
                duration={values['duration'] as number}
                width={values['width'] as number}
                trail={values['trail'] as number}
                color={frame.color}
                className="o-w-full o-max-w-sm o-rounded-xl o-border-w-1 o-border-current o-p-6"
              >
                <h4 className="o-text-lg o-font-semibold">Mise en avant</h4>
                <p className="o-mt-2 o-text-sm o-opacity-70">
                  La couleur du trait suit celle du texte, reglee dans le panneau.
                </p>
              </BorderBeam>
            </Stage>
          )}
        </Atelier>

        <CodeBlock
          code={`<BorderBeam duration={6000} trail={15} className="o-rounded-xl o-border-w-1 o-p-6">
  <p>Une carte mise en avant</p>
</BorderBeam>`}
        />
      </Section>

      <Section
        title="Bandeau defilant"
        lead="Le contenu est rendu deux fois et l'ensemble translate d'exactement la moitie : au moment ou la premiere copie disparait, la seconde occupe sa place au pixel pres."
      >
        <Atelier
          demoByDefault={false}
          height="o-h-40"
          controls={[
            {
              kind: 'range',
              name: 'speed',
              label: 'Vitesse',
              min: 5,
              max: 120,
              step: 5,
              value: 40,
            },
            { kind: 'switch', name: 'reverse', label: 'Inverser', value: false },
            { kind: 'switch', name: 'pause', label: 'Pause survol', value: true },
          ]}
        >
          {(values) => (
            <div className="o-absolute o-inset-0 o-flex o-items-center">
              <Marquee
                speed={values['speed'] as number}
                reverse={values['reverse'] === true}
                pauseOnHover={values['pause'] === true}
                className="o-w-full"
              >
                {['Routeur', 'Styles', 'Animations', 'Moteur', 'Registre', 'CLI'].map(
                  (word) => (
                    <span
                      key={word}
                      className="o-px-8 o-text-2xl o-font-bold o-tracking-tight o-opacity-70"
                    >
                      {word}
                    </span>
                  ),
                )}
              </Marquee>
            </div>
          )}
        </Atelier>

        <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
          La copie est retiree de l arbre d accessibilite : un lecteur d ecran annoncerait
          sinon deux fois la meme chose. Et la duree se deduit de la largeur reelle — une
          duree fixe ferait defiler un bandeau court aussi lentement qu un long.
        </p>
      </Section>

      <Section
        title="Parallaxe"
        lead="Un element qui se deplace moins vite que la page. La lecture passe par la boucle unique : un ecouteur de defilement produirait le tremblement caracteristique."
      >
        <div className="o-h-64 o-overflow-y-auto o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800">
          <div className="o-h-40" />
          <div className="o-relative o-h-56 o-overflow-hidden o-bg-zinc-950">
            <Parallax distance={120} scale={0.2} className="o-absolute o-inset-0">
              <div className="o-size-full o-bg-gradient-to-br o-from-brand-600 o-via-fuchsia-600 o-to-sky-500" />
            </Parallax>
            <p className="o-relative o-p-6 o-text-lg o-font-semibold o-text-white">
              Faites defiler ce cadre
            </p>
          </div>
          <div className="o-h-40" />
        </div>

        <Callout tone="warning">
          Cet effet lit le defilement de la <strong>fenetre</strong>, pas celui d une
          boite. Dans ce cadre, il ne bouge donc qu au defilement de la page — c est une
          limite du hook, pas du composant, et la dire vaut mieux que la maquiller.
        </Callout>
      </Section>

      <Section
        title="Carrousel"
        lead="Un rail de diapositives. Le defilement natif apporte le geste, l'inertie, la molette et le clavier ; il ne reste a notre charge que ce qu'il ne donne pas — l'accessibilite."
      >
        <Atelier
          demoByDefault={false}
          height="o-h-72"
          controls={[
            {
              kind: 'range',
              name: 'perView',
              label: 'Visibles',
              min: 1,
              max: 4,
              step: 1,
              value: 2,
            },
            {
              kind: 'range',
              name: 'gap',
              label: 'Ecart',
              min: 0,
              max: 48,
              step: 4,
              value: 16,
              unit: ' px',
            },
            { kind: 'switch', name: 'loop', label: 'Boucle', value: false },
          ]}
        >
          {(values, frame) => (
            <div className="o-absolute o-inset-0 o-flex o-items-center o-p-6">
              <Carousel
                label="Exemple de carrousel"
                perView={values['perView'] as number}
                gap={values['gap'] as number}
                loop={values['loop'] === true}
                className="o-w-full"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="o-flex o-h-32 o-items-center o-justify-center o-border-w-1 o-border-current o-text-3xl o-font-bold"
                    style={{ borderRadius: `${String(frame.radius)}px` }}
                  >
                    {n}
                  </div>
                ))}
              </Carousel>
            </div>
          )}
        </Atelier>

        <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
          L index suit le defilement reel plutot que l inverse : c est le navigateur qui
          fait autorite, y compris quand on fait glisser le rail a la main. Les
          diapositives sont numerotees et les commandes disent ou elles menent — ce que la
          plupart des carrousels oublient.
        </p>
      </Section>
    </>
  )
}
