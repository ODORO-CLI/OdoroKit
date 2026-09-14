# La charte des vitrines — le niveau « marketplace »

Reference : douze templates du marketplace Framer (Sentira, Tenora, Spector,
Gallary, Creatie, Fuel, Nubo, Salonix, Miles, Portfolite, Nordframe, Rescale)
et treize layers GetLayers (Vesper, Soda, Baseline, Laocoon, New Era, Auralis,
Aerra, Altitude, Forma, Lumen, Flowstate, Stackside, Ascend), captures page
entiere et fiches techniques dans le scratchpad `refs/`.

Ce qu ils ont en commun tient en dix regles. Une vitrine qui en manque une
n est pas au niveau.

## 1. Le fond : noir profond ou blanc franc, jamais un gris moyen

- Sombre : `#060606` a `#0a0a0a` (`nuit()` en zinc ou neutral). Onze des
  vingt-cinq references ouvrent sur ce noir.
- Clair : blanc pur, ou une creme chaude (`#f6efe5` Salonix, `#f9fafb` Rescale).
- Au plus **deux tons par page** : une ouverture sombre sur un corps clair, ou
  l inverse. Le passage de l un a l autre est une coupe nette, pas un degrade.

## 2. Le titre est l objet de la page

- **Le mot-marque ou l accroche fait 96 a 180 px** sur grand ecran (Sentira
  170, Miles 206, Gallary 260, Nubo 110, Salonix 95, Rescale 80). En dessous de
  72 px, ce n est pas une ouverture marketplace.
- Interlettrage **serre** : `-0.03em` a `-0.06em`. Tenora et Fuel vont a -0.08.
- Graisse **extreme** : 300 (Sentira, Miles, Vesper, Lumen) ou 800+ (Gallary,
  Spector, Fuel, Creatie). Jamais 500-600 en ouverture — c est la graisse du
  corps de texte, elle ne porte pas une page.
- **Un mot d accent** au plus : italique serif (Nubo « quieter », Stackside
  « foresight »), ou dans une gelule bordee (Rescale « Smart AI »), ou en
  couleur (Ascend « Harder »).
- La **moitie eteinte** : une phrase de manifeste ou la premiere moitie est
  grisee pour que la seconde tombe (Spector, Aerra). C est un dispositif, pas
  un style de texte courant.

## 3. Le mono porte toutes les metadonnees

Tout ce qui n est ni titre ni paragraphe est en **mono, capitales, 11-12 px,
interlettrage large** : les indices `(01)`, `01 /`, les etiquettes de section,
les coordonnees, `© 2026`, l heure locale, les legendes de photos (Nordframe,
Gallary, Fuel, Vesper, Altitude). Le mono est la voix technique de la page.

## 4. Trois formes de barre, pas une quatrieme

- **Gelule flottante centree, en verre** : Nubo, Rescale, Soda, Stackside,
  Vesper. `o-backdrop-blur-xl o-bg-white-10 o-border-white-20`, rayon plein.
- **Filet** : mot-marque a gauche, liens au centre, une gelule d action a
  droite (Sentira, Portfolite, Salonix, Lumen).
- **Coins en mono** : quatre mots en capitales aux quatre coins (Nordframe,
  Miles, Fuel, Forma).

## 5. L ouverture

Une scene WebGL **ou** une photographie plein cadre — jamais les deux, jamais
rien. L objet lumineux est unique et centre ou decale d un tiers (l orbe de
Vesper, l anneau de New Era, la carte de Lumen, la statue de Laocoon, la canette
de Soda, le buste tramé de Stackside, la Terre d Ascend).

