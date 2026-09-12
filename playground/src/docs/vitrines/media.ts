/**
 * Les images des vitrines.
 *
 * ## Pourquoi elles ne viennent plus d un service au hasard
 *
 * La premiere version tirait une photographie au sort a partir d une graine.
 * Le cadrage tombait juste, le sujet jamais : un chien sur la page d un
 * fleuriste, une chaussure de sport sur celle d un hotel. Une vitrine qui vend
 * un metier ne peut pas illustrer autre chose que ce metier.
 *
 * Chaque emplacement a donc sa photographie, choisie pour son sujet, tiree de
 * Wikimedia Commons — libre de droits, usage commercial et modification admis —
 * et enregistree dans le depot. Servie en local, elle ne depend plus d un
 * service distant qui peut disparaitre ou changer d avis. Les mentions
 * d attribution vivent a cote des fichiers, dans `credits.json`.
 *
 * ## Pourquoi les visages sont des monogrammes
 *
 * Les personnes citees par les vitrines sont inventees. Preter le visage d une
 * personne reelle et identifiable a un barbier ou a une associee qui n existent
 * pas serait une fausse attribution — et aucune licence ne l autorise, parce
 * que ce n est pas une question de licence mais de droit a l image. Un portrait
 * est donc rendu par un monogramme construit sur place, a partir des initiales
 * du nom : rien n est telecharge, rien n est pretendu.
 *
 * @module
 */

/** Une image de demonstration, avec son texte de remplacement. */
export interface Media {
  readonly src: string
  readonly alt: string
}

/** Dossier des photographies enregistrees. */
const DOSSIER = '/vitrines/photos'

/**
 * Les emplacements rendus par un monogramme.
 *
 * Ce sont les visages : tout ce qui pretendrait montrer une personne nommee.
 */
const VISAGES: ReadonlySet<string> = new Set([
  'cabinet-arsac',
  'cabinet-benali',
  'cabinet-berthaut',
  'cabinet-delaunay',
  'cabinet-ferrand',
  'cabinet-lecointre',
  'cabinet-nardi',
  'cabinet-toussaint',
  'cabinet-vaury',
  'cabinet-verne',
  'clinique-amine',
  'clinique-claire',
  'clinique-helene',
  'clinique-marc',
  'portrait-nord-bastien',
  'portrait-nord-come',
  'portrait-nord-hugo',
  'portrait-nord-ines',
  'portrait-nord-lea',
  'portrait-nord-nadia',
  'portrait-nord-salome',
  'portrait-nord-tarek',
  'rasoir-camille',
  'rasoir-ivan',
  'rasoir-sofiane',
  'sport-ivan',
  'sport-lena',
  'sport-maud',
  'sport-sofiane',
  'yoga-camille',
  'yoga-elsa',
  'yoga-jonas',
  'yoga-nadia',
])

/**
 * Teintes des monogrammes.
 *
 * Ecrites en clair, et non en variables du systeme : une image en `data:` est
 * un document isole, ou les proprietes personnalisees de la page ne sont pas
 * resolues. Ce sont les valeurs des nuances 200 et 700 de la palette, relevees
 * une fois. Chaque paire tient au-dessus de 7:1, donc lisible sur les deux
 * themes puisque la pastille porte son propre fond.
 */
const TEINTES = [
  ['#e4e4e7', '#3f3f46'],
  ['#e7e5e4', '#44403c'],
  ['#e2e8f0', '#334155'],
  ['#ccfbf1', '#115e59'],
  ['#fef3c7', '#92400e'],
  ['#ffe4e6', '#9f1239'],
] as const

/** Somme stable d une chaine, pour choisir une teinte sans tirer au sort. */
function empreinte(valeur: string): number {
  let somme = 0
  for (let i = 0; i < valeur.length; i += 1) somme = (somme * 31 + valeur.charCodeAt(i)) % 9973
  return somme
}

