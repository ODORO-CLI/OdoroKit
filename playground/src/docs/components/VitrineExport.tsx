/**
 * Ce qu on peut emporter d une vitrine : son code, et son cadre.
 *
 * ## Les deux panneaux
 *
 * **Code** montre le projet entier, fichier par fichier — pas un extrait de la
 * page, le dossier complet tel que l archive le contient : la vitrine, sa
 * trousse, les pieces du registre recopiees, et le socle qui les fait tourner.
 * De la, trois sorties : l archive, le depot, ou le presse-papiers.
 *
 * **Integrer** fabrique la balise a coller ailleurs, et la montre en train de
 * marcher juste en dessous. Ce qui est regle dans le panneau — hauteur, theme,
 * palette — se retrouve a la fois dans l apercu et dans la balise : il n y a
 * pas deux verites.
 *
 * ## Pourquoi le code n est pas dans le paquet du site
 *
 * Cent vitrines font vingt-cinq megaoctets de source. Les embarquer alourdirait
 * chaque visite de la documentation pour un panneau que presque personne
 * n ouvre. Chaque vitrine a donc son fichier sous `/exports/vitrines/`, produit
 * par `scripts/build-vitrine-exports.mjs`, et telecharge au moment ou on
 * demande a le voir.
 *
 * Le poids de l archive, lui, est connu d avance : il est releve a la
 * generation et compile dans `exports.generated.ts`. Le bouton peut donc
 * l annoncer sans rien telecharger.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { Github } from '@odoro-cli/icons/brands'
import {
  Archive,
  Braces,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  Code,
  Copy,
  Download,
  ExternalLink,
  File,
  FileCode,
  FileText,
  Folder,
  FolderOpen,
  Hash,
  ListTree,
} from '@odoro-cli/icons/outline'
import { Switch } from '@odoro-cli/libs/ui'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

import { DEPOT, EXPORTS } from '../exports.generated.js'
import { type Vitrine } from '../vitrines/index.js'
import { type Couleurs } from '../vitrines/palettes.js'
import { CodeBlock } from './CodeBlock.jsx'

/**
 * Les deux reglages que les utilitaires ne savent pas exprimer.
 *
 * Le systeme ne produit pas de classe a valeur arbitraire : `o-max-h-[70vh]`
 * ne correspond a aucune regle, et une classe absente ne casse rien — elle ne
 * peint rien, en silence. Ces deux mesures passent donc par une feuille posee
 * une fois.
 */
const FEUILLE_CODE = [
  '.tp-code-corps{max-height:70vh}',
  '@media (min-width:1024px){.tp-code{grid-template-columns:19rem minmax(0,1fr)}}',

  /* L explorateur : un cadre, une tete fixe, un corps qui defile. */
  '.tp-arbre{display:flex;flex-direction:column;overflow:hidden;',
  'border-radius:0.75rem;border:1px solid var(--o-chrome-filet);',
  'background-color:var(--o-chrome-carte)}',
  '.tp-arbre-tete{display:flex;align-items:center;justify-content:space-between;',
  'gap:0.5rem;padding:0.5rem 0.5rem 0.5rem 0.75rem;',
  'border-bottom:1px solid var(--o-chrome-filet)}',
  '.tp-arbre-corps{overflow:auto;max-height:70vh}',

  /* Une ligne : pleine largeur, le retrait vient du style en ligne. */
  '.tp-arbre-ligne{display:flex;width:100%;align-items:center;gap:0.375rem;',
  'padding-top:0.1875rem;padding-bottom:0.1875rem;padding-right:0.5rem;',
  'border:0;background:none;cursor:pointer;text-align:left;',
  'font-family:var(--o-font-mono);font-size:0.75rem;line-height:1.5;',
  'color:var(--o-theme-muted);transition:background-color 120ms,color 120ms}',
  '.tp-arbre-ligne:hover{background-color:var(--o-chrome-carte-survol);',
  'color:var(--o-theme-fg)}',
  '.tp-arbre-ligne:focus-visible{outline:2px solid var(--o-palette-brand-500);',
  'outline-offset:-2px}',

  /* Le fichier lu : un filet d accent a gauche, comme un onglet actif. */
  '.tp-arbre-active,.tp-arbre-active:hover{',
  'background-color:color-mix(in oklab,var(--o-palette-brand-500) 14%,transparent);',
  'color:var(--o-theme-fg);box-shadow:inset 2px 0 0 var(--o-palette-brand-500)}',

  /* La gouttiere qui aligne les fichiers sur les dossiers de meme niveau. */
  '.tp-arbre-gouttiere{display:inline-block;flex-shrink:0;width:13px}',

  /* Le filet vertical d un niveau, comme dans un editeur : c est lui qui dit
     ou un dossier s arrete quand son contenu depasse l ecran. Le retrait
     etant une mesure portee par chaque ligne, le groupe recoit la sienne. */
  '.tp-arbre-groupe{position:relative}',
  '.tp-arbre-groupe::before{content:"";position:absolute;top:0;bottom:0;',
  'left:var(--tp-guide);width:1px;background-color:var(--o-chrome-filet)}',
].join('')

