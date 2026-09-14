# Un univers par vitrine

Ce document complete `CHARTE.md`. La charte fixe le **niveau** (titre-objet,
mono, rideau, revelation, photographie dirigee). Celui-ci fixe la
**difference** : quarante et une pages qui ne doivent pas se ressembler, ni
dans leur structure, ni dans leur appel final, ni dans leur pied, ni dans la
maniere de montrer un chiffre.

## Ce qui fait « IA », et qu on ne fait plus

Une page se lit comme generee quand elle enchaine des blocs interchangeables.
Les signes, tous releves sur nos propres pages :

1. **La grille de trois ou quatre cartes egales**, pictogramme + titre + deux
   lignes, avec une ombre ou un halo au survol. C est le bloc le plus
   reconnaissable. On le remplace par une liste numerotee a photos, un
   chapitre a etiquette collante, une mosaique inegale, ou un seul objet.
2. **Le meme rythme de section** : surtitre en capitales, titre, paragraphe,
   contenu, sur `o-py-24`, encore et encore. Une page dessinee alterne un
   ecran plein, une bande etroite, une image pleine largeur, un ecran de
   texte seul, un moment epingle.
3. **L appel final « On commence ? » en 120 px + une gelule**, et **le pied a
   quatre colonnes + mot-marque geant**. Ils etaient sur trente pages. Ils
   sont desormais rationnes (trois pages chacun, voir les formes plus bas).
4. **La barre de quatre chiffres** identique partout. Un chiffre se montre
   selon le metier : un seul nombre enorme, un tableau, une jauge, un ticker,
   une note dans la marge — ou pas du tout.
5. **Tout est centre, tout est aligne, rien ne deborde**. Une page dessinee
   prend un risque : une photo qui chevauche la section suivante, un titre qui
   sort du cadre, une etiquette penchee, une legende dans la marge, une
   colonne vide.
6. **Aucun mouvement au defilement**, ou seulement des fondus a l entree.
   Chaque page a maintenant une **signature de mouvement** : parallaxe,
   scene epinglee, rail horizontal, cartes empilees, zoom au defilement,
   lettres qui s ecartent, texte qui s allume mot a mot.
7. **Le meme fond partout**. Certaines pages sont statiques (papier, blanc
   franc, un aplat) ; d autres ont un fond anime en CSS ou en canevas ;
   d autres une scene WebGL. Le choix vient du metier, pas de l habitude.
8. **Trop de mots**. Une page marketplace dit une chose par ecran. Si un
   paragraphe fait plus de trois lignes, il a un ecran pour lui ou il est
   coupe.

## La regle du rationnement

Chaque forme d appel, de pied et de chiffres est numerotee ci-dessous.
**Au plus trois vitrines partagent une forme.** Les fiches les attribuent.
Un agent qui retravaille une vitrine n a pas le droit de changer sa forme pour
une forme deja pleine.

### Les fonds

| code       | fond                                                                                            | ou                                                                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-statique | un aplat, un papier, une grille fixe ; rien ne bouge derriere le texte                          | mode, cabinet-conseil, galerie-art, architecture, photographe, fleuriste                                                                                                                                                                                  |
| F-photo    | une photographie plein cadre qui zoome ou derive au defilement (`ZoomDefile`, `Devoile`)        | bistro, studio-creatif, immobilier, voyage, hotel (avec sa scene), clinique                                                                                                                                                                               |
| F-css      | un fond anime sans canevas : nappe de degrade qui derive (`Nappe`), filets qui respirent, grain | designer, studio-yoga (avec FogDrift), robot-domestique, saas-analytique (nappe + globe)                                                                                                                                                                  |
| F-canevas  | un fond en canevas ou three.js, sans contexte WebGL exclusif                                    | agence-ia (TerrainWireframe), spatial (OrbitRings), biotech (DnaHelix), energie (ElasticMesh), jeu-video (Ballpit), conference (Constellation), immobilier (CityBlocks), voiture-electrique (TerrainWireframe), label-musique (TorusKnot), voyage (Swarm) |
| F-webgl    | une scene en shader, une seule par page, avec `poster`                                          | studio-3d, travail-profond, barbier, torrefaction, joaillerie, parfum, salle-sport, api-dev, plateforme-ia, securite, fintech, crypto, festival, podcast, sneakers, hotel, spa                                                                            |

