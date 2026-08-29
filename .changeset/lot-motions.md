---
'@odoro-cli/libs': minor
'odoro': patch
---

Barres de defilement personnalisables : `o-scrollbar`, `o-scrollbar-dark`,
`o-scrollbar-stable`. Deux ecritures pour un seul resultat — la propriete
standard, et le pseudo-element pour ce qu'elle ne permet pas encore.

Trois manques comble par l'usage : `row-start-*`, qui existait pour les
colonnes mais pas pour les lignes ; `min-h-*` et `min-w-*` sur l'echelle
d'espacement ; les variantes de theme sur les jalons de degrade et les
variantes de palier sur les bordures. Sans elles, un degrade fige en clair
traversait une page passee en sombre.

La garde anti-doublons compare desormais les selecteurs et non les noms de
classe : une meme classe habille legitimement plusieurs pseudo-elements.

Cote moteur de developpement, l'empreinte du cache de pre-compilation resolvait
les dependances avec la condition `require`. Un paquet ESM pur n'en declare
pas : la resolution echouait, l'empreinte devenait constante, et le cache ne
s'invalidait plus jamais — exactement pour les paquets du depot, ceux qu'on
recompile dix fois par jour. Elle passe maintenant par le manifeste, toujours
atteignable, et empreinte tous les fichiers que la carte d'exports designe.
