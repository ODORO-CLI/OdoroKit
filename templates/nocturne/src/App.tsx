import { HomeView } from '@/views/home'

/**
 * La racine de l application.
 *
 * Ce que l autre cadre posait dans son `layout` vit ailleurs : les metadonnees
 * et le verrou de defilement sont dans `index.html`, la police est liee dans la
 * feuille. Il ne reste que la vue.
 */
export function App() {
  return <HomeView />
}
