/**
 * academy.test.ts — Tests du service métier : les règles de l'académie, les décorateurs
 * en situation réelle (et leur ordre d'empilement), les signatures d'index remplies.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AcademyService } from "../src/academy";

/** Capture ce que console.log affiche pendant `action`. */
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

describe("AcademyService.enroll", () => {
  it("inscrit un sorcier, lui donne un id et enregistre l'événement", () => {
    const academy = new AcademyService();
    let harry = { id: 0 };
    captureLogs(() => {
      harry = academy.enroll({ name: "Harry", house: "Gryffindor", level: 3, active: true });
    });
    assert.equal(harry.id, 1);
    assert.equal(academy.wizards.size, 1);
    assert.deepEqual(academy.events.ofType("wizard-enrolled"), [
      { type: "wizard-enrolled", wizardId: 1, house: "Gryffindor" },
    ]);
  });

  it("journalise l'appel (décorateur Log)", () => {
    const academy = new AcademyService();
    const logs = captureLogs(() => academy.enroll({ name: "Luna", house: "Ravenclaw", level: 3, active: true }));
    assert.deepEqual(logs, ['[LOG] enroll({"name":"Luna","house":"Ravenclaw","level":3,"active":true})']);
  });
});

describe("AcademyService.enrollFromUnknown", () => {
  it("inscrit une donnée inconnue valide", () => {
    const academy = new AcademyService();
    const raw: unknown = JSON.parse('{"name":"Ginny","house":"Gryffindor","level":2,"active":true}');
    captureLogs(() => assert.equal(academy.enrollFromUnknown(raw)?.name, "Ginny"));
    assert.equal(academy.wizards.size, 1);
  });

  it("rejette et signale une donnée invalide sans rien stocker", () => {
    const academy = new AcademyService();
    const warnings: string[] = [];
    const original = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
    try {
      assert.equal(
        academy.enrollFromUnknown({ name: "Viktor", house: "Durmstrang", level: 5, active: true }),
        undefined,
      );
      assert.equal(academy.enrollFromUnknown("pas un objet"), undefined);
    } finally {
      console.warn = original;
    }
    assert.equal(academy.wizards.size, 0);
    assert.equal(warnings.length, 2);
    assert.match(warnings[0], /^\[REJET\] donnée invalide ignorée : /);
  });
});

/** Une académie prête à l'emploi : deux sorciers, deux sorts. */
function setup(): AcademyService {
  const academy = new AcademyService();
  captureLogs(() => {
    academy.enroll({ name: "Harry", house: "Gryffindor", level: 3, active: true }); // id 1
    academy.enroll({ name: "Cedric", house: "Hufflepuff", level: 6, active: true }); // id 2
  });
  academy.registerSpell({ name: "Lumos", category: "charm", power: 5, minLevel: 1 }); // id 1
  academy.registerSpell({ name: "Sectumsempra", category: "curse", power: 90, minLevel: 6 }); // id 2
  return academy;
}

describe("AcademyService.registerSpell", () => {
  it("renvoie le sort créé, ou undefined si le décorateur le refuse", () => {
    const academy = new AcademyService();
    assert.equal(academy.registerSpell({ name: "Lumos", category: "charm", power: 5, minLevel: 1 })?.id, 1);
    const errors: string[] = [];
    const original = console.error;
    console.error = (message: string) => {
      errors.push(message);
    };
    try {
      assert.equal(academy.registerSpell({ name: "Broken", category: "curse", power: -10, minLevel: 1 }), undefined);
    } finally {
      console.error = original;
    }
    assert.deepEqual(errors, ["[REJET] Spell power cannot be negative"]);
    assert.equal(academy.spells.size, 1);
  });
});

describe("AcademyService.castSpell", () => {
  it("lance un sort, compte le lancer et enregistre l'événement", () => {
    const academy = setup();
    assert.equal(academy.castSpell(1, 1), "Harry cast Lumos (power 5)");
    assert.equal(academy.castSpell(1, 1), "Harry cast Lumos (power 5)");
    assert.equal(academy.stats.Lumos, 2);
    assert.equal(academy.events.ofType("spell-cast").length, 2);
  });

  it("refuse un sorcier ou un sort inexistant (assertDefined)", () => {
    const academy = setup();
    assert.throws(() => academy.castSpell(99, 1), /Wizard 99 not found/);
    assert.throws(() => academy.castSpell(1, 99), /Spell 99 not found/);
  });

  it("refuse un sort restreint à un sorcier trop faible, sans rien compter", () => {
    const academy = setup();
    assert.throws(() => academy.castSpell(1, 2), /Access denied/);
    assert.equal(academy.stats.Sectumsempra, undefined);
    assert.equal(academy.events.ofType("spell-cast").length, 0);
    assert.equal(academy.castSpell(2, 2), "Cedric cast Sectumsempra (power 90)");
  });
});

