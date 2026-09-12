# Une architecture par vitrine

## Le probleme

Mesure faite sur les trente-quatre vitrines : les dix ecrites en dernier
partagent une signature identique — `heros + bandeau defilant + Ouverture x4 +
accordeon de questions + pied`. Les vingt-quatre precedentes se repartissent
huit archetypes, soit trois vitrines par archetype.

Autrement dit : une vitrine sur trois a un jumeau structurel. Le contenu differe,
la palette differe, la scene differe — mais on descend la meme page.

La cause est identifiable et elle est de conception : la trousse `communs.tsx`
fournissait `Ouverture`, `RailChiffres` et `BandeauMentions`, et chaque nouvelle
vitrine les a employes dans le meme ordre. Une trousse de **matiere** est
devenue un gabarit de **structure**.

## La regle

Chaque vitrine recoit un **type de document**, et deux vitrines ne partagent
jamais le meme. Le type de document n est pas une variante de heros : c est la
nature meme de la page — ce qu on y cherche, dans quel ordre, et sous quelle
forme. Une console n a pas de heros ; une carte de restaurant n a pas de
sections numerotees ; un rapport annuel n a pas d appel a l action.

Le type doit decouler du metier. Un operateur de satellites se surveille, donc
console. Un bistrot se lit, donc carte. Une agence d architecture se juge sur
planches, donc planche de concours.

## Ce que la trousse garde, et ce qu elle perd

`communs.tsx` ne fournit plus que de la **matiere** : `nuit()`, `Voile`,
`Filigrane`, les classes de gelule. Ces pieces-la ne dictent aucun ordre.

`Ouverture`, `RailChiffres`, `BandeauMentions` et `BarrePilule` restent
disponibles, mais **aucune vitrine ne doit les employer par defaut**. Une
vitrine qui les prend toutes les quatre est, par construction, le jumeau d une
autre.

## Le standard : une landing page, pas un document

Un premier passage avait pris la regle trop au mot : plusieurs vitrines etaient
devenues de purs documents, sans ouverture, sans actions, sans preuve. Ce n est
pas ce qu on veut. La regle complete est donc :

**Le type de document occupe le milieu de la page. Il ne remplace pas la page.**

Toute vitrine porte, dans cet ordre :

1. une **ouverture qui vend** — scene ou photographie en plein cadre, titre
   anime, deux actions, et quatre chiffres qui engagent la maison ;
2. une **bande de preuve** — chiffres, clients, horaires, avis ;
3. **trois a cinq sections d argument**, dont au moins une portee par l image ;
4. **le mecanisme du metier** — c est la, et seulement la, que le type de
   document s installe : console, carte, agenda, planche, carnet, etal ;
5. une **preuve sociale** ou une **piece de transparence** ;
6. une **offre** chiffree ;
7. une **bande d appel** ;
8. un **pied nourri**.

Ce qui doit varier d une vitrine a l autre : la forme de l ouverture, l animation
du titre, le dispositif de preuve, la forme de l offre, et bien sur le mecanisme.
Ce qui ne varie pas : la presence des huit temps.

### Deux pieges mesures

- **Une seule surface WebGL par page.** L arbitre du moteur refuse la seconde et
  laisse le repli en place — un rectangle noir. Verifier a la capture, pas a
  l oeil.
- **Vingt et un fonds n existent qu au curseur** (`ink`, `metaballs`,
  `magnet-grid`, `torch`, `particle-field`...). Ils sont vides tant que personne
  ne touche la page, donc inutilisables en ouverture. Lire le `lead` de la demo
  avant d en poser un.

## La table

