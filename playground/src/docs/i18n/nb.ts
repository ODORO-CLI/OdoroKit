/**
 * Dictionnaire norvegien — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Søk i dokumentasjonen',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Åpne navigasjonen',
  'barre.menu.fermer': 'Lukk navigasjonen',
  'barre.navigation': 'Hovednavigasjon',
  'barre.depot': 'Kodelager',
  'barre.npm': 'npm-pakke',
  'barre.theme': 'Bytt tema',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Dokumentasjon',
  'nav.composants': 'Komponenter',
  'nav.animations': 'Animasjoner',
  'nav.moteur': 'Motor',
  'nav.registre': 'Register',
  'nav.templates': 'Maler',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Navigasjon i dokumentasjonen',
  'colonne.sections': 'Seksjoner',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Søk etter en side, en komponent, et verktøy...',
  'recherche.etiquette': 'Søk',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Resultater',
  'recherche.vide.titre': 'Ingen treff',
  'recherche.vide.texte':
    'Ingenting samsvarer med dette søket. Prøv navnet på en komponent, et verktøy eller en kommando.',
  'recherche.aide.choisir': 'Opp / ned for å velge',
  'recherche.aide.ouvrir': 'Enter for å åpne',
  'recherche.compte': 'resultater',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Forrige',
  'pagination.suivant': 'Neste',
  'pagination.defiler': 'Fortsett å rulle ved kanten av siden for å gå videre til den neste',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Dokumentasjon',
  'doc.propriete': 'Egenskap',
  'doc.type': 'Type',
  'doc.defaut': 'Standard',
  'doc.description': 'Beskrivelse',
  'doc.apercu': 'Forhåndsvisning',
  'doc.code': 'Kode',
  'doc.copier': 'Kopier',
  'doc.copie': 'Kopiert',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Forhåndsvisning',
  'projet.code': 'Kode',
  'projet.integrer': 'Bygg inn',
  'projet.livre': 'Ferdig prosjekt',
  'projet.retour': 'Maler',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Prosjektet ble ikke funnet',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filtre',
  'biblio.famille': 'Familie',
  'biblio.secteur': 'Bransje',
  'biblio.entrees': 'oppføringer',
  'biblio.effacer': 'Tøm filtre',
  'biblio.vitrines': 'Utstillingssider',
  'biblio.projets': 'Ferdige prosjekter',
  'biblio.socles': 'Startpakker',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Språk',
  'langue.choisir': 'Velg et språk',
  'langue.automatique': 'Maskinoversettelse',
}
