# Imports

## Profil HTML

Le parseur extrait les blocs `.measure-box`, lit `.label`, `.value`, `.unit`, puis mappe les labels français/anglais vers les clés canoniques:

- `Poids` / `Weight` -> `weightKg`
- `Graisse Corporelle` / `Body Fat` -> `bodyFatPercent`
- `Poitrine` / `Chest` -> `chestCm`
- `Ventre` / `Stomach` -> `stomachCm`
- `Taille` / `Waist` -> `waistCm`
- `Fessiers` / `Seat/Hips` -> `seatHipsCm`
- bras, cuisses et mollets gauche/droite

Le fichier source n’est pas requis après import.

## Guide CSV

Colonnes minimales:

```csv
brand,guide_name,garment_category,size_system,fabric_stretch,size_label,chest_cm_min,chest_cm_max,waist_cm_min,waist_cm_max
Local Brand,Tshirt Guide,tshirts,INT,medium,S,88,96,78,88
Local Brand,Tshirt Guide,tshirts,INT,medium,M,96,104,86,96
```

Dimensions reconnues:

- `chest_cm_min/max/target`
- `waist_cm_min/max/target`
- `stomach_cm_min/max/target`
- `seat_hips_cm_min/max/target`
- `biceps_cm_min/max/target`
- `forearm_cm_min/max/target`
- `thigh_cm_min/max/target`
- `calf_cm_min/max/target`
- `foot_length_mm_min/max/target`
- `height_cm_min/max/target`

## Guide JSON

Le JSON peut contenir directement:

```json
{
  "brand": { "id": "brand_1", "name": "Marque", "...": "..." },
  "guide": { "id": "guide_1", "brandId": "brand_1", "rows": [] }
}
```

Les données sont validées par Zod avant persistance.
