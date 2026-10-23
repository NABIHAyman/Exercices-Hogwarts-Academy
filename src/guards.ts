/**
 * guards.ts — Les gardes de type (exercice 6) : vérifier À L'EXÉCUTION qu'une valeur
 * inconnue a la forme attendue, et l'annoncer au compilateur (`value is T`).
 * C'est le pont entre le monde non typé (JSON, réseau, saisie) et nos types :
 * en entrée un unknown, en sortie un type précis — sans jamais passer par any.
 */
import {
  HOUSES,
  SPELL_CATEGORIES,
  type AcademyEvent,
  type House,
  type NewSpell,
  type NewWizard,
  type Spell,
  type SpellCastEvent,
  type SpellCategory,
  type Wizard,
} from "./types";

/** `value` est-il un objet (non null) dont on peut lire les clés ? Socle des autres gardes. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Exercice 6 : la chaîne doit être l'une des quatre maisons — pas n'importe quel string.
 * `some` compare à chaque House : pas besoin de cast, House est un sous-type de string.
 */
export function isHouse(value: unknown): value is House {
  return typeof value === "string" && HOUSES.some((house) => house === value);
}

/** Les champs communs à Wizard et NewWizard (tout sauf l'id). */
function hasWizardFields(value: Record<string, unknown>): boolean {
  return (
    typeof value.name === "string" &&
    isHouse(value.house) &&
    typeof value.level === "number" &&
    typeof value.active === "boolean"
  );
}

/** Un sorcier complet (avec id). */
export function isWizard(value: unknown): value is Wizard {
  return isRecord(value) && typeof value.id === "number" && hasWizardFields(value);
}

/** Un sorcier à créer (sans id) : ce qu'on accepte d'un import externe. */
export function isNewWizard(value: unknown): value is NewWizard {
  return isRecord(value) && hasWizardFields(value);
}

/** Même technique que isHouse, pour les catégories de sorts. */
export function isSpellCategory(value: unknown): value is SpellCategory {
  return typeof value === "string" && SPELL_CATEGORIES.some((category) => category === value);
}

/** Les champs communs à Spell et NewSpell. */
function hasSpellFields(value: Record<string, unknown>): boolean {
  return (
    typeof value.name === "string" &&
    isSpellCategory(value.category) &&
    typeof value.power === "number" &&
    typeof value.minLevel === "number"
  );
}

/** Un sort complet (avec id). */
export function isSpell(value: unknown): value is Spell {
  return isRecord(value) && typeof value.id === "number" && hasSpellFields(value);
}

/** Un sort à créer (sans id). */
export function isNewSpell(value: unknown): value is NewSpell {
  return isRecord(value) && hasSpellFields(value);
}

/** Garde sur l'union discriminée : idéale avec Array.filter (voir events.test.ts). */
export function isSpellCast(event: AcademyEvent): event is SpellCastEvent {
  return event.type === "spell-cast";
}

/**
 * Distinguer un sorcier d'un sort : l'opérateur `in` suffit à réduire l'union —
 * seuls les Wizard ont une `house`. Pas besoin de garde nommée pour un cas local.
 */
export function describe(item: Wizard | Spell): string {
  if ("house" in item) {
    return `Sorcier ${item.name} (${item.house}, niveau ${item.level})`;
  }
  return `Sort ${item.name} (${item.category}, puissance ${item.power})`;
}

/**
 * Fonction d'ASSERTION (`asserts value is T`) : si value est undefined elle lève,
 * sinon TypeScript considère value comme T pour tout le reste de la portée —
 * pas besoin de if autour de chaque usage.
 */
export function assertDefined<T>(value: T | undefined, message: string): asserts value is T {
  if (value === undefined) {
    throw new Error(message);
  }
}
