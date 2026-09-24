/**
 * Dictionnaire chinois simplifie — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': '搜索文档',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': '打开导航',
  'barre.menu.fermer': '关闭导航',
  'barre.navigation': '主导航',
  'barre.depot': '代码仓库',
  'barre.npm': 'npm 包',
  'barre.theme': '切换主题',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': '文档',
  'nav.composants': '组件',
  'nav.animations': '动画',
  'nav.moteur': '引擎',
  'nav.registre': '组件注册表',
  'nav.templates': '模板',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': '文档导航',
  'colonne.sections': '章节',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': '搜索页面、组件或工具函数...',
  'recherche.etiquette': '搜索',
  'recherche.echap': 'Esc',
  'recherche.resultats': '搜索结果',
  'recherche.vide.titre': '没有结果',
  'recherche.vide.texte':
    '没有内容匹配这次搜索。试试组件、工具函数或命令的名称。',
  'recherche.aide.choisir': '上下键选择',
  'recherche.aide.ouvrir': '回车打开',
  'recherche.compte': '条结果',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': '上一页',
  'pagination.suivant': '下一页',
  'pagination.defiler': '在页面边缘继续滚动即可进入下一页',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': '文档',
  'doc.propriete': '属性',
  'doc.type': '类型',
  'doc.defaut': '默认值',
  'doc.description': '说明',
  'doc.apercu': '预览',
  'doc.code': '代码',
  'doc.copier': '复制',
  'doc.copie': '已复制',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': '预览',
  'projet.code': '代码',
  'projet.integrer': '嵌入',
  'projet.livre': '完整项目',
  'projet.retour': '模板',
  'projet.archive': 'ZIP',
  'projet.introuvable': '找不到该项目',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': '筛选',
  'biblio.famille': '系列',
  'biblio.secteur': '行业',
  'biblio.entrees': '项',
  'biblio.effacer': '清除筛选',
  'biblio.vitrines': '展示页',
  'biblio.projets': '完整项目',
  'biblio.socles': '脚手架',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': '语言',
  'langue.choisir': '选择语言',
  'langue.automatique': '机器翻译',
}
