/**
 * Dictionnaire coreen — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': '문서 검색',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': '내비게이션 열기',
  'barre.menu.fermer': '내비게이션 닫기',
  'barre.navigation': '주 내비게이션',
  'barre.depot': '저장소',
  'barre.npm': 'npm 패키지',
  'barre.theme': '테마 전환',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': '문서',
  'nav.composants': '컴포넌트',
  'nav.animations': '애니메이션',
  'nav.moteur': '엔진',
  'nav.registre': '레지스트리',
  'nav.templates': '템플릿',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': '문서 내비게이션',
  'colonne.sections': '섹션',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': '페이지, 컴포넌트, 유틸리티 검색...',
  'recherche.etiquette': '검색',
  'recherche.echap': 'Esc',
  'recherche.resultats': '검색 결과',
  'recherche.vide.titre': '결과 없음',
  'recherche.vide.texte':
    '이 검색에 해당하는 항목이 없습니다. 컴포넌트, 유틸리티 또는 명령 이름을 입력해 보세요.',
  'recherche.aide.choisir': '위 / 아래로 선택',
  'recherche.aide.ouvrir': 'Enter로 열기',
  'recherche.compte': '개의 결과',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': '이전',
  'pagination.suivant': '다음',
  'pagination.defiler': '페이지 끝에서 계속 스크롤하면 다음 페이지로 넘어갑니다',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': '문서',
  'doc.propriete': '속성',
  'doc.type': '타입',
  'doc.defaut': '기본값',
  'doc.description': '설명',
  'doc.apercu': '미리보기',
  'doc.code': '코드',
  'doc.copier': '복사',
  'doc.copie': '복사됨',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': '미리보기',
  'projet.code': '코드',
  'projet.integrer': '임베드',
  'projet.livre': '완성 프로젝트',
  'projet.retour': '템플릿',
  'projet.archive': 'ZIP',
  'projet.introuvable': '프로젝트를 찾을 수 없습니다',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': '필터',
  'biblio.famille': '계열',
  'biblio.secteur': '분야',
  'biblio.entrees': '개 항목',
  'biblio.effacer': '필터 지우기',
  'biblio.vitrines': '쇼케이스',
  'biblio.projets': '완성 프로젝트',
  'biblio.socles': '스타터',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': '언어',
  'langue.choisir': '언어 선택',
  'langue.automatique': '기계 번역',
}
