/**
 * Dictionnaire anglais — traduit a la main.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Search the documentation',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Open navigation',
  'barre.menu.fermer': 'Close navigation',
  'barre.navigation': 'Main navigation',
  'barre.depot': 'Repository',
  'barre.npm': 'npm package',
  'barre.theme': 'Switch theme',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Documentation',
  'nav.composants': 'Components',
  'nav.animations': 'Animations',
  'nav.moteur': 'Engine',
  'nav.registre': 'Registry',
  'nav.templates': 'Templates',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Documentation navigation',
  'colonne.sections': 'Sections',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Search pages, components, utilities...',
  'recherche.etiquette': 'Search',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Results',
  'recherche.vide.titre': 'No results',
  'recherche.vide.texte':
    'Nothing matches that search. Try the name of a component, a utility or a command.',
  'recherche.aide.choisir': 'Up / down to select',
  'recherche.aide.ouvrir': 'Enter to open',
  'recherche.compte': 'results',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Previous',
  'pagination.suivant': 'Next',
  'pagination.defiler': 'Keep scrolling at the edge of the page to move on to the next one',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Documentation',
  'doc.propriete': 'Property',
  'doc.type': 'Type',
  'doc.defaut': 'Default',
  'doc.description': 'Description',
  'doc.apercu': 'Preview',
  'doc.code': 'Code',
  'doc.copier': 'Copy',
  'doc.copie': 'Copied',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Preview',
  'projet.code': 'Code',
  'projet.integrer': 'Embed',
  'projet.livre': 'Complete project',
  'projet.retour': 'Templates',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Project not found',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filters',
  'biblio.famille': 'Family',
  'biblio.secteur': 'Industry',
  'biblio.entrees': 'entries',
  'biblio.effacer': 'Clear filters',
  'biblio.vitrines': 'Showcases',
  'biblio.projets': 'Complete projects',
  'biblio.socles': 'Starters',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Language',
  'langue.choisir': 'Choose a language',
  'langue.automatique': 'Machine translation',
}
