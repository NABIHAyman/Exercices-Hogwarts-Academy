/**
 * decorators.test.ts — Tests des décorateurs de méthode, chacun isolé sur une petite
 * classe de test : on vérifie le comportement du décorateur, pas celui du référentiel
 * (qui a ses propres tests). Démarre avec ValidateSpellPower (exercice 4) ;
 * les autres décorateurs s'ajouteront aux étapes 7 et 9.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Cache, ValidateSpellPower } from "../src/decorators";

/** Capture ce que console.log affiche pendant `action` (les décorateurs journalisent). */
function captureLogs(action: () => void): string[] {
  const logs: string[] = [];
  const original = console.log;
  console.log = (message: string) => {
    logs.push(String(message));
  };
  try {
    action();
  } finally {
    console.log = original;
  }
  return logs;
}

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

/** Compte ses exécutions réelles : permet de prouver qu'un appel vient du cache. */
class Calculator {
  calls = 0;

  @Cache
  square(n: number): number {
    this.calls++;
    return n * n;
  }
}

describe("@Cache (exercice 5)", () => {
  it("ne recalcule pas pour les mêmes arguments sur la même instance", () => {
    const calc = new Calculator();
    const logs = captureLogs(() => {
      assert.equal(calc.square(4), 16);
      assert.equal(calc.square(4), 16); // mêmes arguments : servi par le cache
      assert.equal(calc.square(5), 25); // argument différent : recalcule
    });
    assert.equal(calc.calls, 2); // le corps n'a tourné que deux fois
    assert.deepEqual(logs, ["[CACHE MISS] square", "[CACHE HIT] square", "[CACHE MISS] square"]);
  });

  it("garde un cache séparé par instance (WeakMap)", () => {
    const a = new Calculator();
    const b = new Calculator();
    captureLogs(() => {
      a.square(4);
      b.square(4); // même argument, autre instance : PAS un hit
    });
    assert.equal(a.calls, 1);
    assert.equal(b.calls, 1);
  });
});
