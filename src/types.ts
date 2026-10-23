/**
 * types.ts — Le modèle du domaine : les formes de données que tout le reste du projet manipule.
 * Ce fichier ne contient (presque) que des types : ils disparaissent à la compilation,
 * seule la constante HOUSES existera dans le JavaScript produit.
 */

/** Toute entité stockée dans un référentiel possède un identifiant numérique. */
export interface Entity {
  id: number;
}

/** Les quatre maisons de l'académie : un type littéral (union de chaînes). */
export type House = "Gryffindor" | "Slytherin" | "Ravenclaw" | "Hufflepuff";

/**
 * Les mêmes valeurs que House, mais à l'exécution : un type n'existe plus en JavaScript,
 * or les gardes de type (exercice 6) devront vérifier une chaîne reçue au runtime.
 * `readonly House[]` : TypeScript relie chaque élément au type House et interdit la mutation.
 */
export const HOUSES: readonly House[] = ["Gryffindor", "Slytherin", "Ravenclaw", "Hufflepuff"];

/** Un sorcier de l'académie. `extends Entity` : il hérite du champ id. */
export interface Wizard extends Entity {
  name: string;
  house: House;
  level: number;
  active: boolean;
}

/**
 * Ce qu'on fournit pour créer un sorcier : tout sauf l'id, attribué par le référentiel
 * (exercice 1). Omit<T, K> est un type utilitaire : il reconstruit T sans les clés K.
 */
export type NewWizard = Omit<Wizard, "id">;

/**
 * Les sorciers regroupés par maison (exercice 2) : Record<K, V> construit un objet
 * dont les clés sont exactement les membres de K — les quatre maisons, obligatoirement.
 */
export type WizardsByHouse = Record<House, Wizard[]>;

/** Les catégories de sorts : même technique de littéraux que House. */
export type SpellCategory = "charm" | "curse" | "defense" | "healing";

/** Un sort du grimoire. */
export interface Spell extends Entity {
  name: string;
  category: SpellCategory;
  power: number; // jamais négatif (sera vérifié par un décorateur, exercice 4)
  minLevel: number; // niveau minimal exigé du lanceur (contrôlé à l'étape 9)
}

/** Un sort à créer : même logique que NewWizard. */
export type NewSpell = Omit<Spell, "id">;