Un canevas ou une scene peut etre **fixe derriere toute la page**
(studio-3d), **limite a l ouverture** (le plus courant), ou **descendu au
milieu** de la page pour un seul moment (energie).

### Les signatures de mouvement

Une par page, en plus des revelations a l entree :

| code          | signature                                                                                               | primitive                                 |
| ------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| M-parallaxe   | photos et objets qui derivent a des vitesses differentes, **avec inertie**                              | `Parallaxe glisse={0.5..0.85}`, `Devoile` |
| M-diorama     | une scene collee, des couches qui coulent chacune a sa profondeur : le defilement devient le sujet      | `Profondeur` + `Couche`                   |
| M-zoom        | l image d ouverture qui recule et s assombrit quand on defile                                           | `ZoomDefile`                              |
| M-epingle     | un ecran qui reste fixe pendant deux a quatre ecrans de defilement, et dont le contenu change par actes | `Epingle`                                 |
| M-rail        | une bande horizontale qu on parcourt en defilant verticalement                                          | `Rail`                                    |
| M-empile      | des cartes qui s empilent et retrecissent                                                               | `StickyStack` (registre)                  |
| M-chapitres   | une etiquette collante a gauche, le contenu qui defile a droite                                         | `Chapitre`                                |
| M-bandeau     | des mots geants qui defilent en continu, dans un sens ou l autre                                        | `Bandeau`, `ScrollVelocity`               |
| M-lettres     | le mot-marque dont les lettres s ecartent au defilement (Aerra)                                         | `Eclate`                                  |
| M-allume      | un paragraphe dont les mots s allument au fil du defilement                                             | `ScrollReveal` (registre)                 |
| M-flotte      | des objets qui flottent en continu, des autocollants penches                                            | `Flotte`, `Autocollant`                   |
| M-aimant      | des boutons magnetiques, un curseur qui colle                                                           | `Aimant`, `StickyCursor`                  |
| M-pied        | le pied fixe derriere la page, qui se decouvre a la fin                                                 | `PiedColle`                               |
| M-perspective | un ecran ou un objet qui se redresse en 3D quand on defile                                              | `ContainerScroll` (registre)              |

### Les formes d appel

| code | forme                                                                      | attribuee a                                                             |
| ---- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| A1   | un mot geant (« A table ? ») + une gelule                                  | studio-creatif, salle-sport, torrefaction                               |
| A2   | un formulaire en ligne nom / courriel avec un disque de soumission (Forma) | agence-ia, biotech, architecture                                        |
| A3   | une carte flottante « disponible » avec l heure locale (Creatie)           | designer, plateforme-ia, immobilier                                     |
| A4   | une bande pleine largeur en accent, texte qui defile dedans                | robotique, crypto                                                       |
| A5   | le numero de telephone ou l adresse en 120 px, rien d autre                | bistro, fleuriste                                                       |
| A6   | deux panneaux decales, photo d un cote, texte de l autre                   | voyage, label-musique, securite                                         |
| A7   | un compte a rebours ou une prochaine date                                  | spatial, robot-domestique, jeu-video                                    |
| A8   | une liste d attente en verre (Flowstate)                                   | travail-profond, studio-yoga, parfum                                    |
| A9   | un seul bouton magnetique au centre d un ecran vide                        | energie, joaillerie, saas-analytique                                    |
| A10  | pas de section d appel : l action est dans la barre et dans le pied        | mode, api-dev, galerie-art, podcast                                     |
| A11  | le mecanisme du metier sert d appel (reservation, creneaux, capsule)       | barbier, spa, clinique, fintech (ouverture de compte), hotel (registre) |
| A12  | l adresse de courriel en clair, en 64 px, soulignee, avec un ↗             | photographe, studio-3d, cabinet-conseil                                 |
| A13  | une barre de billetterie fixee en bas de l ecran                           | festival, conference                                                    |
| A14  | un champ « prevenez-moi » (SMS ou courriel) dans un bloc d accent          | sneakers                                                                |
| A15  | un choix de date d essai dans une carte                                    | voiture-electrique                                                      |

### Les formes de pied

