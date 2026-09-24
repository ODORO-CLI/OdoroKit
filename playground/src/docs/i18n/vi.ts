/**
 * Dictionnaire vietnamien — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Tìm trong tài liệu',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Mở điều hướng',
  'barre.menu.fermer': 'Đóng điều hướng',
  'barre.navigation': 'Điều hướng chính',
  'barre.depot': 'Kho mã',
  'barre.npm': 'Gói npm',
  'barre.theme': 'Đổi giao diện',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Tài liệu',
  'nav.composants': 'Thành phần',
  'nav.animations': 'Hoạt ảnh',
  'nav.moteur': 'Bộ máy',
  'nav.registre': 'Registry',
  'nav.templates': 'Mẫu',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Điều hướng tài liệu',
  'colonne.sections': 'Mục',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Tìm một trang, một thành phần, một tiện ích...',
  'recherche.etiquette': 'Tìm kiếm',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Kết quả',
  'recherche.vide.titre': 'Không có kết quả',
  'recherche.vide.texte':
    'Không có gì khớp với tìm kiếm này. Hãy thử tên một thành phần, một tiện ích hoặc một lệnh.',
  'recherche.aide.choisir': 'Lên / xuống để chọn',
  'recherche.aide.ouvrir': 'Enter để mở',
  'recherche.compte': 'kết quả',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Trước',
  'pagination.suivant': 'Tiếp',
  'pagination.defiler': 'Tiếp tục cuộn ở cuối trang để sang trang sau',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Tài liệu',
  'doc.propriete': 'Thuộc tính',
  'doc.type': 'Kiểu',
  'doc.defaut': 'Mặc định',
  'doc.description': 'Mô tả',
  'doc.apercu': 'Xem trước',
  'doc.code': 'Mã nguồn',
  'doc.copier': 'Sao chép',
  'doc.copie': 'Đã sao chép',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Xem trước',
  'projet.code': 'Mã nguồn',
  'projet.integrer': 'Nhúng',
  'projet.livre': 'Dự án hoàn chỉnh',
  'projet.retour': 'Mẫu',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Không tìm thấy dự án',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Bộ lọc',
  'biblio.famille': 'Họ',
  'biblio.secteur': 'Lĩnh vực',
  'biblio.entrees': 'mục',
  'biblio.effacer': 'Xóa bộ lọc',
  'biblio.vitrines': 'Trang giới thiệu',
  'biblio.projets': 'Dự án hoàn chỉnh',
  'biblio.socles': 'Bộ khởi tạo',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Ngôn ngữ',
  'langue.choisir': 'Chọn ngôn ngữ',
  'langue.automatique': 'Dịch tự động',
}
