# Odoro — client et serveur

Projet genere par `odoro create`. Une application React servie par le moteur
Odoro en developpement, et une API Express typee, reunies dans un seul depot et
une seule image.

## Structure

```
client/             Application React.
  index.html        Document et point d'entree.
  src/              Routes, styles, montage.
server/             API Express.
  src/env.ts        Lecture et validation de l'environnement au demarrage.
  src/index.ts      Construction de l'application et demarrage.
  tsconfig.json     Compilation du serveur, separee de celle du client.
scripts/dev.mjs     Lance les deux processus en parallele.
odoro.config.ts     Racine du client, proxy vers l'API, dossier de sortie.
Dockerfile          Image multi-etapes.
```

## Scripts

| Commande     | Effet                                                                  |
| ------------ | ---------------------------------------------------------------------- |
| `dev`        | Client et serveur en parallele, sorties prefixees.                     |
| `dev:client` | Client seul.                                                           |
| `dev:server` | Serveur seul, en rechargement.                                         |
| `build`      | Compile le client dans `dist/client` et le serveur dans `dist/server`. |
| `start`      | Demarre le serveur compile, qui sert aussi le client.                  |
| `typecheck`  | Verifie les types du client et du serveur.                             |

## Comment les deux moities communiquent

En developpement, le navigateur ne parle qu'au moteur, sur le port 5180. Les
requetes commencant par `/api` sont transmises au serveur, sur le port 3001.
Le navigateur ne voit donc qu'une seule origine : il n'y a aucune question de
CORS a regler, et le code client n'a pas d'URL d'API a configurer.

En production, il n'y a plus qu'un seul processus : le serveur Express sert
l'API **et** les fichiers compiles du client, avec un repli d'application
monopage sur toute route non prefixee par `/api`.

## Environnement

Copier `.env.example` en `.env`. Les variables sont lues et validees **une
seule fois, au demarrage** : une configuration incomplete arrete le serveur
immediatement, avec la liste de tout ce qui manque. Un serveur qui demarre mal
configure finit toujours par tomber, mais plus tard et moins clairement.

## Image Docker

```bash
docker build -t mon-site .
docker run -p 3001:3001 mon-site
```

L'image finale n'embarque ni la chaine de compilation, ni les dependances de
developpement, et le processus ne tourne pas en root. Une sonde de sante
interroge `/api/health`.
