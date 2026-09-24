/**
 * Dictionnaire japonais — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'ドキュメントを検索',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'ナビゲーションを開く',
  'barre.menu.fermer': 'ナビゲーションを閉じる',
  'barre.navigation': 'メインナビゲーション',
  'barre.depot': 'リポジトリ',
  'barre.npm': 'npm パッケージ',
  'barre.theme': 'テーマを切り替え',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'ドキュメント',
  'nav.composants': 'コンポーネント',
  'nav.animations': 'アニメーション',
  'nav.moteur': 'エンジン',
  'nav.registre': 'レジストリ',
  'nav.templates': 'テンプレート',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'ドキュメントのナビゲーション',
  'colonne.sections': 'セクション',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'ページ、コンポーネント、ユーティリティを検索...',
  'recherche.etiquette': '検索',
  'recherche.echap': 'Esc',
  'recherche.resultats': '検索結果',
  'recherche.vide.titre': '該当なし',
  'recherche.vide.texte':
    'この検索に一致するものはありません。コンポーネント、ユーティリティ、またはコマンドの名前を試してください。',
  'recherche.aide.choisir': '上下キーで選択',
  'recherche.aide.ouvrir': 'Enter で開く',
  'recherche.compte': '件の結果',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': '前へ',
  'pagination.suivant': '次へ',
  'pagination.defiler': 'ページの端でスクロールを続けると次のページに進みます',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'ドキュメント',
  'doc.propriete': 'プロパティ',
  'doc.type': '型',
  'doc.defaut': '既定値',
  'doc.description': '説明',
  'doc.apercu': 'プレビュー',
  'doc.code': 'コード',
  'doc.copier': 'コピー',
  'doc.copie': 'コピーしました',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'プレビュー',
  'projet.code': 'コード',
  'projet.integrer': '埋め込み',
  'projet.livre': '完成プロジェクト',
  'projet.retour': 'テンプレート',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'プロジェクトが見つかりません',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'フィルター',
  'biblio.famille': 'ファミリー',
  'biblio.secteur': '業種',
  'biblio.entrees': '件',
  'biblio.effacer': 'フィルターをクリア',
  'biblio.vitrines': 'ショーケース',
  'biblio.projets': '完成プロジェクト',
  'biblio.socles': 'スターター',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': '言語',
  'langue.choisir': '言語を選択',
  'langue.automatique': '機械翻訳',
}