| Vitrine | Metier | Type de document | Etat |
|---|---|---|---|
| `spatial` | Operateur de satellites | **Console de suivi** — barre d etat, rail de selection, pupitre de telemetrie, bande de passages | fait |
| `biotech` | Biotechnologie | **Portail scientifique** — index colle, document long, liste de references numerotees | fait |
| `voyage` | Voyagiste de montagne | **Carnet de route** — itineraire jour par jour, profil de denivele | fait |
| `architecture` | Agence d architecture | **Planche de concours** — planches numerotees, legendes en gouttiere | fait |
| `joaillerie` | Haute joaillerie | **Ecrin** — un ecran par piece, texte minimal, defilement par crans | fait |
| `jeu-video` | Studio de jeu video | **Carnet de developpement** — fil antechronologique, rail d etat colle | fait |
| `energie` | Energie renouvelable | **Rapport annuel** — couverture, sommaire, chapitres numerotes, notes de bas de page | fait |
| `label-musique` | Label et salle | **Affiche de saison** — programme imprime, dates en colonnes | fait |
| `parfum` | Parfumeur | **Notice depliante** — panneaux qui se deplient lateralement | fait |
| `robotique` | Robotique industrielle | **Fiche technique** — tableaux denses, cotes, abaques | fait |
| `bistro` | Bistrot | **La carte** — lignes tarifees, ardoise du jour, heures en tableau | fait |
| `torrefaction` | Torrefacteur | **Gazette** — manchette et colonnes de journal | fait |
| `barbier` | Barbier | **Prise de rendez-vous** — agenda d abord, le reste apres | fait |
| `fleuriste` | Fleuriste | **Etal** — grille dense, rail de facettes, pas de heros | fait |
| `studio-yoga` | Studio de yoga | **Grille horaire** — semaine en tableau, un cours par case | fait |
| `salle-sport` | Salle de sport | **Tableau de performance** — classement, records, progression | fait |
| `clinique` | Clinique | **Parcours de soin** — un pas par ecran, progression explicite | fait |
| `spa` | Spa | **Revue** — magazine, chapeaux, exergues | fait |
| `api-dev` | Outil pour developpeurs | **Documentation** — sommaire lateral, ancres, blocs de code | fait |
| `saas-analytique` | Logiciel d analyse | **Coque applicative** — panneaux, filtres, etat vide | fait |
| `plateforme-ia` | Plateforme d IA | **Comparateur** — la page est un tableau de comparaison | fait |
| `securite` | Cybersecurite | **Bulletin de veille** — fil d incidents par severite | fait |
| `fintech` | Banque | **Releve de compte** — ecritures, soldes, justificatifs | fait |
| `crypto` | Place d echange | **Carnet d ordres** — colonnes vives, profondeur de marche | fait |
| `immobilier` | Immobilier | **Annonces** — fiches et rail de carte | fait |
| `cabinet-conseil` | Cabinet de conseil | **Dossiers** — affaires numerotees, references croisees | fait |
| `festival` | Festival | **Programme** — horaires par scene et par heure | fait |
| `podcast` | Podcast | **Lecteur** — lecture d abord, episodes en liste | fait |
| `conference` | Conference | **Actes** — sessions, salles, intervenants | fait |
| `galerie-art` | Galerie d art | **Accrochage** — mur par mur, cartels | fait |
| `mode` | Pret-a-porter | **Lookbook** — planches pleine page, legendes seules | fait |
| `sneakers` | Sneakers | **Fiche produit** — media colle, caracteristiques qui defilent | fait |
| `hotel` | Hotel | **Registre** — disponibilite par chambre et par nuit | fait |
| `voiture-electrique` | Automobile | **Configurateur** — la page entiere est un configurateur | fait |

## Comment on verifie

Le script `signature.mjs` du scratchpad releve, pour chaque vitrine, la presence
de heros, bandeau defilant, intitules numerotes, accordeon, filtre et pied. Deux
vitrines ne doivent pas rendre la meme ligne. C est une condition necessaire,
pas suffisante — mais elle attrape la recidive, qui est le vrai risque.

## Le niveau marketplace : la reference de chaque vitrine

Depuis septembre 2026, chaque vitrine tient de la charte (`CHARTE.md`) par la
trousse `marche.tsx` : un rideau d ouverture (`Porte`), une voix typographique
chargee par Google Fonts (`usePolices`), une revelation gardee par le rideau
(`Surgit`, `TitreVague`), et le vocabulaire des sections. Le mecanisme du
milieu, lui, n a pas bouge. La table dit de quelle reference chaque ouverture
descend, et avec quelle voix.

