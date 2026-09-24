/**
 * Dictionnaire swahili — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Tafuta katika nyaraka',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Fungua urambazaji',
  'barre.menu.fermer': 'Funga urambazaji',
  'barre.navigation': 'Urambazaji mkuu',
  'barre.depot': 'Hifadhi ya msimbo',
  'barre.npm': 'Kifurushi cha npm',
  'barre.theme': 'Badilisha mandhari',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Nyaraka',
  'nav.composants': 'Vipengele',
  'nav.animations': 'Uhuishaji',
  'nav.moteur': 'Build engine',
  'nav.registre': 'Component registry',
  'nav.templates': 'Templates',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Urambazaji wa nyaraka',
  'colonne.sections': 'Sehemu',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Tafuta ukurasa, kipengele, zana...',
  'recherche.etiquette': 'Tafuta',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Matokeo',
  'recherche.vide.titre': 'Hakuna matokeo',
  'recherche.vide.texte':
    'Hakuna kinacholingana na utafutaji huu. Jaribu jina la kipengele, la zana au la amri.',
  'recherche.aide.choisir': 'Juu / chini kuchagua',
  'recherche.aide.ouvrir': 'Enter kufungua',
  'recherche.compte': 'matokeo',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Iliyotangulia',
  'pagination.suivant': 'Inayofuata',
  'pagination.defiler': 'Endelea kusogeza mwisho wa ukurasa ili kwenda kwa unaofuata',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Nyaraka',
  'doc.propriete': 'Sifa',
  'doc.type': 'Aina',
  'doc.defaut': 'Chaguomsingi',
  'doc.description': 'Maelezo',
  'doc.apercu': 'Preview',
  'doc.code': 'Msimbo',
  'doc.copier': 'Nakili',
  'doc.copie': 'Imenakiliwa',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Preview',
  'projet.code': 'Msimbo',
  'projet.integrer': 'Embed',
  'projet.livre': 'Delivered project',
  'projet.retour': 'Templates',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Mradi haukupatikana',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Vichujio',
  'biblio.famille': 'Familia',
  'biblio.secteur': 'Sekta',
  'biblio.entrees': 'maingizo',
  'biblio.effacer': 'Ondoa vichujio',
  'biblio.vitrines': 'Showcase landings',
  'biblio.projets': 'Delivered projects',
  'biblio.socles': 'Starters',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Lugha',
  'langue.choisir': 'Chagua lugha',
  'langue.automatique': 'Tafsiri ya kiotomatiki',
}
