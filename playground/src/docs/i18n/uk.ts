/**
 * Dictionnaire ukrainien — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Пошук у документації',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Відкрити навігацію',
  'barre.menu.fermer': 'Закрити навігацію',
  'barre.navigation': 'Основна навігація',
  'barre.depot': 'Репозиторій',
  'barre.npm': 'Пакет npm',
  'barre.theme': 'Змінити тему',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Документація',
  'nav.composants': 'Компоненти',
  'nav.animations': 'Анімації',
  'nav.moteur': 'Рушій',
  'nav.registre': 'Реєстр',
  'nav.templates': 'Шаблони',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Навігація по документації',
  'colonne.sections': 'Розділи',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Знайти сторінку, компонент, утиліту...',
  'recherche.etiquette': 'Пошук',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Результати',
  'recherche.vide.titre': 'Нічого не знайдено',
  'recherche.vide.texte':
    'За цим запитом нічого немає. Спробуйте назву компонента, утиліти або команди.',
  'recherche.aide.choisir': 'Вгору / вниз — вибрати',
  'recherche.aide.ouvrir': 'Enter — відкрити',
  'recherche.compte': 'результатів',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Назад',
  'pagination.suivant': 'Далі',
  'pagination.defiler': 'Продовжуйте прокручувати біля краю сторінки, щоб перейти до наступної',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Документація',
  'doc.propriete': 'Властивість',
  'doc.type': 'Тип',
  'doc.defaut': 'Типово',
  'doc.description': 'Опис',
  'doc.apercu': 'Попередній перегляд',
  'doc.code': 'Код',
  'doc.copier': 'Копіювати',
  'doc.copie': 'Скопійовано',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Попередній перегляд',
  'projet.code': 'Код',
  'projet.integrer': 'Вбудувати',
  'projet.livre': 'Готовий проєкт',
  'projet.retour': 'Шаблони',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Проєкт не знайдено',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Фільтри',
  'biblio.famille': 'Родина',
  'biblio.secteur': 'Галузь',
  'biblio.entrees': 'записів',
  'biblio.effacer': 'Очистити фільтри',
  'biblio.vitrines': 'Вітрини',
  'biblio.projets': 'Готові проєкти',
  'biblio.socles': 'Заготовки',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Мова',
  'langue.choisir': 'Вибрати мову',
  'langue.automatique': 'Машинний переклад',
}
