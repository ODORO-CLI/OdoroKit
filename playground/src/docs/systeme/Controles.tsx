/**
 * Les controles du §10, chacun dans tous ses etats.
 *
 * ## Ce que cette page prouve, et ce qu elle ne peut pas prouver
 *
 * Un controle ne se juge pas sur son etat de repos : c est coche, desactive ou
 * en erreur qu il se defait. Chaque famille est donc montree jusqu au bout, et
 * aucune variante n est laissee a l imagination du lecteur.
 *
 * Le survol manque, et il manque a dessein : aucune capture ne le retient, et
 * un exemple qui pretendrait le montrer mentirait. Il est ecrit dans
 * `systeme-controles.css`, ou il se lit au moins.
 *
 * ## Les donnees sont inventees
 *
 * C est la page du systeme de design : le sujet, ici, est la piece et non son
 * contenu. Un nom de produit reel n apprendrait rien de plus sur la forme d une
 * case a cocher.
 *
 * ## Les mesures ne sont pas ici
 *
 * Pas une seule dans ce fichier. Les dix-huit pixels d une case, les quarante
 * d un interrupteur, les vingt-huit d un segment vivent dans la
 * feuille, en jetons. Les ecrire en utilitaires a valeur arbitraire — `o-h-[18px]`
 * — ne peindrait rien : le generateur ne produit pas ces classes, et leur
 * absence ne casse rien, elle se voit juste a l ecran.
 *
 * @module
 */

import { type ReactElement, type ReactNode } from 'react'

/*
 * La feuille est importee ici plutot qu au demarrage.
 *
 * Elle ne sert qu a ce composant : la porter avec lui garde les deux ensemble,
 * et personne ne peut deplacer l un en oubliant l autre. Vite dedoublonne, donc
 * un second import au demarrage ne couterait rien s il venait un jour.
 */
import '../systeme-controles.css'

/* ============================ Le cadre ================================= */

/** Un sous-bloc par famille : un titre, et les exemples dessous. */
function Famille({
  titre,
  classe,
  children,
}: {
  readonly titre: string
  readonly classe: string
  readonly children: ReactNode
}): ReactElement {
  return (
    <section className="ods-sous-bloc">
      <div className="o-flex o-flex-wrap o-items-baseline o-gap-3 o-mb-3">
        <h3 className="ods-carte-titre o-m-0">{titre}</h3>
        <span className="o-font-mono o-text-xs" style={{ color: 'var(--ods-encre-eteinte)' }}>
          {classe}
        </span>
      </div>
      {children}
    </section>
  )
}

/**
 * Le nom d un etat, sous l exemple qu il decrit.
 *
 * Il est sous et non a cote : une legende posee a droite grandit avec le texte
 * et desaligne la rangee entiere, alors qu au-dessous elle n emporte que sa
 * propre colonne.
 */
function Etat({
  nom,
  pleine = false,
  children,
}: {
  readonly nom: string
  /* La barre de sauvegarde prend toute la largeur : `items-start` la ferait
     rentrer a la taille de son texte, et sa mise en page — message a gauche,
     boutons a droite — ne se verrait plus. */
  readonly pleine?: boolean
  readonly children: ReactNode
}): ReactElement {
  return (
    <div
      className={`o-flex o-flex-col o-gap-2 ${pleine ? 'o-items-stretch' : 'o-items-start'}`}
    >
      {children}
      <span className="o-font-mono o-text-xs" style={{ color: 'var(--ods-encre-eteinte)' }}>
        {nom}
      </span>
    </div>
  )
}

/** Une rangee d exemples, qui passe a la ligne plutot que de deborder. */
function Rangee({ children }: { readonly children: ReactNode }): ReactElement {
  return <div className="o-flex o-flex-wrap o-items-start o-gap-6">{children}</div>
}

/* ============================ Les familles ============================= */

