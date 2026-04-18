# Size Intelligence Studio

Application desktop local-first pour recommander des tailles de vêtements à partir d’un profil corporel stable et de guides de tailles normalisés.

## État de la base initiale

Le dépôt fourni contenait uniquement `.gitattributes` et un fichier HTML `rapport de Mesures Corporelles.html`. Ce fichier est conservé comme fixture/import source, mais l’application ne l’utilise pas directement à l’exécution: elle le parse puis persiste un profil canonique.

## Stack

- Tauri 2 pour l’application desktop Windows-first.
- React 19, TypeScript strict, Vite.
- Tailwind CSS 4 et composants shadcn/ui internalisés.
- Zod et React Hook Form pour les validations.
- SQLite côté Tauri, schéma Drizzle et migration SQL versionnée.
- Zustand pour l’état applicatif local.
- Vitest pour unit/integration, Playwright pour le parcours web-dev.

## Installation

```bash
pnpm install
```

Dans l’environnement Codex local, si Node échoue à cause d’un environnement Windows minimal, préfixer les commandes par:

```cmd
set SystemRoot=C:\WINDOWS&& set WINDIR=C:\WINDOWS&& set USERPROFILE=C:\Users\cadet&& set APPDATA=C:\Users\cadet\AppData\Roaming&& set LOCALAPPDATA=C:\Users\cadet\AppData\Local&& set TEMP=C:\Users\cadet\AppData\Local\Temp&& set TMP=C:\Users\cadet\AppData\Local\Temp&& pnpm test
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm tauri:dev
pnpm tauri:build
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm db:generate
pnpm db:migrate
pnpm lint
pnpm format
```

## Utilisation

1. Ouvrir `Body Profile`.
2. Importer `rapport de Mesures Corporelles.html`.
3. Vérifier la prévisualisation, puis cliquer `Valider et persister`.
4. Compléter les mesures absentes, notamment la taille corporelle et la longueur de pied si nécessaire.
5. Ouvrir `Recommendation Studio`, sélectionner catégorie, guide, coupe et aisance.
6. Lancer `Calculer et sauvegarder`.
7. Consulter `Historique`, `Comparaison`, `Diagnostics` ou exporter les résultats.

## Vérité des données

L’application ne contient pas de standards officiels inventés. Les guides embarqués sont des échantillons marqués `sample`; ils servent à tester le moteur. Les vrais guides doivent être saisis ou importés avec provenance et incertitude.

## Desktop

La configuration Tauri est dans `src-tauri`. La persistance SQLite est locale et versionnée par `drizzle/0000_initial.sql`. Le pont Tauri expose uniquement:

- `load_app_state`
- `save_app_state`

Ces commandes synchronisent un snapshot applicatif validé et alimentent aussi les tables normalisées pour diagnostic et évolution future.

Voir `docs/architecture.md`, `docs/data-model.md`, `docs/recommendation-strategy.md` et `docs/imports.md`.
