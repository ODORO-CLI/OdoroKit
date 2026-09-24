/**
 * Dictionnaire portugais — traduction automatique.
 *
 * La source est `fr.ts`. Une cle absente ici retombe sur le francais.
 *
 * @module
 */

import type { fr } from './fr.js'

export const dictionnaire: Partial<Record<keyof typeof fr, string>> = {
  /* --- La barre --------------------------------------------------------- */
  'barre.rechercher': 'Pesquisar na documentação',
  'barre.recherche.raccourci': 'Ctrl K',
  'barre.menu.ouvrir': 'Abrir a navegação',
  'barre.menu.fermer': 'Fechar a navegação',
  'barre.navigation': 'Navegação principal',
  'barre.depot': 'Repositório',
  'barre.npm': 'Pacote npm',
  'barre.theme': 'Mudar de tema',

  /* --- Les destinations de premier niveau ------------------------------- */
  'nav.documentation': 'Documentação',
  'nav.composants': 'Componentes',
  'nav.animations': 'Animações',
  'nav.moteur': 'Motor',
  'nav.registre': 'Registro',
  'nav.templates': 'Modelos',

  /* --- La colonne ------------------------------------------------------- */
  'colonne.titre': 'Navegação da documentação',
  'colonne.sections': 'Seções',

  /* --- La recherche ----------------------------------------------------- */
  'recherche.placeholder': 'Pesquisar uma página, um componente, um utilitário...',
  'recherche.etiquette': 'Pesquisar',
  'recherche.echap': 'Esc',
  'recherche.resultats': 'Resultados',
  'recherche.vide.titre': 'Nenhum resultado',
  'recherche.vide.texte':
    'Nada corresponde a esta pesquisa. Tente o nome de um componente, de um utilitário ou de um comando.',
  'recherche.aide.choisir': 'Cima / baixo para escolher',
  'recherche.aide.ouvrir': 'Enter para abrir',
  'recherche.compte': 'resultados',

  /* --- La pagination ---------------------------------------------------- */
  'pagination.precedent': 'Anterior',
  'pagination.suivant': 'Próximo',
  'pagination.defiler': 'Continue a rolar na borda da página para passar para a seguinte',

  /* --- Les blocs de documentation --------------------------------------- */
  'doc.rubrique': 'Documentação',
  'doc.propriete': 'Propriedade',
  'doc.type': 'Tipo',
  'doc.defaut': 'Padrão',
  'doc.description': 'Descrição',
  'doc.apercu': 'Pré-visualização',
  'doc.code': 'Código',
  'doc.copier': 'Copiar',
  'doc.copie': 'Copiado',

  /* --- Un projet livre --------------------------------------------------- */
  'projet.apercu': 'Pré-visualização',
  'projet.code': 'Código',
  'projet.integrer': 'Incorporar',
  'projet.livre': 'Projeto entregue',
  'projet.retour': 'Modelos',
  'projet.archive': 'ZIP',
  'projet.introuvable': 'Projeto não encontrado',

  /* --- La bibliotheque --------------------------------------------------- */
  'biblio.filtres': 'Filtros',
  'biblio.famille': 'Família',
  'biblio.secteur': 'Setor',
  'biblio.entrees': 'entradas',
  'biblio.effacer': 'Limpar os filtros',
  'biblio.vitrines': 'Vitrines',
  'biblio.projets': 'Projetos entregues',
  'biblio.socles': 'Bases',

  /* --- Le selecteur de langue -------------------------------------------- */
  'langue.etiquette': 'Idioma',
  'langue.choisir': 'Escolher um idioma',
  'langue.automatique': 'Tradução automática',
}
