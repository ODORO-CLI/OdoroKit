/**
 * Dictionnaire polonais — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Szukaj w dokumentacji',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Otwórz nawigację',
  'barre.menu.fermer': 'Zamknij nawigację',
  'barre.navigation': 'Nawigacja główna',
  'barre.depot': 'Repozytorium',
  'barre.npm': 'Pakiet npm',
  'barre.theme': 'Zmień motyw',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Dokumentacja',
  'nav.composants': 'Komponenty',
  'nav.animations': 'Animacje',
  'nav.moteur': 'Silnik',
  'nav.registre': 'Rejestr',
  'nav.templates': 'Szablony',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Nawigacja dokumentacji',
  'colonne.sections': 'Sekcje',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Szukaj strony, komponentu, narzędzia...',
  'recherche.etiquette': 'Szukaj',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Wyniki',
  'recherche.vide.titre': 'Brak wyników',
  'recherche.vide.texte':
    'Nic nie odpowiada temu zapytaniu. Spróbuj nazwy komponentu, narzędzia lub polecenia.',
  'recherche.aide.choisir': 'Góra / dół, aby wybrać',
  'recherche.aide.ouvrir': 'Enter, aby otworzyć',
  'recherche.compte': 'wyników',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Poprzednia',
  'pagination.suivant': 'Następna',
  'pagination.defiler': 'Przewijaj dalej na krawędzi strony, aby przejść do następnej',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Dokumentacja',
  'doc.propriete': 'Właściwość',
  'doc.type': 'Typ',
  'doc.defaut': 'Domyślnie',
  'doc.description': 'Opis',
  'doc.apercu': 'Podgląd',
  'doc.code': 'Kod',
  'doc.copier': 'Kopiuj',
  'doc.copie': 'Skopiowano',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Podgląd',
  'projet.code': 'Kod',
  'projet.integrer': 'Osadź',
  'projet.livre': 'Gotowy projekt',
  'projet.retour': 'Szablony',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Projekt nie znaleziony',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filtry',
  'biblio.famille': 'Rodzina',
  'biblio.secteur': 'Branża',
  'biblio.entrees': 'pozycji',
  'biblio.effacer': 'Wyczyść filtry',
  'biblio.vitrines': 'Witryny',
  'biblio.projets': 'Gotowe projekty',
  'biblio.socles': 'Szkielety',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Język',
  'langue.choisir': 'Wybierz język',
  'langue.automatique': 'Tłumaczenie automatyczne',
}