describe("AcademyService.levelUp / updateWizard", () => {
  it("monte d'un niveau et enregistre l'événement", () => {
    const academy = setup();
    captureLogs(() => assert.equal(academy.levelUp(1).level, 4));
    assert.deepEqual(academy.events.ofType("level-up"), [{ type: "level-up", wizardId: 1, newLevel: 4 }]);
  });

  it("ne dépasse jamais le niveau maximal de la configuration", () => {
    const academy = new AcademyService({ maxLevel: 5 });
    captureLogs(() => {
      academy.enroll({ name: "Cedric", house: "Hufflepuff", level: 5, active: true });
      assert.equal(academy.levelUp(1).level, 5);
    });
  });

  it("updateWizard applique une mise à jour partielle et refuse un id inconnu", () => {
    const academy = setup();
    assert.equal(academy.updateWizard(1, { house: "Ravenclaw" }).house, "Ravenclaw");
    assert.equal(academy.wizards.findById(1)?.name, "Harry");
    assert.throws(() => academy.updateWizard(99, { level: 1 }), /Wizard 99 not found/);
  });

  it("accepte une configuration partielle avec des clés supplémentaires (signature d'index)", () => {
    const academy = new AcademyService({ motto: "Draco dormiens" });
    assert.equal(academy.config.name, "Hogwarts Academy");
    assert.equal(academy.config.maxLevel, 7);
    assert.equal(academy.config.motto, "Draco dormiens");
  });
});

describe("AcademyService.expel", () => {
  it("rend le sorcier inactif, enregistre l'événement et l'audite", () => {
    const academy = setup();
    let result = false;
    const logs = captureLogs(() => {
      result = academy.expel(1, "duel interdit");
    });
    assert.equal(result, true);
    assert.equal(academy.wizards.findById(1)?.active, false);
    assert.deepEqual(academy.events.ofType("wizard-expelled"), [
      { type: "wizard-expelled", wizardId: 1, reason: "duel interdit" },
    ]);
    assert.deepEqual(logs, ["[AUDIT] expulsion via expel(1, duel interdit) -> true"]);
  });

  it("renvoie false pour un sorcier déjà expulsé ou inconnu", () => {
    const academy = setup();
    captureLogs(() => {
      assert.equal(academy.expel(1, "a"), true);
      assert.equal(academy.expel(1, "b"), false);
      assert.equal(academy.expel(99, "c"), false);
    });
    assert.equal(academy.events.ofType("wizard-expelled").length, 1);
  });

  it("un sorcier expulsé ne peut plus lancer de sort", () => {
    const academy = setup();
    captureLogs(() => academy.expel(1, "duel"));
    assert.throws(() => academy.castSpell(1, 1), /has been expelled/);
  });
});

describe("AcademyService.calculatePower / summaries / report", () => {
  it("calculatePower met en cache et journalise (ordre Log puis Cache)", () => {
    const academy = setup();
    const logs = captureLogs(() => {
      assert.equal(academy.calculatePower(30, 3), 90);
      assert.equal(academy.calculatePower(30, 3), 90);
    });
    assert.deepEqual(logs, [
      "[LOG] calculatePower(30, 3)",
      "[CACHE MISS] calculatePower",
      "Calculating...",
      "[LOG] calculatePower(30, 3)",
      "[CACHE HIT] calculatePower",
    ]);
  });

  it("summaries renvoie un Pick nom / maison / niveau", () => {
    assert.deepEqual(setup().summaries(), [
      { name: "Harry", house: "Gryffindor", level: 3 },
      { name: "Cedric", house: "Hufflepuff", level: 6 },
    ]);
  });

  it("report regroupe par maison, marque les expulsés et affiche stats et événements", () => {
    const academy = setup();
    academy.castSpell(1, 1);
    captureLogs(() => academy.expel(2, "triche"));
    let lines: string[] = [];
    const logs = captureLogs(() => {
      lines = academy.report();
    });
    assert.deepEqual(lines, [
      "=== Hogwarts Academy (niveau max 7) ===",
      "Gryffindor : Harry",
      "Slytherin  : -",
      "Ravenclaw  : -",
      "Hufflepuff : Cedric (expulsé)",
      'Sorts lancés : {"Lumos":1}',
      'Événements   : {"wizard-enrolled":2,"spell-cast":1,"wizard-expelled":1}',
    ]);
    assert.match(logs[0], /^\[TIME\] report : /);
  });
});
