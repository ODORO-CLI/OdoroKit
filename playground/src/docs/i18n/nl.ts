/**
 * Dictionnaire neerlandais — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Zoeken in de documentatie',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Navigatie openen',
  'barre.menu.fermer': 'Navigatie sluiten',
  'barre.navigation': 'Hoofdnavigatie',
  'barre.depot': 'Repository',
  'barre.npm': 'npm-pakket',
  'barre.theme': 'Thema wijzigen',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Documentatie',
  'nav.composants': 'Componenten',
  'nav.animations': 'Animaties',
  'nav.moteur': 'Engine',
  'nav.registre': 'Register',
  'nav.templates': 'Templates',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Navigatie van de documentatie',
  'colonne.sections': 'Secties',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Zoek een pagina, een component, een hulpprogramma...',
  'recherche.etiquette': 'Zoeken',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Resultaten',
  'recherche.vide.titre': 'Geen resultaten',
  'recherche.vide.texte':
    'Niets komt overeen met deze zoekopdracht. Probeer de naam van een component, van een hulpprogramma of van een opdracht.',
  'recherche.aide.choisir': 'Omhoog / omlaag om te kiezen',
  'recherche.aide.ouvrir': 'Enter om te openen',
  'recherche.compte': 'resultaten',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Vorige',
  'pagination.suivant': 'Volgende',
  'pagination.defiler':
    'Blijf scrollen aan de rand van de pagina om naar de volgende te gaan',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Documentatie',
  'doc.propriete': 'Eigenschap',
  'doc.type': 'Type',
  'doc.defaut': 'Standaard',
  'doc.description': 'Beschrijving',
  'doc.apercu': 'Voorbeeld',
  'doc.code': 'Code',
  'doc.copier': 'Kopiëren',
  'doc.copie': 'Gekopieerd',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Voorbeeld',
  'projet.code': 'Code',
  'projet.integrer': 'Insluiten',
  'projet.livre': 'Opgeleverd project',
  'projet.retour': 'Templates',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Project niet gevonden',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filters',
  'biblio.famille': 'Familie',
  'biblio.secteur': 'Sector',
  'biblio.entrees': 'items',
  'biblio.effacer': 'Filters wissen',
  'biblio.vitrines': 'Etalages',
  'biblio.projets': 'Opgeleverde projecten',
  'biblio.socles': 'Startpunten',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Taal',
  'langue.choisir': 'Een taal kiezen',
  'langue.automatique': 'Automatische vertaling',
}
