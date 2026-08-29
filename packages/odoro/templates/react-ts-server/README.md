# Application Odoro — client et serveur

Une application monopage React et une API bâtie sur `@odoro-cli/server`, dans le
même dépôt.

```
client/            interface, servie par Odoro en developpement
server/
  src/main.ts      assemble les modules, rien d'autre
  src/modules/     un dossier par module — commencez par `health/`
```

## Demarrer

```sh
cp .env.example .env
npm install
npm run dev
```

Le client ecoute sur <http://localhost:5180> et transmet au serveur tout appel
commencant par `/api`. Le navigateur ne voit donc qu'une seule origine, et
aucune question de CORS ne se pose en developpement.

## La base de donnees

**PostgreSQL, heberge, et rien d'autre.** Il n'y a pas de base locale : l'URL
pointe sur une base joignable par le reseau.

```sh
odoro db:create            # provisionne une base et ecrit .env
# ou collez votre propre URL dans .env :
DATABASE_URL=postgres://utilisateur:motdepasse@hote:5432/base?sslmode=require
```

Tant qu'elle est absente, **le client demarre quand meme** et le serveur repond
`503` sur `/api/ready` en disant precisement ce qui manque. On voit donc
l'interface des la premiere minute, et on sait ce qu'il reste a faire.

## Ecrire un module

`server/src/modules/health/` est l'exemple. Un module declare son nom, ce dont
il a besoin, les services qu'il enregistre et les routes qu'il expose — et
`main.ts` ne fait que dire lesquels sont actifs.

```ts
export const billingModule = defineModule({
  name: 'billing',
  requires: ['auth'],
  register: (c) => c.register('billingService', createBillingService),
  routes: billingRoutes,
})
```

Le noyau resout l'ordre de chargement depuis `requires`, detecte les cycles, et
refuse de demarrer si une dependance manque. Activer ou desactiver un module
tient donc en une ligne dans `main.ts`.

## Deux points de controle, qui ne disent pas la meme chose

| Route         | Question                        | Qui l'interroge                                  |
| ------------- | ------------------------------- | ------------------------------------------------ |
| `/api/health` | Le processus vit-il ?           | L'orchestrateur, pour decider de redemarrer      |
| `/api/ready`  | Le service peut-il travailler ? | Le repartiteur, pour decider d'envoyer du trafic |

Les confondre donne l'un des deux defauts : un service qui redemarre en boucle
pendant un incident de base, ou un repartiteur qui envoie du trafic a un
service incapable de repondre.

## Compiler et deployer

```sh
npm run build      # client dans dist/client, serveur dans dist/server
npm start          # sert les deux depuis un seul processus
```

Le `Dockerfile` est multi-etapes : les dependances de compilation ne se
retrouvent pas dans l'image finale, qui tourne sous un utilisateur sans
privileges.

## Variables d'environnement

Voir `.env.example`, commente ligne par ligne. En production, ce qui manque
arrete le demarrage avec un message qui **liste tout d'un coup** — plutot
qu'une suite de redemarrages, une variable a la fois.

`.env` n'est jamais versionne.