/** Identifiant de la feuille du panneau de code. */
const STYLE_CODE = 'o-vitrine-export'

/** Pose la feuille du panneau, une seule fois pour le document. */
function useFeuilleCode(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_CODE) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_CODE
    feuille.textContent = FEUILLE_CODE
    document.head.append(feuille)
  }, [])
}

/* ============================ Le chargement ============================= */

/**
 * Un fichier du projet exporte.
 *
 * `code` manque pour ce qui ne se lit pas — une image, une video, une police.
 * Ces fichiers restent dans l arborescence, avec leur poids : un projet se
 * comprend a sa forme autant qu a ses lignes, et cacher ses assets donnerait
 * une forme fausse.
 */
interface Fichier {
  readonly path: string
  readonly code?: string
  readonly bytes?: number
}

/**
 * Ce que le generateur ecrit, vitrine ou projet livre.
 *
 * Les deux fichiers ne portent pas les memes entetes — une vitrine annonce son
 * metier, un projet son nom de dossier — mais le panneau ne lit que `files`.
 * C est le seul champ qu il exige.
 */
interface Export {
  readonly files: readonly Fichier[]
}

/** L etat du telechargement du code. */
type Etat =
  | { readonly statut: 'attente' }
  | { readonly statut: 'echec'; readonly message: string }
  | { readonly statut: 'pret'; readonly contenu: Export }

/** Les exports deja telecharges, pour ne pas les redemander. */
const CACHE = new Map<string, Export>()

/** Le lien de l archive d une vitrine. */
function lienArchive(slug: string): string {
  return `/exports/vitrines/${slug}.zip`
}

/** Le lien du fichier source d une vitrine, dans le depot. */
function lienDepot(slug: string): string {
  return `${DEPOT}/blob/main/playground/src/docs/vitrines/${slug}.tsx`
}

/**
 * Telecharge une liste de fichiers, une seule fois.
 *
 * L adresse est donnee plutot que deduite : une vitrine et un projet livre
 * n ecrivent pas au meme endroit, et le panneau qui les montre est le meme.
 */
function useExport(cle: string, adresse: string): Etat {
  const slug = cle
  const [etat, setEtat] = useState<Etat>(() => {
    const deja = CACHE.get(slug)
    return deja === undefined ? { statut: 'attente' } : { statut: 'pret', contenu: deja }
  })

  useEffect(() => {
    const deja = CACHE.get(slug)
    if (deja !== undefined) {
      setEtat({ statut: 'pret', contenu: deja })
      return
    }

    // Changer de vitrine pendant un telechargement doit abandonner celui-ci :
    // sans cela la reponse de la precedente ecraserait la suivante si elle
    // arrive en second.
    let vivant = true
    setEtat({ statut: 'attente' })

    fetch(adresse)
      .then((reponse) => {
        if (!reponse.ok) throw new Error(`reponse ${String(reponse.status)}`)
        return reponse.json() as Promise<Export>
      })
      .then((contenu) => {
        CACHE.set(slug, contenu)
        if (vivant) setEtat({ statut: 'pret', contenu })
      })
      .catch((cause: unknown) => {
        if (vivant) setEtat({ statut: 'echec', message: String(cause) })
      })

    return () => {
      vivant = false
    }
  }, [slug, adresse])

  return etat
}

/** Un poids en octets, tel qu on l annonce. */
function poids(octets: number): string {
  if (octets < 1024) return `${String(octets)} o`
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(0)} ko`
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`
}

/** Le langage d un fichier, deduit de son nom. */
function langage(chemin: string): string {
  const point = chemin.lastIndexOf('.')
  if (chemin.endsWith('.gitignore') || point <= 0) return 'txt'
  const suffixe = chemin.slice(point + 1)
  return suffixe === 'mjs' ? 'js' : suffixe
}

/* ============================ L explorateur ============================= */

/** Un noeud de l arborescence : un dossier, ou un fichier. */
interface Noeud {
  readonly nom: string
  /** Chemin complet, tel que l export le nomme. */
  readonly chemin: string
  readonly dossier: boolean
  readonly enfants: readonly Noeud[]
}

