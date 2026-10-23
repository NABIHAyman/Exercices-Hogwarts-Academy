/**
 * types.test.ts — Tests du modèle du domaine. Particularité : la plupart sont des
 * tests de TYPE, joués à la compilation. Une affectation qui compile prouve qu'un type
 * accepte ce qu'il doit ; `@ts-expect-error` prouve qu'il refuse ce qu'il doit
 * (si l'erreur attendue disparaît, c'est la compilation entière qui échoue).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HOUSES, type Entity, type House, type NewSpell, type NewWizard, type Spell, type Wizard } from "../src/types";

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
