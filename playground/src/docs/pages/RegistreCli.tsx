/**
 * Les commandes de registre : init, add, list, diff, doctor.
 *
 * Les sorties reproduites ici sont celles de la vraie CLI, relevees sur un
 * projet d'essai. Les recopier a la main les aurait fait diverger du premier
 * changement de formulation.
 *
 * @module
 */

import { type ReactElement } from 'react'
import { Link } from '@odoro-cli/libs/router'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, PropsTable, Section } from '../components/DocBlocks.jsx'

/** Sortie de terminal, telle qu'elle apparait. */
function Terminal({ children }: { children: string }): ReactElement {
  return (
    <pre
      className="o-overflow-x-auto o-rounded-lg o-border-w-1 o-p-4 o-font-mono o-text-xs o-leading-relaxed"
      style={{
        backgroundColor: 'var(--o-palette-zinc-950)',
        borderColor: 'var(--o-palette-zinc-800)',
        color: 'var(--o-palette-zinc-300)',
      }}
    >
      {children}
    </pre>
  )
}

/** Page des commandes de registre. */
export function RegistreCli(): ReactElement {
  return (
    <>
      <PageHeader
        module="odoro"
        title="Installer un composant"
        lead="Quatre commandes et un fichier. Ce qui est copie devient votre code — la CLI ne fait que l'apporter, et se souvenir de ce qu'elle a apporte."
      />

      <Section title="Le cycle complet">
        <Terminal>{`odoro init                     # ecrit odoro.json
odoro list                     # le catalogue
odoro add molten               # copie le composant et ses dependances
odoro diff                     # ce qui a bouge depuis
odoro doctor                   # ce qui ne va pas`}</Terminal>

        <PropsTable
          rows={[
            {
              name: '--registry <src>',
              type: 'url | dossier',
              defaultValue: 'celui du projet',
              description:
                'Un dossier local n est pas un mode degrade : c est ainsi qu on developpe le registre, et qu un studio garde ses composants pour lui.',
            },
            {
              name: '--yes',
              type: 'drapeau',
              defaultValue: 'false',
              description: 'Supprime toute question. Necessaire hors terminal.',
            },
            {
              name: '--root <chemin>',
              type: 'chemin',
              defaultValue: 'dossier courant',
              description: 'Racine du projet.',
            },
          ]}
        />
      </Section>

      <Section
        title="init"
        lead="La commande lit le tsconfig.json pour en deduire le prefixe d'import. Les commentaires et les virgules finales que TypeScript autorise y sont geres — JSON.parse seul les refuse."
      >
        <Terminal>{`$ odoro init
odoro Alias trouve dans tsconfig.json : @/* vers src/.
odoro odoro.json ecrit.
  destination  src/odoro/
  imports      @/odoro/…
  registre     https://registre.odoro.dev`}</Terminal>

        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Quand aucun alias n est declare, la commande le dit et retombe sur un chemin nu.
          La reponse est notee dans{' '}
          <code className="o-font-mono o-text-sm">odoro.json</code> et n est plus jamais
          redemandee.
        </p>
      </Section>

      <Section
        title="add"
        lead="Ce qui arrive sans avoir ete demande est annonce avant, pas decouvert apres coup dans le suivi de version."
      >
        <Terminal>{`$ odoro add molten
odoro Dependances ajoutees : hooks/use-poster
odoro molten charge une scene 3D : environ 130 Ko compresses au premier
      affichage. Le backend leger en demande 13, si un effet plein ecran suffit.
odoro A installer ensuite : gsap three

  + src/odoro/hooks/usePoster.ts
  + src/odoro/hero/Molten.tsx

odoro 2 fichier(s) ecrit(s).`}</Terminal>

        <Callout>
          Les chiffres de poids sont <strong>mesures</strong>, pas estimes : une scene
          minimale compilee et compressee. Un backend n est compte qu une fois, meme
          reclame par cinq composants — il n est charge qu une fois, et un avertissement
          qu on apprend a ignorer ne sert plus a rien.
        </Callout>
      </Section>

      <Section
        title="L ecriture est transactionnelle"
        lead="Une installation ecrit plusieurs fichiers. Si la troisieme echoue, une approche naive laisse un projet a moitie servi — et personne ne sait ce qui a ete touche."
      >
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Les fichiers sont donc d abord ecrits <strong>a cote</strong> de leur
          destination, sous un nom temporaire ; rien d observable n a change a ce stade.
          Ils ne sont mis en place qu ensuite. Un echec avant la mise en place laisse le
          projet exactement dans l etat ou on l a trouve.
        </p>
        <Callout tone="warning">
          La mise en place elle-meme n est pas atomique entre plusieurs fichiers — le
          systeme n offre rien de tel. Les contenus precedents sont gardes et remis en
          place, ce qui reste une reparation. Le compromis est nomme plutot que
          sous-entendu : la phase risquee, celle qui remplit le disque et rencontre les
          permissions, est integralement couverte.
        </Callout>
      </Section>

      <Section
        title="diff, et les trois versions"
        lead="Comparer le fichier local a celui du registre ne dit presque rien : s'ils different, on ne sait pas si c'est une retouche locale ou une evolution amont. Ce sont pourtant deux situations opposees."
      >
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          L empreinte notee a l installation fournit le troisieme point de reference. Avec
          elle, les quatre cas se distinguent sans ambiguite.
        </p>

        <Terminal>{`$ odoro diff

  hooks/use-pointer-damped src/odoro/hooks/usePointerDamped.ts
    une mise a jour existe
    - const { host, speed = 3, name = 'pointeur' } = options
    + const { host, speed = 5, name = 'pointeur-amorti' } = options

  hooks/use-poster src/odoro/hooks/usePoster.ts
    retouche localement`}</Terminal>

        <div className="o-overflow-x-auto o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800">
          <table className="o-w-full o-text-sm">
            <thead>
              <tr className="o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-text-left">
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  local vs livre
                </th>
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  amont vs livre
                </th>
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  verdict
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['identique', 'identique', 'a jour'],
                ['different', 'identique', 'retouche localement'],
                ['identique', 'different', 'une mise a jour existe'],
                ['different', 'different', 'divergence'],
              ].map((row) => (
                <tr
                  key={row.join()}
                  className="o-border-b o-border-zinc-100 dark:o-border-zinc-900"
                >
                  <td className="o-px-4 o-py-2 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                    {row[0]}
                  </td>
                  <td className="o-px-4 o-py-2 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                    {row[1]}
                  </td>
                  <td className="o-px-4 o-py-2 o-text-zinc-900 dark:o-text-zinc-50">
                    {row[2]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Le dernier cas est le seul qui demande une decision humaine, et c est exactement
          celui qu une comparaison a deux termes aurait noye dans les autres.
        </p>
      </Section>

      <Section
        title="doctor"
        lead="Ce qui empeche le projet de fonctionner, separe de ce qui merite seulement d'etre su."
      >
        <Terminal>{`$ odoro doctor

  · registre : https://registre.odoro.dev
  · 1 fichier(s) retouche(s) localement : "odoro add" les reecrirait.

  · gsap est requis par un composant installe mais absent du package.json.

odoro 1 probleme(s).`}</Terminal>

        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Une retouche locale n est pas un probleme — c est la raison d etre de la copie.
          Elle est signalee parce qu une reinstallation l effacerait.
        </p>
      </Section>

      <Section
        title="Le jeton @registre"
        lead="Un composant qui importe son voisin ne peut pas ecrire le chemin en dur : la destination depend du projet d'accueil."
      >
        <CodeBlock
          code={`// Dans les sources du registre :
import { usePoster } from '@registre/hooks/usePoster'

// Ce qui est ecrit chez vous :
import { usePoster } from '@/odoro/hooks/usePoster'`}
        />
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Le jeton ne resout nulle part, ce qui est voulu : un composant qui l aurait
          garde par accident echoue a la compilation au lieu d aller chercher sur npm.
          Tout le reste est laisse intact —{' '}
          <code className="o-font-mono o-text-sm">odoro-engine</code>,{' '}
          <code className="o-font-mono o-text-sm">react</code>,{' '}
          <code className="o-font-mono o-text-sm">gsap</code> sont de vrais paquets : ils
          s installent, ils ne se copient pas.
        </p>
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          <Link
            to="/docs/registre"
            className="o-text-brand-600 dark:o-text-brand-300 hover:o-text-brand-700 dark:hover:o-text-brand-200 o-underline"
          >
            Le format
          </Link>{' '}
          decrit le cote producteur : arborescence, meta.json, validation.
        </p>
      </Section>
    </>
  )
}