| code | forme                                                                   | attribuee a                                |
| ---- | ----------------------------------------------------------------------- | ------------------------------------------ |
| P1   | mot-marque qui remplit la largeur + colonnes en mono                    | agence-ia, torrefaction, mode              |
| P2   | une seule ligne : marque · liens · ©                                    | photographe, travail-profond, architecture |
| P3   | carte de visite : adresse, horaires, acces, en grand                    | bistro, clinique, immobilier               |
| P4   | plan du site dense, six colonnes de petits liens                        | robot-domestique, label-musique, jeu-video |
| P5   | generique de fin qui defile (`CinematicFooter`)                         | barbier, parfum, securite                  |
| P6   | pied noir avec le formulaire de contact integre, trois champs soulignes | biotech, api-dev, fintech                  |
| P7   | pied fixe derriere la page, decouvert a la fin (`PiedColle`)            | energie, saas-analytique, podcast          |
| P8   | bandeau de mots qui defilent + une ligne de mentions                    | studio-creatif, salle-sport, crypto        |
| P9   | horloges de villes + coordonnees en mono                                | studio-3d, voyage, plateforme-ia           |
| P10  | tableau a filets, style documentation                                   | spatial, robotique, cabinet-conseil        |
| P11  | une signature en italique serif, et les mentions                        | designer, studio-yoga, spa                 |
| P12  | colophon : police, papier, credits photo                                | fleuriste, joaillerie, festival            |
| P13  | plan du lieu dessine en SVG + lignes de metro                           | sneakers                                   |
| P14  | partenaires en gris + une ligne                                         | conference, voiture-electrique             |
| P15  | le mot-marque repete en colonne verticale                               | galerie-art                                |
| P16  | une lettre signee, un paragraphe                                        | hotel                                      |

### Les formes de chiffres

| code | forme                                            | attribuee a                                                                      |
| ---- | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| C1   | barre de quatre nombres en verre                 | studio-3d, robotique, spa                                                        |
| C2   | quatre nombres sur filets, 96 px                 | studio-creatif, torrefaction, fintech                                            |
| C3   | un seul nombre enorme (200 px) et une phrase     | barbier, parfum, plateforme-ia                                                   |
| C4   | compteurs qui roulent (`CounterRoll`, `CountUp`) | energie, agence-ia, salle-sport                                                  |
| C5   | un tableau de donnees en mono                    | spatial, jeu-video, api-dev                                                      |
| C6   | jauges, anneaux, barres de progression           | biotech, clinique, saas-analytique                                               |
| C7   | notes dans la marge, en mono                     | architecture, cabinet-conseil, voiture-electrique                                |
| C8   | aucun chiffre                                    | photographe, bistro, fleuriste, mode, joaillerie, galerie-art, sneakers, podcast |
| C9   | ticker : une bande de valeurs qui defile         | label-musique, securite, crypto                                                  |
| C10  | des chiffres poses sur les photos, en legende    | immobilier, festival, hotel                                                      |

## Les fiches

Chaque fiche dit : le fond, la signature de mouvement, la structure ecran par
ecran, et les trois formes. La **structure est unique** : deux vitrines ne
doivent pas enchainer les memes sections dans le meme ordre.

### agence-ia — Tangente (Sentira)

- Fond : F-canevas, TerrainWireframe fixe derriere l ouverture et le manifeste.
- Mouvement : M-epingle. Le manifeste est epingle : trois actes (« sentir »,
  « fermer », « construire ») qui se remplacent sur le terrain.
- Structure : ouverture (mot-marque serif 220 px, deux gelules, logos) →
  manifeste epingle → cas en liste numerotee 01/02/03 avec photos →
  calculateur de rendement → un seul temoignage plein ecran → A2 → P1.
- A2 · P1 · C4 (dans les cas).

### photographe — Maud Ferrand (Gallary)

- Fond : F-statique, blanc franc.
- Mouvement : M-rail. Les tirages se parcourent en rail horizontal.
- Structure : nom en grotesque noire + heure → rail de tirages → table
  lumineuse (filtre) → series en mosaique inegale, legendes dans la marge →
  a propos avec photo collante → A12 → P2.
- A12 · P2 · C8.

### studio-creatif — Ardent (Spector)

- Fond : F-photo, zoom au defilement sur la photo sous grille.
- Mouvement : M-empile. Les projets s empilent.
- Structure : ouverture → projets empiles → manifeste moitie eteinte qui
  s allume (M-allume en second) → clients en bandeau → C2 → A1 → P8.
- A1 · P8 · C2.

### designer — Ines Roque (Creatie)