/**
 * L arborescence, batie a partir des chemins plats de l export.
 *
 * Une liste a plat de vingt-huit chemins ne se lit pas : `src/odoro/loader/` y
 * revient cinq fois, et la structure du projet — ce qui appartient a la
 * vitrine, ce qui vient du registre, ce qui est le socle — n apparait nulle
 * part. L arbre, lui, la montre sans qu on ait a lire.
 *
 * Les dossiers passent avant les fichiers, comme dans un editeur : c est
 * l ordre qui laisse voir la forme du projet avant son contenu.
 */
function construireArbre(chemins: readonly string[]): readonly Noeud[] {
  interface Brouillon {
    nom: string
    chemin: string
    dossier: boolean
    enfants: Map<string, Brouillon>
  }

  const racine: Brouillon = { nom: '', chemin: '', dossier: true, enfants: new Map() }

  for (const chemin of chemins) {
    const morceaux = chemin.split('/')
    let courant = racine
    morceaux.forEach((morceau, rang) => {
      const complet = morceaux.slice(0, rang + 1).join('/')
      let enfant = courant.enfants.get(morceau)
      if (enfant === undefined) {
        enfant = {
          nom: morceau,
          chemin: complet,
          dossier: rang < morceaux.length - 1,
          enfants: new Map(),
        }
        courant.enfants.set(morceau, enfant)
      }
      courant = enfant
    })
  }

  const geler = (brouillon: Brouillon): Noeud => ({
    nom: brouillon.nom,
    chemin: brouillon.chemin,
    dossier: brouillon.dossier,
    enfants: [...brouillon.enfants.values()]
      .sort((a, b) => {
        if (a.dossier !== b.dossier) return a.dossier ? -1 : 1
        return a.nom.localeCompare(b.nom)
      })
      .map(geler),
  })

  return geler(racine).enfants
}

/**
 * L icone et la couleur d un fichier, selon ce qu il est.
 *
 * Un explorateur ou tous les fichiers se ressemblent ne sert qu a lire des
 * noms. La couleur porte le type : on repere une feuille de style ou un
 * manifeste sans lire, et c est la moitie du travail de reperage.
 */
function apparence(nom: string): {
  readonly icone: typeof FileCode
  readonly teinte: string
} {
  if (nom.endsWith('.tsx')) return { icone: FileCode, teinte: 'o-text-sky-500' }
  if (nom.endsWith('.ts')) return { icone: FileCode, teinte: 'o-text-blue-500' }
  if (nom.endsWith('.css')) return { icone: Hash, teinte: 'o-text-violet-500' }
  if (nom.endsWith('.json')) return { icone: Braces, teinte: 'o-text-amber-500' }
  if (nom.endsWith('.html')) return { icone: Code, teinte: 'o-text-orange-500' }
  if (nom.endsWith('.md')) return { icone: FileText, teinte: 'o-text-emerald-500' }
  return { icone: File, teinte: 'o-text-zinc-400' }
}

/**
 * Une ligne de l arborescence — un dossier qui s ouvre, ou un fichier.
 *
 * ## Pourquoi ce n est pas declare comme un arbre ARIA
 *
 * `role="tree"` promet la navigation au clavier d un arbre : les fleches pour
 * descendre et remonter, gauche et droite pour plier et deplier, un seul arret
 * de tabulation pour l ensemble. Rien de tout cela n est ici. L annoncer
 * quand meme ferait, pour qui navigue au lecteur d ecran, une promesse que la
 * page ne tient pas — ce qui est pire que de n avoir rien promis.
 *
 * C est donc ce que c est : une liste imbriquee de boutons. Les dossiers
 * portent `aria-expanded`, le fichier lu porte `aria-current`, et la
 * tabulation les parcourt dans l ordre ou ils sont ecrits.
 */
