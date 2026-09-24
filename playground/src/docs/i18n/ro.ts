/**
 * Dictionnaire roumain — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Caută în documentație',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Deschide navigarea',
  'barre.menu.fermer': 'Închide navigarea',
  'barre.navigation': 'Navigare principală',
  'barre.depot': 'Depozit',
  'barre.npm': 'Pachet npm',
  'barre.theme': 'Schimbă tema',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Documentație',
  'nav.composants': 'Componente',
  'nav.animations': 'Animații',
  'nav.moteur': 'Motor',
  'nav.registre': 'Registru',
  'nav.templates': 'Șabloane',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Navigarea documentației',
  'colonne.sections': 'Secțiuni',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Caută o pagină, o componentă, un utilitar...',
  'recherche.etiquette': 'Caută',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Rezultate',
  'recherche.vide.titre': 'Niciun rezultat',
  'recherche.vide.texte':
    'Nimic nu corespunde acestei căutări. Încearcă numele unei componente, al unui utilitar sau al unei comenzi.',
  'recherche.aide.choisir': 'Sus / jos pentru a alege',
  'recherche.aide.ouvrir': 'Enter pentru a deschide',
  'recherche.compte': 'rezultate',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Anterior',
  'pagination.suivant': 'Următor',
  'pagination.defiler': 'Continuă să derulezi la marginea paginii pentru a trece la următoarea',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Documentație',
  'doc.propriete': 'Proprietate',
  'doc.type': 'Tip',
  'doc.defaut': 'Implicit',
  'doc.description': 'Descriere',
  'doc.apercu': 'Previzualizare',
  'doc.code': 'Cod',
  'doc.copier': 'Copiază',
  'doc.copie': 'Copiat',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Previzualizare',
  'projet.code': 'Cod',
  'projet.integrer': 'Încorporează',
  'projet.livre': 'Proiect finalizat',
  'projet.retour': 'Șabloane',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Proiectul nu a fost găsit',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filtre',
  'biblio.famille': 'Familie',
  'biblio.secteur': 'Domeniu',
  'biblio.entrees': 'intrări',
  'biblio.effacer': 'Șterge filtrele',
  'biblio.vitrines': 'Vitrine',
  'biblio.projets': 'Proiecte finalizate',
  'biblio.socles': 'Baze de pornire',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Limbă',
  'langue.choisir': 'Alege o limbă',
  'langue.automatique': 'Traducere automată',
}
