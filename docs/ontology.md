# Ontologie Menswear V1

L’ontologie se trouve dans `src/domain/ontology`.

## Fichiers

- `garments.json`: familles, catégories calculables, sous-catégories, mesures requises, priorités et sorties attendues.
- `cuts.json`: modificateurs de coupe par dimension.
- `ease.json`: profils d’aisance par usage.
- `materials.json`: profils matière, stretch, risque de rétrécissement et pénalité d’incertitude.
- `measurement-mapping.json`: mapping FR/EN vers dimensions canoniques et dimensions guide-only.

## Portée

La v1 couvre uniquement les vêtements homme utiles au sizing: `tshirt`, `polo`, `chemise`, `pull`, `hoodie`, `veste_legere`, `manteau`, `jean`, `pantalon`, `short`, `boxer`, `slip`.

Des catégories additionnelles comme `chino`, `cargo`, `parka`, `doudoune` et `chaussette` existent pour préparer l’extension, mais la garantie v1 porte sur la liste ci-dessus.

## Vérité des données

L’ontologie est un modèle interne orienté calcul. Elle ne représente pas un standard officiel, ni un guide de marque.
