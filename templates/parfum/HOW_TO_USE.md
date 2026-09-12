# ODORO — comment utiliser ce dossier

Ce dossier est le projet complet : code, assets, sources des assets et
documentation. Il se suffit à lui-même.

1. `npm install` puis `PORT=3001 npm run dev`.
2. Tout le texte est dans `src/data/mocks/home.ts`. Les longueurs sont écrites
   pour les boîtes de l'artboard 1440×800 : rester à un ou deux caractères près
   (contraintes listées en tête du fichier).
3. Pour changer un flacon de la collection : partir d'un packshot à **étiquette
   vierge**, le détourer, puis `python3 .claude/scripts/assets/label-packshot.py`.
   Ne jamais laisser un générateur écrire le texte (ADR-0050).
4. Pour changer le flacon 3D : `assets-source/README.md`.
5. Avant de toucher au code : `obsidian/workflows/ai-agent-guide.md`.

Ce fichier remplace le HOW_TO_USE du template Artefakt d'origine.
