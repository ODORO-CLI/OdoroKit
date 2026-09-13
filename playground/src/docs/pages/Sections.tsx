/**
 * Sections : les compositions de page qui portent une mecanique.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { Faq } from '@/odoro/section/Faq.jsx'
import { LogoBand } from '@/odoro/section/LogoBand.jsx'
import { RevealGrid } from '@/odoro/section/RevealGrid.jsx'
import { ScrollSteps } from '@/odoro/section/ScrollSteps.jsx'
import { StickyStack } from '@/odoro/section/StickyStack.jsx'
import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Une carte d'exemple, employee par plusieurs demonstrations. */
function Carte({
  titre,
  texte,
  tone,
}: {
  titre: string
  texte: string
  tone: string
}): ReactElement {
  return (
    <article
      className={`o-flex o-flex-col o-gap-2 o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-6 ${tone}`}
    >
      <h4 className="o-font-semibold o-tracking-tight">{titre}</h4>
      <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">{texte}</p>
    </article>
  )
}

/** Page de la categorie Sections. */
export function Sections(): ReactElement {
  return (
    <>
      <PageHeader
        module="@odoro-cli/bits"
        title="Sections"
        lead="Cinq compositions de page. Pas de tarifs, pas de temoignages, pas d’équipe : ce sont des structures de contenu, et une version generique y est plus longue a plier qu’a reecrire."
      />

      <Callout>
        Une section n’entre dans ce registre que si elle porte une{' '}
        <strong>mecanique</strong> — un calcul de défilement, un enchainement, un collage.
        Ce qui n’est que mise en page et contenu se code plus vite que ne se configure.
      </Callout>

      <Section
        title="Grille révélée"
        lead="Les éléments arrivent en cascade quand la section entre dans le champ. Transitions CSS decalees : aucun JavaScript ne s'execute pendant l'animation."
      >
        <RevealGrid columns={3} stagger={80}>
          {[
            'Format',
            'Validation',
            'Installation',
            'Contrat',
            'Diagnostic',
            'Publication',
          ].map((titre, index) => (
            <Carte
              key={titre}
              titre={titre}
              texte="Un élément de la grille, révèle a son tour."
              tone={index % 2 === 0 ? 'o-bg-zinc-50 dark:o-bg-zinc-900' : ''}
            />
          ))}
        </RevealGrid>

        <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
          Une timeline apporterait le contrôle du milieu de course — une pause, un retour
          arriere. Rien de cela n’est utile ici, et le prix serait un orchestrateur charge
          pour deplacer six cartes une fois.
        </p>
      </Section>

      <Section
        title="Cartes empilees"
        lead="Chaque carte se fige a son tour et se réduit quand la suivante la recouvre. Le collage est natif ; seule la réduction passe par la boucle."
      >
        <div className="o-h-96 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-6">
          <StickyStack offset={16} gap={16} shrink={0.06}>
            {['Ecrire', 'Valider', 'Compiler', 'Installer'].map((titre) => (
              <Carte
                key={titre}
                titre={titre}
                texte="Faites defiler ce cadre : les cartes se figent les unes sous les autres."
                tone="o-bg-white dark:o-bg-zinc-900 o-shadow-lg"
              />
            ))}
          </StickyStack>
          <div className="o-h-40" />
        </div>

        <Callout tone="warning">
          La réduction est lue par{' '}
          <code className="o-font-mono o-text-xs">useScrollProgress</code>, qui observe le
          défilement de la <strong>fenêtre</strong>. Dans ce cadre a défilement interne, l
          empilement se voit mais la réduction ne bouge pas — c’est une limite du hook, et
          la dire vaut mieux que la maquiller.
        </Callout>
      </Section>

      <Section
        title="Étapes au défilement"
        lead="Un media colle, des étapes qui défilent, et le media qui suit l'étape active. L'index ne change qu'au passage d'une étape."
      >
        <ScrollSteps
          label="Comment le registre fonctionne"
          steps={[
            { title: 'Écrire', body: <p>Un dossier, un meta.json, une source.</p> },
            { title: 'Valider', body: <p>Le schema refuse ce qui ne tient pas.</p> },
            { title: 'Compiler', body: <p>Un JSON par entrée, source inline.</p> },
            { title: 'Installer', body: <p>La CLI résout le graphe et écrit.</p> },
          ]}
          render={(index) => (
            <div className="o-flex o-h-64 o-items-center o-justify-center o-bg-zinc-50 dark:o-bg-zinc-900">
              <span className="o-font-mono o-text-6xl o-font-bold o-text-brand-500">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          )}
        />

        <p className="o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
          Si l’état suivait la progression, il changerait a chaque image pour afficher le
          même media la plupart du temps. Sur quatre étapes, cela fait trois rendus au
          lieu de plusieurs centaines.
        </p>
      </Section>

      <Section
        title="Bandeau de logos"
        lead="Le défilement vient de effect/marquee : cette section n'ajoute qu'une mise en page et un intitule."
      >
        <LogoBand title="Ils emploient Odoro" speed={30}>
          {[
            'Atelier',
            'Studio Nord',
            'Fabrique',
            'Comptoir',
            'Maison Verte',
            'Nord & Cie',
          ].map((nom) => (
            <span
              key={nom}
              className="o-text-lg o-font-semibold o-tracking-tight o-text-zinc-500 dark:o-text-zinc-400"
            >
              {nom}
            </span>
          ))}
        </LogoBand>

        <Callout>
          C’est la dependance de registre qui rend cette section courte :{' '}
          <code className="o-font-mono o-text-xs">odoro add logo-band</code> installe
          aussi le bandeau. Reimplementer le défilement ici aurait donne deux versions de
          la même mecanique, qui divergeraient au premier correctif.
        </Callout>
      </Section>

      <Section
        title="Questions frequentes"
        lead="Le repliage passe par les éléments natifs. Ce n'est pas une facilite : c'est ce qui rend les réponses trouvables par la recherche du navigateur."
      >
        <Faq
          single
          title="Ce qu’on nous demande"
          items={[
            {
              question: 'Pourquoi copier les composants plutot que d en dependre ?',
              answer: (
                <p>
                  Un composant d’animation est presque toujours retouche. Livre en
                  dependance, chaque retouche passerait par une propriété de plus.
                </p>
              ),
            },
            {
              question: 'Que se passe-t-il sous mouvement reduit ?',
              answer: (
                <p>
                  L’animation est neutralisee, jamais l’état final. Un contenu révèle
                  reste visible.
                </p>
              ),
            },
            {
              question: 'Peut-on employer deux fonds en shader sur une page ?',
              answer: (
                <p>
                  Non : l’arbitre n’accorde qu’un contexte par backend. Le second
                  afficherait son repli.
                </p>
              ),
            },
          ]}
        />

        <Callout tone="warning">
          Le point que presque tout le monde manque : un navigateur ouvre un{' '}
          <code className="o-font-mono o-text-xs">détails</code> ferme quand le texte
          cherche s’y trouve. Une réponse cachee derrière un{' '}
          <code className="o-font-mono o-text-xs">useState</code> reste introuvable a la
          recherche dans la page.
        </Callout>

        <CodeBlock
          code={`// Une seule ouverte a la fois, sans aucun etat : un name partage suffit,
// et le navigateur ferme les autres comme des boutons radio.
<Faq single items={questions} />`}
        />
      </Section>
    </>
  )
}
