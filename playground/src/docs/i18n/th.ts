/**
 * Dictionnaire thai — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'ค้นหาในเอกสาร',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'เปิดเมนูนำทาง',
  'barre.menu.fermer': 'ปิดเมนูนำทาง',
  'barre.navigation': 'การนำทางหลัก',
  'barre.depot': 'ที่เก็บโค้ด',
  'barre.npm': 'แพ็กเกจ npm',
  'barre.theme': 'สลับธีม',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'เอกสาร',
  'nav.composants': 'คอมโพเนนต์',
  'nav.animations': 'แอนิเมชัน',
  'nav.moteur': 'เอนจิน',
  'nav.registre': 'รีจิสทรีคอมโพเนนต์',
  'nav.templates': 'เทมเพลต',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'การนำทางของเอกสาร',
  'colonne.sections': 'หัวข้อ',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'ค้นหาหน้า คอมโพเนนต์ หรือยูทิลิตี...',
  'recherche.etiquette': 'ค้นหา',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'ผลการค้นหา',
  'recherche.vide.titre': 'ไม่พบผลลัพธ์',
  'recherche.vide.texte':
    'ไม่มีอะไรตรงกับการค้นหานี้ ลองใช้ชื่อคอมโพเนนต์ ยูทิลิตี หรือคำสั่ง',
  'recherche.aide.choisir': 'ขึ้น / ลง เพื่อเลือก',
  'recherche.aide.ouvrir': 'Enter เพื่อเปิด',
  'recherche.compte': 'ผลลัพธ์',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'ก่อนหน้า',
  'pagination.suivant': 'ถัดไป',
  'pagination.defiler': 'เลื่อนต่อที่ขอบหน้าเพื่อไปยังหน้าถัดไป',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'เอกสาร',
  'doc.propriete': 'พร็อพเพอร์ตี',
  'doc.type': 'ชนิด',
  'doc.defaut': 'ค่าเริ่มต้น',
  'doc.description': 'คำอธิบาย',
  'doc.apercu': 'ตัวอย่าง',
  'doc.code': 'โค้ด',
  'doc.copier': 'คัดลอก',
  'doc.copie': 'คัดลอกแล้ว',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'ตัวอย่าง',
  'projet.code': 'โค้ด',
  'projet.integrer': 'ฝัง',
  'projet.livre': 'โปรเจกต์สำเร็จรูป',
  'projet.retour': 'เทมเพลต',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'ไม่พบโปรเจกต์',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'ตัวกรอง',
  'biblio.famille': 'ตระกูล',
  'biblio.secteur': 'อุตสาหกรรม',
  'biblio.entrees': 'รายการ',
  'biblio.effacer': 'ล้างตัวกรอง',
  'biblio.vitrines': 'หน้าโชว์เคส',
  'biblio.projets': 'โปรเจกต์สำเร็จรูป',
  'biblio.socles': 'สตาร์ตเตอร์',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'ภาษา',
  'langue.choisir': 'เลือกภาษา',
  'langue.automatique': 'แปลด้วยเครื่อง',
}
