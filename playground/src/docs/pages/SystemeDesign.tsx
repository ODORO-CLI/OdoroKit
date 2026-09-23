/**
 * La page du systeme de design.
 *
 * ## Ce qu elle est, et ce qu elle n est pas
 *
 * C est le seul endroit du site ou des donnees factices sont permises. La
 * specification le demande explicitement, et pour une raison : un composant ne
 * se juge pas sur sa definition mais sur ses etats — le bouton desactive, le
 * champ en erreur, le badge critique, la carte vide. Ailleurs, une donnee
 * inventee serait un mensonge ; ici, c est le sujet.
 *
 * ## Pourquoi les deux themes sont cote a cote
 *
 * Un composant qui tient en clair et se defait en sombre se decouvre au moment
 * ou quelqu un bascule le theme — c est-a-dire trop tard. Chaque famille est
 * donc montree deux fois, sur la meme ligne, et le defaut saute aux yeux au
 * lieu de se cacher derriere un interrupteur.
 *
 * @module
 */

import { type ReactElement, type ReactNode } from 'react'

import { PageHeader } from '../components/DocBlocks.jsx'

/* ============================ Le cadre ================================= */

/**
 * Une paire clair / sombre.
 *
 * Le panneau sombre porte `ods-sombre`, qui redefinit les jetons sur le
 * conteneur au lieu de la racine. Les deux panneaux rendent donc exactement le
 * meme balisage, et toute difference vient des jetons — ce qui est le seul
 * moyen de prouver qu un composant n a aucune couleur ecrite en dur.
 */
function Paire({
  titre,
  reference,
  children,
}: {
  readonly titre: string
  readonly reference: string
  readonly children: ReactNode
}): ReactElement {
  return (
    <section className="o-mt-10">
      <div className="o-flex o-items-baseline o-gap-3">
        <h2 className="ods-carte-titre o-text-base">{titre}</h2>
        <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
          {reference}
        </span>
      </div>

      <div className="o-mt-3 o-grid o-gap-3 md:o-grid-cols-2">
        <div
          className="o-rounded-xl o-p-5"
          style={{ background: 'var(--ods-fond)', border: '1px solid var(--ods-bordure)' }}
        >
          {children}
        </div>
        <div
          className="ods-sombre o-rounded-xl o-p-5"
          style={{ background: 'var(--ods-fond)', border: '1px solid var(--ods-bordure)' }}
        >
          {children}
        </div>
      </div>
    </section>
  )
}

/** Une ligne d exemples, avec ce que chacun montre. */
function Rangee({ children }: { readonly children: ReactNode }): ReactElement {
  return <div className="o-flex o-flex-wrap o-items-center o-gap-2">{children}</div>
}

/** Le nom d un etat, sous l exemple qu il decrit. */
function Etat({
  nom,
  children,
}: {
  readonly nom: string
  readonly children: ReactNode
}): ReactElement {
  return (
    <div className="o-flex o-flex-col o-gap-1.5">
      {children}
      <span
        className="o-font-mono o-text-xs"
        style={{ color: 'var(--ods-encre-eteinte)' }}
      >
        {nom}
      </span>
    </div>
  )
}

/* ============================ Les jetons =============================== */

