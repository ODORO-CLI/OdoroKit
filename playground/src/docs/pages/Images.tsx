/**
 * Images : cadre, comparaison, deformation.
 *
 * Les images de demonstration sont generees en SVG, encodees dans la page.
 * Faire venir des photographies d'un service tiers rendrait ces previews
 * dependantes du reseau — et d'un service dont nous ne maitrisons ni la
 * disponibilite ni les conditions.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { Deform } from '@/odoro/effect/Deform.jsx'
import { Compare } from '@/odoro/image/Compare.jsx'
import { Frame } from '@/odoro/image/Frame.jsx'
import { Atelier, type AtelierControl } from '../components/Atelier.jsx'
import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Un reglage a curseur, ecrit une fois. */
function range(
  name: string,
  label: string,
  min: number,
  max: number,
  step: number,
  value: number,
): AtelierControl {
  return { kind: 'range', name, label, min, max, step, value }
}

/**
 * Fabrique une image de demonstration.
 *
 * Un degrade et quelques formes suffisent a juger un cadre, une comparaison ou
 * une deformation — et cela ne depend d'aucun service.
 */
function sample(from: string, to: string, seed: number): string {
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">`,
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>`,
    `</linearGradient></defs>`,
    `<rect width="320" height="180" fill="url(#g)"/>`,
    `<circle cx="${String(60 + seed * 40)}" cy="70" r="46" fill="white" opacity="0.18"/>`,
    `<circle cx="${String(230 - seed * 30)}" cy="120" r="62" fill="black" opacity="0.16"/>`,
    `<rect x="${String(40 + seed * 20)}" y="120" width="120" height="10" rx="5" fill="white" opacity="0.35"/>`,
    `</svg>`,
  ].join('')

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const BEFORE = sample('#1e1b4b', '#4338ca', 0)
const AFTER = sample('#3b0764', '#c026d3', 1)

/** Page de la categorie Images. */
export function Images(): ReactElement {
  return (
    <>
      <PageHeader
        module="odoro-bits"
        title="Images"
        lead="Un cadre qui ne fait pas sauter la page, une comparaison qui marche au clavier, et une deformation qui s'applique a n'importe quel contenu."
      />

      <Section
        title="Cadre"
        lead="Le rapport est pose des le premier rendu, a partir du seul nombre. L'image qui arrive ne pousse donc rien."
      >
        <Atelier
          demoByDefault={false}
          height="o-h-80"
          controls={[
            range('ratio', 'Rapport', 0.6, 2.5, 0.05, 1.777),
            range('zoom', 'Agrandissement', 0, 0.3, 0.01, 0.08),
          ]}
        >
          {(values) => (
            <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-p-6">
              <Frame
                src={AFTER}
                alt="Image de demonstration"
                ratio={values['ratio'] as number}
                zoom={values['zoom'] as number}
                className="o-w-full o-max-w-md o-rounded-lg"
              />
            </div>
          )}
        </Atelier>

        <Callout>
          Une image sans dimensions declarees occupe zero pixel jusqu a son chargement,
          puis pousse brutalement tout ce qui la suit. C est le decalage de mise en page
          le plus courant du web, et il est entierement evitable.
        </Callout>

        <CodeBlock
          code={`// Ce que le composant ne decide pas passe par le passe-plat.
<Frame
  src="/photo.jpg"
  alt="Vue de l atelier"
  srcSet="/photo-800.jpg 800w, /photo-1600.jpg 1600w"
  sizes="(min-width: 60rem) 50vw, 100vw"
  loading="lazy"
/>`}
        />
      </Section>

      <Section
        title="Avant / apres"
        lead="Un curseur, pas une image cliquable. Les fleches le deplacent, Origine et Fin le poussent aux extremites, et sa position est annoncee."
      >
        <Atelier
          demoByDefault={false}
          height="o-h-80"
          controls={[range('start', 'Depart', 0, 100, 1, 50)]}
        >
          {(values) => (
            <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-p-6">
              <Compare
                label="Comparaison de demonstration"
                before={{ src: BEFORE, alt: 'Version initiale' }}
                after={{ src: AFTER, alt: 'Version retouchee' }}
                start={values['start'] as number}
                className="o-w-full o-max-w-md o-rounded-lg"
              />
            </div>
          )}
        </Atelier>

        <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
          La position ne passe pas par l etat React : elle change a chaque mouvement du
          pointeur, et un rendu par evenement pendant tout le glissement serait du travail
          perdu. Une variable CSS suffit ; l etat ne sert qu a l annonce accessible.
        </p>
      </Section>

      <Section
        title="Deformation"
        lead="Un filtre de deplacement natif, applicable a un fond, a du texte ou a une image — indifferemment."
      >
        <Atelier
          demoByDefault={false}
          height="o-h-96"
          controls={[
            range('amount', 'Amplitude', 0, 40, 1, 12),
            range('frequency', 'Finesse', 0.002, 0.05, 0.001, 0.012),
            range('speed', 'Vitesse', 0, 1, 0.05, 0.15),
          ]}
        >
          {(values, frame) => (
            <div className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-6 o-p-6">
              <Deform
                amount={values['amount'] as number}
                frequency={values['frequency'] as number}
                speed={values['speed'] as number}
              >
                <div
                  className="o-flex o-w-64 o-flex-col o-gap-2 o-p-6"
                  style={{
                    borderRadius: `${String(frame.radius)}px`,
                    background:
                      'linear-gradient(135deg, var(--o-palette-brand-600), var(--o-palette-fuchsia-600))',
                  }}
                >
                  <span className="o-text-xl o-font-bold o-text-white">Un conteneur</span>
                  <span className="o-text-sm o-text-white o-opacity-80">
                    Fond et texte, deformes ensemble.
                  </span>
                </div>
              </Deform>

              <Deform
                amount={values['amount'] as number}
                frequency={values['frequency'] as number}
                speed={values['speed'] as number}
              >
                <Frame
                  src={AFTER}
                  alt=""
                  ratio={16 / 9}
                  className="o-w-64 o-rounded-lg"
                />
              </Deform>
            </div>
          )}
        </Atelier>

        <Callout tone="warning">
          Trois limites qu il vaut mieux connaitre avant de poser ce composant. Le texte
          est <strong>rasterise</strong> : au-dela d une dizaine de pixels d amplitude,
          les lettres perdent leur nettete. Le filtre cree un{' '}
          <strong>contexte d empilement</strong>, donc un enfant en position fixe s y
          ancrera. Et la turbulence est calculee <strong>une fois</strong> : le mouvement
          translate le champ plutot que de le regenerer, ce qui est moins riche et cent
          fois moins cher.
        </Callout>

        <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
          La voie evidente aurait ete de rendre le contenu dans une texture puis de la
          tordre dans un shader. C est une impasse des que le contenu est du DOM :
          capturer du HTML en image demande une bibliotheque tierce, echoue sur les
          polices distantes, ignore une partie des pseudo-elements, et casse des qu une
          image vient d une autre origine. Le filtre, lui, est natif.
        </p>

        <CodeBlock
          code={`// N importe quel contenu, y compris du texte.
<Deform amount={8}>
  <section className="o-rounded-xl o-bg-brand-600 o-p-8">
    <h2>Un titre</h2>
  </section>
</Deform>

// Ou seulement au survol.
<Deform amount={0} onHover>
  <img src="/photo.jpg" alt="" />
</Deform>`}
        />
      </Section>
    </>
  )
}
