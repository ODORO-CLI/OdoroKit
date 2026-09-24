/**
 * Dictionnaire hindi — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<typeof fr> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'दस्तावेज़ में खोजें',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'नेविगेशन खोलें',
  'barre.menu.fermer': 'नेविगेशन बंद करें',
  'barre.navigation': 'मुख्य नेविगेशन',
  'barre.depot': 'रिपॉज़िटरी',
  'barre.npm': 'npm पैकेज',
  'barre.theme': 'थीम बदलें',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'दस्तावेज़',
  'nav.composants': 'कॉम्पोनेंट',
  'nav.animations': 'एनिमेशन',
  'nav.moteur': 'इंजन',
  'nav.registre': 'रजिस्ट्री',
  'nav.templates': 'टेम्पलेट',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'दस्तावेज़ का नेविगेशन',
  'colonne.sections': 'अनुभाग',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'कोई पेज, कॉम्पोनेंट या यूटिलिटी खोजें...',
  'recherche.etiquette': 'खोजें',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'परिणाम',
  'recherche.vide.titre': 'कोई परिणाम नहीं',
  'recherche.vide.texte':
    'इस खोज से कुछ मेल नहीं खाता। किसी कॉम्पोनेंट, यूटिलिटी या कमांड का नाम आज़माएँ।',
  'recherche.aide.choisir': 'चुनने के लिए ऊपर / नीचे',
  'recherche.aide.ouvrir': 'खोलने के लिए Enter',
  'recherche.compte': 'परिणाम',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'पिछला',
  'pagination.suivant': 'अगला',
  'pagination.defiler': 'अगले पेज पर जाने के लिए पेज के अंत में स्क्रॉल करते रहें',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'दस्तावेज़',
  'doc.propriete': 'प्रॉपर्टी',
  'doc.type': 'टाइप',
  'doc.defaut': 'डिफ़ॉल्ट',
  'doc.description': 'विवरण',
  'doc.apercu': 'प्रीव्यू',
  'doc.code': 'कोड',
  'doc.copier': 'कॉपी करें',
  'doc.copie': 'कॉपी हो गया',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'प्रीव्यू',
  'projet.code': 'कोड',
  'projet.integrer': 'एम्बेड करें',
  'projet.livre': 'पूर्ण प्रोजेक्ट',
  'projet.retour': 'टेम्पलेट',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'प्रोजेक्ट नहीं मिला',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'फ़िल्टर',
  'biblio.famille': 'फ़ैमिली',
  'biblio.secteur': 'क्षेत्र',
  'biblio.entrees': 'प्रविष्टियाँ',
  'biblio.effacer': 'फ़िल्टर हटाएँ',
  'biblio.vitrines': 'शोकेस पेज',
  'biblio.projets': 'पूर्ण प्रोजेक्ट',
  'biblio.socles': 'स्टार्टर',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'भाषा',
  'langue.choisir': 'भाषा चुनें',
  'langue.automatique': 'मशीन अनुवाद',
}
