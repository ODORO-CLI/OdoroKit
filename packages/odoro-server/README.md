# odoro-server

Socle back-end Odoro : le **noyau** seulement. Les modules fonctionnels —
authentification, compte, fichiers — se montent dessus et vivent ailleurs.

## Decisions arretees

| Point | Choix | Raison courte |
| --- | --- | --- |
| ORM | Drizzle, couche unique | Une couche de depot abstraite ferait ecrire chaque module deux fois, et fuirait au premier `jsonb`. |
| Moteurs tenus | Postgres (niveau 1), SQLite (niveau 2) | Un moteur non teste en integration continue ne figure pas dans le tableau. |
| Schemas | Un fichier par dialecte | `pgTable` et `sqliteTable` sont des constructeurs distincts : « multi-dialecte » veut dire N schemas, pas un schema portable. |
| Authentification | Better Auth, encapsule | Voir la reserve ci-dessous. |
| Redis | Optionnel, repli en memoire | Le plus petit des projets ne doit pas exiger une dependance d'infrastructure. |
| Multi-tenant | Des le premier jour | Des invitations et des donnees partagees : la portee doit exister avant la premiere requete ecrite. |

**La reserve sur Better Auth.** L'encapsulation stabilise les sites d'appel.
Elle ne rend pas la librairie interchangeable : le verrouillage est dans le
schema — ses tables, son format de cookie — et non dans la surface d'appel. En
sortir serait une migration de donnees, pas un changement de code.

## Ce que le noyau fournit

### `createContainer()`

Conteneur type, sans decorateurs ni reflexion. Le type s'accumule a chaque
`register` : `c.get('mailer')` rend le bon type sans annotation, et une cle
inconnue est une erreur de compilation.

Deux refus valent d'etre connus :

- **Un cycle** est impossible a ecrire — une fabrique ne voit que les cles deja
  enregistrees.
- **Une dependance captive** est refusee : un singleton qui lirait un service
  par requete capturerait la premiere requete et la garderait pour toutes les
  suivantes. Le resolveur confie a un singleton refuse donc ces cles, y compris
  dans une lecture differee.

### `loadConfig()`

L'environnement, valide par Zod, **entierement au demarrage**. Le rapport liste
tous les problemes d'un coup. Les valeurs par defaut n'existent qu'hors
production : en production, ce qui n'est pas declare fait echouer le demarrage.

`process.env` ne se lit qu'ici — une regle ESLint le fait echouer partout
ailleurs.

### `defineModule()` / `orderModules()`

Un module declare son nom, ses dependances, ses services et ses routes. Le
noyau resout l'ordre, detecte les cycles, et refuse de demarrer si une
dependance manque ou si le moteur n'offre pas une capacite exigee.

### Erreurs

Hierarchie explicite, traduite en `application/problem+json` (RFC 9457). En
production, une erreur imprevue rend un identifiant de correlation et **rien
d'autre** : ni trace, ni message de pilote, ni nom de table ou de contrainte.

### Journal

Pino, JSON structure, identifiant de correlation propage par
`AsyncLocalStorage`. La liste d'expurgation couvre les en-tetes
d'autorisation, les cookies, les mots de passe, les jetons, les secrets et les
numeros de carte — ecrite avant le premier incident, pas apres.

### `route()`

Une declaration, quatre consommateurs : le montage Express, le typage du
handler, le client TypeScript du front, et la specification OpenAPI. La garde
`auth` est **obligatoire** : ecrire une route oblige a decider si elle est
publique.

`findOpenMutations()` repere les routes mutatives publiques sans politique.
Cherchees a l'oeil, elles ne se trouvent jamais : elles ne se distinguent des
autres que par l'absence d'un champ.

## Variables d'environnement

Voir `.env.example`. Les obligatoires en production : `DATABASE_URL`,
`SESSION_SECRET` (32 caracteres au moins), `APP_URL`.

## Etat

Phase 1 terminee : conteneur, configuration, modules, erreurs, journal,
definition de route, assemblage Express. 64 tests.

Phase 2 (persistance) a suivre.
