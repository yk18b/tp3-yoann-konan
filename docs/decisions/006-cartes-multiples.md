# 006 — Schéma prêt pour les cartes partagées

- **Statut :** accepté
- **Décision :** dès la phase 1, tables `maps` et `map_members`, et `map_id` sur `cells` et
  `places`. Chaque utilisateur reçoit une carte personnelle (`is_personal = true`) à l'inscription.
- **Conséquences :** toutes les routes sont préfixées par `/api/maps/:mapId` et vérifient
  l'appartenance. La phase 2 (partage) n'ajoute que des routes d'invitation, sans migration
  destructive.
