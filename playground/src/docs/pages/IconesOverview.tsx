/**
 * Le module d'icones : ce qu'il est, et comment on choisit un jeu.
 *
 * @module
 */

import { Icon, type IconData } from '@odoro/icons'
import { ArrowRight, Bell, Check, Heart, Search, Star } from '@odoro/icons/filaire'
import { type ReactElement } from 'react'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Ce que chaque jeu apporte, et ce qu'il coute. */
const JEUX = [
  {
    module: 'filaire',
    titre: 'Filaire',
    nombre: 2048,
    grille: '24 · trait de 2',
    resume:
      'Le plus regulier : meme epaisseur, memes terminaisons arrondies partout. Le choix par defaut pour une interface.',
  },
  {
    module: 'compact',
    titre: 'Compact',
    nombre: 2078,
    grille: '16 · plein',
    resume:
      'Dessine pour de petites tailles. A seize pixels, il reste lisible la ou un trace au trait se brouille.',
  },
  {
    module: 'classique',
    titre: 'Classique',
    nombre: 2001,
    grille: '512 · plein',
    resume:
      'Le vocabulaire graphique du web depuis quinze ans. Dense, immediatement reconnaissable, peu neutre.',
  },
  {
    module: 'etendu',
    titre: 'Etendu',
    nombre: 3903,
    grille: '960 · contour',
    resume:
      'De loin le plus vaste. Il couvre des domaines que les autres ignorent, au prix d une qualite inegale.',
  },
  {
    module: 'marques',
    titre: 'Marques',
    nombre: 609,
    grille: '512 · plein',
    resume:
      'Logos de services et de plateformes. Des marques deposees : leur emploi ne releve pas d une licence de code.',
  },
] as const

/** La meme icone, coloree par la classe de texte qui la porte. */
const TEINTES: readonly { readonly tone: string; readonly icon: IconData }[] = [
  { tone: 'o-text-zinc-900 dark:o-text-zinc-100', icon: Star },
  { tone: 'o-text-brand-600 dark:o-text-brand-400', icon: Heart },
  { tone: 'o-text-emerald-600 dark:o-text-emerald-400', icon: Check },
  { tone: 'o-text-amber-600 dark:o-text-amber-400', icon: Bell },
  { tone: 'o-text-sky-600 dark:o-text-sky-400', icon: Search },
  { tone: 'o-text-fuchsia-600 dark:o-text-fuchsia-400', icon: ArrowRight },
]

