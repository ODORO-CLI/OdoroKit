/**
 * Le contrat de personnalisation, montre sur un composant reellement installe.
 *
 * `ScrollProgress` n'est pas importe du registre : il a ete copie dans
 * `src/odoro/effect/` par `odoro add`, et il est importe par l'alias du
 * projet. C'est la chaine entiere — format, validation, compilation,
 * installation, contrat — qui rend cette page.
 *
 * Les deux instances suivent la lecture de **cette page**. Une demonstration
 * dans un cadre a defilement interne aurait ete plus compacte, et fausse :
 * `useScrollProgress` observe le defilement de la fenetre, pas celui d'une
 * boite. Faites defiler pour les voir travailler.
 *
 * @module
 */

import { type ReactElement, useRef, useState } from 'react'
import { Link } from 'odoro-libs/router'

import { ScrollProgress } from '@/odoro/effect/ScrollProgress.jsx'
import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Une ligne de l'echelle des niveaux. */
function Niveau({
  rang,
  titre,
  quand,
}: {
  rang: string
  titre: string
  quand: string
}): ReactElement {
  return (
    <div className="o-flex o-gap-4 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-4">
      <span className="o-flex o-h-7 o-w-7 o-shrink-0 o-items-center o-justify-center o-rounded-full o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400 o-text-sm o-font-mono">
        {rang}
      </span>
      <div className="o-flex o-flex-col o-gap-1">
        <span className="o-font-medium">{titre}</span>
        <span className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">{quand}</span>
      </div>
    </div>
  )
}