/**
 * Mots qui precedent un nom sans en faire partie.
 *
 * Sans eux, « Le docteur Helene Vernet » donnerait « LD » — et trois medecins
 * d une meme page porteraient les memes initiales.
 */
const CIVILITES = new Set([
  'le', 'la', 'les', 'un', 'une', 'du', 'de', 'des',
  'docteur', 'dr', 'professeur', 'pr', 'maitre', 'me',
  'madame', 'mme', 'monsieur', 'mr', 'm',
])

/**
 * Les initiales d une personne.
 *
 * Le texte de remplacement porte le nom — « Sofiane Merad, barbier » : on
 * s arrete a la premiere virgule, on ecarte les civilites, puis on prend la
 * premiere lettre des deux mots restants. Quand le texte ne porte aucun nom,
 * c est la graine qui parle : `cabinet-delaunay` vaut « D ».
 */
function initiales(nom: string, graine: string): string {
  const propre = nom.split(',')[0]?.trim() ?? ''
  const mots = propre
    .split(/\s+/)
    .filter((mot) => /^[A-Za-z]/.test(mot))
    .filter((mot) => !CIVILITES.has(mot.toLowerCase().replace(/\.$/, '')))
  const lettres = mots.slice(0, 2).map((mot) => mot[0]?.toUpperCase() ?? '')
  if (lettres.length > 0) return lettres.join('')

  const segment = graine.split('-').pop() ?? ''
  return (segment[0] ?? '?').toUpperCase()
}

/**
 * Un monogramme, en image, sans rien telecharger.
 *
 * L image est une adresse de donnees : elle ne coute aucune requete. Ses
 * couleurs sont ecrites en clair, un document `data:` n heritant pas des
 * proprietes personnalisees de la page qui l affiche.
 */
function monogramme(graine: string, nom: string): string {
  const paire = TEINTES[empreinte(graine) % TEINTES.length] ?? TEINTES[0]
  const [fond, encre] = paire
  const svg = [
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>",
    `<rect width='200' height='200' fill='${fond}'/>`,
    "<text x='100' y='100' text-anchor='middle' dominant-baseline='central'",
    " font-family='system-ui, sans-serif' font-size='76' font-weight='600'",
    ` fill='${encre}'>${initiales(nom, graine)}</text>`,
    '</svg>',
  ].join('')
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/**
 * L adresse d une image.
 *
 * Les dimensions demandees ne servent plus a decouper une image a la volee :
 * le fichier a sa taille propre, et c est la mise en page qui le cadre, par
 * `object-fit`. Elles restent dans la signature parce que les vitrines les
 * passent, et parce qu elles disent le format attendu.
 *
 * @param graine Ce qui identifie l emplacement.
 *
 * @example
 * photo('tamaris-crique-1', 1200, 800)
 */
export function photo(graine: string, _largeur?: number, _hauteur?: number): string {
  return VISAGES.has(graine) ? monogramme(graine, '') : `${DOSSIER}/${graine}.jpg`
}

/** Une image et son texte de remplacement, en une fois. */
export function media(
  graine: string,
  alt: string,
  _largeur?: number,
  _hauteur?: number,
): Media {
  return {
    src: VISAGES.has(graine) ? monogramme(graine, alt) : `${DOSSIER}/${graine}.jpg`,
    alt,
  }
}

/**
 * Un portrait.
 *
 * Rendu par un monogramme : la personne est inventee, et aucun visage reel ne
 * doit lui etre prete.
 */
export function portrait(graine: string, alt: string, _taille?: number): Media {
  return { src: monogramme(graine, alt), alt }
}

/** Une image large, pour une banniere ou une galerie. */
export function paysage(graine: string, alt: string): Media {
  return media(graine, alt)
}

/** Une image haute, pour une carte de produit ou une affiche. */
export function affiche(graine: string, alt: string): Media {
  return media(graine, alt)
}
