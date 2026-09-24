/**
 * Dictionnaire persan — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 * Langue de droite a gauche : le site pose `dir="rtl"` sur la racine.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'جست‌وجو در مستندات',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'باز کردن ناوبری',
  'barre.menu.fermer': 'بستن ناوبری',
  'barre.navigation': 'ناوبری اصلی',
  'barre.depot': 'مخزن',
  'barre.npm': 'پکیج npm',
  'barre.theme': 'تغییر تم',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'مستندات',
  'nav.composants': 'کامپوننت‌ها',
  'nav.animations': 'انیمیشن‌ها',
  'nav.moteur': 'موتور بیلد',
  'nav.registre': 'رجیستری',
  'nav.templates': 'قالب‌ها',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'ناوبری مستندات',
  'colonne.sections': 'بخش‌ها',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'جست‌وجوی صفحه، کامپوننت یا کلاس کمکی...',
  'recherche.etiquette': 'جست‌وجو',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'نتایج',
  'recherche.vide.titre': 'نتیجه‌ای یافت نشد',
  'recherche.vide.texte':
    'چیزی با این جست‌وجو مطابقت ندارد. نام یک کامپوننت، یک کلاس کمکی یا یک دستور را امتحان کن.',
  'recherche.aide.choisir': 'بالا / پایین برای انتخاب',
  'recherche.aide.ouvrir': 'Enter برای باز کردن',
  'recherche.compte': 'نتیجه',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'قبلی',
  'pagination.suivant': 'بعدی',
  'pagination.defiler': 'برای رفتن به صفحه بعد، در انتهای صفحه به اسکرول ادامه بده',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'مستندات',
  'doc.propriete': 'پراپرتی',
  'doc.type': 'نوع',
  'doc.defaut': 'مقدار پیش‌فرض',
  'doc.description': 'توضیح',
  'doc.apercu': 'پیش‌نمایش',
  'doc.code': 'کد',
  'doc.copier': 'کپی',
  'doc.copie': 'کپی شد',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'پیش‌نمایش',
  'projet.code': 'کد',
  'projet.integrer': 'جاسازی',
  'projet.livre': 'پروژه تحویل‌شده',
  'projet.retour': 'قالب‌ها',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'پروژه یافت نشد',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'فیلترها',
  'biblio.famille': 'خانواده',
  'biblio.secteur': 'حوزه',
  'biblio.entrees': 'مورد',
  'biblio.effacer': 'پاک کردن فیلترها',
  'biblio.vitrines': 'لندینگ‌های نمایشی',
  'biblio.projets': 'پروژه‌های تحویل‌شده',
  'biblio.socles': 'استارترها',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'زبان',
  'langue.choisir': 'انتخاب زبان',
  'langue.automatique': 'ترجمه ماشینی',
}