/** Les surfaces et les encres, montrees plutot que listees. */
function Jetons(): ReactElement {
  const surfaces = [
    ['--ods-fond', 'fond de la zone de contenu'],
    ['--ods-colonne', 'colonne et barre du haut'],
    ['--ods-carte', 'carte'],
    ['--ods-sous-bloc', 'sous-bloc gris'],
    ['--ods-bordure', 'bordure'],
    ['--ods-separateur', 'separateur de lignes'],
    ['--ods-bordure-champ', 'bordure de champ'],
  ] as const

  const encres = [
    ['--ods-encre', 'texte'],
    ['--ods-encre-douce', 'secondaire'],
    ['--ods-encre-eteinte', 'desactive'],
    ['--ods-accent-encre', 'actionnable'],
  ] as const

  return (
    <div className="o-flex o-flex-col o-gap-4">
      <div className="o-grid o-gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {surfaces.map(([jeton, role]) => (
          <div key={jeton} className="o-flex o-flex-col o-gap-1.5">
            <div
              className="o-h-12 o-rounded-lg"
              style={{
                background: `var(${jeton})`,
                border: '1px solid var(--ods-bordure)',
              }}
            />
            <span
              className="o-font-mono o-text-xs o-break-all"
              style={{ color: 'var(--ods-encre-douce)' }}
            >
              {jeton}
            </span>
            <span className="o-text-xs" style={{ color: 'var(--ods-encre-eteinte)' }}>
              {role}
            </span>
          </div>
        ))}
      </div>

      <div className="o-flex o-flex-wrap o-gap-4">
        {encres.map(([jeton, role]) => (
          <span
            key={jeton}
            className="o-font-mono o-text-sm"
            style={{ color: `var(${jeton})` }}
          >
            {role} · {jeton}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ============================ La page ================================== */

/** Le systeme de design, composant par composant. */
export function SystemeDesign(): ReactElement {
  return (
    <>
      <PageHeader
        title="Système de design"
        module="Fondations"
        lead="Chaque pièce dans tous ses états, en clair et en sombre côte à côte. C’est la seule page du site où les données sont inventées : c’est ici le sujet, ailleurs ce serait un mensonge."
      />

      <Paire titre="Jetons" reference="§4 · §5">
        <Jetons />
      </Paire>

      <Paire titre="Boutons" reference="§4">
        <div className="o-flex o-flex-col o-gap-4">
          <Rangee>
            <Etat nom="primaire">
              <button type="button" className="ods-bouton ods-bouton-primaire">
                Enregistrer
              </button>
            </Etat>
            <Etat nom="secondaire">
              <button type="button" className="ods-bouton ods-bouton-secondaire">
                Annuler
              </button>
            </Etat>
            <Etat nom="tertiaire">
              <button type="button" className="ods-bouton ods-bouton-tertiaire">
                Dupliquer
              </button>
            </Etat>
            <Etat nom="destructeur">
              <button type="button" className="ods-bouton ods-bouton-destructeur">
                Supprimer
              </button>
            </Etat>
          </Rangee>

          <Rangee>
            <Etat nom="lien">
              <button type="button" className="ods-bouton ods-bouton-lien">
                En savoir plus
              </button>
            </Etat>
            <Etat nom="icône seule 32×32">
              <button type="button" className="ods-bouton ods-bouton-icone" aria-label="Plus">
                ⋯
              </button>
            </Etat>
            <Etat nom="primaire désactivé">
              <button type="button" className="ods-bouton ods-bouton-primaire" disabled>
                Enregistrer
              </button>
            </Etat>
            <Etat nom="secondaire désactivé">
              <button type="button" className="ods-bouton ods-bouton-secondaire" disabled>
                Annuler
              </button>
            </Etat>
          </Rangee>
        </div>
      </Paire>

      <Paire titre="Badges" reference="§11">
        <Rangee>
          <span className="ods-badge ods-badge-succes">Actif</span>
          <span className="ods-badge ods-badge-info">Brouillon</span>
          <span className="ods-badge ods-badge-attention">À vérifier</span>
          <span className="ods-badge ods-badge-critique">Échoué</span>
          <span className="ods-badge ods-badge-neutre">Désactivé</span>
          <span className="ods-badge ods-badge-neutre ods-badge-sans-point">Principal</span>
        </Rangee>
      </Paire>

      <Paire titre="Champs" reference="§10">
        <div className="o-grid o-gap-4 md:o-grid-cols-2">
          <div>
            <label className="ods-label" htmlFor="ods-demo-nom">
              Nom du produit
            </label>
            <input
              id="ods-demo-nom"
              className="ods-champ"
              defaultValue="Bougie Cèdre 220 g"
            />
            <p className="ods-aide o-m-0">Visible par les clients.</p>
          </div>

          <div>
            <label className="ods-label" htmlFor="ods-demo-vide">
              Référence
            </label>
            <input id="ods-demo-vide" className="ods-champ" placeholder="SKU-0042" />
            <p className="ods-aide o-m-0">Placeholder en encre éteinte.</p>
          </div>

          <div>
            <label className="ods-label" htmlFor="ods-demo-erreur">
              Prix
            </label>
            <input
              id="ods-demo-erreur"
              className="ods-champ ods-champ-erreur"
              defaultValue="-12"
              aria-invalid="true"
            />
            <p className="ods-aide o-m-0" style={{ color: 'var(--ods-critique-encre)' }}>
              Un prix ne peut pas être négatif.
            </p>
          </div>

          <div>
            <label className="ods-label" htmlFor="ods-demo-off">
              Identifiant
            </label>
            <input id="ods-demo-off" className="ods-champ" defaultValue="gid://42" disabled />
            <p className="ods-aide o-m-0">Désactivé.</p>
          </div>

          <div className="md:o-col-span-2">
            <label className="ods-label" htmlFor="ods-demo-zone">
              Description
            </label>
            <textarea
              id="ods-demo-zone"
              className="ods-champ ods-zone"
              defaultValue="Cire de colza, mèche coton, parfum de Grasse."
            />
          </div>
        </div>
      </Paire>

      <Paire titre="Cartes" reference="§7">
        <div className="o-flex o-flex-col o-gap-4">
          <div className="ods-carte">
            <div className="ods-carte-tete">
              <h3 className="ods-carte-titre">Organisation</h3>
              <button type="button" className="ods-bouton ods-bouton-secondaire">
                Modifier
              </button>
            </div>
            <p className="o-m-0 o-text-sm" style={{ color: 'var(--ods-encre-douce)' }}>
              Titre en haut à gauche, action en haut à droite, sur la même ligne.
            </p>
            <hr className="ods-separation" />
            <div className="ods-sous-bloc">
              <p className="o-m-0 o-text-sm" style={{ color: 'var(--ods-encre-douce)' }}>
                Sous-bloc gris : fond dédié, arrondi 8 px, padding 12 px.
              </p>
            </div>
          </div>
        </div>
      </Paire>
    </>
  )
}
