# Architecture

## Découpage

- `src/domain`: logique métier indépendante de React.
- `src/services`: import, export, recommandation et persistance.
- `src/db`: schéma Drizzle, repository et mappers.
- `src/features`: pages applicatives.
- `src/components`: shell, composants métier et composants shadcn/ui internalisés.
- `src-tauri`: app desktop, pont SQLite et migration initiale.

## Flux de données

```mermaid
flowchart LR
  HTML["HTML de mesures"] --> Importer["HTML importer"]
  Importer --> Profile["BodyProfile canonique Zod"]
  CSV["CSV/JSON guide"] --> GuideImporter["Guide importer"]
  GuideImporter --> Guide["BrandSizeGuide canonique"]
  Profile --> Engine["Recommendation Engine"]
  Guide --> Engine
  Preferences["Comfort Preferences"] --> Engine
  Engine --> Result["RecommendationResult expliqué"]
  Result --> Store["AppState validé"]
  Store --> Tauri["Commandes Tauri"]
  Tauri --> SQLite["SQLite local"]
```

## Principes

- Le moteur de recommandation ne dépend pas de React.
- Les imports ne polluent pas le domaine: ils produisent des objets validés.
- Les données sensibles restent locales.
- Les guides sample sont explicitement marqués et diminuent la confiance.
- Les conversions de tailles génériques ne sont pas traitées comme exactes.

## Persistance

En web-dev, l’état est stocké dans `localStorage` pour permettre les tests Playwright sans Tauri. En desktop, Tauri écrit dans SQLite sous le dossier de données local utilisateur. Les deux chemins utilisent le même `AppState` Zod.
