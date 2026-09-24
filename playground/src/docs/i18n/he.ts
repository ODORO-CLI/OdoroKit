/**
 * Dictionnaire hebreu — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 * Langue de droite a gauche : le site pose `dir="rtl"` sur la racine.
 *
 * Les valeurs de `fr` sont litterales (`as const`) : le type ne reprend donc
 * que ses cles, et laisse la prose libre.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'חיפוש בתיעוד',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'פתיחת הניווט',
  'barre.menu.fermer': 'סגירת הניווט',
  'barre.navigation': 'ניווט ראשי',
  'barre.depot': 'מאגר הקוד',
  'barre.npm': 'חבילת npm',
  'barre.theme': 'החלפת ערכת נושא',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'תיעוד',
  'nav.composants': 'קומפוננטות',
  'nav.animations': 'אנימציות',
  'nav.moteur': 'מנוע בנייה',
  'nav.registre': 'רג׳יסטרי קומפוננטות',
  'nav.templates': 'תבניות',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'ניווט בתיעוד',
  'colonne.sections': 'מקטעים',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'חיפוש עמוד, קומפוננטה, יוטיליטי...',
  'recherche.etiquette': 'חיפוש',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'תוצאות',
  'recherche.vide.titre': 'אין תוצאות',
  'recherche.vide.texte':
    'שום דבר לא תואם את החיפוש הזה. נסה שם של קומפוננטה, יוטיליטי או פקודה.',
  'recherche.aide.choisir': 'מעלה / מטה לבחירה',
  'recherche.aide.ouvrir': 'Enter לפתיחה',
  'recherche.compte': 'תוצאות',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'הקודם',
  'pagination.suivant': 'הבא',
  'pagination.defiler': 'המשך לגלול בקצה העמוד כדי לעבור לעמוד הבא',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'תיעוד',
  'doc.propriete': 'מאפיין',
  'doc.type': 'טיפוס',
  'doc.defaut': 'ברירת מחדל',
  'doc.description': 'תיאור',
  'doc.apercu': 'תצוגה מקדימה',
  'doc.code': 'קוד',
  'doc.copier': 'העתקה',
  'doc.copie': 'הועתק',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'תצוגה מקדימה',
  'projet.code': 'קוד',
  'projet.integrer': 'הטמעה',
  'projet.livre': 'פרויקט מלא',
  'projet.retour': 'תבניות',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'הפרויקט לא נמצא',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'מסננים',
  'biblio.famille': 'משפחה',
  'biblio.secteur': 'תחום',
  'biblio.entrees': 'רשומות',
  'biblio.effacer': 'ניקוי המסננים',
  'biblio.vitrines': 'דפי נחיתה לדוגמה',
  'biblio.projets': 'פרויקטים מלאים',
  'biblio.socles': 'סטארטרים',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'שפה',
  'langue.choisir': 'בחירת שפה',
  'langue.automatique': 'תרגום אוטומטי',
}