/** Le segmente : deux a quatre choix exclusifs, dans une seule boite. */
function Segmente(): ReactElement {
  return (
    <Rangee>
      <Etat nom="repos · 3 segments">
        <div className="ods-segmente">
          <button type="button" className="ods-segmente-choix" data-actif="">
            Tous
          </button>
          <button type="button" className="ods-segmente-choix">
            Actifs
          </button>
          <button type="button" className="ods-segmente-choix">
            Archivés
          </button>
        </div>
      </Etat>

      <Etat nom="actif au milieu">
        <div className="ods-segmente">
          <button type="button" className="ods-segmente-choix">
            Jour
          </button>
          <button type="button" className="ods-segmente-choix" data-actif="">
            Semaine
          </button>
          <button type="button" className="ods-segmente-choix">
            Mois
          </button>
        </div>
      </Etat>

      <Etat nom="un segment désactivé">
        <div className="ods-segmente">
          <button type="button" className="ods-segmente-choix" data-actif="">
            Brouillon
          </button>
          <button type="button" className="ods-segmente-choix">
            Publié
          </button>
          <button type="button" className="ods-segmente-choix" disabled>
            Programmé
          </button>
        </div>
      </Etat>

      <Etat nom="groupe entier désactivé">
        <div className="ods-segmente" data-desactive="">
          <button type="button" className="ods-segmente-choix" data-actif="" disabled>
            Grille
          </button>
          <button type="button" className="ods-segmente-choix" disabled>
            Liste
          </button>
        </div>
      </Etat>
    </Rangee>
  )
}

/** Le radio : 18 px, cercle, anneau de 5 px a l etat actif. */
function Radios(): ReactElement {
  return (
    <Rangee>
      <Etat nom="repos">
        <input type="radio" name="ods-ctrl-radio-1" className="ods-radio" aria-label="Repos" />
      </Etat>
      <Etat nom="sélectionné">
        <input
          type="radio"
          name="ods-ctrl-radio-2"
          className="ods-radio"
          defaultChecked
          aria-label="Sélectionné"
        />
      </Etat>
      <Etat nom="désactivé">
        <input
          type="radio"
          name="ods-ctrl-radio-3"
          className="ods-radio"
          disabled
          aria-label="Désactivé"
        />
      </Etat>
      <Etat nom="sélectionné + désactivé">
        <input
          type="radio"
          name="ods-ctrl-radio-4"
          className="ods-radio"
          defaultChecked
          disabled
          aria-label="Sélectionné et désactivé"
        />
      </Etat>
      <Etat nom="erreur">
        <input
          type="radio"
          name="ods-ctrl-radio-5"
          className="ods-radio ods-radio-erreur"
          aria-invalid="true"
          aria-label="En erreur"
        />
      </Etat>
    </Rangee>
  )
}

/**
 * La case a cocher, y compris l etat partiel.
 *
 * `indeterminate` n existe pas en attribut : c est une propriete de l element,
 * que le balisage ne peut pas porter. Elle est donc posee par un rappel de
 * reference — le plus court chemin qui ne demande ni etat ni effet.
 */
function Cases(): ReactElement {
  return (
    <Rangee>
      <Etat nom="repos">
        <input type="checkbox" className="ods-case" aria-label="Repos" />
      </Etat>
      <Etat nom="cochée">
        <input type="checkbox" className="ods-case" defaultChecked aria-label="Cochée" />
      </Etat>
      <Etat nom="partielle">
        <input
          type="checkbox"
          className="ods-case"
          aria-label="Partielle"
          ref={(element) => {
            if (element) element.indeterminate = true
          }}
        />
      </Etat>
      <Etat nom="désactivée">
        <input type="checkbox" className="ods-case" disabled aria-label="Désactivée" />
      </Etat>
      <Etat nom="cochée + désactivée">
        <input
          type="checkbox"
          className="ods-case"
          defaultChecked
          disabled
          aria-label="Cochée et désactivée"
        />
      </Etat>
      <Etat nom="erreur">
        <input
          type="checkbox"
          className="ods-case ods-case-erreur"
          aria-invalid="true"
          aria-label="En erreur"
        />
      </Etat>
    </Rangee>
  )
}

