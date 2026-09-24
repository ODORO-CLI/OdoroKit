/**
 * Dictionnaire hongrois — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * Les valeurs de `fr` sont litterales (`as const`) : le type ne reprend donc
 * que ses cles, et laisse la prose libre.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- A fejlec ---------------------------------------------------------- */
  'barre.rechercher': 'Keresés a dokumentációban',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Navigáció megnyitása',
  'barre.menu.fermer': 'Navigáció bezárása',
  'barre.navigation': 'Fő navigáció',
  'barre.depot': 'Tárház',
  'barre.npm': 'npm csomag',
  'barre.theme': 'Téma váltása',

  /* --- Felso szintu celok ------------------------------------------------ */
  'nav.documentation': 'Dokumentáció',
  'nav.composants': 'Komponensek',
  'nav.animations': 'Animációk',
  'nav.moteur': 'Build motor',
  'nav.registre': 'Registry',
  'nav.templates': 'Sablonok',

  /* --- Az oldalsav ------------------------------------------------------- */
  'colonne.titre': 'A dokumentáció navigációja',
  'colonne.sections': 'Szakaszok',

  /* --- A kereso ---------------------------------------------------------- */
  'recherche.placeholder': 'Oldal, komponens vagy segédosztály keresése...',
  'recherche.etiquette': 'Keresés',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Találatok',
  'recherche.vide.titre': 'Nincs találat',
  'recherche.vide.texte':
    'Erre a keresésre semmi sem illeszkedik. Próbáld meg egy komponens, egy segédosztály vagy egy parancs nevét.',
  'recherche.aide.choisir': 'Fel / le a választáshoz',
  'recherche.aide.ouvrir': 'Enter a megnyitáshoz',
  'recherche.compte': 'találat',

  /* --- A lapozas --------------------------------------------------------- */
  'pagination.precedent': 'Előző',
  'pagination.suivant': 'Következő',
  'pagination.defiler': 'Görgess tovább az oldal alján a következő oldalra lépéshez',

  /* --- Dokumentacios blokkok --------------------------------------------- */
  'doc.rubrique': 'Dokumentáció',
  'doc.propriete': 'Tulajdonság',
  'doc.type': 'Típus',
  'doc.defaut': 'Alapérték',
  'doc.description': 'Leírás',
  'doc.apercu': 'Előnézet',
  'doc.code': 'Kód',
  'doc.copier': 'Másolás',
  'doc.copie': 'Másolva',

  /* --- Egy atadott projekt ----------------------------------------------- */
  'projet.apercu': 'Előnézet',
  'projet.code': 'Kód',
  'projet.integrer': 'Beágyazás',
  'projet.livre': 'Kész projekt',
  'projet.retour': 'Sablonok',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'A projekt nem található',

  /* --- A konyvtar -------------------------------------------------------- */
  'biblio.filtres': 'Szűrők',
  'biblio.famille': 'Család',
  'biblio.secteur': 'Ágazat',
  'biblio.entrees': 'bejegyzés',
  'biblio.effacer': 'Szűrők törlése',
  'biblio.vitrines': 'Bemutatóoldalak',
  'biblio.projets': 'Kész projektek',
  'biblio.socles': 'Starterek',

  /* --- A nyelvvalaszto --------------------------------------------------- */
  'langue.etiquette': 'Nyelv',
  'langue.choisir': 'Nyelv választása',
  'langue.automatique': 'Gépi fordítás',
}
