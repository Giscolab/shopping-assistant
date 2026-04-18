# Recommendation Strategy

Le moteur est déterministe. Il ne fait pas de ML.

## Étapes

1. Sélectionner la taxonomie de catégorie.
2. Lire les dimensions corporelles pertinentes.
3. Calculer une cible par dimension:

```text
target = body_dimension
  + base_ease
  + fit_adjustment
  + ease_preference_adjustment
  + layering_adjustment
  - stretch_relaxation
  + shrinkage_bias
```

4. Comparer chaque cible aux plages de la ligne de guide.
5. Pondérer par importance dimensionnelle.
6. Pénaliser les mesures manquantes, guides incomplets, incertitude et données sample.
7. Retourner taille primaire, alternatives proches, confiance, explications, warnings et hypothèses.

## Modules purs

- `src/domain/sizing/ease.ts`: calcul de cible et biais rétrécissement.
- `src/domain/sizing/rules.ts`: scoring de plage et labels dimensionnels.
- `src/domain/sizing/weights.ts`: pondération et dimensions dominantes.
- `src/domain/sizing/confidence.ts`: score candidat, confiance et seuil d’alternatives proches.

Le moteur `src/domain/recommendation/engine.ts` consomme ces modules. La logique ne vit pas dans les composants React.

## Limites assumées

- Les guides sample ne sont pas des standards.
- Les plages importées peuvent représenter mesures corps ou vêtement selon la source; l’application conserve cette hypothèse dans les explications.
- Sans source de marque complète, la confiance est volontairement conservatrice.
- Les longueurs de manches, entrejambes et épaules ne sont pas inférées si elles ne sont pas fournies.
