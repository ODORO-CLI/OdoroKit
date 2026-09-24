/**
 * Dictionnaire tcheque — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Hledat v dokumentaci',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Otevřít navigaci',
  'barre.menu.fermer': 'Zavřít navigaci',
  'barre.navigation': 'Hlavní navigace',
  'barre.depot': 'Repozitář',
  'barre.npm': 'Balíček npm',
  'barre.theme': 'Změnit téma',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Dokumentace',
  'nav.composants': 'Komponenty',
  'nav.animations': 'Animace',
  'nav.moteur': 'Engine',
  'nav.registre': 'Registr',
  'nav.templates': 'Šablony',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Navigace dokumentace',
  'colonne.sections': 'Sekce',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Hledat stránku, komponentu, utilitu...',
  'recherche.etiquette': 'Hledat',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Výsledky',
  'recherche.vide.titre': 'Žádné výsledky',
  'recherche.vide.texte':
    'Tomuto hledání nic neodpovídá. Zkus název komponenty, utility nebo příkazu.',
  'recherche.aide.choisir': 'Nahoru / dolů pro výběr',
  'recherche.aide.ouvrir': 'Enter pro otevření',
  'recherche.compte': 'výsledků',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Předchozí',
  'pagination.suivant': 'Další',
  'pagination.defiler': 'Pokračuj v posouvání na okraji stránky, abys přešel na další',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Dokumentace',
  'doc.propriete': 'Vlastnost',
  'doc.type': 'Typ',
  'doc.defaut': 'Výchozí',
  'doc.description': 'Popis',
  'doc.apercu': 'Náhled',
  'doc.code': 'Kód',
  'doc.copier': 'Kopírovat',
  'doc.copie': 'Zkopírováno',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Náhled',
  'projet.code': 'Kód',
  'projet.integrer': 'Vložit',
  'projet.livre': 'Hotový projekt',
  'projet.retour': 'Šablony',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Projekt nenalezen',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filtry',
  'biblio.famille': 'Rodina',
  'biblio.secteur': 'Odvětví',
  'biblio.entrees': 'položek',
  'biblio.effacer': 'Vymazat filtry',
  'biblio.vitrines': 'Výlohy',
  'biblio.projets': 'Hotové projekty',
  'biblio.socles': 'Základy',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Jazyk',
  'langue.choisir': 'Vybrat jazyk',
  'langue.automatique': 'Automatický překlad',
}
