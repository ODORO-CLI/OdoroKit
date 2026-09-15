---
'@odoro-cli/server': minor
---

Un gestionnaire peut poser un cookie.

Le contexte gagne `cookies`, avec `set(name, value, options)` et `clear(name)`.
`httpOnly` et `sameSite: 'lax'` sont les valeurs par defaut, et `secure` suit le
mode : actif en production, inactif ailleurs — ou il n'y a pas de certificat, et
ou un cookie `secure` ne reviendrait jamais.

## Pourquoi le gestionnaire ne recoit pas la reponse

Tout ce qu'un gestionnaire produit d'autre est sa valeur de retour, validee
contre un schema. Un cookie ne peut pas l'etre : c'est un en-tete, et il s'ecrit
avant le corps. Lui passer l'objet de reponse entier pour en poser un ouvrirait
la porte a un gestionnaire qui ecrit son propre statut, son propre corps, et
echappe au contrat de sortie.

Les cookies sont donc collectes, et c'est le montage qui les ecrit. Un
gestionnaire enonce une intention ; il ne pilote pas le transport.

```ts
route({
  name: 'auth.login',
  method: 'POST',
  path: '/api/auth/login',
  auth: 'public',
  handler: ({ cookies }) => {
    cookies.set('session', id, { maxAge: 60 * 60 * 24 * 30 })
  },
})
```

C'est ce qui manquait pour qu'une authentification se tienne : sans cela, la
seule voie restante etait un jeton range dans `localStorage`, que le premier
script injecte dans la page sait lire.
