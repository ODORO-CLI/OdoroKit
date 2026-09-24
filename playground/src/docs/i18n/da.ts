/**
 * Dictionnaire danois — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Søg i dokumentationen',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Åbn navigationen',
  'barre.menu.fermer': 'Luk navigationen',
  'barre.navigation': 'Hovednavigation',
  'barre.depot': 'Kodelager',
  'barre.npm': 'npm-pakke',
  'barre.theme': 'Skift tema',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Dokumentation',
  'nav.composants': 'Komponenter',
  'nav.animations': 'Animationer',
  'nav.moteur': 'Motor',
  'nav.registre': 'Register',
  'nav.templates': 'Skabeloner',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Navigation i dokumentationen',
  'colonne.sections': 'Sektioner',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Søg efter en side, en komponent, et værktøj...',
  'recherche.etiquette': 'Søg',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Resultater',
  'recherche.vide.titre': 'Ingen resultater',
  'recherche.vide.texte':
    'Intet matcher denne søgning. Prøv navnet på en komponent, et værktøj eller en kommando.',
  'recherche.aide.choisir': 'Op / ned for at vælge',
  'recherche.aide.ouvrir': 'Enter for at åbne',
  'recherche.compte': 'resultater',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Forrige',
  'pagination.suivant': 'Næste',
  'pagination.defiler': 'Bliv ved med at rulle ved sidens kant for at gå videre til den næste',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Dokumentation',
  'doc.propriete': 'Egenskab',
  'doc.type': 'Type',
  'doc.defaut': 'Standard',
  'doc.description': 'Beskrivelse',
  'doc.apercu': 'Forhåndsvisning',
  'doc.code': 'Kode',
  'doc.copier': 'Kopiér',
  'doc.copie': 'Kopieret',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Forhåndsvisning',
  'projet.code': 'Kode',
  'projet.integrer': 'Indlejr',
  'projet.livre': 'Færdigt projekt',
  'projet.retour': 'Skabeloner',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Projektet blev ikke fundet',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filtre',
  'biblio.famille': 'Familie',
  'biblio.secteur': 'Branche',
  'biblio.entrees': 'poster',
  'biblio.effacer': 'Ryd filtre',
  'biblio.vitrines': 'Udstillingssider',
  'biblio.projets': 'Færdige projekter',
  'biblio.socles': 'Startpakker',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Sprog',
  'langue.choisir': 'Vælg et sprog',
  'langue.automatique': 'Maskinoversættelse',
}
