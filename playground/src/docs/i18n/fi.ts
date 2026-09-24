/**
 * Dictionnaire finnois — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Hae dokumentaatiosta',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Avaa navigointi',
  'barre.menu.fermer': 'Sulje navigointi',
  'barre.navigation': 'Päänavigointi',
  'barre.depot': 'Koodivarasto',
  'barre.npm': 'npm-paketti',
  'barre.theme': 'Vaihda teemaa',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Dokumentaatio',
  'nav.composants': 'Komponentit',
  'nav.animations': 'Animaatiot',
  'nav.moteur': 'Moottori',
  'nav.registre': 'Rekisteri',
  'nav.templates': 'Mallipohjat',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Dokumentaation navigointi',
  'colonne.sections': 'Osiot',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Hae sivua, komponenttia tai apuvälinettä...',
  'recherche.etiquette': 'Haku',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Tulokset',
  'recherche.vide.titre': 'Ei tuloksia',
  'recherche.vide.texte':
    'Mikään ei vastaa tätä hakua. Kokeile komponentin, apuvälineen tai komennon nimeä.',
  'recherche.aide.choisir': 'Ylös / alas valitsee',
  'recherche.aide.ouvrir': 'Enter avaa',
  'recherche.compte': 'tulosta',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Edellinen',
  'pagination.suivant': 'Seuraava',
  'pagination.defiler': 'Jatka vierittämistä sivun reunassa siirtyäksesi seuraavalle sivulle',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Dokumentaatio',
  'doc.propriete': 'Ominaisuus',
  'doc.type': 'Tyyppi',
  'doc.defaut': 'Oletus',
  'doc.description': 'Kuvaus',
  'doc.apercu': 'Esikatselu',
  'doc.code': 'Koodi',
  'doc.copier': 'Kopioi',
  'doc.copie': 'Kopioitu',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Esikatselu',
  'projet.code': 'Koodi',
  'projet.integrer': 'Upota',
  'projet.livre': 'Valmis projekti',
  'projet.retour': 'Mallipohjat',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Projektia ei löytynyt',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Suodattimet',
  'biblio.famille': 'Perhe',
  'biblio.secteur': 'Toimiala',
  'biblio.entrees': 'kohdetta',
  'biblio.effacer': 'Tyhjennä suodattimet',
  'biblio.vitrines': 'Esittelysivut',
  'biblio.projets': 'Valmiit projektit',
  'biblio.socles': 'Aloituspohjat',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Kieli',
  'langue.choisir': 'Valitse kieli',
  'langue.automatique': 'Konekäännös',
}