function Ligne({
  noeud,
  profondeur,
  choisi,
  replies,
  onChoisir,
  onBasculer,
}: {
  readonly noeud: Noeud
  readonly profondeur: number
  readonly choisi: string
  readonly replies: ReadonlySet<string>
  readonly onChoisir: (chemin: string) => void
  readonly onBasculer: (chemin: string) => void
}): ReactElement {
  const ouvert = !replies.has(noeud.chemin)
  const actif = !noeud.dossier && noeud.chemin === choisi
  const { icone, teinte } = apparence(noeud.nom)
  const bouton = useRef<HTMLButtonElement>(null)

  /*
   * Le fichier lu est souvent au fond de l arbre — `src/vitrine/` vient apres
   * les onze pieces du registre. Sans cela, le panneau s ouvre sur un fichier
   * surligne que personne ne voit.
   *
   * On deplace la colonne a la main plutot que d appeler `scrollIntoView` :
   * celui-ci remonte la chaine des parents defilables et bouge aussi la page.
   * Dans la route d un projet, ou le panneau vit dans une colonne haute,
   * cela decalait le titre sous le bandeau des l ouverture.
   */
  useEffect(() => {
    if (!actif) return
    const cible = bouton.current
    const colonne = cible?.closest('.tp-arbre-corps')
    if (cible === null || colonne === null || colonne === undefined) return

    /*
     * La position se mesure a l ecran, pas avec `offsetTop` : les groupes de
     * l arbre sont positionnes — ils portent leur filet vertical — et c est
     * donc son groupe, pas la colonne, qui sert de repere a une ligne.
     */
    const cadre = colonne.getBoundingClientRect()
    const ligne = cible.getBoundingClientRect()
    const centre = ligne.top - cadre.top - cadre.height / 2 + ligne.height / 2
    colonne.scrollTop = Math.max(0, colonne.scrollTop + centre)
  }, [actif])

  return (
    <li>
      <button
        ref={bouton}
        type="button"
        aria-expanded={noeud.dossier ? ouvert : undefined}
        aria-current={actif ? 'true' : undefined}
        onClick={() => {
          if (noeud.dossier) onBasculer(noeud.chemin)
          else onChoisir(noeud.chemin)
        }}
        // Le retrait est une mesure, pas une echelle : le systeme ne produit
        // pas de classe a valeur arbitraire, et un niveau de plus n aurait
        // aucune regle a appliquer.
        style={{ paddingLeft: `${String(0.375 + profondeur * 0.875)}rem` }}
        className={`tp-arbre-ligne${actif ? ' tp-arbre-active' : ''}`}
      >
        {noeud.dossier ? (
          <>
            <Icon
              icon={ouvert ? ChevronDown : ChevronRight}
              size={13}
              aria-hidden="true"
              className="o-shrink-0 o-text-zinc-400 dark:o-text-zinc-500"
            />
            <Icon
              icon={ouvert ? FolderOpen : Folder}
              size={14}
              aria-hidden="true"
              className="o-shrink-0 o-text-brand-500"
            />
          </>
        ) : (
          <>
            {/* La gouttiere du chevron, vide : sans elle, les noms de fichiers
                ne s alignent pas sur ceux des dossiers de meme niveau. */}
            <span className="tp-arbre-gouttiere" aria-hidden="true" />
            <Icon
              icon={icone}
              size={14}
              aria-hidden="true"
              className={`o-shrink-0 ${teinte}`}
            />
          </>
        )}
        <span className="o-truncate">{noeud.nom}</span>
      </button>

      {noeud.dossier && ouvert && noeud.enfants.length > 0 && (
        <ul
          className="tp-arbre-groupe o-m-0 o-list-none o-p-0"
          style={
            {
              '--tp-guide': `${String(0.375 + profondeur * 0.875 + 0.4)}rem`,
            } as CSSProperties
          }
        >
          {noeud.enfants.map((enfant) => (
            <Ligne
              key={enfant.chemin}
              noeud={enfant}
              profondeur={profondeur + 1}
              choisi={choisi}
              replies={replies}
              onChoisir={onChoisir}
              onBasculer={onBasculer}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

/** Tous les chemins de dossier de l arbre, racine comprise. */
function dossiersDe(noeuds: readonly Noeud[], trouves: string[] = []): string[] {
  for (const noeud of noeuds) {
    if (!noeud.dossier) continue
    trouves.push(noeud.chemin)
    dossiersDe(noeud.enfants, trouves)
  }
  return trouves
}

/** Le chemin que porte la racine — celui d aucun fichier. */
const RACINE = '.'

/**
 * L arborescence des fichiers du modele.
 *
 * Le dossier racine porte le nom du projet, comme dans l archive : ce qu on
 * voit ici est exactement ce qu on obtient en la decompressant.
 */
function Explorateur({
  slug,
  chemins,
  choisi,
  onChoisir,
}: {
  readonly slug: string
  readonly chemins: readonly string[]
  readonly choisi: string
  readonly onChoisir: (chemin: string) => void
}): ReactElement {
  const arbre = useMemo(() => construireArbre(chemins), [chemins])
  const dossiers = useMemo(() => [RACINE, ...dossiersDe(arbre)], [arbre])
  const [replies, setReplies] = useState<ReadonlySet<string>>(new Set())

  // Changer de modele rouvre tout : les dossiers replies appartenaient a
  // l autre projet, et deux vitrines n ont pas les memes.
  useEffect(() => {
    setReplies(new Set())
  }, [slug])

  const toutReplie = dossiers.every((dossier) => replies.has(dossier))

  return (
    <div className="tp-arbre">
      <div className="tp-arbre-tete">
        <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          Explorateur
        </span>
        <button
          type="button"
          onClick={() => setReplies(toutReplie ? new Set() : new Set(dossiers))}
          className="o-inline-flex o-items-center o-gap-1.5 o-rounded-md o-px-1.5 o-py-1 o-text-xs o-cursor-pointer o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-100 o-transition-colors"
        >
          <Icon
            icon={toutReplie ? ListTree : ChevronsDownUp}
            size={13}
            aria-hidden="true"
          />
          {toutReplie ? 'Tout déplier' : 'Tout replier'}
        </button>
      </div>

      <div className="tp-arbre-corps o-scrollbar dark:o-scrollbar-dark">
        <ul
          aria-label={`Fichiers de ${slug}`}
          className="o-m-0 o-list-none o-p-0 o-py-1.5"
        >
          <Ligne
            noeud={{ nom: slug, chemin: RACINE, dossier: true, enfants: arbre }}
            profondeur={0}
            choisi={choisi}
            replies={replies}
            onChoisir={onChoisir}
            onBasculer={(chemin) =>
              setReplies((courant) => {
                const suite = new Set(courant)
                if (suite.has(chemin)) suite.delete(chemin)
                else suite.add(chemin)
                return suite
              })
            }
          />
        </ul>
      </div>
    </div>
  )
}

/* ============================ Le panneau de code ======================== */

/** La liste des fichiers, et celui qu on lit. */
export function PanneauCode({ vitrine }: { readonly vitrine: Vitrine }): ReactElement {
  useFeuilleCode()
  const etat = useExport(vitrine.slug, `/exports/vitrines/${vitrine.slug}.json`)
  const [choisi, setChoisi] = useState<string | null>(null)
  const mesures = EXPORTS[vitrine.slug]

  const fichiers = useMemo(
    () => (etat.statut === 'pret' ? etat.contenu.files : []),
    [etat],
  )
  const chemins = useMemo(() => fichiers.map((f) => f.path), [fichiers])

  // Le fichier choisi appartient a la vitrine precedente quand on change de
  // modele : il faut le laisser retomber sur le premier de la nouvelle liste.
  useEffect(() => {
    setChoisi(null)
  }, [vitrine.slug])

  // A l ouverture, c est la vitrine qu on veut voir, pas `tsconfig.json`.
  const defaut = `src/vitrine/${vitrine.slug}.tsx`
  const courant =
    fichiers.find((f) => f.path === choisi) ??
    fichiers.find((f) => f.path === defaut) ??
    fichiers[0]

  return (
    <div className="o-mx-auto o-max-w-7xl o-px-4 o-py-6 md:o-px-6">
      <EnTeteExport vitrine={vitrine} mesures={mesures} />

      {etat.statut === 'attente' && (
        <p className="o-mt-8 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Chargement du code...
        </p>
      )}

      {etat.statut === 'echec' && (
        <p className="o-mt-8 o-text-sm o-text-red-600 dark:o-text-red-400">
          Le code n’a pas pu être chargé ({etat.message}). L’archive et le dépôt restent
          accessibles.
        </p>
      )}

      {etat.statut === 'pret' && courant !== undefined && (
        <div className="o-mt-6 o-grid o-gap-5 tp-code">
          <Explorateur
            slug={vitrine.slug}
            chemins={chemins}
            choisi={courant.path}
            onChoisir={setChoisi}
          />

          <div className="o-min-w-0">
            {/* Un fichier sans texte n est pas une erreur : c est une image,
                une video, une police. On le dit, avec son poids, plutot que
                d afficher une colonne vide. */}
            <CodeBlock
              lang={courant.code === undefined ? 'txt' : langage(courant.path)}
              code={
                courant.code ??
                `Ce fichier ne se lit pas dans une colonne.
` +
                  `${poids(courant.bytes ?? 0)} — il est dans l’archive.`
              }
              className="tp-code-corps o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark"
              actions={
                <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                  {courant.path}
                </span>
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Les fichiers d un projet livre.
 *
 * Le meme explorateur que pour une vitrine, sur une autre source. Ce qui
 * change tient en trois points : l adresse du fichier de code, le fichier
 * ouvert par defaut — on veut voir la page, pas `tsconfig.json` — et
 * l arborescence, qui porte ici tout le projet, assets compris.
 *
 * Un projet livre compte jusqu a cinq cents fichiers. C est beaucoup pour une
 * colonne, et c est justement ce qu on vient voir : la forme d un vrai projet,
 * pas un extrait choisi.
 */
export function PanneauCodeProjet({
  nom,
  titre,
  install,
  dev,
}: {
  readonly nom: string
  readonly titre: string
  readonly install?: string
  readonly dev?: string
}): ReactElement {
  useFeuilleCode()
  const etat = useExport(`projet:${nom}`, `/exports/projets/${nom}.json`)
  const [choisi, setChoisi] = useState<string | null>(null)

  const fichiers = useMemo(
    () => (etat.statut === 'pret' ? etat.contenu.files : []),
    [etat],
  )
  const chemins = useMemo(() => fichiers.map((f) => f.path), [fichiers])

  useEffect(() => {
    setChoisi(null)
  }, [nom])

  /*
   * A l ouverture, la page : celle qui monte l application, ou a defaut le
   * premier fichier qui se lit. Ouvrir sur un binaire montrerait une colonne
   * qui dit « ce fichier ne se lit pas », ce qui est vrai et sans interet.
   */
  const ORDRE = ['src/App.tsx', 'src/main.tsx', 'index.html', 'README.md']
  const courant =
    fichiers.find((f) => f.path === choisi) ??
    ORDRE.map((p) => fichiers.find((f) => f.path === p)).find((f) => f !== undefined) ??
    fichiers.find((f) => f.code !== undefined) ??
    fichiers[0]

  return (
    <div className="o-mx-auto o-max-w-7xl o-px-4 o-py-6 md:o-px-6">
      <div className="o-min-w-0">
        <h2 className="o-m-0 o-text-lg o-font-semibold o-tracking-tight">
          Le code complet de {titre}
        </h2>
        <p className="o-m-0 o-mt-1 o-max-w-2xl o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
          L’arborescence entière du projet, telle qu’elle est livrée :{' '}
          {/* Tous les projets ne s installent pas. `sections` est une
              bibliotheque de documents autonomes : il n y a rien a poser, et
              annoncer une commande qui ne sert pas serait une fausse piste. */}
          {install !== undefined && (
            <>
              <code className="o-font-mono o-text-xs">{install}</code> puis{' '}
            </>
          )}
          <code className="o-font-mono o-text-xs">{dev ?? 'npm run dev'}</code>, et il
          tourne. Les fichiers qui ne se lisent pas dans une colonne — images, vidéos,
          polices — gardent leur place et leur poids.
        </p>
      </div>

      {etat.statut === 'attente' && (
        <p className="o-mt-8 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Chargement du code...
        </p>
      )}

      {etat.statut === 'echec' && (
        <p className="o-mt-8 o-text-sm o-text-red-600 dark:o-text-red-400">
          Le code n’a pas pu être chargé ({etat.message}). L’archive et le dépôt restent
          accessibles depuis le bandeau.
        </p>
      )}

      {etat.statut === 'pret' && courant !== undefined && (
        <div className="o-mt-6 o-grid o-gap-5 tp-code">
          <Explorateur
            slug={nom}
            chemins={chemins}
            choisi={courant.path}
            onChoisir={setChoisi}
          />

          <div className="o-min-w-0">
            <CodeBlock
              lang={courant.code === undefined ? 'txt' : langage(courant.path)}
              code={
                courant.code ??
                `Ce fichier ne se lit pas dans une colonne.
` +
                  `${poids(courant.bytes ?? 0)} — il est dans l’archive.`
              }
              className="tp-code-corps o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark"
              actions={
                <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                  {courant.path}
                </span>
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}

/** Les trois sorties, et ce que pese l archive. */
function EnTeteExport({
  vitrine,
  mesures,
}: {
  readonly vitrine: Vitrine
  readonly mesures: (typeof EXPORTS)[string] | undefined
}): ReactElement {
  return (
    <div className="o-flex o-flex-wrap o-items-start o-justify-between o-gap-4">
      <div className="o-min-w-0">
        <h2 className="o-m-0 o-text-lg o-font-semibold o-tracking-tight">
          Le code complet du modèle
        </h2>
        <p className="o-m-0 o-mt-1 o-max-w-2xl o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
          L’archive est un projet qui tourne seul :{' '}
          <code className="o-font-mono o-text-xs">npm install</code> puis{' '}
          <code className="o-font-mono o-text-xs">npm run dev</code>. La vitrine, sa
          trousse et les {mesures === undefined ? '' : `${String(mesures.pieces)} `}pièces
          du registre qu’elle emploie y sont recopiées — rien ne pointe vers la
          documentation.
        </p>
      </div>

      <div className="o-flex o-shrink-0 o-flex-wrap o-items-center o-gap-2">
        <a
          href={lienArchive(vitrine.slug)}
          download={`${vitrine.slug}.zip`}
          className="o-inline-flex o-items-center o-gap-2 o-rounded-lg o-bg-brand-600 hover:o-bg-brand-700 o-px-3 o-py-2 o-text-sm o-font-medium o-text-white o-no-underline o-transition-colors"
        >
          <Icon icon={Download} size={15} aria-hidden="true" />
          Télécharger le ZIP
          {mesures !== undefined && (
            <span className="o-font-mono o-text-xs o-opacity-80">
              {poids(mesures.zip)}
            </span>
          )}
        </a>
        <a
          href={lienDepot(vitrine.slug)}
          target="_blank"
          rel="noreferrer"
          className="o-inline-flex o-items-center o-gap-2 o-rounded-lg o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-px-3 o-py-2 o-text-sm o-font-medium o-no-underline o-text-zinc-700 dark:o-text-zinc-200 hover:o-border-zinc-400 dark:hover:o-border-zinc-600 o-transition-colors"
        >
          <Icon icon={Github} size={15} aria-hidden="true" />
          Voir sur GitHub
          <Icon
            icon={ExternalLink}
            size={13}
            aria-hidden="true"
            className="o-opacity-60"
          />
        </a>
      </div>

      {mesures !== undefined && (
        <p className="o-m-0 o-flex o-w-full o-flex-wrap o-items-center o-gap-x-4 o-gap-y-1 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
          <span className="o-inline-flex o-items-center o-gap-1.5">
            <Icon icon={Archive} size={13} aria-hidden="true" />
            {String(mesures.files)} fichiers
          </span>
          <span>{String(mesures.pieces)} pièces du registre</span>
          <span>{String(mesures.photographies)} photographies</span>
        </p>
      )}
    </div>
  )
}

/* ============================ Le panneau d integration ================== */

/** Les hauteurs proposees, et ce qu elles valent. */
const HAUTEURS = [
  { valeur: '100vh', etiquette: 'Plein écran' },
  { valeur: '900', etiquette: '900 px' },
  { valeur: '720', etiquette: '720 px' },
  { valeur: '560', etiquette: '560 px' },
] as const

/** Les themes que l adresse accepte. */
const THEMES = [
  { valeur: '', etiquette: 'Visiteur' },
  { valeur: 'light', etiquette: 'Clair' },
  { valeur: 'dark', etiquette: 'Sombre' },
] as const

/**
 * L adresse d integration, telle que le panneau la regle.
 *
 * L origine vient du document : la meme page ouverte sur un poste de
 * developpement doit donner une balise qui marche sur ce poste, pas une qui
 * pointe vers la production.
 */
function adresse(slug: string, theme: string, couleurs: Couleurs | null): string {
  const origine = typeof window === 'undefined' ? '' : window.location.origin
  const parametres = new URLSearchParams()
  if (theme !== '') parametres.set('theme', theme)
  if (couleurs !== null) {
    parametres.set('palette', couleurs.map((c) => c.replace(/^#/, '')).join(','))
  }
  const suite = parametres.toString()
  return `${origine}/embed/${slug}${suite === '' ? '' : `?${suite}`}`
}

/** La balise a coller. */
function balise(lien: string, titre: string, hauteur: string): string {
  const attribut = hauteur.endsWith('vh') ? '' : `\n  height="${hauteur}"`
  const style = hauteur.endsWith('vh')
    ? `border:0;display:block;width:100%;height:${hauteur}`
    : 'border:0;display:block;width:100%'

  return `<iframe
  src="${lien}"
  title="${titre}"
  width="100%"${attribut}
  loading="lazy"
  style="${style}"
></iframe>`
}

/** Le complement, pour qui veut un cadre qui suit la hauteur de la page. */
function ecoute(slug: string): string {
  return `<script>
  // La vitrine annonce la hauteur de son document a chaque changement.
  //
  // A n employer qu en connaissance de cause : un cadre etire a la hauteur de
  // son contenu n a plus de fenetre propre, et les animations au defilement se
  // declenchent alors toutes a la premiere image.
  window.addEventListener('message', function (message) {
    var donnees = message.data
    if (!donnees || donnees.source !== 'odoro-embed') return
    if (donnees.slug !== ${JSON.stringify(slug)}) return
    var cadre = document.querySelector('iframe[data-odoro="' + donnees.slug + '"]')
    if (cadre) cadre.style.height = donnees.hauteur + 'px'
  })
</script>`
}

/** Le fabricant de balise, et son apercu. */
export function PanneauIntegration({
  vitrine,
  couleurs,
}: {
  readonly vitrine: Vitrine
  readonly couleurs: Couleurs
}): ReactElement {
  const [hauteur, setHauteur] = useState<string>('720')
  const [theme, setTheme] = useState<string>('')
  const [reprendre, setReprendre] = useState(false)
  const [suivre, setSuivre] = useState(false)

  const lien = adresse(vitrine.slug, theme, reprendre ? couleurs : null)
  const code = suivre
    ? `${balise(lien, vitrine.titre, hauteur).replace('<iframe', `<iframe data-odoro="${vitrine.slug}"`)}\n\n${ecoute(vitrine.slug)}`
    : balise(lien, vitrine.titre, hauteur)

  return (
    <div className="o-mx-auto o-max-w-7xl o-px-4 o-py-6 md:o-px-6">
      <h2 className="o-m-0 o-text-lg o-font-semibold o-tracking-tight">
        Poser ce modèle sur un autre site
      </h2>
      <p className="o-m-0 o-mt-1 o-max-w-2xl o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
        Le cadre garde son défilement propre — c’est ce qui fait marcher les animations,
        qui observent ce qui entre dans la fenêtre. Réglez ci-dessous, l’aperçu du bas est
        exactement ce que la balise produit.
      </p>

      <div className="o-mt-5 o-flex o-flex-wrap o-items-end o-gap-x-6 o-gap-y-4">
        <Choix
          titre="Hauteur"
          options={HAUTEURS}
          valeur={hauteur}
          onChange={setHauteur}
        />
        <Choix titre="Thème" options={THEMES} valeur={theme} onChange={setTheme} />

        <Switch
          size="sm"
          checked={reprendre}
          onCheckedChange={setReprendre}
          label={
            <span className="o-inline-flex o-items-center o-gap-2">
              Reprendre la palette choisie
              {reprendre && (
                <span className="o-inline-flex o-items-center o-gap-1">
                  {couleurs.map((couleur, rang) => (
                    <span
                      key={rang}
                      className="o-inline-block o-size-3 o-rounded-full o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700"
                      style={{ backgroundColor: couleur }}
                    />
                  ))}
                </span>
              )}
            </span>
          }
        />

        <Switch
          size="sm"
          checked={suivre}
          onCheckedChange={setSuivre}
          label="Cadre qui suit la hauteur de la page"
        />
      </div>

      {suivre && (
        <p className="o-m-0 o-mt-3 o-max-w-2xl o-rounded-lg o-border-w-1 o-border-amber-300 dark:o-border-amber-800 o-bg-amber-50 dark:o-bg-amber-950 o-px-3 o-py-2 o-text-xs o-text-amber-900 dark:o-text-amber-200">
          Un cadre étiré à la hauteur de son contenu n’a plus de fenêtre propre : tout y
          est visible en permanence, et les animations au défilement se déclenchent toutes
          à la première image. L’aperçu ci-dessous garde le défilement du cadre pour
          rester honnête.
        </p>
      )}

      <div className="o-mt-5">
        <CodeBlock lang="html" code={code} />
      </div>

      <div className="o-mt-6">
        <p className="o-m-0 o-mb-2 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          <Icon icon={Copy} size={13} aria-hidden="true" />
          Aperçu du cadre
        </p>
        <iframe
          key={lien}
          src={lien}
          title={vitrine.titre}
          loading="lazy"
          className="o-w-full o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800"
          style={{
            display: 'block',
            height: hauteur.endsWith('vh') ? '80vh' : `${hauteur}px`,
          }}
        />
      </div>
    </div>
  )
}

/** Un choix parmi quelques valeurs, rendu en segments. */
function Choix({
  titre,
  options,
  valeur,
  onChange,
}: {
  readonly titre: string
  readonly options: readonly { readonly valeur: string; readonly etiquette: string }[]
  readonly valeur: string
  readonly onChange: (valeur: string) => void
}): ReactElement {
  return (
    <div>
      <p className="o-m-0 o-mb-1.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        {titre}
      </p>
      <div
        role="group"
        aria-label={titre}
        className="o-inline-flex o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-0.5"
      >
        {options.map((option) => {
          const actif = option.valeur === valeur
          return (
            <button
              key={option.valeur}
              type="button"
              aria-pressed={actif}
              onClick={() => onChange(option.valeur)}
              className={[
                'o-rounded-md o-px-2.5 o-py-1 o-text-sm o-cursor-pointer o-transition-colors',
                actif
                  ? 'o-bg-zinc-900 dark:o-bg-zinc-100 o-text-white dark:o-text-zinc-900'
                  : 'o-text-zinc-600 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-100',
              ].join(' ')}
            >
              {option.etiquette}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Le bouton qui copie l adresse seule, pour qui a deja son cadre. */
export function CopierAdresse({ slug }: { readonly slug: string }): ReactElement {
  const [copie, setCopie] = useState(false)
  const lien = adresse(slug, '', null)

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(lien).then(() => {
          setCopie(true)
          setTimeout(() => setCopie(false), 1600)
        })
      }}
      className="o-inline-flex o-items-center o-gap-1.5 o-rounded-md o-px-2 o-py-1 o-text-xs o-cursor-pointer o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-100 o-transition-colors"
    >
      <Icon icon={copie ? Check : Copy} size={13} aria-hidden="true" />
      {copie ? 'Copiée' : 'Copier l’adresse'}
    </button>
  )
}
