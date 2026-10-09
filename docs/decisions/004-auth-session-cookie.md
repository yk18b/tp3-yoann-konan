# 004 — Authentification email + mot de passe, session en cookie

- **Statut :** accepté
- **Décision :** mot de passe haché avec **argon2id** ; session stockée en base (`sessions`) et
  référencée par un cookie `httpOnly`, `SameSite=Lax`, `Secure` en production. Pas de JWT.
- **Conséquences :** la déconnexion révoque la session côté serveur. Les routes mutantes sont
  protégées contre le CSRF par `SameSite` et un contrôle de l'en-tête `Origin`. Un compte de démo
  est créé par le seed et documenté dans le README.
