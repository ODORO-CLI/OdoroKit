/**
 * Dictionnaire grec — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Αναζήτηση στην τεκμηρίωση',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Άνοιγμα πλοήγησης',
  'barre.menu.fermer': 'Κλείσιμο πλοήγησης',
  'barre.navigation': 'Κύρια πλοήγηση',
  'barre.depot': 'Αποθετήριο',
  'barre.npm': 'Πακέτο npm',
  'barre.theme': 'Αλλαγή θέματος',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Τεκμηρίωση',
  'nav.composants': 'Στοιχεία',
  'nav.animations': 'Κινήσεις',
  'nav.moteur': 'Μηχανή',
  'nav.registre': 'Μητρώο',
  'nav.templates': 'Πρότυπα',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Πλοήγηση στην τεκμηρίωση',
  'colonne.sections': 'Ενότητες',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Αναζητήστε μια σελίδα, ένα στοιχείο, ένα βοηθητικό εργαλείο...',
  'recherche.etiquette': 'Αναζήτηση',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Αποτελέσματα',
  'recherche.vide.titre': 'Κανένα αποτέλεσμα',
  'recherche.vide.texte':
    'Τίποτα δεν ταιριάζει με αυτήν την αναζήτηση. Δοκιμάστε το όνομα ενός στοιχείου, ενός βοηθητικού εργαλείου ή μιας εντολής.',
  'recherche.aide.choisir': 'Πάνω / κάτω για επιλογή',
  'recherche.aide.ouvrir': 'Enter για άνοιγμα',
  'recherche.compte': 'αποτελέσματα',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Προηγούμενο',
  'pagination.suivant': 'Επόμενο',
  'pagination.defiler':
    'Συνεχίστε να κυλάτε στην άκρη της σελίδας για να περάσετε στην επόμενη',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Τεκμηρίωση',
  'doc.propriete': 'Ιδιότητα',
  'doc.type': 'Τύπος',
  'doc.defaut': 'Προεπιλογή',
  'doc.description': 'Περιγραφή',
  'doc.apercu': 'Προεπισκόπηση',
  'doc.code': 'Κώδικας',
  'doc.copier': 'Αντιγραφή',
  'doc.copie': 'Αντιγράφηκε',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Προεπισκόπηση',
  'projet.code': 'Κώδικας',
  'projet.integrer': 'Ενσωμάτωση',
  'projet.livre': 'Ολοκληρωμένο έργο',
  'projet.retour': 'Πρότυπα',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Το έργο δεν βρέθηκε',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Φίλτρα',
  'biblio.famille': 'Οικογένεια',
  'biblio.secteur': 'Κλάδος',
  'biblio.entrees': 'εγγραφές',
  'biblio.effacer': 'Καθαρισμός φίλτρων',
  'biblio.vitrines': 'Βιτρίνες',
  'biblio.projets': 'Ολοκληρωμένα έργα',
  'biblio.socles': 'Βάσεις εκκίνησης',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Γλώσσα',
  'langue.choisir': 'Επιλέξτε γλώσσα',
  'langue.automatique': 'Αυτόματη μετάφραση',
}
