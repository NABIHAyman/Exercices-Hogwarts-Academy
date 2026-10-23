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

/** Le jumeau runtime de SpellCategory, pour la garde isSpellCategory (exercice 6). */
export const SPELL_CATEGORIES: readonly SpellCategory[] = ["charm", "curse", "defense", "healing"];

/** Un sort du grimoire. */
export interface Spell extends Entity {
  name: string;
  category: SpellCategory;
  power: number; // jamais négatif (sera vérifié par un décorateur, exercice 4)
  minLevel: number; // niveau minimal exigé du lanceur (contrôlé à l'étape 9)
}

/** Un sort à créer : même logique que NewWizard. */
export type NewSpell = Omit<Spell, "id">;

// ---------------------------------------------------------------------------
// Événements (exercice 3) : une union DISCRIMINÉE par le champ littéral `type`.
// Chaque membre porte le même champ `type` avec une valeur littérale différente :
// il suffit de tester `event.type` pour que TypeScript réduise l'union au bon membre.
// ---------------------------------------------------------------------------

/** Un sorcier vient d'être inscrit. */
export interface WizardEnrolledEvent {
  type: "wizard-enrolled";
  wizardId: number;
  house: House;
}

/** Un sort vient d'être lancé : l'événement vedette de l'exercice 3. */
export interface SpellCastEvent {
  type: "spell-cast";
  wizardId: number;
  spellName: string;
}

/** Un sorcier vient de monter de niveau. */
export interface LevelUpEvent {
  type: "level-up";
  wizardId: number;
  newLevel: number;
}

/** Un sorcier vient d'être expulsé. */
export interface WizardExpelledEvent {
  type: "wizard-expelled";
  wizardId: number;
  reason: string;
}

/** Tout ce qui peut arriver dans l'académie : l'union des quatre événements. */
export type AcademyEvent = WizardEnrolledEvent | SpellCastEvent | LevelUpEvent | WizardExpelledEvent;

/** Les valeurs possibles du discriminant (accès indexé sur une union). */
export type AcademyEventType = AcademyEvent["type"];

/**
 * Exercice 3 : Extract<U, M> garde les membres de l'union U compatibles avec M.
 * EventOfType<"spell-cast"> = SpellCastEvent, calculé au lieu d'être recopié.
 */
export type EventOfType<K extends AcademyEventType> = Extract<AcademyEvent, { type: K }>;

/** Le miroir d'Extract : tous les événements SAUF les lancers de sort. */
export type NonSpellEvent = Exclude<AcademyEvent, { type: "spell-cast" }>;
