---
'odoro': patch
---

Quand le port est pris, le serveur glisse vers le suivant au lieu de s arreter.

`EADDRINUSE` arretait la commande. C est le bon comportement pour un serveur de
production, dont le port fait partie du contrat ; c en est un mauvais pour un
serveur de developpement, ou le coupable est presque toujours une fenetre de
terminal oubliee. Il fallait chercher le processus, le tuer, relancer — pour un
resultat que la machine trouve seule.

Le port obtenu est annonce des qu il differe de celui demande : un serveur
ouvert ailleurs ferait recharger une page qui ne bougerait pas.

Seul un conflit de port fait glisser. Un port refuse pour une autre raison —
droits insuffisants, adresse inexistante — reste une erreur de configuration.

Deux serveurs lances sur le meme projet ne se disputent plus le cache des
dependances : l un effacait le dossier pendant que l autre y ecrivait. Le cas
est devenu courant, justement parce que le second demarre maintenant.