/** L interrupteur : 40 x 22, le seul arrondi du systeme au-dela de 12 px. */
function Interrupteurs(): ReactElement {
  return (
    <Rangee>
      <Etat nom="éteint">
        <input type="checkbox" className="ods-interrupteur" aria-label="Éteint" />
      </Etat>
      <Etat nom="allumé">
        <input
          type="checkbox"
          className="ods-interrupteur"
          defaultChecked
          aria-label="Allumé"
        />
      </Etat>
      <Etat nom="éteint + désactivé">
        <input
          type="checkbox"
          className="ods-interrupteur"
          disabled
          aria-label="Éteint et désactivé"
        />
      </Etat>
      <Etat nom="allumé + désactivé">
        <input
          type="checkbox"
          className="ods-interrupteur"
          defaultChecked
          disabled
          aria-label="Allumé et désactivé"
        />
      </Etat>
    </Rangee>
  )
}

/** Le groupe de choix : le libelle, l aide en retrait, et l ecart aux voisins. */
function GroupeChoix(): ReactElement {
  return (
    <div className="o-flex o-flex-wrap o-gap-6">
      <Etat nom="radios avec aide">
        <div className="ods-groupe-choix" style={{ width: '280px' }}>
          <div className="ods-choix">
            <div className="ods-choix-tete">
              <input
                type="radio"
                id="ods-ctrl-envoi-standard"
                name="ods-ctrl-envoi"
                className="ods-radio"
                defaultChecked
              />
              <label className="ods-choix-libelle" htmlFor="ods-ctrl-envoi-standard">
                Livraison standard
              </label>
            </div>
            <p className="ods-choix-aide">3 à 5 jours ouvrés, suivi inclus.</p>
          </div>

          <div className="ods-choix">
            <div className="ods-choix-tete">
              <input
                type="radio"
                id="ods-ctrl-envoi-express"
                name="ods-ctrl-envoi"
                className="ods-radio"
              />
              <label className="ods-choix-libelle" htmlFor="ods-ctrl-envoi-express">
                Livraison express
              </label>
            </div>
            <p className="ods-choix-aide">Demain avant 13 h, 6,90 €.</p>
          </div>

          <div className="ods-choix">
            <div className="ods-choix-tete">
              <input
                type="radio"
                id="ods-ctrl-envoi-retrait"
                name="ods-ctrl-envoi"
                className="ods-radio"
                disabled
              />
              <label className="ods-choix-libelle" htmlFor="ods-ctrl-envoi-retrait">
                Retrait en boutique
              </label>
            </div>
            <p className="ods-choix-aide">Aucune boutique près de cette adresse.</p>
          </div>
        </div>
      </Etat>

      <Etat nom="cases, dont une en erreur">
        <div className="ods-groupe-choix" style={{ width: '280px' }}>
          <div className="ods-choix">
            <div className="ods-choix-tete">
              <input
                type="checkbox"
                id="ods-ctrl-avis-stock"
                className="ods-case"
                defaultChecked
              />
              <label className="ods-choix-libelle" htmlFor="ods-ctrl-avis-stock">
                Alertes de stock
              </label>
            </div>
            <p className="ods-choix-aide">Un message dès qu’un article passe sous 5 unités.</p>
          </div>

          <div className="ods-choix">
            <div className="ods-choix-tete">
              <input
                type="checkbox"
                id="ods-ctrl-avis-cgv"
                className="ods-case ods-case-erreur"
                aria-invalid="true"
              />
              <label className="ods-choix-libelle" htmlFor="ods-ctrl-avis-cgv">
                J’accepte les conditions
              </label>
            </div>
            <p className="ods-choix-aide ods-choix-aide-erreur">
              Cette case doit être cochée pour continuer.
            </p>
          </div>
        </div>
      </Etat>

      <Etat nom="interrupteurs">
        <div className="ods-groupe-choix" style={{ width: '280px' }}>
          <div className="ods-choix">
            <div className="ods-choix-tete">
              <input
                type="checkbox"
                id="ods-ctrl-reglage-tva"
                className="ods-interrupteur"
                defaultChecked
              />
              <label className="ods-choix-libelle" htmlFor="ods-ctrl-reglage-tva">
                Afficher les prix TTC
              </label>
            </div>
            <p className="ods-choix-aide">Sur la boutique et dans le panier.</p>
          </div>

          <div className="ods-choix">
            <div className="ods-choix-tete">
              <input
                type="checkbox"
                id="ods-ctrl-reglage-beta"
                className="ods-interrupteur"
                disabled
              />
              <label className="ods-choix-libelle" htmlFor="ods-ctrl-reglage-beta">
                Nouvelle caisse
              </label>
            </div>
            <p className="ods-choix-aide">Réservée aux comptes de l’offre Atelier.</p>
          </div>
        </div>
      </Etat>
    </div>
  )
}

