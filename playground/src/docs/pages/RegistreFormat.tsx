/**
 * Le format d'une entree de registre : arborescence, meta.json, validation.
 *
 * @module
 */

import { type ReactElement } from 'react'
import { Link } from 'odoro-libs/router'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, PropsTable, Section } from '../components/DocBlocks.jsx'

/** Une regle de validation, avec le message qu'elle produit. */
function Regle({
  titre,
  pourquoi,
  message,
}: {
  titre: string
  pourquoi: string
  message?: string
}): ReactElement {
  return (
    <div className="o-flex o-flex-col o-gap-2 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-4">
      <h4 className="o-font-medium">{titre}</h4>
      <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">{pourquoi}</p>
      {message === undefined ? null : (
        <p className="o-font-mono o-text-xs o-text-red-600 dark:o-text-red-400 o-bg-red-50 dark:o-bg-red-950 o-border-w-1 o-border-red-200 dark:o-border-red-800 o-rounded-md o-px-3 o-py-2">
          {message}
        </p>
      )}
    </div>
  )
}

/** Page du format de registre. */
export function RegistreFormat(): ReactElement {
  return (
    <>
      <PageHeader
        module="odoro/registry"
        title="Le registre"
        lead="Les composants animes ne s'installent pas depuis npm : ils sont copies dans le projet, et deviennent du code que l'equipe possede."
      />

      <Section
        title="Pourquoi copier plutot que dependre"
        lead="Le choix a un cout — pas de mise a jour automatique — et une contrepartie qui le justifie."
      >
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Un composant d animation est presque toujours retouche. Un degrade change, une
          duree ne convient pas, un easing doit suivre la charte. Livre en dependance,
          chacune de ces retouches passerait par une propriete de plus, jusqu a ce que le
          composant en ait trente et que personne ne sache plus laquelle fait quoi. Livre
          en source, la retouche est une ligne modifiee.
        </p>
      </Section>

      <Section
        title="L arborescence"
        lead="Le dossier est l'identifiant. Le meta.json repete le nom et la categorie, et la validation refuse tout ecart : un composant declare sous un autre nom serait introuvable a l'adresse ou tout le monde le cherche."
      >
        <CodeBlock
          code={`registry/
  hooks/
    use-poster/
      meta.json
      hook.ts
  hero/
    molten/
      meta.json
      component.tsx
      shader.glsl.ts`}
        />
        <p className="o-text-zinc-500 dark:o-text-zinc-400">
          Sept categories, closes :{' '}
          {['text', 'background', 'effect', 'hero', 'ui', 'section', 'hooks'].map(
            (category, index, all) => (
              <span key={category}>
                <code className="o-font-mono o-text-sm o-text-brand-600 dark:o-text-brand-400">
                  {category}
                </code>
                {index === all.length - 1 ? '.' : ', '}
              </span>
            ),
          )}
        </p>
      </Section>

      <Section title="meta.json">
        <CodeBlock
          lang="json"
          code={`{
  "name": "use-poster",
  "category": "hooks",
  "title": "Repli visuel",
  "description": "Maintient un repli affiche jusqu a ce que la scene soit prete.",
  "engine": { "gsap": [], "gl": false },
  "files": [{ "path": "hook.ts", "target": "hooks/usePoster.ts" }],
  "dependencies": [],
  "registryDependencies": [],
  "tokens": ["--o-duration-slow"],
  "props": [{ "name": "fade", "type": "number", "default": 320, "unit": "ms" }],
  "perf": { "tier": "light", "backend": false }
}`}
        />

        <PropsTable
          rows={[
            {
              name: 'engine.gl',
              type: "false | 'ogl' | 'three'",
              defaultValue: 'false',
              description: 'Backend graphique requis.',
            },
            {
              name: 'files[].target',
              type: 'string',
              description:
                'Destination dans le projet, relative a l alias. Les chemins absolus et les remontees sont refuses.',
            },
            {
              name: 'registryDependencies',
              type: 'string[]',
              defaultValue: '[]',
              description: 'Autres entrees, sous la forme categorie/nom.',
            },
            {
              name: 'perf.tier',
              type: "'light' | 'medium' | 'heavy'",
              description: 'Niveau de cout.',
            },
            {
              name: 'perf.fallback',
              type: "'poster' | 'gradient' | 'static' | 'none'",
              defaultValue: '—',
              description: 'Obligatoire des que le niveau est heavy.',
            },
          ]}
        />

        <Callout>
          Les durees exposees en propriete sont <strong>toujours en millisecondes</strong>
          . C est une regle du registre, pas une convention locale : une entree en
          secondes et sa voisine en millisecondes produisent une erreur qu on ne voit qu a
          l execution.
        </Callout>
      </Section>

      <Section
        title="Ce que la validation refuse"
        lead="Six cas, tous verifies avant publication. Les problemes sont rassembles avant d'echouer : sur quarante entrees, apres un changement de format, s'arreter au premier imposerait quarante allers-retours."
      >
        <div className="o-flex o-flex-col o-gap-3">
          <Regle
            titre="Un meta.json mal forme"
            pourquoi="Le message cite le chemin du champ fautif, plutot que de dire « invalide » et laisser chercher."
            message="hero/molten → perf.tier : Un composant employant une scene 3D est necessairement de cout eleve."
          />
          <Regle
            titre="Un fichier declare qui n existe pas"
            pourquoi="Le schema ne connait pas le disque. Cette verification est faite a la lecture."
            message='text/casse : le fichier declare "absent.tsx" est introuvable.'
          />
          <Regle
            titre="Une dependance qui pointe dans le vide"
            pourquoi="Elle serait sinon decouverte par le premier utilisateur qui installe le composant, sur sa machine, au moment le moins opportun."
            message="Entree introuvable : hooks/nulle-part, reclamee par text/casse"
          />
          <Regle
            titre="Un cycle"
            pourquoi="L erreur donne le chemin complet. Une erreur qui dit seulement « cycle detecte » oblige a le chercher a la main dans tout le registre."
            message="Cycle de dependances : a/un → b/deux → c/trois → a/un"
          />
          <Regle
            titre="Une destination absolue, remontante, ou en double"
            pourquoi="La CLI ecrit chez l utilisateur : un chemin non borne y serait une porte ouverte. Deux fichiers vers la meme destination, et le second effacerait le premier sans que rien ne le signale."
          />
          <Regle
            titre="Une incoherence de cout"
            pourquoi="Un composant couteux sans repli ; un backend declare de deux facons differentes ; une scene 3D classee autrement que couteuse. La CLI et l arbitre de surfaces se fient a ces champs pour decider."
          />
        </div>
      </Section>

      <Section
        title="Le meme schema aux deux bouts"
        lead="Le schema vit du cote client, et non dans le paquet du registre."
      >
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Ce n est pas arbitraire : le registre valide ce qu il produit avant de le
          publier, mais le client valide ce qu il <strong>recoit</strong> — d un serveur
          qu il ne controle pas, juste avant d ecrire des fichiers dans le projet de
          quelqu un. C est la que la validation compte le plus.
        </p>
        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          <Link
            to="/docs/registre/cli"
            className="o-text-brand-600 dark:o-text-brand-300 hover:o-text-brand-700 dark:hover:o-text-brand-200 o-underline"
          >
            Les commandes
          </Link>{' '}
          montrent le cote consommateur : installation, comparaison, diagnostic.
        </p>
      </Section>
    </>
  )
}
