/**
 * smoke.test.ts — Test de fumée de l'étape 0 : s'il compile et passe, c'est que
 * toute la chaîne (tsc, node:test, node:assert) est en place.
 * Il sera supprimé à l'étape 11, quand le test de bout en bout existera.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { greet } from "../src/index";

test("greet construit le message attendu", () => {
  assert.equal(greet("Hogwarts"), "Hello Hogwarts!");
});
