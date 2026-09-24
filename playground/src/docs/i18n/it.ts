/**
 * Dictionnaire italien — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Cerca nella documentazione',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Apri la navigazione',
  'barre.menu.fermer': 'Chiudi la navigazione',
  'barre.navigation': 'Navigazione principale',
  'barre.depot': 'Repository',
  'barre.npm': 'Pacchetto npm',
  'barre.theme': 'Cambia tema',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Documentazione',
  'nav.composants': 'Componenti',
  'nav.animations': 'Animazioni',
  'nav.moteur': 'Motore',
  'nav.registre': 'Registro',
  'nav.templates': 'Template',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Navigazione della documentazione',
  'colonne.sections': 'Sezioni',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Cerca una pagina, un componente, un’utilità...',
  'recherche.etiquette': 'Cerca',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Risultati',
  'recherche.vide.titre': 'Nessun risultato',
  'recherche.vide.texte':
    'Niente corrisponde a questa ricerca. Prova il nome di un componente, di un’utilità o di un comando.',
  'recherche.aide.choisir': 'Su / giù per scegliere',
  'recherche.aide.ouvrir': 'Invio per aprire',
  'recherche.compte': 'risultati',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Precedente',
  'pagination.suivant': 'Successivo',
  'pagination.defiler':
    'Continua a scorrere al bordo della pagina per passare alla successiva',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Documentazione',
  'doc.propriete': 'Proprietà',
  'doc.type': 'Tipo',
  'doc.defaut': 'Predefinito',
  'doc.description': 'Descrizione',
  'doc.apercu': 'Anteprima',
  'doc.code': 'Codice',
  'doc.copier': 'Copia',
  'doc.copie': 'Copiato',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Anteprima',
  'projet.code': 'Codice',
  'projet.integrer': 'Incorpora',
  'projet.livre': 'Progetto consegnato',
  'projet.retour': 'Template',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Progetto non trovato',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filtri',
  'biblio.famille': 'Famiglia',
  'biblio.secteur': 'Settore',
  'biblio.entrees': 'voci',
  'biblio.effacer': 'Cancella i filtri',
  'biblio.vitrines': 'Vetrine',
  'biblio.projets': 'Progetti consegnati',
  'biblio.socles': 'Basi',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Lingua',
  'langue.choisir': 'Scegli una lingua',
  'langue.automatique': 'Traduzione automatica',
}