- Fond : F-css, `Nappe` pastel qui derive derriere toute la page.
- Mouvement : M-flotte. Les autocollants flottent, les boutons sont aimantes.
- Structure : ouverture (paysage, autocollants) → dock → travaux en mosaique
  → processus en orbes → temoignages en colonnes → A3 → P11.
- A3 · P11 · C8.

### travail-profond — Etale (Flowstate)

- Fond : F-webgl, Silk plein cadre, fixe.
- Mouvement : M-allume. Le seul long paragraphe s allume au defilement.
- Structure : un ecran d ouverture, puis trois ecrans courts (la session, le
  silence, le compte), et A8 → P2. Pas plus.
- A8 · P2 · C8.

### robot-domestique — Nubo

- Fond : F-css, cuisine chaude en photo et une nappe.
- Mouvement : M-epingle. La journee de 24 h est epinglee : l heure avance
  avec le defilement, la scene change.
- Structure : ouverture (gelule flottante, mot en italique) → journee
  epinglee → mosaique de capacites → questions → A7 (precommande, date) → P4.
- A7 · P4 · C3 (le nombre d heures d autonomie, seul).

### studio-3d — Manifeste (Auralis)

- Fond : F-webgl, ParticleSphere fixe derriere toute la page.
- Mouvement : M-epingle (les actes passent sur la scene).
- Structure : deux mots autour de l objet → actes → manifeste → C1 → A12 → P9.
- A12 · P9 · C1.

### bistro — Maison Perrin (Salonix)

- Fond : F-photo, la salle en `ZoomDefile`.
- Mouvement : M-parallaxe. Trois photos qui derivent, decalees, une qui
  chevauche la section suivante.
- Structure : ouverture → la salle (trois photos en decale) → l ardoise
  (SplitFlap) → bandeau des plats du jour → horaires → reservation → A5 (le
  numero) → P3.
- A5 · P3 · C8.

### barbier — Atelier Rasoir (Salonix)

- Fond : F-webgl, Smoke.
- Mouvement : M-rail. Les soins se parcourent en rail horizontal.
- Structure : ouverture → rail des soins → C3 (« 11 ans ») → l equipe →
  creneaux (A11) → P5.
- A11 · P5 · C3.

### studio-yoga — Souffle (Nubo)

- Fond : F-css avec FogDrift, respiration lente.
- Mouvement : M-flotte. Tout respire : un cercle qui s ouvre et se ferme au
  rythme d une inspiration guide la page.
- Structure : ouverture → le cercle de respiration → planning → les
  professeurs → A8 → P11.
- A8 · P11 · C8.

### fleuriste — Tige (Creatie)

- Fond : F-statique, creme.
- Mouvement : M-parallaxe. Les brassees derivent, des petales en autocollants.
- Structure : ouverture → la saison (photos en decale) → l atelier → le
  carnet de commandes → A5 (l adresse) → P12.
- A5 · P12 · C8.

### torrefaction — Brulerie Nord (Fuel)

- Fond : F-webgl, Dunes.
- Mouvement : M-empile. Les origines s empilent.
- Structure : ouverture (mot-marque en bas du cadre) → 01/02/03 en 120 px
  avec photos → origines empilees → C2 → abonnement → A1 → P1.
- A1 · P1 · C2.

### label-musique — Cale (Fuel / Tenora)

- Fond : F-canevas, TorusKnot.
- Mouvement : M-bandeau. Les sorties defilent a la vitesse du defilement.
- Structure : ouverture → bandeau des artistes → sorties → C9 (ticker
  d ecoutes) → A6 → P4.
- A6 · P4 · C9.

### spatial — Aphelie (Ascend / New Era)

- Fond : F-canevas, OrbitRings.
- Mouvement : M-epingle. La sequence de lancement : quatre actes epingles.
- Structure : ouverture → lancement epingle → missions en tableau (C5) → A7
  (prochain lancement) → P10.
- A7 · P10 · C5.

### biotech — Cytea (Vesper)

- Fond : F-canevas, DnaHelix.
- Mouvement : M-chapitres. Le pipeline en chapitres a etiquette collante.
- Structure : ouverture (HUD) → chapitres → jauges (C6) → A2 → P6.
- A2 · P6 · C6.

### energie — Courant (Baseline / Ascend)

- Fond : F-canevas, ElasticMesh descendu au milieu de la page.
- Mouvement : M-pied. Le pied est fixe derriere la page.
- Structure : ouverture (photo du parc) → production en direct (C4) → le
  maillage au milieu → offres → A9 → P7.
