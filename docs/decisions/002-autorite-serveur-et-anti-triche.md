# 002 — Le serveur fait autorité sur le brouillard

- **Statut :** accepté
- **Contexte :** dévoiler la carte doit refléter de vrais déplacements, et un pin ne doit être
  posé que dans une zone dévoilée. Un client peut être modifié.
- **Décision :** le client envoie des positions brutes. Le serveur :
  1. rejette les positions hors des arrondissements de Paris (GeoJSON officiel dans `shared`) ;
  2. rejette (422) une vitesse irréaliste par rapport à la position précédente, **sauf si
     `ALLOW_SIMULATION=true`** (dev et démo) ;
  3. calcule et enregistre les cellules ;
  4. recalcule la cellule de chaque pin et refuse (403) si elle n'est pas dévoilée.
- **Conséquences :** le front ne calcule jamais de cellule « officielle ». Le seuil de vitesse
  est une constante de `shared`. En démo, `ALLOW_SIMULATION=true` est obligatoire côté API.
