# 001 — Cellules H3 en résolution 10

- **Statut :** accepté
- **Contexte :** le brouillard doit se lever à l'échelle d'un piéton, sans stocker des millions de
  cellules ni trahir la position exacte.
- **Décision :** résolution H3 **10** (arête ≈ 66 m, surface ≈ 0,015 km²). Paris intra-muros
  (≈ 105 km²) représente environ 7 000 cellules. La constante `H3_RESOLUTION` est exportée par
  `@duper/shared` et utilisée par le front comme par le back.
- **Conséquences :** changer de résolution impose une migration des cellules (`cellToParent` /
  `cellToChildren`) ; d'où une constante unique et aucune valeur en dur.