- A9 · P7 · C4.

### voyage — Bivouac (Aerra)

- Fond : F-canevas (Swarm) + photo.
- Mouvement : M-lettres. Le mot-marque s ecarte au defilement.
- Structure : ouverture (filigrane) → itineraires en photos qui derivent →
  A6 → P9.
- A6 · P9 · C10 (sur les photos d itineraires).

### architecture — Cadre (Forma)

- Fond : F-statique, blanc.
- Mouvement : M-rail. Les projets en rail.
- Structure : ouverture gouttiere a gouttiere → rail des projets → notes de
  chantier avec chiffres dans la marge (C7) → A2 → P2.
- A2 · P2 · C7.

### jeu-video — Fonte (Tenora)

- Fond : F-canevas, Ballpit.
- Mouvement : M-empile. Les niveaux s empilent.
- Structure : ouverture → niveaux empiles → tableau des scores (C5) → A7
  (date de sortie) → P4.
- A7 · P4 · C5.

### robotique — Stackside

- Fond : F-statique, trame de demi-teinte.
- Mouvement : M-bandeau + ScrollSteps existants.
- Structure : ouverture → C1 → etapes → A4 → P10.
- A4 · P10 · C1.

### spa — Altitude

- Fond : F-webgl, WaterSurface.
- Mouvement : M-parallaxe, tres lent.
- Structure : ouverture → rituels en photos qui derivent → C1 → capsule
  (A11) → P11.
- A11 · P11 · C1.

### mode — Lisiere (Nordframe)

- Fond : F-statique, blanc.
- Mouvement : M-rail. Les silhouettes en rail.
- Structure : bande de tirages + nom qui remplit la page → rail → pieces →
  ateliers → P1. Pas d appel.
- A10 · P1 · C8.

### cabinet-conseil — Verne & Associes (Forma)

- Fond : F-statique, papier.
- Mouvement : M-chapitres.
- Structure : ouverture → chapitres (les quatre domaines) → notes dans la
  marge (C7) → A12 → P10.
- A12 · P10 · C7.

### joaillerie — Laocoon

- Fond : F-webgl, Crystal.
- Mouvement : M-epingle. Quatre diapositives editoriales sur le cristal.
- Structure : ouverture → diapositives epinglees → pieces → A9 → P12.
- A9 · P12 · C8.

### parfum — Flowstate

- Fond : F-webgl, LiquidChrome.
- Mouvement : M-flotte. Les notes flottent et se revelent au survol.
- Structure : premier volet → notes → C3 (« 72 h ») → A8 → P5.
- A8 · P5 · C3.

### salle-sport — Fonte (Tenora / Spector)

- Fond : F-webgl, ElectricField.
- Mouvement : M-bandeau + TextPressure.
- Structure : affiche → bandeau → planning → C4 → A1 → P8.
- A1 · P8 · C4.

### clinique — Clinique Vernet (Baseline)

- Fond : F-photo (le hall) et blanc, bleu royal en accent.
- Mouvement : M-epingle. Le parcours en quatre etapes est epingle.
- Structure : ouverture → parcours epingle → specialites en liste, pas en
  cartes → praticiens → jauges d attente (C6) → creneaux (A11) → P3.
- A11 · P3 · C6.

### api-dev — Orbe (Vesper)

- Fond : F-webgl, Circuit.
- Mouvement : M-chapitres. La documentation en chapitres collants.
- Structure : ouverture → chapitres → tableau des limites (C5) → journal →
  P6. Pas d appel separe.
- A10 · P6 · C5.

### saas-analytique — Rescale

- Fond : F-css (nappe pastel) + GlobeMesh.
- Mouvement : M-perspective. Le produit se redresse.
- Structure : ouverture → produit en perspective → mosaique → jauges (C6)
  → tarifs → A9 → P7.
- A9 · P7 · C6.

### plateforme-ia — New Era

- Fond : F-webgl, ParticleSphere.
- Mouvement : M-epingle. Les phases de la sphere changent au defilement.
- Structure : ouverture → phases epinglees → C3 → A3 → P9.
- A3 · P9 · C3.

### securite — Artefakt (Vesper)

- Fond : F-webgl, Hologram.
- Mouvement : M-empile. Les menaces s empilent.
- Structure : ouverture (pupitre) → menaces empilees → ticker (C9) → A6 → P5.
- A6 · P5 · C9.

