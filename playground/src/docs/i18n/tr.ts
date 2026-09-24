/**
 * Dictionnaire turc — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Dokümantasyonda ara',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Gezinmeyi aç',
  'barre.menu.fermer': 'Gezinmeyi kapat',
  'barre.navigation': 'Ana gezinme',
  'barre.depot': 'Depo',
  'barre.npm': 'npm paketi',
  'barre.theme': 'Temayı değiştir',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Dokümantasyon',
  'nav.composants': 'Bileşenler',
  'nav.animations': 'Animasyonlar',
  'nav.moteur': 'Build motoru',
  'nav.registre': 'Registry',
  'nav.templates': 'Şablonlar',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Dokümantasyon gezinmesi',
  'colonne.sections': 'Bölümler',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Sayfa, bileşen veya yardımcı sınıf ara...',
  'recherche.etiquette': 'Ara',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Sonuçlar',
  'recherche.vide.titre': 'Sonuç bulunamadı',
  'recherche.vide.texte':
    'Bu aramaya uyan bir şey yok. Bir bileşen, yardımcı sınıf veya komut adı deneyin.',
  'recherche.aide.choisir': 'Seçmek için yukarı / aşağı',
  'recherche.aide.ouvrir': 'Açmak için Enter',
  'recherche.compte': 'sonuç',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Önceki',
  'pagination.suivant': 'Sonraki',
  'pagination.defiler': 'Sonraki sayfaya geçmek için sayfanın sonunda kaydırmaya devam edin',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Dokümantasyon',
  'doc.propriete': 'Özellik',
  'doc.type': 'Tür',
  'doc.defaut': 'Varsayılan',
  'doc.description': 'Açıklama',
  'doc.apercu': 'Önizleme',
  'doc.code': 'Kod',
  'doc.copier': 'Kopyala',
  'doc.copie': 'Kopyalandı',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Önizleme',
  'projet.code': 'Kod',
  'projet.integrer': 'Göm',
  'projet.livre': 'Teslim edilen proje',
  'projet.retour': 'Şablonlar',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Proje bulunamadı',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filtreler',
  'biblio.famille': 'Aile',
  'biblio.secteur': 'Sektör',
  'biblio.entrees': 'kayıt',
  'biblio.effacer': 'Filtreleri temizle',
  'biblio.vitrines': 'Vitrinler',
  'biblio.projets': 'Teslim edilen projeler',
  'biblio.socles': 'Başlangıç kitleri',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Dil',
  'langue.choisir': 'Bir dil seçin',
  'langue.automatique': 'Makine çevirisi',
}
