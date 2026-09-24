/**
 * Dictionnaire bengali — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'ডকুমেন্টেশনে সার্চ করুন',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'নেভিগেশন খুলুন',
  'barre.menu.fermer': 'নেভিগেশন বন্ধ করুন',
  'barre.navigation': 'প্রধান নেভিগেশন',
  'barre.depot': 'রিপোজিটরি',
  'barre.npm': 'npm প্যাকেজ',
  'barre.theme': 'থিম বদলান',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'ডকুমেন্টেশন',
  'nav.composants': 'কম্পোনেন্ট',
  'nav.animations': 'অ্যানিমেশন',
  'nav.moteur': 'বিল্ড ইঞ্জিন',
  'nav.registre': 'কম্পোনেন্ট রেজিস্ট্রি',
  'nav.templates': 'টেমপ্লেট',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'ডকুমেন্টেশন নেভিগেশন',
  'colonne.sections': 'সেকশন',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'পেজ, কম্পোনেন্ট বা ইউটিলিটি সার্চ করুন...',
  'recherche.etiquette': 'সার্চ',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'ফলাফল',
  'recherche.vide.titre': 'কোনো ফলাফল নেই',
  'recherche.vide.texte':
    'এই সার্চের সঙ্গে কিছু মেলেনি। কোনো কম্পোনেন্ট, ইউটিলিটি বা কমান্ডের নাম দিয়ে চেষ্টা করুন।',
  'recherche.aide.choisir': 'বাছতে উপর / নিচ',
  'recherche.aide.ouvrir': 'খুলতে Enter',
  'recherche.compte': 'ফলাফল',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'পূর্ববর্তী',
  'pagination.suivant': 'পরবর্তী',
  'pagination.defiler': 'পরের পেজে যেতে পেজের শেষ প্রান্তে স্ক্রল করে যান',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'ডকুমেন্টেশন',
  'doc.propriete': 'প্রপার্টি',
  'doc.type': 'টাইপ',
  'doc.defaut': 'ডিফল্ট',
  'doc.description': 'বিবরণ',
  'doc.apercu': 'প্রিভিউ',
  'doc.code': 'কোড',
  'doc.copier': 'কপি করুন',
  'doc.copie': 'কপি হয়েছে',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'প্রিভিউ',
  'projet.code': 'কোড',
  'projet.integrer': 'এমবেড',
  'projet.livre': 'ডেলিভারড প্রজেক্ট',
  'projet.retour': 'টেমপ্লেট',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'প্রজেক্ট পাওয়া যায়নি',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'ফিল্টার',
  'biblio.famille': 'ফ্যামিলি',
  'biblio.secteur': 'সেক্টর',
  'biblio.entrees': 'এন্ট্রি',
  'biblio.effacer': 'ফিল্টার মুছুন',
  'biblio.vitrines': 'শোকেস ল্যান্ডিং',
  'biblio.projets': 'ডেলিভারড প্রজেক্ট',
  'biblio.socles': 'স্টার্টার',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'ভাষা',
  'langue.choisir': 'একটি ভাষা বাছুন',
  'langue.automatique': 'স্বয়ংক্রিয় অনুবাদ',
}