### fintech — Palier (Lumen)

- Fond : F-webgl, une mer de nuit ; la carte se dresse et s incline au
  pointeur (TiltGlare). L ouverture est une affiche sombre plein ecran ; le
  corps est clair.
- Mouvement : M-zoom + inclinaison de la carte.
- Structure : affiche → le releve (mecanisme) → C2 → l epargne → ouverture de
  compte (A11) → P6.
- A11 · P6 · C2.

### crypto — Cobalt (Vesper)

- Fond : F-webgl, DataStream.
- Mouvement : M-bandeau. Le ticker des cours.
- Structure : ouverture → carnet d ordres → ticker (C9) → A4 → P8.
- A4 · P8 · C9.

### immobilier — Cadre & Bien (Aerra)

- Fond : F-photo + CityBlocks.
- Mouvement : M-lettres.
- Structure : couverture → biens en mosaique avec chiffres en legende (C10)
  → visite → A3 → P3.
- A3 · P3 · C10.

### festival — Auber (Tenora)

- Fond : F-webgl, PrismaticBurst.
- Mouvement : M-empile. Les jours s empilent.
- Structure : affiche → programmation en bandeau → jours empiles → A13
  (barre de billetterie fixee) → P12.
- A13 · P12 · C10 (sur les photos de scenes).

### podcast — Miles

- Fond : F-webgl, AudioBars.
- Mouvement : M-pied.
- Structure : typographie geante → episodes → invites → P7. Pas d appel :
  l abonnement est dans l ouverture.
- A10 · P7 · C8.

### conference — Tenora

- Fond : F-canevas, Constellation.
- Mouvement : M-epingle. Le programme se parcourt epingle.
- Structure : ouverture → programme epingle → intervenants → tarifs par
  paliers de date → A13 → P14.
- A13 · P14 · C8.

### galerie-art — Gallary

- Fond : F-statique, blanc + Noise.
- Mouvement : M-parallaxe + curseur qui colle aux oeuvres.
- Structure : accrochage → oeuvres en mosaique, legendes collantes →
  exposition en cours → visite (adresse, horaires) → P15.
- A10 · P15 · C8.

### sneakers — Paire 44 (Soda)

- Fond : F-webgl, LedWall ; un clic sur un coloris change toute la palette.
- Mouvement : M-aimant.
- Structure : compte a rebours → coloris → carrousel → A14 → P13.
- A14 · P13 · C8.

### hotel — Les Tamaris (Altitude)

- Fond : F-webgl, WaterSurface.
- Mouvement : M-parallaxe. Les chambres derivent, chiffres en legende.
- Structure : ouverture → registre (A11) → la crique → chambres (C10) → P16.
- A11 · P16 · C10.

### voiture-electrique — Sillon

- Fond : F-canevas, TerrainWireframe.
- Mouvement : M-perspective + M-epingle (la charge simulee).
- Structure : ouverture → perspective → charge epinglee → notes (C7) → A15
  → P14.
- A15 · P14 · C7.

## Ce que Kilam a precise ensuite

- **Les heros sont en general bons** : on garde leur fond (scene, photo,
  canevas). Ce qui se retravaille, c est leur **contenu** : la composition du
  titre, de l etiquette, des actions et des metadonnees de coin. Sont a
  recomposer ceux qui ressemblent a une page de documentation (fintech,
  clinique, saas-analytique, api-dev, conference, securite, crypto) et ceux
  dont le titre n est pas encore un objet (moins de 72 px, graisse moyenne,
  paragraphe trop long, aucune metadonnee en mono).
- **Toutes les pages ont des KPI, et elles ne devraient pas.** La forme C8
  (aucun chiffre) est la reponse par defaut ; un chiffre reste seulement quand
  la fiche l attribue et que le metier le justifie.
- **Ce sont les sections qui suivent le heros qui ne sont pas bien baties.**
  C est la que le travail se fait : chaque section est recomposee avec une
  piece du registre ou une primitive de `scene.tsx`, jamais avec la grille de
  cartes egales.
- **Des animations de texte, sur beaucoup de sites (pas tous)**, prises dans
  `@/odoro/text/` — la table ci-dessous les attribue, une par site, en plus de
  la revelation d ouverture.
- **Utiliser au maximum la librairie** : chaque page emploie au moins trois
  pieces du registre hors fond (une section, un effet, une image ou un texte),
  differentes de celles de la page voisine.

