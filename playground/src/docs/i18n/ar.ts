/**
 * Dictionnaire arabe — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 * Langue de droite a gauche : le site pose `dir="rtl"` sur la racine.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'البحث في التوثيق',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'فتح قائمة التنقل',
  'barre.menu.fermer': 'إغلاق قائمة التنقل',
  'barre.navigation': 'التنقل الرئيسي',
  'barre.depot': 'المستودع',
  'barre.npm': 'حزمة npm',
  'barre.theme': 'تبديل المظهر',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'التوثيق',
  'nav.composants': 'المكونات',
  'nav.animations': 'الحركات',
  'nav.moteur': 'محرك البناء',
  'nav.registre': 'سجل المكونات',
  'nav.templates': 'القوالب',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'تنقل التوثيق',
  'colonne.sections': 'الأقسام',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'ابحث عن صفحة أو مكون أو أداة مساعدة...',
  'recherche.etiquette': 'بحث',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'النتائج',
  'recherche.vide.titre': 'لا توجد نتائج',
  'recherche.vide.texte':
    'لا شيء يطابق هذا البحث. جرب اسم مكون أو أداة مساعدة أو أمر.',
  'recherche.aide.choisir': 'أعلى أو أسفل للاختيار',
  'recherche.aide.ouvrir': 'اضغط Enter للفتح',
  'recherche.compte': 'نتائج',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'السابق',
  'pagination.suivant': 'التالي',
  'pagination.defiler': 'واصل التمرير عند حد الصفحة للانتقال إلى الصفحة التالية',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'التوثيق',
  'doc.propriete': 'الخاصية',
  'doc.type': 'النوع',
  'doc.defaut': 'القيمة الافتراضية',
  'doc.description': 'الوصف',
  'doc.apercu': 'معاينة',
  'doc.code': 'الكود',
  'doc.copier': 'نسخ',
  'doc.copie': 'تم النسخ',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'معاينة',
  'projet.code': 'الكود',
  'projet.integrer': 'تضمين',
  'projet.livre': 'مشروع جاهز',
  'projet.retour': 'القوالب',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'المشروع غير موجود',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'الفلاتر',
  'biblio.famille': 'العائلة',
  'biblio.secteur': 'القطاع',
  'biblio.entrees': 'مدخلات',
  'biblio.effacer': 'مسح الفلاتر',
  'biblio.vitrines': 'صفحات العرض',
  'biblio.projets': 'مشاريع جاهزة',
  'biblio.socles': 'قواعد الانطلاق',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'اللغة',
  'langue.choisir': 'اختيار اللغة',
  'langue.automatique': 'ترجمة آلية',
}