/** Les balises : un champ de 32 px qui contient des pastilles de 24 px. */
function Balises(): ReactElement {
  return (
    <div className="o-flex o-flex-col o-gap-4">
      <Etat nom="repos, avec saisie libre">
        <div className="ods-balises" style={{ width: '320px' }}>
          <span className="ods-balise">
            Cèdre
            <button type="button" className="ods-balise-croix" aria-label="Retirer Cèdre">
              ✕
            </button>
          </span>
          <span className="ods-balise">
            Vétiver
            <button type="button" className="ods-balise-croix" aria-label="Retirer Vétiver">
              ✕
            </button>
          </span>
          <input
            className="ods-balises-saisie"
            placeholder="Ajouter…"
            aria-label="Ajouter une balise"
          />
        </div>
      </Etat>

      <Etat nom="avec pastille « + Ajouter »">
        <div className="ods-balises" style={{ width: '320px' }}>
          <span className="ods-balise">
            Automne
            <button type="button" className="ods-balise-croix" aria-label="Retirer Automne">
              ✕
            </button>
          </span>
          <button type="button" className="ods-balise-ajout">
            + Ajouter
          </button>
        </div>
      </Etat>

      <Etat nom="erreur">
        <div className="ods-balises ods-balises-erreur" style={{ width: '320px' }}>
          <span className="ods-balise">
            promo-2024
            <button type="button" className="ods-balise-croix" aria-label="Retirer promo-2024">
              ✕
            </button>
          </span>
          <button type="button" className="ods-balise-ajout">
            + Ajouter
          </button>
        </div>
      </Etat>

      <Etat nom="désactivé">
        <div className="ods-balises" data-desactive="" style={{ width: '320px' }}>
          <span className="ods-balise ods-balise-fixe">Importé</span>
          <button type="button" className="ods-balise-ajout" disabled>
            + Ajouter
          </button>
        </div>
      </Etat>
    </div>
  )
}

/** La zone de depot : le seul filet pointille du systeme. */
function Depot(): ReactElement {
  return (
    <div className="o-flex o-flex-wrap o-gap-4">
      <Etat nom="repos">
        <div className="ods-depot" style={{ width: '260px' }}>
          <p className="ods-depot-titre">Déposez vos visuels</p>
          <p className="ods-depot-aide">PNG ou JPG, 5 Mo au plus</p>
          <button type="button" className="ods-bouton ods-bouton-secondaire">
            Parcourir
          </button>
        </div>
      </Etat>

      <Etat nom="fichier au-dessus">
        <div className="ods-depot" data-survol="" style={{ width: '260px' }}>
          <p className="ods-depot-titre">Relâchez pour envoyer</p>
          <p className="ods-depot-aide">3 fichiers</p>
          <button type="button" className="ods-bouton ods-bouton-secondaire">
            Parcourir
          </button>
        </div>
      </Etat>

      <Etat nom="erreur">
        <div className="ods-depot ods-depot-erreur" style={{ width: '260px' }}>
          <p className="ods-depot-titre">Format refusé</p>
          <p className="ods-depot-aide" style={{ color: 'var(--ods-critique-encre)' }}>
            catalogue.psd n’est pas une image web.
          </p>
          <button type="button" className="ods-bouton ods-bouton-secondaire">
            Parcourir
          </button>
        </div>
      </Etat>

      <Etat nom="désactivé">
        <div className="ods-depot" data-desactive="" style={{ width: '260px' }}>
          <p className="ods-depot-titre">Envoi suspendu</p>
          <p className="ods-depot-aide">Espace de stockage épuisé</p>
          <button type="button" className="ods-bouton ods-bouton-secondaire" disabled>
            Parcourir
          </button>
        </div>
      </Etat>
    </div>
  )
}

