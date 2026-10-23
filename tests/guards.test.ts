/**
 * guards.test.ts — Tests des gardes de type (exercice 6).
 * Les gardes travaillent sur des unknown : chaque test vérifie l'acceptation du cas
 * valide ET le refus des cas tordus (triangulation), car une garde trop laxiste
 * laisserait entrer des données corrompues dans le système typé.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertDefined,
  describe as describeItem,
  isHouse,
  isNewWizard,
  isSpell,
  isSpellCast,
  isWizard,
} from "../src/guards";
import type { AcademyEvent, House } from "../src/types";

describe("isHouse (exercice 6)", () => {
  it("accepte les quatre maisons", () => {
    for (const house of ["Gryffindor", "Slytherin", "Ravenclaw", "Hufflepuff"]) {
      assert.equal(isHouse(house), true, house);
    }
  });

  it("refuse une chaîne inconnue et tout ce qui n'est pas une chaîne", () => {
    assert.equal(isHouse("Durmstrang"), false);
    assert.equal(isHouse("gryffindor"), false); // la casse compte
    assert.equal(isHouse(42), false);
    assert.equal(isHouse(null), false);
    assert.equal(isHouse(undefined), false);
  });

  it("affine un unknown en House dans un if (le rôle de `value is House`)", () => {
    const value: unknown = JSON.parse('"Ravenclaw"');
    if (isHouse(value)) {
      const house: House = value; // compile : dans cette branche, value EST une House
      assert.equal(house, "Ravenclaw");
    } else {
      assert.fail("Ravenclaw aurait dû être reconnue");
    }
  });
});

describe("isWizard / isNewWizard", () => {
  const valid = { id: 1, name: "Harry", house: "Gryffindor", level: 3, active: true };

  it("accepte un sorcier complet", () => {
    assert.equal(isWizard(valid), true);
    assert.equal(isNewWizard(valid), true); // l'id en trop ne gêne pas (typage structurel)
  });

  it("isNewWizard accepte sans id, isWizard l'exige", () => {
    const { id: _id, ...withoutId } = valid;
    assert.equal(isNewWizard(withoutId), true);
    assert.equal(isWizard(withoutId), false);
  });

  it("refuse une maison inconnue, un mauvais type, un champ manquant", () => {
    assert.equal(isWizard({ ...valid, house: "Durmstrang" }), false);
    assert.equal(isWizard({ ...valid, level: "3" }), false); // "3" est une chaîne, pas un nombre
    const { active: _active, ...withoutActive } = valid;
    assert.equal(isWizard(withoutActive), false);
  });

  it("refuse ce qui n'est pas un objet", () => {
    assert.equal(isWizard(null), false);
    assert.equal(isWizard("Harry"), false);
    assert.equal(isWizard([]), false);
  });
});

describe("isSpell", () => {
  const valid = { id: 1, name: "Lumos", category: "charm", power: 5, minLevel: 1 };

  it("accepte un sort complet", () => {
    assert.equal(isSpell(valid), true);
  });

  it("refuse une catégorie inconnue, un power non numérique, un champ manquant", () => {
    assert.equal(isSpell({ ...valid, category: "potion" }), false);
    assert.equal(isSpell({ ...valid, power: "5" }), false);
    const { minLevel: _minLevel, ...withoutMinLevel } = valid;
    assert.equal(isSpell(withoutMinLevel), false);
  });
});

describe("isSpellCast (garde sur l'union discriminée)", () => {
  it("réduit AcademyEvent à SpellCastEvent, notamment dans un filter", () => {
    const events: AcademyEvent[] = [
      { type: "spell-cast", wizardId: 1, spellName: "Lumos" },
      { type: "level-up", wizardId: 1, newLevel: 4 },
      { type: "spell-cast", wizardId: 2, spellName: "Protego" },
    ];
    const casts = events.filter(isSpellCast);
    // casts est un SpellCastEvent[] : spellName accessible sans vérification.
    assert.deepEqual(
      casts.map((e) => e.spellName),
      ["Lumos", "Protego"],
    );
  });
});

describe("describe (réduction par l'opérateur in)", () => {
  it("distingue un sorcier d'un sort", () => {
    assert.equal(
      describeItem({ id: 1, name: "Harry", house: "Gryffindor", level: 3, active: true }),
      "Sorcier Harry (Gryffindor, niveau 3)",
    );
    assert.equal(
      describeItem({ id: 1, name: "Lumos", category: "charm", power: 5, minLevel: 1 }),
      "Sort Lumos (charm, puissance 5)",
    );
  });
});

describe("assertDefined (fonction d'assertion)", () => {
  it("lève une erreur sur undefined, avec le message fourni", () => {
    assert.throws(() => assertDefined(undefined, "sorcier introuvable"), /sorcier introuvable/);
  });

  it("laisse passer toute valeur définie, y compris 0, et affine le type", () => {
    // `find` renvoie number | undefined sans que le compilateur connaisse la réponse :
    // contrairement à `const maybe = 0`, l'affinage ne peut venir que d'assertDefined.
    const maybe: number | undefined = [0, 1].find((n) => n === 0);
    assertDefined(maybe, "zéro est une valeur");
    const sure: number = maybe; // compile seulement si le type a été affiné en number
    assert.equal(sure, 0);
  });
});
