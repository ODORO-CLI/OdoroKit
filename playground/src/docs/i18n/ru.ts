/**
 * Dictionnaire russe — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Поиск по документации',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Открыть навигацию',
  'barre.menu.fermer': 'Закрыть навигацию',
  'barre.navigation': 'Основная навигация',
  'barre.depot': 'Репозиторий',
  'barre.npm': 'Пакет npm',
  'barre.theme': 'Сменить тему',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Документация',
  'nav.composants': 'Компоненты',
  'nav.animations': 'Анимации',
  'nav.moteur': 'Движок',
  'nav.registre': 'Реестр',
  'nav.templates': 'Шаблоны',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Навигация по документации',
  'colonne.sections': 'Разделы',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Найти страницу, компонент, утилиту...',
  'recherche.etiquette': 'Поиск',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Результаты',
  'recherche.vide.titre': 'Ничего не найдено',
  'recherche.vide.texte':
    'По этому запросу ничего нет. Попробуйте название компонента, утилиты или команды.',
  'recherche.aide.choisir': 'Вверх / вниз — выбрать',
  'recherche.aide.ouvrir': 'Enter — открыть',
  'recherche.compte': 'результатов',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Назад',
  'pagination.suivant': 'Далее',
  'pagination.defiler': 'Продолжайте прокручивать у края страницы, чтобы перейти к следующей',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Документация',
  'doc.propriete': 'Свойство',
  'doc.type': 'Тип',
  'doc.defaut': 'По умолчанию',
  'doc.description': 'Описание',
  'doc.apercu': 'Предпросмотр',
  'doc.code': 'Код',
  'doc.copier': 'Копировать',
  'doc.copie': 'Скопировано',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Предпросмотр',
  'projet.code': 'Код',
  'projet.integrer': 'Встроить',
  'projet.livre': 'Готовый проект',
  'projet.retour': 'Шаблоны',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Проект не найден',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Фильтры',
  'biblio.famille': 'Семейство',
  'biblio.secteur': 'Отрасль',
  'biblio.entrees': 'записей',
  'biblio.effacer': 'Сбросить фильтры',
  'biblio.vitrines': 'Витрины',
  'biblio.projets': 'Готовые проекты',
  'biblio.socles': 'Заготовки',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Язык',
  'langue.choisir': 'Выбрать язык',
  'langue.automatique': 'Машинный перевод',
}