/** Prefixe et suffixe : le cadre appartient a la boite, pas au champ. */
function Affixes(): ReactElement {
  return (
    <div className="o-flex o-flex-wrap o-gap-6">
      <Etat nom="préfixe">
        <div style={{ width: '220px' }}>
          <label className="ods-label" htmlFor="ods-ctrl-prix">
            Prix de vente
          </label>
          <div className="ods-affixe">
            <span className="ods-affixe-prefixe">€</span>
            <input id="ods-ctrl-prix" className="ods-champ" defaultValue="24,00" />
          </div>
        </div>
      </Etat>

      <Etat nom="suffixe">
        <div style={{ width: '220px' }}>
          <label className="ods-label" htmlFor="ods-ctrl-poids">
            Poids
          </label>
          <div className="ods-affixe">
            <input id="ods-ctrl-poids" className="ods-champ" defaultValue="220" />
            <span className="ods-affixe-suffixe">g</span>
          </div>
        </div>
      </Etat>

      <Etat nom="les deux">
        <div style={{ width: '220px' }}>
          <label className="ods-label" htmlFor="ods-ctrl-marge">
            Marge cible
          </label>
          <div className="ods-affixe">
            <span className="ods-affixe-prefixe">≥</span>
            <input id="ods-ctrl-marge" className="ods-champ" defaultValue="38" />
            <span className="ods-affixe-suffixe">%</span>
          </div>
        </div>
      </Etat>

      <Etat nom="erreur">
        <div style={{ width: '220px' }}>
          <label className="ods-label" htmlFor="ods-ctrl-remise">
            Remise
          </label>
          <div className="ods-affixe ods-affixe-erreur">
            <input
              id="ods-ctrl-remise"
              className="ods-champ"
              defaultValue="140"
              aria-invalid="true"
            />
            <span className="ods-affixe-suffixe">%</span>
          </div>
          <p className="ods-aide o-m-0" style={{ color: 'var(--ods-critique-encre)' }}>
            Une remise ne dépasse pas 100 %.
          </p>
        </div>
      </Etat>

      <Etat nom="désactivé">
        <div style={{ width: '220px' }}>
          <label className="ods-label" htmlFor="ods-ctrl-taux">
            Taux appliqué
          </label>
          <div className="ods-affixe" data-desactive="">
            <input id="ods-ctrl-taux" className="ods-champ" defaultValue="20" disabled />
            <span className="ods-affixe-suffixe">%</span>
          </div>
        </div>
      </Etat>
    </div>
  )
}

/** Le champ numerique : deux fleches empilees dans la gouttiere droite. */
function Nombres(): ReactElement {
  return (
    <div className="o-flex o-flex-wrap o-gap-6">
      <Etat nom="repos">
        <div className="ods-nombre" style={{ width: '160px' }}>
          <input
            type="number"
            className="ods-champ"
            defaultValue="12"
            aria-label="Quantité"
          />
          <span className="ods-nombre-fleches">
            <button type="button" className="ods-nombre-fleche" aria-label="Augmenter">
              ▲
            </button>
            <button type="button" className="ods-nombre-fleche" aria-label="Diminuer">
              ▼
            </button>
          </span>
        </div>
      </Etat>

      <Etat nom="borne atteinte">
        <div className="ods-nombre" style={{ width: '160px' }}>
          <input
            type="number"
            className="ods-champ"
            defaultValue="0"
            aria-label="Quantité au minimum"
          />
          <span className="ods-nombre-fleches">
            <button type="button" className="ods-nombre-fleche" aria-label="Augmenter">
              ▲
            </button>
            <button type="button" className="ods-nombre-fleche" disabled aria-label="Diminuer">
              ▼
            </button>
          </span>
        </div>
      </Etat>

      <Etat nom="erreur">
        <div className="ods-nombre" style={{ width: '160px' }}>
          <input
            type="number"
            className="ods-champ ods-champ-erreur"
            defaultValue="-3"
            aria-invalid="true"
            aria-label="Quantité en erreur"
          />
          <span className="ods-nombre-fleches">
            <button type="button" className="ods-nombre-fleche" aria-label="Augmenter">
              ▲
            </button>
            <button type="button" className="ods-nombre-fleche" aria-label="Diminuer">
              ▼
            </button>
          </span>
        </div>
      </Etat>

      <Etat nom="désactivé">
        <div className="ods-nombre" style={{ width: '160px' }}>
          <input
            type="number"
            className="ods-champ"
            defaultValue="1"
            disabled
            aria-label="Quantité verrouillée"
          />
          <span className="ods-nombre-fleches">
            <button type="button" className="ods-nombre-fleche" disabled aria-label="Augmenter">
              ▲
            </button>
            <button type="button" className="ods-nombre-fleche" disabled aria-label="Diminuer">
              ▼
            </button>
          </span>
        </div>
      </Etat>
    </div>
  )
}

