# @odoro-cli/server-billing

## 0.2.0

### Minor Changes

- 34b0e1e: `POST /api/billing/cancel` : le propriétaire d'une équipe résilie à la fin de la période payée, par une demande signée à Odoro (`odoroBilling().cancel`) ; `resiliee` dans l'état de l'équipe. `seatsAllowMember` borne une équipe par ses sièges payés (à donner à `createTeamsModule` comme `canAddMember`). Une facture remboursée chez l'encaisseur se lit `refunded`, avec `rembourseCentimes`. Ces colonnes viennent avec la capacité `billing` 1.1.0 ; une base plus ancienne les lit vides.