| Vitrine | Reference | Voix | Rideau | Ouverture |
|---|---|---|---|---|
| `agence-ia` (neuve) | Sentira | fraunces | compteur | nappe de particules, mot-marque serif de 220 px, bande de logos |
| `studio-creatif` (neuve) | Spector | jakarta | lettres | photo sous grille, capitales condensees dont le premier mot est en accent |
| `photographe` (neuve) | Gallary | affiche | trou | nom en grotesque noire, heure en direct, bande de quatre tirages |
| `designer` (neuve) | Creatie | bricolage | trou | paysage, autocollants inclines, dock de verre |
| `robot-domestique` (neuve) | Nubo | inter | iris | cuisine chaude, gelule flottante, mot en italique |
| `travail-profond` (neuve) | Flowstate | onest | compteur | fluide plein cadre, barre de liste d attente en verre |
| `studio-3d` (neuve) | Auralis | grotesk | zoom | sphere de particules collee, deux mots espaces, actes en verre |
| `bistro` | Salonix | fraunces | trou | salle plein cadre, etat du service en palettes, carte flottante |
| `barbier` | Salonix | jakarta | iris | vapeur, mot-marque en capitales lourdes, soin le plus demande en carte |
| `studio-yoga` | Nubo | inter | compteur | salle vide, gelule flottante, mot en italique, chiffres en verre |
| `fleuriste` | Creatie | bricolage | trou | brassee plein cadre, autocollants, cartes de verre aux coins |
| `torrefaction` | Fuel | affiche | lettres | sechage ambre, mot-marque chrome en bas du cadre, croix aux coins |
| `label-musique` | Fuel / Tenora | affiche | zoom | noeud torique, mot-marque qui remplit la largeur, heure en direct |
| `spatial` | Ascend / New Era | onest | compteur | anneaux orbitaux, gelule flottante, chiffres en verre |
| `biotech` | Vesper | onest | compteur | helice, HUD de tresorerie en verre |
| `energie` | Baseline / Ascend | inter | compteur | parc plein cadre, titre vu a travers la photographie |
| `voyage` | Aerra | inter | compteur | mot-marque en filigrane derriere la crete |
| `architecture` | Forma | manrope | trou (clair) | gouttiere a gouttiere, rangee de trois cartes |
| `jeu-video` | Tenora | grotesk | lettres | grille de points, blocs en escalier, mots en boites blanches |
| `robotique` | Stackside | grotesk | compteur (clair) | trame de demi-teinte, grille 2 x 2 de chiffres en verre |
| `spa` | Altitude | cormorant | iris (clair) | nuit sur le bassin, capsule de demande, chiffres en verre |
| `mode` | Nordframe | affiche | lettres (clair) | bande de tirages, nom qui remplit la page |
| `cabinet-conseil` | Forma | manrope | trou (clair) | papier millimetre, rangee de cartes |
| `joaillerie` | Laocoon | cormorant | iris | premier panneau : cristal, actions et chiffres |
| `parfum` | Flowstate | fraunces | iris | premier volet : chrome liquide, actions et chiffres |
| `salle-sport` | Tenora / Spector | oswald | zoom | son affiche, inchangee |
| `clinique` | Baseline | manrope | iris (clair) | son parcours, inchange |
| `api-dev` | Vesper | onest | compteur | sa documentation, inchangee |
| `saas-analytique` | Rescale | manrope | iris (clair) | son produit d abord, inchange |
| `plateforme-ia` | New Era | inter | compteur | son anneau, inchange |
| `securite` | Vesper / Artefakt | grotesk | lettres | son pupitre, inchange |
| `fintech` | Lumen | inter | compteur (clair) | son releve, inchange |
| `crypto` | Vesper | grotesk | zoom | son carnet d ordres, inchange |
| `immobilier` | Aerra | inter | compteur (clair) | sa couverture, inchangee |
| `festival` | Tenora | grotesk | lettres | son affiche, inchangee |
| `podcast` | Miles | inter | zoom | sa typographie geante, inchangee |
| `conference` | Tenora | grotesk | compteur (clair) | sa billetterie d abord, inchangee |
| `galerie-art` | Gallary | affiche | trou (clair) | son accrochage, inchange |
| `sneakers` | Soda | unbounded | zoom | son compte a rebours, inchange |
| `hotel` | Altitude | cormorant | compteur | son registre, inchange |
| `voiture-electrique` | Lumen / Fuel | inter | compteur | son configurateur, inchange |

## Comment on greffe une vitrine

`refit.py` (scratchpad) fait la greffe en une commande : il entoure la page
d un `Porte`, pose `usePolices` sur la racine, remplace le bloc d ouverture par
un fragment et le pied par un autre, et ajoute l import de la trousse.
`elague-imports.py` retire ensuite ce que `tsc` declare inutilise. Le fragment
d ouverture est ecrit a la main : c est la seule partie qui merite de l etre.

## Un univers par vitrine : `UNIVERS.md` et `scene.tsx`

Le 10 septembre 2026, apres la greffe de la charte, les pages avaient un air
de famille trop marque : meme appel final, meme pied, meme barre de chiffres,
memes grilles de cartes sous le heros. `UNIVERS.md` corrige cela. Il liste ce
qui fait « IA », rationne les formes d appel (A1-A15), de pied (P1-P16) et de
chiffres (C1-C10) a trois vitrines chacune, attribue a chaque page un fond
(statique, photo, CSS, canevas ou WebGL), une signature de mouvement et une
animation de texte du registre, et donne une fiche par vitrine avec sa
structure ecran par ecran.

`scene.tsx` fournit les primitives de mouvement que `marche.tsx` n avait pas :
`Parallaxe`, `ZoomDefile`, `Epingle` (ecran epingle par actes), `Rail` (bande
horizontale), `Bandeau`, `Devoile` (photo qui se decoupe et derive),
`Chapitre` (etiquette collante), `Flotte`, `Nappe`, `Respire`, `Aimant`,
`Eclate` (lettres qui s ecartent) et `PiedColle`. Toutes lisent le defilement
par `useScrollScrub` du moteur et ont un rendu immobile sous mouvement reduit.
