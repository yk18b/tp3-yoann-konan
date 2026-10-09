# 003 — Abstraction `LocationSource` et mode simulation

- **Statut :** accepté
- **Contexte :** la démo et les tests e2e doivent fonctionner sans se déplacer.
- **Décision :** le front ne lit la position qu'à travers une interface `LocationSource`
  (`subscribe(callback) → unsubscribe`). Deux implémentations :
  `BrowserGeolocationSource` (`watchPosition`) et `SimulatedSource` (déplacement au clavier,
  téléportation au clic, rejeu d'un tracé GeoJSON de `public/sim-routes/`). On active la
  simulation avec `?sim=1` ou `VITE_GPS_MODE=sim`.
- **Conséquences :** Playwright pilote `SimulatedSource` : les tests sont déterministes. Le mode
  simulation n'a d'effet côté serveur que si `ALLOW_SIMULATION=true`.