/** Page d'ensemble du module d'icones. */
export function IconesOverview(): ReactElement {
  return (
    <>
      <PageHeader
        module="@odoro/icons"
        title="Icones"
        lead="Cinq jeux, dix mille six cent trente-neuf icones, un seul composant pour les rendre."
      />

      <Section
        title="Une donnee, pas un composant par icone"
        lead="Le choix qui decide de tout le reste."
      >
        <p className="o-max-w-prose o-text-zinc-600 dark:o-text-zinc-300">
          La solution repandue est un composant par icone. A dix mille six cent
          trente-neuf, cela fait autant de fermetures, autant d entrees dans le graphe du
          bundler, et un temps de compilation qui se compte en dizaines de secondes meme
          quand on en emploie trois.
        </p>
        <p className="o-max-w-prose o-text-zinc-600 dark:o-text-zinc-300">
          Une icone est ici une <strong>donnee</strong> : sa boite, son mode, ses noeuds.
          Un composant unique les rend toutes. L elagage fonctionne aussi bien — une
          constante non referencee disparait exactement comme un composant non reference —
          et la compilation redevient instantanee.
        </p>

        <CodeBlock
          lang="tsx"
          code={`import { Icon } from '@odoro/icons'
import { Download, Search } from '@odoro/icons/filaire'

// Decorative, a cote d'un mot : elle grandit avec lui.
<button className="o-inline-flex o-items-center o-gap-2 o-text-brand-600">
  <Icon icon={Download} />
  Telecharger
</button>

// Seule : elle porte le sens, donc elle a un intitule.
<Icon icon={Search} size={20} label="Rechercher" />`}
        />
      </Section>

      <Section
        title="La couleur vient du texte"
        lead="Il n y a pas de propriete de couleur, et c est delibere."
      >
        <p className="o-max-w-prose o-text-zinc-600 dark:o-text-zinc-300">
          Le trace prend <code className="o-font-mono o-text-sm">currentColor</code>. Une
          classe de texte colore donc l icone comme elle colore le reste, y compris au
          changement de theme. Une propriete de couleur creerait un second chemin, qui
          divergerait du premier des le premier basculement.
        </p>

        <div className="o-flex o-flex-wrap o-items-center o-gap-6 o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-6">
          {TEINTES.map(({ tone, icon }) => (
            <Icon key={tone} icon={icon} size={28} className={tone} />
          ))}
        </div>

        <p className="o-max-w-prose o-text-zinc-600 dark:o-text-zinc-300">
          La taille par defaut est <code className="o-font-mono o-text-sm">1em</code> :
          une icone placee dans un titre est grande sans qu on ait rien a regler. Un
          nombre force une taille en pixels, pour une icone seule qui ne suit aucun texte.
        </p>
      </Section>

      <Section
        title="Choisir un jeu, et s y tenir"
        lead="Les jeux ne partagent ni grille, ni epaisseur, ni style."
      >
        <p className="o-max-w-prose o-text-zinc-600 dark:o-text-zinc-300">
          Aucun jeu n est ramene a une grille commune : redessiner un trace pour le faire
          tenir ailleurs, c est le deformer. Chacun garde donc sa boite, et le composant s
          y adapte. Ce qui reste different — l epaisseur apparente, le style du dessin —
          est precisement la raison pour laquelle on en choisit un seul.
        </p>

        <div className="o-overflow-x-auto">
          <table className="o-w-full o-text-left o-text-sm">
            <thead>
              <tr className="o-border-b o-border-zinc-200 dark:o-border-zinc-800">
                <th className="o-py-2 o-pr-4 o-font-medium">Module</th>
                <th className="o-py-2 o-pr-4 o-font-medium">Grille</th>
                <th className="o-py-2 o-pr-4 o-font-medium o-text-right">Icones</th>
                <th className="o-py-2 o-font-medium">Caractere</th>
              </tr>
            </thead>
            <tbody>
              {JEUX.map((jeu) => (
                <tr
                  key={jeu.module}
                  className="o-border-b o-border-zinc-100 dark:o-border-zinc-900"
                >
                  <td className="o-py-3 o-pr-4 o-align-top o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-400">
                    odoro-icons/{jeu.module}
                  </td>
                  <td className="o-py-3 o-pr-4 o-align-top o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                    {jeu.grille}
                  </td>
                  <td className="o-py-3 o-pr-4 o-align-top o-text-right o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400">
                    {jeu.nombre}
                  </td>
                  <td className="o-py-3 o-align-top o-text-zinc-600 dark:o-text-zinc-300">
                    {jeu.resume}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="o-max-w-prose o-text-zinc-600 dark:o-text-zinc-300">
          Le seul melange qui se defende est un jeu principal plus{' '}
          <code className="o-font-mono o-text-sm">marques</code> : les logos n ont de
          toute facon aucun style commun avec le reste.
        </p>
      </Section>

      <Section title="Ce que le module ne dessine pas">
        <Callout>
          Aucun de ces traces n est de nous. Le module importe cinq jeux tiers et les
          normalise ; les licences — ISC, MIT, CC BY 4.0, Apache 2.0 — sont reportees dans{' '}
          <code className="o-font-mono o-text-sm">CREDITS.md</code> a la racine, avec la
          correspondance entre chaque module et son jeu d origine.
        </Callout>

        <Callout tone="warning">
          Les 609 logos de <code className="o-font-mono o-text-sm">marques</code> sont des{' '}
          <strong>marques deposees</strong>. Aucune licence de code ne regit leur emploi :
          ce sont les regles de chaque proprietaire. Designer un service par son logo est
          l usage nominatif ordinaire ; suggerer une affiliation qui n existe pas, ou
          modifier un logo, ne le devient pas parce que le fichier etait libre.
        </Callout>
      </Section>
    </>
  )
}
