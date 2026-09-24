/**
 * Dictionnaire suedois — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Sök i dokumentationen',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Öppna navigeringen',
  'barre.menu.fermer': 'Stäng navigeringen',
  'barre.navigation': 'Huvudnavigering',
  'barre.depot': 'Kodförråd',
  'barre.npm': 'npm-paket',
  'barre.theme': 'Byt tema',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Dokumentation',
  'nav.composants': 'Komponenter',
  'nav.animations': 'Animationer',
  'nav.moteur': 'Motor',
  'nav.registre': 'Register',
  'nav.templates': 'Mallar',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Dokumentationens navigering',
  'colonne.sections': 'Avsnitt',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Sök en sida, en komponent, ett verktyg...',
  'recherche.etiquette': 'Sök',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Resultat',
  'recherche.vide.titre': 'Inga resultat',
  'recherche.vide.texte':
    'Inget matchar den här sökningen. Prova namnet på en komponent, ett verktyg eller ett kommando.',
  'recherche.aide.choisir': 'Upp / ned för att välja',
  'recherche.aide.ouvrir': 'Enter för att öppna',
  'recherche.compte': 'resultat',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Föregående',
  'pagination.suivant': 'Nästa',
  'pagination.defiler': 'Fortsätt skrolla vid sidans kant för att gå till nästa',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Dokumentation',
  'doc.propriete': 'Egenskap',
  'doc.type': 'Typ',
  'doc.defaut': 'Standard',
  'doc.description': 'Beskrivning',
  'doc.apercu': 'Förhandsvisning',
  'doc.code': 'Kod',
  'doc.copier': 'Kopiera',
  'doc.copie': 'Kopierat',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Förhandsvisning',
  'projet.code': 'Kod',
  'projet.integrer': 'Bädda in',
  'projet.livre': 'Levererat projekt',
  'projet.retour': 'Mallar',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Projektet hittades inte',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filter',
  'biblio.famille': 'Familj',
  'biblio.secteur': 'Bransch',
  'biblio.entrees': 'poster',
  'biblio.effacer': 'Rensa filtren',
  'biblio.vitrines': 'Skyltfönster',
  'biblio.projets': 'Levererade projekt',
  'biblio.socles': 'Grunder',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Språk',
  'langue.choisir': 'Välj ett språk',
  'langue.automatique': 'Automatisk översättning',
}
