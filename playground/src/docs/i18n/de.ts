/**
 * Dictionnaire allemand — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'In der Dokumentation suchen',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Navigation öffnen',
  'barre.menu.fermer': 'Navigation schließen',
  'barre.navigation': 'Hauptnavigation',
  'barre.depot': 'Repository',
  'barre.npm': 'npm-Paket',
  'barre.theme': 'Thema wechseln',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Dokumentation',
  'nav.composants': 'Komponenten',
  'nav.animations': 'Animationen',
  'nav.moteur': 'Engine',
  'nav.registre': 'Registry',
  'nav.templates': 'Templates',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Navigation der Dokumentation',
  'colonne.sections': 'Abschnitte',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Seite, Komponente oder Utility suchen...',
  'recherche.etiquette': 'Suchen',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Ergebnisse',
  'recherche.vide.titre': 'Keine Ergebnisse',
  'recherche.vide.texte':
    'Zu dieser Suche passt nichts. Probiere den Namen einer Komponente, eines Utilitys oder eines Befehls.',
  'recherche.aide.choisir': 'Auf / ab zum Auswählen',
  'recherche.aide.ouvrir': 'Eingabetaste zum Öffnen',
  'recherche.compte': 'Ergebnisse',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Zurück',
  'pagination.suivant': 'Weiter',
  'pagination.defiler': 'Scrolle am Seitenrand weiter, um zur nächsten Seite zu gelangen',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Dokumentation',
  'doc.propriete': 'Eigenschaft',
  'doc.type': 'Typ',
  'doc.defaut': 'Standard',
  'doc.description': 'Beschreibung',
  'doc.apercu': 'Vorschau',
  'doc.code': 'Code',
  'doc.copier': 'Kopieren',
  'doc.copie': 'Kopiert',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Vorschau',
  'projet.code': 'Code',
  'projet.integrer': 'Einbetten',
  'projet.livre': 'Fertiges Projekt',
  'projet.retour': 'Templates',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Projekt nicht gefunden',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filter',
  'biblio.famille': 'Familie',
  'biblio.secteur': 'Branche',
  'biblio.entrees': 'Einträge',
  'biblio.effacer': 'Filter zurücksetzen',
  'biblio.vitrines': 'Schaufenster',
  'biblio.projets': 'Fertige Projekte',
  'biblio.socles': 'Grundgerüste',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Sprache',
  'langue.choisir': 'Sprache wählen',
  'langue.automatique': 'Automatische Übersetzung',
}