### Les animations de texte

Chaque piece apparait sur trois pages au plus. Elle porte un vrai texte de la
page (un titre de section, un manifeste, une valeur), jamais une demonstration.

| vitrine            | texte anime                              | ou                                                  |
| ------------------ | ---------------------------------------- | --------------------------------------------------- |
| agence-ia          | `SplitLines` + `ScrollReveal`            | titre des cas ; manifeste epingle                   |
| photographe        | `Shuffle`                                | l heure et les titres de series                     |
| studio-creatif     | `StrokeText`                             | les capitales du manifeste, en contour puis pleines |
| designer           | `RotatingWords`                          | « designer produit / d interfaces / de systemes »   |
| travail-profond    | `BlurWords`                              | le paragraphe de la session                         |
| robot-domestique   | `MorphText`                              | les heures de la journee epinglee                   |
| studio-3d          | `DecodeText`                             | les titres d actes                                  |
| bistro             | `SplitFlap` (existant)                   | l ardoise                                           |
| barbier            | `LetterSwap`                             | les soins, au survol                                |
| studio-yoga        | `WaveText`                               | « inspirez — expirez »                              |
| fleuriste          | `HandWritten`                            | le nom, ecrit a la main                             |
| torrefaction       | `CurvedLoop`                             | « torrefie a Pantin » en boucle autour du sac       |
| label-musique      | `WarpText` + `ScrollVelocity`            | les artistes                                        |
| spatial            | `CounterRoll` + `DepthText`              | le compte a rebours ; le nom de la mission          |
| biotech            | `VariableProximity`                      | le titre du pipeline, au pointeur                   |
| energie            | `MaskedHeading` (existant) + `CountUp`   | le titre ; la production                            |
| voyage             | `Eclate` (scene.tsx) + `FoldText`        | le mot-marque ; les itineraires                     |
| architecture       | `SplitReveal`                            | les titres de projets                               |
| jeu-video          | `FuzzyText`                              | le titre du jeu                                     |
| robotique          | `AsciiText`                              | le mot-marque, en ascii                             |
| spa                | `BlurReveal` (existant)                  | les rituels                                         |
| mode               | `SplitLines` (existant) + `CircularText` | le nom ; un badge « numero douze »                  |
| cabinet-conseil    | `HighlightSweep` + `UnderlineDraw`       | une phrase surlignee ; les liens                    |
| joaillerie         | `ShineText`                              | le nom des pieces                                   |
| parfum             | `GradientFlow`                           | le nom du parfum                                    |
| salle-sport        | `TextPressure` (existant)                | l affiche                                           |
| clinique           | `TrueFocus`                              | « le motif, le praticien, le creneau »              |
| api-dev            | `Typewriter` (existant) + `TextCursor`   | l exemple ; l invite                                |
| saas-analytique    | `SpotlightText`                          | le titre du produit                                 |
| plateforme-ia      | `ParticleText`                           | le mot « Ensemble »                                 |
| securite           | `GlitchText` (existant)                  | les menaces                                         |
| fintech            | `CounterRoll`                            | le solde, qui roule au changement de mois           |
| crypto             | `CounterRoll` (existant)                 | les cours                                           |
| immobilier         | `ImageMaskText`                          | le nom du quartier, rempli de sa photo              |
| festival           | `FallingText`                            | les noms des artistes tombent en pluie              |
| podcast            | `TextLoop` (existant) + `EchoText`       | les sujets ; le nom                                 |
| conference         | `Shuffle`                                | le programme, quand on change de jour               |
| galerie-art        | `VariableProximity`                      | le titre de l exposition                            |
| sneakers           | `DepthText`                              | « 44 »                                              |
| hotel              | `SplitReveal` (existant)                 | les chambres                                        |
| voiture-electrique | `ScrollFloat` (existant)                 | les titres                                          |

### Les pieces du registre, au-dela du fond

`section/` : BentoGrid, BookShelf, Changelog, CinematicFooter, ComingSoon,
ComparisonTable, ContainerScroll, CtaBand, Faq, FeatureTabs, HeroScrollMorph,
LogoBand, Newsletter, OrbitalTimeline, PricingTiers, RevealGrid, ScrollSteps,
SignIn, StatBand, StickyStack, TeamGrid, TestimonialsColumns, Timeline.

