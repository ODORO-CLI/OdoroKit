/**
 * Dictionnaire chinois traditionnel — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': '搜尋文件',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': '開啟導覽',
  'barre.menu.fermer': '關閉導覽',
  'barre.navigation': '主導覽',
  'barre.depot': '程式碼儲存庫',
  'barre.npm': 'npm 套件',
  'barre.theme': '切換主題',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': '文件',
  'nav.composants': '元件',
  'nav.animations': '動畫',
  'nav.moteur': '引擎',
  'nav.registre': '元件註冊表',
  'nav.templates': '範本',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': '文件導覽',
  'colonne.sections': '章節',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': '搜尋頁面、元件或工具函式...',
  'recherche.etiquette': '搜尋',
  'recherche.echap': 'Esc',
  'recherche.resultats': '搜尋結果',
  'recherche.vide.titre': '沒有結果',
  'recherche.vide.texte':
    '沒有內容符合這次搜尋。試試元件、工具函式或指令的名稱。',
  'recherche.aide.choisir': '上下鍵選擇',
  'recherche.aide.ouvrir': 'Enter 開啟',
  'recherche.compte': '筆結果',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': '上一頁',
  'pagination.suivant': '下一頁',
  'pagination.defiler': '在頁面邊緣繼續滾動即可前往下一頁',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': '文件',
  'doc.propriete': '屬性',
  'doc.type': '型別',
  'doc.defaut': '預設值',
  'doc.description': '說明',
  'doc.apercu': '預覽',
  'doc.code': '程式碼',
  'doc.copier': '複製',
  'doc.copie': '已複製',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': '預覽',
  'projet.code': '程式碼',
  'projet.integrer': '嵌入',
  'projet.livre': '完整專案',
  'projet.retour': '範本',
  'projet.archive': 'ZIP',
  'projet.introuvable': '找不到該專案',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': '篩選',
  'biblio.famille': '系列',
  'biblio.secteur': '產業',
  'biblio.entrees': '項',
  'biblio.effacer': '清除篩選',
  'biblio.vitrines': '展示頁',
  'biblio.projets': '完整專案',
  'biblio.socles': '腳手架',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': '語言',
  'langue.choisir': '選擇語言',
  'langue.automatique': '機器翻譯',
}
