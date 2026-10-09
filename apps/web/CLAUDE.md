# apps/web — conventions front

- Organisation par fonctionnalité : `src/features/<feature>/`. La carte (`src/map/`) ne contient
  que l'intégration MapLibre : sources, couches, événements.
- Pas de logique métier dans les composants : la mettre dans des fonctions pures ou des hooks,
  testées à part.
- La position passe **toujours** par l'interface `LocationSource` (`src/location/`) :
  `BrowserGeolocationSource` en usage réel, `SimulatedSource` si `?sim=1` ou
  `VITE_GPS_MODE=sim`. Aucun composant n'appelle `navigator.geolocation` directement.
- Le brouillard est un polygone couvrant le monde, troué par les cellules dévoilées
  (`cellsToMultiPolygon`), dans une couche `fill` MapLibre. Il est recalculé à partir de l'état
  serveur, jamais d'un calcul local seul.
- Tuiles : OpenFreeMap (sans clé). Ne pas ajouter de fournisseur qui demande une clé.
- Appels API via `src/api/client.ts`, typé par les schémas de `@duper/shared` ; `fetch` direct
  interdit ailleurs. Cookies de session : `credentials: 'include'`.
- Hors ligne : les positions non envoyées attendent dans une file IndexedDB (`src/offline/`).
- Accessibilité : les contrôles de la carte et du formulaire de pin sont utilisables au clavier.