Autour, dans l ordre : une **etiquette en gelule** (« Welcome to a new era »,
« #01 Premium hair salon », « ● Crafting unique brand identities ») · le titre ·
un paragraphe de deux lignes · **deux gelules** (pleine + fantome) · en bas, au
choix : une **barre de chiffres en verre** (Altitude, Stackside, Forma), une
**bande de logos** (Sentira, Portfolite, Rescale, Nubo), une **carte flottante**
(Salonix « most-booked treatment », Creatie « available for work »). Aux coins,
les metadonnees en mono.

Le **filigrane** — le mot-marque en 800 px derriere la photo (Aerra) ou en
contour a un cinquieme d opacite (Artefakt) — est autorise et recommande.

## 6. Le rideau d ouverture

Chaque page ouvre derriere un rideau : compteur honnete (`CounterGate`),
diaphragme (`IrisOpen`), trou qui grandit (`CurtainWipe`), mot qui s assemble
(`LettersGate`), plaque qui recule (`ZoomGate`). Plancher 900 ms, plafond
7 000 ms. **Le contenu est monte cache et se revele a travers le rideau qui
part**, jamais apres son repos. Sous `prefers-reduced-motion`, le rideau ne
tient que son plancher et le contenu arrive sans translation.

## 7. La revelation

- Le titre : **par mot ou par ligne**, cadence 60-120 ms, duree 600-1 000 ms ;
  par lettre seulement sur un mot-marque court. Flou-et-montee, opacite pleine
  des le premier tiers de la courbe.
- Les photographies **derivent contre le defilement** dans leur boite de
  decoupe (`ParallaxImage`, `Parallax`).
- Les compteurs **se resolvent d un flou** en meme temps qu ils s arretent.
- **Une seule horloge de defilement** pour la scene et l habillage
  (`useScrollScrub`) ; les revelations sous le pli sont a l entree dans le
  champ, une fois, pas au frottement.

## 8. Le vocabulaire des sections

Une page marketplace enchaine huit a dix-huit sections prises dans ce
vocabulaire, et pas ailleurs :

| section           | forme                                                                      | vu chez                                     |
| ----------------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| bande de logos    | six marques en gris, fondues aux bords                                     | Sentira, Portfolite, Rescale, Nubo, Salonix |
| manifeste         | une phrase de 40-64 px, moitie eteinte, alignee a droite sur deux colonnes | Spector, Fuel, Aerra                        |
| liste numerotee   | `01 02 03` en 120 px a gauche, titre + photo a droite                      | Fuel, Salonix, Sentira                      |
| grille de photos  | trois ou quatre colonnes, legendes en mono, sans cartes                    | Gallary, Nordframe, Spector, Miles          |
| mosaique bento    | tuiles inegales, une mise en avant, fond de surface                        | Rescale, Nubo, Portfolite, Tenora           |
| chiffres          | quatre nombres en 64-96 px sur filets, mot en mono dessous                 | Spector, Nubo, Salonix, Altitude            |
| cartes de verre   | `blur-xl` + `white-10` + bord `white-20`, 3x3 avec cases vides             | Aerra, Vesper, Creatie                      |
| temoignages       | portraits ronds, citation en 24 px, colonnes ou defilement                 | Sentira, Rescale, Portfolite                |
| tarifs            | trois cartes, une sombre mise en avant, le prix en 64 px                   | Fuel, Nubo, Rescale                         |
| processus         | etapes en gelules numerotees ou en orbes                                   | Sentira, Rescale, Portfolite                |
| questions         | accordeon a filets, sans cartes                                            | Nubo, Vesper, Baseline                      |
| maquettes produit | ecran ou objet en rendu, dans un cadre sombre                              | Sentira, Miles, Rescale, Lumen              |
| appel final       | « LET S TALK », « On commence ? » en 120 px, une gelule                    | Gallary, Salonix, Nordframe                 |
| pied              | mot-marque geant + colonnes en mono + `© 2026`                             | Nordframe, Miles, Fuel                      |

## 9. Les details qui font le prix

Filets a 1 px en `white-10` / `black-10` · croix `+` aux coins des cadres (Fuel)
· fleches `↗` sur les liens · gelules d etiquettes **inclinees** comme des
autocollants (Creatie) · escaliers de pixels sur les degrades (Tenora) ·
grain de film a 4-8 % sur les fonds sombres (`Noise`) · heure locale en direct
(Gallary) · l indice de section `(04)` en mono avant chaque titre · une
photographie en **noir et blanc avec un seul accent** (Spector, Salonix).

## 10. La photographie et la couleur

- Photographies **dirigees** : contrastees, sujet detoure ou flou en
  mouvement (Fuel), noir et blanc (Portfolite), jamais une banque d images
  tiede. Une photo au mauvais sujet vaut zero photo.
- **Un accent, rationne** : rouge Spector, jaune Nubo, vert lime Stackside,
  lavande Rescale, cuivre Laocoon. Il tient sur les gelules, un mot, un filet.
- Les palettes peuvent sortir de la marque : pastel degrade (Tenora, Rescale),
  lime sur papier casse (Stackside), ambre (Fuel), creme et noyer (Salonix).

## Ce que cela change pour nous

Le milieu de chaque vitrine — la console, la carte, l agenda, le carnet — reste
son mecanisme, et il reste different d une vitrine a l autre. Mais **tout le
reste doit venir de ce vocabulaire** : la barre, l ouverture, le rideau, la
revelation, les chiffres, le pied. Une section qui n est pas dans la table du
point 8 doit se justifier par le metier, pas par l habitude.
