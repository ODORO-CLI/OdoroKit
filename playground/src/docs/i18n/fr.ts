/**
 * Le dictionnaire source.
 *
 * C est la seule langue ou la prose est ecrite plutot que traduite : les
 * termes du domaine — jeton, gabarit, socle, vitrine, registre — y ont ete
 * choisis, et les trente et une autres en decoulent.
 *
 * Une cle absente d une traduction retombe ici. Ce fichier ne peut donc pas
 * avoir de trou : toute phrase du chrome doit y figurer avant d exister
 * ailleurs.
 *
 * @module
 */

const source = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Rechercher dans la documentation',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Ouvrir la navigation',
  'barre.menu.fermer': 'Fermer la navigation',
  'barre.navigation': 'Navigation principale',
  'barre.depot': 'Dépôt',
  'barre.npm': 'Paquet npm',
  'barre.theme': 'Changer de thème',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Documentation',
  'nav.composants': 'Composants',
  'nav.animations': 'Animations',
  'nav.moteur': 'Moteur',
  'nav.registre': 'Registre',
  'nav.templates': 'Templates',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Navigation de la documentation',
  'colonne.sections': 'Sections',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Rechercher une page, un composant, un utilitaire...',
  'recherche.etiquette': 'Rechercher',
  'recherche.echap': 'Échap',
  'recherche.resultats': 'Résultats',
  'recherche.vide.titre': 'Aucun résultat',
  'recherche.vide.texte':
    'Rien ne répond à cette recherche. Essaie le nom d’un composant, d’un utilitaire ou d’une commande.',
  'recherche.aide.choisir': 'Haut / bas pour choisir',
  'recherche.aide.ouvrir': 'Entrée pour ouvrir',
  'recherche.compte': 'résultats',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Précédent',
  'pagination.suivant': 'Suivant',
  'pagination.defiler': 'Continuez à défiler au bord de la page pour passer à la suivante',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Documentation',
  'doc.propriete': 'Propriété',
  'doc.type': 'Type',
  'doc.defaut': 'Défaut',
  'doc.description': 'Description',
  'doc.apercu': 'Aperçu',
  'doc.code': 'Code',
  'doc.copier': 'Copier',
  'doc.copie': 'Copié',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Aperçu',
  'projet.code': 'Code',
  'projet.integrer': 'Intégrer',
  'projet.livre': 'Projet livré',
  'projet.retour': 'Templates',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Projet introuvable',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filtres',
  'biblio.famille': 'Famille',
  'biblio.secteur': 'Secteur',
  'biblio.entrees': 'entrées',
  'biblio.effacer': 'Effacer les filtres',
  'biblio.vitrines': 'Vitrines',
  'biblio.projets': 'Projets livrés',
  'biblio.socles': 'Socles',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Langue',
  'langue.choisir': 'Choisir une langue',
  'langue.automatique': 'Traduction automatique',
} as const

/** Une cle du chrome. Le `as const` ci dessus fixe la liste. */
export type CleDeTraduction = keyof typeof source

/**
 * Le dictionnaire source, dont le type ne retient que `string` en valeur.
 *
 * Garder les phrases dans le type serait tentant — on saurait a la lecture ce
 * que dit chaque cle — mais `Partial<typeof fr>`, le type de toute traduction,
 * n accepterait alors que le francais lui meme : « Search » ne serait pas un
 * « Rechercher » valide. Les cles restent litterales, les valeurs non.
 */
export const fr: Record<CleDeTraduction, string> = source
