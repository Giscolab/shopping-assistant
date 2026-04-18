# Data Model

## Tables principales

- `body_profiles`: profil corporel canonique et snapshot JSON.
- `body_measurements`: mesures normalisées avec provenance.
- `body_profile_versions`: versions successives des profils.
- `comfort_preferences`: préférences par profil et catégorie.
- `garment_categories`, `garment_types`: taxonomie métier.
- `size_systems`, `size_labels`: référentiel de labels et incertitude.
- `brands`: marques et statut sample.
- `brand_size_guides`: guide par marque/catégorie/système.
- `brand_size_guide_rows`: tailles candidates.
- `brand_size_guide_measurements`: plages dimensionnelles normalisées.
- `fabric_profiles`, `fit_profiles`: profils textiles et de coupe.
- `recommendation_runs`, `recommendation_results`: simulations et résultats.
- `import_jobs`, `import_sources`: journal et provenance.
- `app_settings`: préférences et snapshot applicatif.
- `ontology_bundles`, `ontology_families`, `ontology_garment_categories`, `ontology_measurement_mappings`, `ontology_priority_dimensions`: extension additive pour persister l’ontologie.
- `sizing_rule_sets`, `sizing_rule_dimensions`: extension additive pour versionner les règles de sizing.
- `brand_guide_assumptions`, `brand_guide_quality_checks`, `diagnostic_events`: diagnostics et qualité des guides.

## Unités

Les mesures corporelles sont canoniques:

- longueurs et circonférences en centimètres;
- longueur de pied en millimètres;
- poids en kilogrammes;
- pourcentages entre `0` et `100`.

## Champs manquants

Le HTML fourni ne contient pas la taille corporelle ni la longueur de pied. Les champs existent dans le schéma mais peuvent être `null` jusqu’à saisie manuelle. Le moteur signale ces absences et baisse la confiance quand elles sont utiles.

## Migration additive v2

`drizzle/0001_flaky_scrambler.sql` ajoute les tables d’ontologie, règles et diagnostics. La migration est additive et ne renomme aucune table existante.
