/**
 * events.test.ts — Tests du journal d'événements générique (exercice 3).
 * Comme pour le référentiel, une union inventée (Ping | Pong) prouve la généricité,
 * puis AcademyEvent couvre le cas réel du projet.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EventLog } from "../src/events";
import type { AcademyEvent } from "../src/types";

type Ping = { type: "ping"; n: number };
type Pong = { type: "pong"; text: string };

describe("EventLog<E> (exercice 3)", () => {
  it("enregistre les événements dans l'ordre et les compte", () => {
    const log = new EventLog<Ping | Pong>();
    assert.equal(log.size, 0);
    log.record({ type: "ping", n: 1 });
    log.record({ type: "pong", text: "a" });
    assert.equal(log.size, 2);
    assert.deepEqual(
      log.all().map((e) => e.type),
      ["ping", "pong"],
    );
  });

  it("ofType renvoie les événements d'un type, avec le type précis (Extract)", () => {
    const log = new EventLog<AcademyEvent>();
    log.record({ type: "wizard-enrolled", wizardId: 1, house: "Gryffindor" });
    log.record({ type: "spell-cast", wizardId: 1, spellName: "Lumos" });
    log.record({ type: "spell-cast", wizardId: 2, spellName: "Episkey" });
    const casts = log.ofType("spell-cast");
    // e.spellName compile sans vérification : casts est un SpellCastEvent[], pas un AcademyEvent[].
    assert.deepEqual(
      casts.map((e) => e.spellName),
      ["Lumos", "Episkey"],
    );
    assert.deepEqual(log.ofType("level-up"), []);
  });

  it("refuse un type d'événement inconnu à la compilation", () => {
    const log = new EventLog<AcademyEvent>();
    // @ts-expect-error "explosion" n'est pas un AcademyEvent["type"]
    assert.deepEqual(log.ofType("explosion"), []);
  });

  it("countByType compte par type dans une signature d'index", () => {
    const log = new EventLog<AcademyEvent>();
    log.record({ type: "spell-cast", wizardId: 1, spellName: "Lumos" });
    log.record({ type: "spell-cast", wizardId: 1, spellName: "Lumos" });
    log.record({ type: "level-up", wizardId: 1, newLevel: 4 });
    assert.deepEqual(log.countByType(), { "spell-cast": 2, "level-up": 1 });
  });
});
