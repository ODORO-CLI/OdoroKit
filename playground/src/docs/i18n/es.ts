/**
 * Dictionnaire espagnol — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Buscar en la documentación',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Abrir la navegación',
  'barre.menu.fermer': 'Cerrar la navegación',
  'barre.navigation': 'Navegación principal',
  'barre.depot': 'Repositorio',
  'barre.npm': 'Paquete npm',
  'barre.theme': 'Cambiar de tema',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Documentación',
  'nav.composants': 'Componentes',
  'nav.animations': 'Animaciones',
  'nav.moteur': 'Motor',
  'nav.registre': 'Registro',
  'nav.templates': 'Plantillas',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Navegación de la documentación',
  'colonne.sections': 'Secciones',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Buscar una página, un componente, una utilidad...',
  'recherche.etiquette': 'Buscar',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Resultados',
  'recherche.vide.titre': 'Sin resultados',
  'recherche.vide.texte':
    'Nada coincide con esta búsqueda. Prueba con el nombre de un componente, de una utilidad o de un comando.',
  'recherche.aide.choisir': 'Arriba / abajo para elegir',
  'recherche.aide.ouvrir': 'Intro para abrir',
  'recherche.compte': 'resultados',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Anterior',
  'pagination.suivant': 'Siguiente',
  'pagination.defiler':
    'Sigue desplazándote al borde de la página para pasar a la siguiente',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Documentación',
  'doc.propriete': 'Propiedad',
  'doc.type': 'Tipo',
  'doc.defaut': 'Por defecto',
  'doc.description': 'Descripción',
  'doc.apercu': 'Vista previa',
  'doc.code': 'Código',
  'doc.copier': 'Copiar',
  'doc.copie': 'Copiado',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Vista previa',
  'projet.code': 'Código',
  'projet.integrer': 'Incrustar',
  'projet.livre': 'Proyecto entregado',
  'projet.retour': 'Plantillas',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Proyecto no encontrado',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filtros',
  'biblio.famille': 'Familia',
  'biblio.secteur': 'Sector',
  'biblio.entrees': 'entradas',
  'biblio.effacer': 'Borrar los filtros',
  'biblio.vitrines': 'Escaparates',
  'biblio.projets': 'Proyectos entregados',
  'biblio.socles': 'Bases',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Idioma',
  'langue.choisir': 'Elegir un idioma',
  'langue.automatique': 'Traducción automática',
}
