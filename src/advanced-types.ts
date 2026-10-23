/**
 * advanced-types.ts — Types conditionnels, `infer` et types mappés.
 * Ces types n'existent qu'à la compilation : ils ne produisent AUCUN JavaScript.
 * Leur rôle : DÉRIVER des types à partir d'autres, au lieu de les récrire à la main.
 */
import type { Repository } from "./repository";
import type { AcademyEvent, Wizard } from "./types";

/** Un type conditionnel se lit comme un ternaire : vrai si T est (ou étend) Wizard. */
export type IsWizard<T> = T extends Wizard ? true : false;

/** Le type d'un membre d'un tableau : `infer U` capture ce qu'il y a entre les crochets. */
export type ElementType<T> = T extends readonly (infer U)[] ? U : never;

/** Déballe une promesse : Promise<Wizard[]> devient Wizard[] ; un non-promesse reste tel quel. */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

/** Réimplémentation du ReturnType natif : `infer R` capture le type de retour. */
export type ReturnOf<F> = F extends (...args: never[]) => infer R ? R : never;

/** Quelle entité un référentiel stocke-t-il ? EntityOf<Repository<Spell>> donne Spell. */
export type EntityOf<R> = R extends Repository<infer T> ? T : never;

/** Les événements qui portent un wizardId : un conditionnel appliqué à une union se DISTRIBUE. */
export type EventsWithWizard = AcademyEvent extends infer E ? (E extends { wizardId: number } ? E : never) : never;

/** Type mappé : chaque champ peut valoir null (utile pour un formulaire non rempli). */
export type Nullable<T> = { [K in keyof T]: T[K] | null };

/** Retire `readonly` de chaque champ : le `-` enlève un modificateur au lieu de l'ajouter. */
export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

/** Lecture seule EN PROFONDEUR : conditionnel + mappé + récursif, les trois à la fois. */
export type DeepReadonly<T> = T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;

/** Les clés de T dont la valeur est de type V. Pour Wizard et number : "id" | "level". */
export type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];
