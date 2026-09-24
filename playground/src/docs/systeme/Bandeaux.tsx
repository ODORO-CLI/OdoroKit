/**
 * §11 — La demonstration des bandeaux, pastilles et bandes de pastilles.
 *
 * ## Pourquoi des messages ecrits, et non du remplissage
 *
 * Un bandeau se juge sur la longueur de son texte. Avec deux mots, les quatre
 * tons se ressemblent et la variante a en-tete colore n a plus de raison
 * d exister ; avec une vraie phrase, on voit ou l icone se decale, ou l action
 * se serre contre la croix, et pourquoi le corps du bandeau a en-tete revient
 * sur du blanc. Les messages sont donc inventes mais plausibles — c est la
 * seule page du site ou une donnee fausse est le sujet.
 *
 * ## Pourquoi aucune classe a valeur arbitraire
 *
 * Le generateur ne produit que les classes que ce site emploie deja : une
 * classe inventee — `o-p-[12px]` — ne correspond a aucune regle et ne peint
 * rien, sans erreur ni avertissement. Les mesures de cette page viennent donc
 * des jetons `--ods-*`, et les rares exceptions passent par un style en ligne.
 *
 * @module
 */

import { type ReactElement, type ReactNode } from 'react'

/* ============================ Les icones =============================== */

/*
 * Les traces sont ecrits ici, a vingt pixels, plutot que pris a la librairie
 * d icones : un bandeau porte toujours le meme jeu de quatre signes, et les
 * choisir dans un catalogue de plusieurs milliers laissait la porte ouverte a
 * un ton signale par deux dessins differents selon la page.
 */
