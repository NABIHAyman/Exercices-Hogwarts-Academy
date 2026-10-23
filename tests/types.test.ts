/**
 * types.test.ts — Tests du modèle du domaine. Particularité : la plupart sont des
 * tests de TYPE, joués à la compilation. Une affectation qui compile prouve qu'un type
 * accepte ce qu'il doit ; `@ts-expect-error` prouve qu'il refuse ce qu'il doit
 * (si l'erreur attendue disparaît, c'est la compilation entière qui échoue).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  DeepReadonly,
  ElementType,
  EntityOf,
  IsWizard,
  KeysOfType,
  Mutable,
  Nullable,
  ReturnOf,
  UnwrapPromise,
} from "../src/advanced-types";
import type { WizardRepository } from "../src/repository";
import {
  HOUSES,
  type AcademyEvent,
  type Entity,
  type EventOfType,
  type House,
  type NewSpell,
  type NewWizard,
  type NonSpellEvent,
  type Spell,
  type Wizard,
} from "../src/types";

describe("House et HOUSES", () => {
  it("le type House n'accepte que les quatre maisons", () => {
    const valid: House = "Gryffindor";
    // @ts-expect-error "Durmstrang" n'est pas une House
    const invalid: House = "Durmstrang";
    assert.notEqual(valid, invalid);
  });

  it("HOUSES expose les quatre maisons à l'exécution, dans l'ordre du cours", () => {
    assert.deepEqual([...HOUSES], ["Gryffindor", "Slytherin", "Ravenclaw", "Hufflepuff"]);
    assert.equal(HOUSES.length, 4);
  });
});

describe("Wizard et NewWizard", () => {
  it("accepte un sorcier conforme au modèle, qui est aussi une Entity", () => {
    const harry: Wizard = { id: 1, name: "Harry Potter", house: "Gryffindor", level: 3, active: true };
    const entity: Entity = harry; // Wizard étend Entity : l'affectation compile
    assert.equal(entity.id, 1);
  });

  it("refuse un champ manquant ou une maison inconnue", () => {
    // @ts-expect-error il manque active
    const incomplete: Wizard = { id: 1, name: "Harry", house: "Gryffindor", level: 3 };
    // @ts-expect-error "Durmstrang" n'est pas une House
    const badHouse: Wizard = { id: 2, name: "Viktor", house: "Durmstrang", level: 5, active: true };
    assert.equal(incomplete.level, badHouse.level - 2);
  });

  it("NewWizard est un Wizard sans id (Omit)", () => {
    const data: NewWizard = { name: "Luna Lovegood", house: "Ravenclaw", level: 3, active: true };
    // @ts-expect-error l'id est refusé : c'est le référentiel qui l'attribuera (exercice 1)
    const withId: NewWizard = { id: 7, name: "Luna", house: "Ravenclaw", level: 3, active: true };
    assert.equal(data.name, "Luna Lovegood");
    // Nuance : le refus est purement au niveau du TYPE ; à l'exécution la propriété existe.
    assert.equal("id" in withId, true);
  });
});

describe("Spell et NewSpell", () => {
  it("accepte un sort conforme, refuse une catégorie inconnue", () => {
    const lumos: Spell = { id: 1, name: "Lumos", category: "charm", power: 5, minLevel: 1 };
    // @ts-expect-error "potion" n'est pas une SpellCategory
    const badCategory: NewSpell = { name: "Polynectar", category: "potion", power: 10, minLevel: 4 };
    assert.equal(lumos.category, "charm");
    assert.equal(badCategory.minLevel, 4);
  });
});

describe("événements : union discriminée, Extract et Exclude (exercice 3)", () => {
  it("EventOfType extrait de l'union le membre voulu", () => {
    const cast: EventOfType<"spell-cast"> = { type: "spell-cast", wizardId: 1, spellName: "Lumos" };
    const levelUp: EventOfType<"level-up"> = { type: "level-up", wizardId: 1, newLevel: 4 };
    assert.equal(cast.spellName, "Lumos");
    assert.equal(levelUp.newLevel, 4);
  });

  it("NonSpellEvent exclut les lancers de sort", () => {
    const other: NonSpellEvent = { type: "level-up", wizardId: 1, newLevel: 2 };
    const cast: EventOfType<"spell-cast"> = { type: "spell-cast", wizardId: 1, spellName: "Lumos" };
    // @ts-expect-error un lancer de sort n'est pas un NonSpellEvent
    const wrong: NonSpellEvent = cast;
    assert.deepEqual([other.type, wrong.type], ["level-up", "spell-cast"]);
  });

  it("le discriminant `type` réduit l'union dans un switch exhaustif", () => {
    // Dans chaque case, TypeScript SAIT quel membre de l'union est en main :
    // event.house, event.spellName… compilent sans vérification supplémentaire.
    function describeEvent(event: AcademyEvent): string {
      switch (event.type) {
        case "wizard-enrolled":
          return `inscription (${event.house})`;
        case "spell-cast":
          return `sort ${event.spellName}`;
        case "level-up":
          return `niveau ${event.newLevel}`;
        case "wizard-expelled":
          return `expulsion (${event.reason})`;
      }
    }
    assert.equal(describeEvent({ type: "spell-cast", wizardId: 1, spellName: "Lumos" }), "sort Lumos");
    assert.equal(describeEvent({ type: "wizard-expelled", wizardId: 2, reason: "duel" }), "expulsion (duel)");
  });
});

describe("types conditionnels et infer (advanced-types.ts)", () => {
  it("EntityOf retrouve l'entité stockée par un référentiel (infer)", () => {
    const wizard: EntityOf<WizardRepository> = { id: 1, name: "Harry", house: "Gryffindor", level: 3, active: true };
    const check: Wizard = wizard; // compile : EntityOf<WizardRepository> EST Wizard
    assert.equal(check.name, "Harry");
  });

  it("ElementType, UnwrapPromise, ReturnOf et IsWizard capturent avec infer", () => {
    const element: ElementType<Wizard[]> = { id: 1, name: "Luna", house: "Ravenclaw", level: 3, active: true };
    const unwrapped: UnwrapPromise<Promise<number>> = 42;
    const untouched: UnwrapPromise<string> = "pas une promesse"; // branche « sinon » du conditionnel
    const returned: ReturnOf<() => string> = "ok";
    const isWizard: IsWizard<Wizard> = true;
    const isNotWizard: IsWizard<Spell> = false;
    assert.deepEqual(
      [element.level, unwrapped, untouched, returned, isWizard, isNotWizard],
      [3, 42, "pas une promesse", "ok", true, false],
    );
  });

  it("KeysOfType extrait les clés numériques de Wizard", () => {
    const keys: KeysOfType<Wizard, number>[] = ["id", "level"];
    // @ts-expect-error "name" n'est pas une clé numérique de Wizard
    const wrong: KeysOfType<Wizard, number> = "name";
    assert.deepEqual([...keys, wrong], ["id", "level", "name"]);
  });

  it("Nullable, Mutable et DeepReadonly transforment champ par champ (types mappés)", () => {
    // Nullable : un formulaire vide est représentable sans tricher avec undefined.
    const draft: Nullable<NewWizard> = { name: null, house: null, level: null, active: null };
    // Mutable retire les readonly que Readonly avait posés.
    const editable: Mutable<Readonly<Spell>> = { id: 1, name: "Lumos", category: "charm", power: 5, minLevel: 1 };
    editable.power = 10; // compile : le readonly a été retiré
    const config: DeepReadonly<{ academy: { name: string } }> = { academy: { name: "Hogwarts" } };
    // @ts-expect-error DeepReadonly fige aussi les champs PROFONDS
    config.academy.name = "Durmstrang";
    assert.deepEqual([draft.name, editable.power, config.academy.name], [null, 10, "Durmstrang"]);
  });
});
