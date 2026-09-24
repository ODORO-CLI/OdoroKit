/**
 * Dictionnaire indonesien — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Cari di dokumentasi',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Buka navigasi',
  'barre.menu.fermer': 'Tutup navigasi',
  'barre.navigation': 'Navigasi utama',
  'barre.depot': 'Repositori',
  'barre.npm': 'Paket npm',
  'barre.theme': 'Ganti tema',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Dokumentasi',
  'nav.composants': 'Komponen',
  'nav.animations': 'Animasi',
  'nav.moteur': 'Mesin',
  'nav.registre': 'Registry',
  'nav.templates': 'Templat',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Navigasi dokumentasi',
  'colonne.sections': 'Bagian',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Cari halaman, komponen, atau utilitas...',
  'recherche.etiquette': 'Cari',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Hasil',
  'recherche.vide.titre': 'Tidak ada hasil',
  'recherche.vide.texte':
    'Tidak ada yang cocok dengan pencarian ini. Coba nama komponen, utilitas, atau perintah.',
  'recherche.aide.choisir': 'Atas / bawah untuk memilih',
  'recherche.aide.ouvrir': 'Enter untuk membuka',
  'recherche.compte': 'hasil',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Sebelumnya',
  'pagination.suivant': 'Berikutnya',
  'pagination.defiler': 'Terus gulir di ujung halaman untuk lanjut ke halaman berikutnya',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Dokumentasi',
  'doc.propriete': 'Properti',
  'doc.type': 'Tipe',
  'doc.defaut': 'Bawaan',
  'doc.description': 'Deskripsi',
  'doc.apercu': 'Pratinjau',
  'doc.code': 'Kode',
  'doc.copier': 'Salin',
  'doc.copie': 'Tersalin',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Pratinjau',
  'projet.code': 'Kode',
  'projet.integrer': 'Sematkan',
  'projet.livre': 'Proyek lengkap',
  'projet.retour': 'Templat',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Proyek tidak ditemukan',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filter',
  'biblio.famille': 'Keluarga',
  'biblio.secteur': 'Sektor',
  'biblio.entrees': 'entri',
  'biblio.effacer': 'Hapus filter',
  'biblio.vitrines': 'Halaman etalase',
  'biblio.projets': 'Proyek lengkap',
  'biblio.socles': 'Starter',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Bahasa',
  'langue.choisir': 'Pilih bahasa',
  'langue.automatique': 'Terjemahan mesin',
}