/** Page du contrat de personnalisation. */
export function RegistreContrat(): ReactElement {
  const article = useRef<HTMLDivElement>(null)
  const [lu, setLu] = useState('—')

  return (
    <div ref={article}>
      {/*
        Niveaux 1 a 3. La classe par defaut du composant est `o-fixed` ; seul
        `style` permet de garantir qu'il passe au-dessus de l'en-tete, parce
        qu'une classe de meme specificite ne gagnerait pas a coup sur.
      */}
      <ScrollProgress target={article} thickness={4} style={{ zIndex: 60 }} />

      {/* Niveaux 4 et 5 sur une meme instance, ancree au bas de la fenetre. */}
      <ScrollProgress
        target={article}
        position="bottom"
        style={{ zIndex: 60 }}
        onReady={({ handle, motion }) => {
          if (motion.reduced) return
          const timer = setInterval(() => setLu(handle.read().toFixed(2)), 250)
          // Ce que le rappel rend est appele au demontage. Sans cela,
          // l'echappatoire serait une fuite offerte par l'API elle-meme.
          return () => clearInterval(timer)
        }}
      >
        {({ progress }) => (
          <div className="o-flex o-justify-end o-p-3">
            <span className="o-rounded-full o-glass o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-text-zinc-900 dark:o-text-zinc-50 o-px-3 o-py-1 o-text-xs o-font-mono o-tabular-nums">
              lecture {Math.round(progress * 100)} %
            </span>
          </div>
        )}
      </ScrollProgress>

      <PageHeader
        module="odoro-engine"
        title="Le contrat de personnalisation"
        lead="Cinq facons d'adapter un composant sans en editer la source — et donc sans avoir a reporter la retouche a chaque mise a jour."
      />

      <Callout>
        Le composant de cette page n est pas importe du registre : il a ete copie dans{' '}
        <code className="o-font-mono o-text-xs">playground/src/odoro/effect/</code> par{' '}
        <code className="o-font-mono o-text-xs">odoro add scroll-progress</code>, puis
        importe par l alias du projet. Deux instances tournent en ce moment : la barre en
        haut de la fenetre, et la pastille en bas. Faites defiler.
      </Callout>

      <Section
        title="L echelle"
        lead="Les niveaux sont ordonnes par la distance qu'il faut parcourir pour les atteindre. On ne descend d'un cran que lorsque le precedent ne suffit pas."
      >
        <div className="o-flex o-flex-col o-gap-3">
          <Niveau
            rang="1"
            titre="Les tokens"
            quand="Changer une variable CSS modifie tous les composants a la fois. Rien a toucher dans le code."
          />
          <Niveau
            rang="2"
            titre="Les props"
            quand="L API documentee, celle que la table des proprietes decrit."
          />
          <Niveau
            rang="3"
            titre="Le passe-plat"
            quand="className, style, ref, attributs DOM : poser le composant dans une mise en page, sans rien savoir de son interieur."
          />
          <Niveau
            rang="4"
            titre="Le slot de rendu"
            quand="Remplacer ce qui est affiche en gardant la mecanique — les mesures, les abonnements, le cycle de vie."
          />
          <Niveau
            rang="5"
            titre="onReady"
            quand="L echappatoire : l objet imperatif lui-meme, pour ce que l API n a pas prevu."
          />
        </div>

        <Callout tone="warning">
          Il existe un sixieme niveau : editer le fichier. Il est legitime — la copie est
          faite pour cela. Mais chaque retouche est une retouche a refaire :{' '}
          <Link
            to="/docs/registre/cli"
            className="o-text-brand-600 dark:o-text-brand-300 hover:o-text-brand-700 dark:hover:o-text-brand-200 o-underline"
          >
            <code className="o-font-mono o-text-xs">odoro diff</code>
          </Link>{' '}
          la signalera, et il faudra la reporter a la main quand l entree amont evoluera.
          Les cinq niveaux ci-dessus survivent a une reinstallation.
        </Callout>
      </Section>

      <Section
        title="Niveau 3 — poser, pas repeindre"
        lead="Le passe-plat sert a placer le composant. Ce qu'il ne fait pas est aussi instructif que ce qu'il fait."
      >
        <Callout tone="warning">
          La classe par defaut du composant est{' '}
          <code className="o-font-mono o-text-xs">o-fixed</code>. Lui passer{' '}
          <code className="o-font-mono o-text-xs">o-absolute</code> en{' '}
          <code className="o-font-mono o-text-xs">className</code> ne suffirait pas : l
          ordre des classes dans l attribut n a <strong>aucun</strong> effet sur la
          cascade. Entre deux regles de meme specificite, c est celle qui vient en dernier{' '}
          <em>dans la feuille</em> qui gagne. C est la source la plus courante de «
          pourquoi ma classe ne s applique pas ».
        </Callout>

        <CodeBlock
          code={`// Ne marche pas de facon fiable : meme specificite que o-fixed.
<ScrollProgress className="o-absolute" />

// Marche toujours : en ligne, c est la derniere ecriture qui reste.
<ScrollProgress style={{ position: 'absolute' }} />

// Ce que la barre du haut de cette page recoit reellement :
<ScrollProgress target={article} thickness={4} style={{ zIndex: 60 }} />`}
        />

        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          D ou la place du niveau 3 dans l echelle : marges, position, largeur,{' '}
          <code className="o-font-mono o-text-sm">z-index</code> — ce qui ne se dispute
          pas. Pour repeindre avec certitude, il y a un token au-dessus et{' '}
          <code className="o-font-mono o-text-sm">style</code> en dessous.
        </p>

        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Les classes du composant sont <strong>conservees</strong>, jamais remplacees :
          un composant qui ecraserait les siennes par celles qu on lui passe perdrait sa
          mise en forme des qu on veut seulement le decaler d un cran.
        </p>
      </Section>

      <Section
        title="Niveau 4 — remplacer le rendu, garder la mesure"
        lead="Un balisage convient rarement a deux maquettes. Le slot rend l'affichage remplacable sans toucher au calcul. La pastille en bas de la fenetre en est un."
      >
        <CodeBlock
          code={`<ScrollProgress target={article} position="bottom">
  {({ progress }) => (
    <span>lecture {Math.round(progress * 100)} %</span>
  )}
</ScrollProgress>`}
        />

        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Sans slot, la progression n est jamais un etat React : elle est ecrite
          directement dans le <code className="o-font-mono o-text-sm">transform</code> de
          la barre, et le defilement ne provoque aucun rendu — c est le cas de la barre du
          haut. Avec un slot il en faut bien un, mais la cadence est bornee au centieme :
          plus fin que ce qu un pourcentage peut montrer, et cent fois moins de rendus qu
          une image.
        </p>
      </Section>

      <Section
        title="Niveau 5 — l echappatoire"
        lead="Sans elle, chaque besoin non prevu devient une propriete de plus. Au bout d'un an, le composant en a trente et la moitie ne sert qu'a un seul projet."
      >
        <div className="o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-6">
          <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Lecture imperative de la pastille, relevee quatre fois par seconde :{' '}
            <span className="o-font-mono o-text-zinc-900 dark:o-text-zinc-50 o-tabular-nums">
              {lu}
            </span>
          </p>
        </div>

        <CodeBlock
          code={`<ScrollProgress
  onReady={({ handle, motion }) => {
    if (motion.reduced) return
    const timer = setInterval(() => setLu(handle.read().toFixed(2)), 250)
    return () => clearInterval(timer)  // appele au demontage
  }}
/>`}
        />

        <Callout>
          Le rappel est ecrit en ligne, donc c est une valeur neuve a chaque rendu du
          parent — et ce parent se rerend quatre fois par seconde, puisque c est lui qui
          affiche la valeur relevee. Il n est pourtant appele <strong>qu une fois</strong>{' '}
          : la fonction est gardee dans une reference, et l effet ne depend que de l objet
          et de l element. Sans cela, chaque relevé poserait un intervalle de plus.
        </Callout>

        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Le contexte porte aussi l etat du mouvement. L echappatoire contourne l API du
          composant, pas la preference de l utilisateur : sous mouvement reduit, le rappel
          ci-dessus ne pose aucun intervalle.
        </p>
      </Section>

      <Section
        title="Ce que la validation verifie"
        lead="Trois regles sur cinq niveaux. Les deux autres se lisent, elles ne se mesurent pas — et un refus arbitraire sur du code correct est pire que pas de verification : on apprend a contourner l'outil."
      >
        <div className="o-flex o-flex-col o-gap-3">
          <Niveau
            rang="1"
            titre="Les tokens declares et employes coincident"
            quand="Dans les deux sens. L ecart est invisible a la relecture — il faut avoir les deux fichiers sous les yeux — et il trompe exactement qui cherche quelle variable regler."
          />
          <Niveau
            rang="3"
            titre="Un composant qui rend un element mentionne className"
            quand="La presence du nom, pas la correction de la fusion : celle-ci vient de mergePresentation, pas d une lecture textuelle. La regle attrape l oubli, pas la maladresse."
          />
          <Niveau
            rang="1"
            titre="Aucune couleur ecrite en dur"
            quand="Une couleur en dur echappe aux tokens : le composant restera seul de son espece dans une page qui a change de theme."
          />
        </div>

        <CodeBlock
          code={`$ pnpm --filter odoro-bits registry:validate
Registre invalide — 1 probleme(s) :

  · hooks/use-poster : le token --o-duration-slow est declare mais n'est
    employe nulle part.`}
        />

        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Cet exemple n est pas invente : c est ce que la regle a signale la premiere fois
          qu elle a tourne, sur une entree de ce registre. La declaration etait restee
          apres que la duree soit passee en propriete.
        </p>
      </Section>
    </div>
  )
}
