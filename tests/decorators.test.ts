/**
 * decorators.test.ts — Tests des décorateurs de méthode, chacun isolé sur une petite
 * classe de test : on vérifie le comportement du décorateur, pas celui du référentiel
 * (qui a ses propres tests). Démarre avec ValidateSpellPower (exercice 4) ;
 * les autres décorateurs s'ajouteront aux étapes 7 et 9.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ValidateSpellPower } from "../src/decorators";

/** Une classe minimale : juste de quoi observer si la méthode décorée s'exécute. */
class Grimoire {
  readonly powers: number[] = [];

  @ValidateSpellPower
  addSpell(spell: { name: string; power: number }): void {
    this.powers.push(spell.power);
  }

  /** Premier argument sans champ power : le décorateur doit laisser passer. */
  @ValidateSpellPower
  rename(name: string): string {
    return name.toUpperCase();
  }
}

describe("@ValidateSpellPower (exercice 4)", () => {
  it("laisse passer une puissance positive ou nulle", () => {
    const grimoire = new Grimoire();
    grimoire.addSpell({ name: "Lumos", power: 0 });
    grimoire.addSpell({ name: "Protego", power: 50 });
    assert.deepEqual(grimoire.powers, [0, 50]);
  });

  it("rejette une puissance négative AVANT d'exécuter la méthode", () => {
    const grimoire = new Grimoire();
    assert.throws(() => grimoire.addSpell({ name: "Broken", power: -10 }), /Spell power cannot be negative/);
    assert.deepEqual(grimoire.powers, []); // le corps n'a jamais tourné
  });

  it("ignore un premier argument qui n'a pas de champ power", () => {
    const grimoire = new Grimoire();
    assert.equal(grimoire.rename("lumos"), "LUMOS");
  });
});