function Trace({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

/** Information : le cercle et la barre. */
function IconeInfo(): ReactElement {
  return (
    <Trace>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </Trace>
  )
}

/** Attention : le triangle, le seul contour non circulaire du jeu. */
function IconeAttention(): ReactElement {
  return (
    <Trace>
      <path d="M10.3 4.3 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </Trace>
  )
}

/** Critique : le cercle barre d une croix. */
function IconeCritique(): ReactElement {
  return (
    <Trace>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </Trace>
  )
}

/** Succes : le cercle et la coche. */
function IconeSucces(): ReactElement {
  return (
    <Trace>
      <path d="M21 11.1V12a9 9 0 1 1-5.3-8.2" />
      <path d="m9 11 3 3 8.5-8.5" />
    </Trace>
  )
}

/** La suggestion : une etincelle, qui n appartient a aucun des quatre tons. */
function IconeEtincelle(): ReactElement {
  return (
    <Trace>
      <path d="M12 3.5l1.7 4.3 4.3 1.7-4.3 1.7L12 15.5l-1.7-4.3L6 9.5l4.3-1.7L12 3.5Z" />
      <path d="M18.5 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9Z" />
    </Trace>
  )
}

/** La croix de fermeture, a vingt pixels comme l icone de tete. */
function IconeCroix(): ReactElement {
  return (
    <Trace>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Trace>
  )
}

/** Le chevron, a quatorze pixels dans une pastille et vingt dans une bande. */
function IconeChevron({ taille }: { readonly taille: 14 | 20 }): ReactElement {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

/* ============================ Le cadre ================================= */

/** Un exemple, suivi du nom de la classe qu il montre. */
function Exemple({
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

/* ============================ Les bandeaux ============================= */

/** Le jeu d icones, par ton : le ton et son signe ne se separent jamais. */
const SIGNES = {
  info: IconeInfo,
  attention: IconeAttention,
  critique: IconeCritique,
  succes: IconeSucces,
} as const

/** Un bandeau plein, dans le ton demande. */
function Bandeau({
  ton,
  titre,
  texte,
  action,
}: {
  readonly ton: keyof typeof SIGNES
  readonly titre: string
  readonly texte: string
  readonly action?: string
}): ReactElement {
  const Signe = SIGNES[ton]

  return (
    <div className={`ods-bandeau ods-bandeau-${ton}`} role="status">
      <span className="ods-bandeau-icone">
        <Signe />
      </span>

      <div className="ods-bandeau-corps">
        <p className="ods-bandeau-titre">{titre}</p>
        <p className="ods-bandeau-texte">{texte}</p>

        {action !== undefined ? (
          <div className="ods-bandeau-actions">
            <button type="button" className="ods-bouton ods-bouton-secondaire">
              {action}
            </button>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="ods-bandeau-fermer"
        aria-label="Masquer ce message"
      >
        <IconeCroix />
      </button>
    </div>
  )
}

/* ============================ La page ================================== */

/** Les bandeaux, les pastilles et la bande de pastilles, chacun dans ses tons. */
export function DemoBandeaux(): ReactElement {
  return (
    <div className="o-flex o-flex-col o-gap-4">
      <Exemple nom=".ods-bandeau .ods-bandeau-info">
        <Bandeau
          ton="info"
          titre="Le registre est passé en 2.4.0"
          texte="Douze composants ajoutés, aucun retiré. Les noms d’import restent identiques : rien à changer dans vos pages."
          action="Voir les changements"
        />
      </Exemple>

      <Exemple nom=".ods-bandeau .ods-bandeau-attention">
        <Bandeau
          ton="attention"
          titre="Quota de construction bientôt atteint"
          texte="Il reste 3 constructions sur les 50 du mois. Le compteur repart le 1er octobre."
          action="Augmenter le quota"
        />
      </Exemple>

      <Exemple nom=".ods-bandeau .ods-bandeau-critique">
        <Bandeau
          ton="critique"
          titre="Le déploiement a échoué"
          texte="L’étape « build » s’est arrêtée au bout de 2 min 14 s : le module @odoro-cli/libs/styles est introuvable."
          action="Relire le journal"
        />
      </Exemple>

      <Exemple nom=".ods-bandeau .ods-bandeau-succes">
        <Bandeau
          ton="succes"
          titre="Le site est en ligne"
          texte="La version 2.4.0 est publiée sur odorokit.dev. La propagation du cache prend environ deux minutes."
        />
      </Exemple>

      <Exemple nom=".ods-bandeau (sans action)">
        <Bandeau
          ton="info"
          titre="Mode hors ligne"
          texte="Vos modifications sont gardées localement et seront envoyées dès le retour du réseau."
        />
      </Exemple>

      <Exemple nom=".ods-bandeau-tete">
        <div className="ods-bandeau-tete">
          {/* Le ton ne peint que la bande : le paragraphe est trop long pour
              tenir sur un aplat colore sans se lire comme une alerte. */}
          <div className="ods-bandeau-tete-bande ods-bandeau-attention">
            <span className="ods-bandeau-icone">
              <IconeAttention />
            </span>
            <p className="ods-bandeau-titre">
              Les jetons de thème changent de nom le 15 octobre
            </p>
            <button
              type="button"
              className="ods-bandeau-fermer"
              aria-label="Masquer ce message"
            >
              <IconeCroix />
            </button>
          </div>

          <div className="ods-bandeau-tete-corps">
            <p className="ods-bandeau-texte">
              Les variables <code className="o-font-mono">--o-color-*</code> deviennent{' '}
              <code className="o-font-mono">--o-theme-*</code> pour distinguer la palette
              de marque des surfaces du thème. Les anciens noms restent lus jusqu’à la
              version 3.0, puis disparaîtront. Un script de migration réécrit vos feuilles
              en une passe et n’en modifie aucune autre.
            </p>
            <div className="ods-bandeau-actions">
              <button type="button" className="ods-bouton ods-bouton-secondaire">
                Lancer la migration
              </button>
              <button type="button" className="ods-bouton ods-bouton-lien">
                Lire la note de version
              </button>
            </div>
          </div>
        </div>
      </Exemple>

      <Exemple nom=".ods-pastille-ia">
        <div className="ods-pastille-ia">
          <span className="ods-pastille-ia-icone">
            <IconeEtincelle />
          </span>
          <span className="ods-pastille-ia-texte">
            Vos 14 nuances de gris pourraient tenir en une seule échelle de 6 valeurs.
          </span>
          <button
            type="button"
            className="ods-bandeau-fermer"
            aria-label="Écarter cette suggestion"
          >
            <IconeCroix />
          </button>
        </div>
      </Exemple>

      <Exemple nom=".ods-pastille">
        <div className="o-flex o-flex-wrap o-items-center o-gap-2">
          <button type="button" className="ods-pastille">
            <span className="ods-pastille-libelle">Statut</span>
            <span className="ods-pastille-valeur">En ligne</span>
            <span className="ods-pastille-chevron">
              <IconeChevron taille={14} />
            </span>
          </button>
          <button type="button" className="ods-pastille">
            <span className="ods-pastille-libelle">Thème</span>
            <span className="ods-pastille-valeur">Sombre</span>
            <span className="ods-pastille-chevron">
              <IconeChevron taille={14} />
            </span>
          </button>
          <button type="button" className="ods-pastille">
            <span className="ods-pastille-libelle">Composants</span>
            <span className="ods-pastille-valeur">312</span>
            <span className="ods-pastille-chevron">
              <IconeChevron taille={14} />
            </span>
          </button>
        </div>
      </Exemple>

      <Exemple nom=".ods-bande-pastilles">
        {/* La carte est nue : c est la bande qui pose le padding bas, et un
            padding de carte l aurait decollee du bord qu elle doit toucher. */}
        <div className="ods-carte ods-carte-nue">
          <div style={{ padding: 'var(--ods-marge)' }}>
            <div className="ods-carte-tete">
              <h3 className="ods-carte-titre">Landing « Atelier Vermeil »</h3>
              <span className="ods-badge ods-badge-succes">Publiée</span>
            </div>
            <p className="ods-bandeau-texte" style={{ color: 'var(--ods-encre-douce)' }}>
              Dernière construction il y a 2 heures, en 41 secondes. Aucun avertissement.
            </p>
          </div>

          <div className="ods-bande-pastilles">
            <button type="button" className="ods-pastille">
              <span className="ods-pastille-libelle">Sections</span>
              <span className="ods-pastille-valeur">9</span>
            </button>
            <button type="button" className="ods-pastille">
              <span className="ods-pastille-libelle">Poids</span>
              <span className="ods-pastille-valeur">184 ko</span>
            </button>
            <button type="button" className="ods-pastille">
              <span className="ods-pastille-libelle">Polices</span>
              <span className="ods-pastille-valeur">2</span>
            </button>
            <button
              type="button"
              className="ods-bande-pastilles-chevron"
              aria-label="Déplier les détails"
            >
              <IconeChevron taille={20} />
            </button>
          </div>
        </div>
      </Exemple>
    </div>
  )
}
