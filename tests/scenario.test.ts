/**
 * scenario.test.ts — Le test de bout en bout : il déroule le scénario complet
 * (celui que `npm start` affiche) en silence, puis vérifie l'état final de
 * l'académie — effectifs, statistiques, événements, conséquences des refus.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runScenario } from "../src/main";

describe("scénario complet (main.ts)", () => {
  it("se déroule sans erreur fatale et laisse l'académie dans l'état attendu", async () => {
    const silence = { log: console.log, warn: console.warn, error: console.error };
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    let academy;
    try {
      academy = await runScenario();
    } finally {
      Object.assign(console, silence);
    }
    assert.equal(academy.wizards.size, 6); // 5 de départ + Ginny (seule entrée valide de l'import)
    assert.equal(academy.spells.size, 4); // le sort de puissance -10 a été refusé
    assert.deepEqual(academy.stats, { Lumos: 1, Sectumsempra: 1, Expelliarmus: 2 });
    assert.deepEqual(academy.events.countByType(), {
      "wizard-enrolled": 6,
      "spell-cast": 4,
      "wizard-expelled": 1,
      "level-up": 1,
    });
    assert.equal(academy.wizards.findById(3)?.active, false); // Draco expulsé
    assert.equal(academy.wizards.findById(1)?.level, 4); // Harry a monté d'un niveau
  });
});