`effect/` : BeamConnect, BlobCursor, BorderBeam, Carousel, ClickSparks,
Crosshair, CursorHalo, CursorRing, Deform, FloatGroup, GlareHover,
GlitchHover, GlowCursor, GradualBlur, HalftoneReveal, InertiaDrag, LaserFlow,
MagicRings, MagnetLines, Magnetic, Marquee, Meteors, NeonBorder,
OrbitingDots, Parallax, PixelSwap, PixelTransition, RevealMask, RippleClick,
RippleDistortion, ScrollProgress, ScrollVelocity, ShapeBlur, SplashPointer,
Spotlight, StickerPeel, StickyCursor, SwarmCursor, TargetCursor.

`image/` : AsciiImage, ColorShift, Compare, Duotone, Frame, HoverZoom,
ImageGlitch, ImageMaskText, ImageParticles, ImageStackSwipe, ImageTrail,
KenBurns, LensZoom, ParallaxImage, Player, RevealImage, ScrollRevealImage,
TiltGlare, Video.

`ui/` : AnimatedList, AvatarStack, BounceCards, BubbleMenu, CardNav, CardSwap,
ChromaGrid, CircularGallery, CommandPalette, DecayCard, DepthCarousel,
DomeGallery, ElasticSlider, ElectricBorder, FlipCard, FlowingMenu,
FlyingPosters, Folder, GlassIcons, GlassSurface, GlowCard, GooeyNav,
HoverRevealButton, InfiniteMenu, LiquidButton, MagnifyDock, Masonry,
OptionWheel, PillNav, PillTabs, PixelCard, ProfileCard, ProgressRing,
RatingStars, ReflectiveCard, SegmentedControl, ShinyButton, SortableList,
SpotlightCard, StackedCards, StaggeredMenu, StarBorder, Stepper, TagInput,
TiltCard, ToastStack, TreeView.

Chaque fiche choisit dans ces listes ; une piece employee par deux vitrines
voisines dans la galerie doit l etre autrement (un autre contenu, une autre
place).

### abysse — Musee de la mer (neuve, 10 septembre)

- Fond : F-css, une colonne d eau en degrade, de la neige marine, des rais de
  lumiere et des silhouettes en SVG. Aucune scene graphique.
- Mouvement : **M-diorama**. Sept ecrans de descente, glisse 0,82, la faune
  semee a la profondeur ou elle vit, un sondeur ecrit depuis l horloge.
- Structure : surface (ouverture) → descente epinglee en cinq zones → les
  pieces remontees, en liste a profondeurs → visiter (horaires et tarifs) →
  A13 → P15.
- A13 · P15 · C8 (les metres sont le mecanisme, pas un indicateur).

### velo — Meridien (neuve, 10 septembre)

- Fond : F-css, cinq plans de relief en SVG en ligne, teintes par la palette.
- Mouvement : **M-diorama lateral** (`sens="x"`, course 420). Les roues
  tournent sur la meme variable que le decor ; le compteur egrene les
  kilometres, l altitude et la pente ; un curseur avance sur le profil.
- Structure : ouverture (la machine a l arret) → la sortie de 128 km en cinq
  portions, chacune defendant une piece du velo → l atelier en neuf semaines →
  A15 → P13.
- A15 · P13 · C8 · texte : `Shuffle` sur le nom de portion.
- La scene est epinglee au **registre du jour** (`JOUR`, le pendant de
  `nuit()`) : la sortie a lieu de jour dans les deux themes.

## Comment on verifie

Apres chaque vitrine, dans l ordre :

1. `npx tsc --noEmit -p playground` sans erreur.
2. Balayage des classes : toute classe `o-*` doit exister dans
   `packages/odoro-libs/src/styles/generated/classNames.ts`.
3. `erreurs.mjs <slug>` : zero erreur de console, un seul `h1`.
4. `debord-tous.mjs <slug>` : zero debordement horizontal a 380 et 1280.
5. `audit-contraste.mjs http://localhost:5190/templates/<slug>` : zero defaut.
6. Toute photo qui derive dans une page M-parallaxe ou M-zoom porte une
   `glisse` entre 0,5 et 0,85 : une derive qui s arrete avec la molette n est
   pas ce qui est demande.
7. La page se termine par un `<footer>` : Kilam a releve des vitrines sans
   pied. Le pied est obligatoire, dans la forme P attribuee.
8. Une capture a 1440 x 900, regardee : le titre est un objet, la page ne
   ressemble a aucune autre.