/** La barre de sauvegarde : 48 px, noire dans les deux themes. */
function BarreSauvegarde(): ReactElement {
  return (
    <div className="o-flex o-flex-col o-gap-4">
      <Etat nom="modifications en attente" pleine>
        <div className="ods-barre-sauvegarde">
          <span className="ods-barre-sauvegarde-texte">Modifications non enregistrées</span>
          <div className="ods-barre-sauvegarde-actions">
            <button type="button" className="ods-bouton ods-bouton-secondaire">
              Annuler
            </button>
            <button type="button" className="ods-bouton ods-bouton-primaire">
              Enregistrer
            </button>
          </div>
        </div>
      </Etat>

      <Etat nom="enregistrement en cours" pleine>
        <div className="ods-barre-sauvegarde">
          <span className="ods-barre-sauvegarde-texte">Enregistrement…</span>
          <div className="ods-barre-sauvegarde-actions">
            <button type="button" className="ods-bouton ods-bouton-secondaire" disabled>
              Annuler
            </button>
            <button type="button" className="ods-bouton ods-bouton-primaire" disabled>
              Enregistrer
            </button>
          </div>
        </div>
      </Etat>

      <Etat nom="erreur de validation" pleine>
        <div className="ods-barre-sauvegarde">
          <span className="ods-barre-sauvegarde-texte">
            2 champs à corriger avant d’enregistrer
          </span>
          <div className="ods-barre-sauvegarde-actions">
            <button type="button" className="ods-bouton ods-bouton-secondaire">
              Annuler
            </button>
            <button type="button" className="ods-bouton ods-bouton-primaire" disabled>
              Enregistrer
            </button>
          </div>
        </div>
      </Etat>
    </div>
  )
}

/* ============================ La demonstration ========================= */

/**
 * Les dix familles de controles du §10, bout a bout.
 *
 * Le composant ne tient aucun etat : chaque exemple est fige dans celui qu il
 * illustre. C est voulu — un interrupteur qui basculerait au clic ne montrerait
 * plus qu un etat a la fois, et la page perdrait justement ce qu elle est la
 * pour dire.
 */
export function DemoControles(): ReactElement {
  return (
    <div className="o-flex o-flex-col o-gap-6">
      <Famille titre="Contrôle segmenté" classe=".ods-segmente">
        <Segmente />
      </Famille>

      <Famille titre="Boutons radio" classe=".ods-radio">
        <Radios />
      </Famille>

      <Famille titre="Cases à cocher" classe=".ods-case">
        <Cases />
      </Famille>

      <Famille titre="Interrupteurs" classe=".ods-interrupteur">
        <Interrupteurs />
      </Famille>

      <Famille titre="Groupes de choix" classe=".ods-groupe-choix">
        <GroupeChoix />
      </Famille>

      <Famille titre="Balises" classe=".ods-balises · .ods-balise">
        <Balises />
      </Famille>

      <Famille titre="Zone de dépôt" classe=".ods-depot">
        <Depot />
      </Famille>

      <Famille titre="Préfixe et suffixe" classe=".ods-affixe">
        <Affixes />
      </Famille>

      <Famille titre="Champ numérique" classe=".ods-nombre">
        <Nombres />
      </Famille>

      <Famille titre="Barre de sauvegarde" classe=".ods-barre-sauvegarde">
        <BarreSauvegarde />
      </Famille>
    </div>
  )
}
