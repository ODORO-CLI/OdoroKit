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
import { Player } from '@/odoro/image/Player.jsx'
import { Video } from '@/odoro/image/Video.jsx'
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

/**
 * Image a structure fine.
 *
 * Une deformation ne se voit pas sur un degrade lisse : deplacer un degrade
 * rend un degrade. Il faut des aretes — une grille, des rayures — pour que le
 * deplacement se lise.
 */
function grid(from: string, to: string): string {
  const lines: string[] = []
  for (let x = 0; x <= 320; x += 20) {
    lines.push(
      `<line x1="${String(x)}" y1="0" x2="${String(x)}" y2="180" stroke="white" stroke-opacity="0.45"/>`,
    )
  }
  for (let y = 0; y <= 180; y += 20) {
    lines.push(
      `<line x1="0" y1="${String(y)}" x2="320" y2="${String(y)}" stroke="white" stroke-opacity="0.45"/>`,
    )
  }

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">',
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>`,
    '<rect width="320" height="180" fill="url(#g)"/>',
    lines.join(''),
    '<circle cx="160" cy="90" r="52" fill="none" stroke="white" stroke-width="3"/>',
    '<circle cx="160" cy="90" r="26" fill="white" fill-opacity="0.9"/>',
    '</svg>',
  ].join('')

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/**
 * Une video minuscule, encodee dans la page.
 *
 * Faire venir un fichier d'un service tiers rendrait ces previews dependantes
 * du reseau. Cette sequence de quelques images suffit a montrer le cadrage,
 * les commandes et le comportement au clavier.
 */
const VIDEO =
  'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAr1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1NSByMjkxNyAwYTg0ZDk4IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxOCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbAAAAAAAAAAA'

/** Sujet des demonstrations de deformation. */
const DETAILLEE = grid('#1e1b4b', '#a21caf')

const BEFORE = sample('#1e1b4b', '#4338ca', 0)
const AFTER = sample('#3b0764', '#c026d3', 1)

/** Page de la categorie Images. */
export function Images(): ReactElement {
  return (
    <>
      <PageHeader
        module="@odoro/bits"
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
        <Callout>
          La grille et le cercle ne sont pas decoratifs : une deformation ne se voit que
          sur du detail. Deplacer un degrade lisse rend un degrade lisse — c est pour cela
          que la premiere version de cette page semblait ne rien faire.
        </Callout>

        <Callout>
          A quoi cela sert : donner de la matiere a une surface plate. Un fond qui ondule
          lentement, une image qui fremit au survol, une tache de couleur qui n a pas l
          air decoupee au compas. A forte amplitude, c est un parti pris graphique ; a
          faible amplitude, on ne le remarque pas et c est le but.
        </Callout>

        <Atelier
          demoByDefault={false}
          height="o-h-96"
          controls={[
            range('amount', 'Amplitude', 0, 60, 1, 22),
            range('frequency', 'Finesse', 0.002, 0.06, 0.001, 0.014),
            range('speed', 'Vitesse', 0, 1, 0.05, 0.15),
            {
              kind: 'choice',
              name: 'edges',
              label: 'Bords',
              options: ['clean', 'organic'],
              value: 'clean',
            },
          ]}
        >
          {(values) => (
            <div className="o-absolute o-inset-0 o-grid o-grid-cols-2 o-items-center o-gap-6 o-p-6">
              {/* Le temoin : la meme image, sans filtre. */}
              <div className="o-flex o-flex-col o-items-center o-gap-2">
                <span className="o-text-xs o-uppercase o-tracking-wide o-opacity-50">
                  sans
                </span>
                <Frame
                  src={DETAILLEE}
                  alt=""
                  ratio={16 / 9}
                  className="o-w-full o-rounded-lg"
                />
              </div>

              <div className="o-flex o-flex-col o-items-center o-gap-2">
                <span className="o-text-xs o-uppercase o-tracking-wide o-opacity-50">
                  deforme
                </span>
                <Deform
                  className="o-w-full"
                  amount={values['amount'] as number}
                  frequency={values['frequency'] as number}
                  speed={values['speed'] as number}
                  edges={values['edges'] as 'clean' | 'organic'}
                >
                  <Frame
                    src={DETAILLEE}
                    alt=""
                    ratio={16 / 9}
                    className="o-w-full o-rounded-lg"
                  />
                </Deform>
              </div>
            </div>
          )}
        </Atelier>

        <Callout tone="warning">
          Le reglage <strong>Bords</strong> merite un mot, parce que c est lui qui decide
          si l effet se lit ou pas. Un deplacement va chercher chaque pixel ailleurs ; au
          bord de l element, cet ailleurs est en dehors, et la silhouette part en
          lambeaux.
          <code className="o-font-mono o-text-xs"> clean</code> redecoupe donc le resultat
          sur la forme d origine — elle reste intacte, seul l interieur ondule.
          <code className="o-font-mono o-text-xs"> organic</code> laisse la silhouette se
          deformer : c est ce qu on veut pour une tache de couleur, et rarement pour une
          carte, dont les angles sont precisement ce qu on remarque.
        </Callout>

        <Section
          title="Sur une image, au survol"
          lead="Amplitude nulle au repos, montee en douceur quand le pointeur entre. C'est l'emploi le plus courant."
        >
          <div className="o-flex o-justify-center o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-8">
            <Deform amount={14} onHover speed={0.2} className="o-w-64">
              <Frame src={AFTER} alt="" ratio={16 / 9} className="o-rounded-lg" />
            </Deform>
          </div>
        </Section>

        <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
          La voie evidente aurait ete de rendre le contenu dans une texture puis de la
          tordre dans un shader. C est une impasse des que le contenu est du DOM :
          capturer du HTML en image demande une bibliotheque tierce, echoue sur les
          polices distantes, ignore une partie des pseudo-elements, et casse des qu une
          image vient d une autre origine. Le filtre, lui, est natif.
        </p>

        <Callout tone="warning">
          Deux autres limites. Le texte est <strong>rasterise</strong> : au-dela d une
          dizaine de pixels d amplitude, les lettres perdent leur nettete. Et la
          turbulence est calculee <strong>une fois</strong> — le mouvement translate le
          champ plutot que de le regenerer, ce qui est moins riche et cent fois moins
          cher.
        </Callout>

        <CodeBlock
          code={`// Le defaut preserve la forme : seul l interieur ondule.
<Deform amount={8}>
  <section className="o-rounded-xl o-bg-brand-600 o-p-8">
    <h2>Un titre</h2>
  </section>
</Deform>

// Pour une tache de couleur, on laisse la silhouette bouger.
<Deform amount={20} edges="organic">
  <div className="o-size-64 o-rounded-full o-bg-fuchsia-500" />
</Deform>`}
        />
      </Section>
      <Section
        title="Video de fond"
        lead="Le pendant du cadre, pour une video : rapport fige, affiche pendant le decodage, et lecture qui n'a lieu que dans le champ."
      >
        <div className="o-flex o-justify-center o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-8">
          <Video
            src={VIDEO}
            poster={DETAILLEE}
            ratio={16 / 9}
            className="o-w-80 o-rounded-lg"
          />
        </div>

        <Callout tone="warning">
          Sous <strong>mouvement reduit</strong>, elle ne demarre pas du tout et l affiche
          reste. C est le seul cas ou une image fixe est le rendu final plutot qu une
          attente : une video d ambiance n apporte rien d autre que son mouvement.
        </Callout>

        <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
          La lecture attend l entree dans le champ et s arrete a la sortie. Une video qui
          se decode hors de l ecran consomme processeur et batterie sans que personne ne
          la voie.
        </p>
      </Section>

      <Section
        title="Lecteur video"
        lead="Un lecteur habillable. Ce qui reste au natif reste au natif : decodage, mise en tampon, sous-titres, plein ecran."
      >
        <div className="o-flex o-justify-center o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-8">
          <Player
            src={VIDEO}
            poster={DETAILLEE}
            label="Video de demonstration"
            ratio={16 / 9}
            className="o-w-96 o-rounded-lg"
          />
        </div>

        <Callout>
          Les commandes natives fonctionnent parfaitement, et n ont aucune raison d etre
          remplacees si leur apparence convient. Ce lecteur existe pour une seule raison :
          elles ne sont pas habillables — ni couleur, ni forme, ni rayon, ni position.
        </Callout>

        <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
          L etat vient du media, jamais l inverse. Un lecteur qui tiendrait son propre
          etat de lecture se desynchroniserait au premier evenement exterieur — une touche
          media du clavier, une mise en pause par le systeme. Et la barre de progression
          est un <strong>curseur</strong> : role, bornes, valeur en secondes, fleches de
          cinq secondes.
        </p>

        <CodeBlock
          code={`<Player
  src="/presentation.mp4"
  poster="/presentation.jpg"
  label="Presentation du produit"
  tracks={[{ src: '/fr.vtt', srcLang: 'fr', label: 'Francais' }]}
/>`}
        />
      </Section>
    </>
  )
}
