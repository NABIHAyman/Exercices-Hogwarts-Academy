/**
 * repository.test.ts — Tests du référentiel générique (exercice 1).
 * Le référentiel est testé avec une entité inventée (Potion) : la preuve qu'il ne
 * connaît ni les sorciers ni les sorts, puis avec WizardRepository pour l'exercice 1.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Repository, WizardRepository } from "../src/repository";
import type { Entity } from "../src/types";

/** Une entité de test minimale : un id (exigé par la contrainte) et un nom. */
interface Potion extends Entity {
  name: string;
}

describe("Repository<T> (exercice 1)", () => {
  it("attribue des identifiants croissants à partir de 1", () => {
    const repo = new Repository<Potion>();
    const felix = repo.add({ name: "Felix Felicis" });
    const poly = repo.add({ name: "Polynectar" });
    assert.equal(felix.id, 1);
    assert.equal(poly.id, 2);
    assert.equal(felix.name, "Felix Felicis");
  });

  it("refuse un id fourni par l'appelant (type), et l'écraserait de toute façon (runtime)", () => {
    const repo = new Repository<Potion>();
    // @ts-expect-error add attend Omit<Potion, "id"> : fournir un id est refusé à la compilation
    const potion = repo.add({ id: 99, name: "Veritaserum" });
    // Ceinture et bretelles : même à l'exécution, l'id 99 est écrasé par le compteur.
    assert.equal(potion.id, 1);
  });

  it("retrouve une entité par son id, et renvoie undefined sinon", () => {
    const repo = new Repository<Potion>();
    const potion = repo.add({ name: "Veritaserum" });
    assert.deepEqual(repo.findById(potion.id), { id: 1, name: "Veritaserum" });
    assert.equal(repo.findById(42), undefined);
  });

  it("getAll renvoie les entités dans l'ordre d'ajout, en copie", () => {
    const repo = new Repository<Potion>();
    repo.add({ name: "A" });
    repo.add({ name: "B" });
    const all = repo.getAll();
    assert.deepEqual(
      all.map((p) => p.name),
      ["A", "B"],
    );
    all.pop(); // modifier la copie ne touche pas le référentiel
    assert.equal(repo.size, 2);
  });

  it("la contrainte T extends Entity exige un id numérique", () => {
    // @ts-expect-error { name: string } n'a pas d'id : la contrainte Entity refuse ce type
    const invalid = new Repository<{ name: string }>();
    assert.ok(invalid instanceof Repository);
  });
});

describe("WizardRepository (exercice 1)", () => {
  it("inscrit un sorcier sans id et le retrouve, complet, par l'id attribué", () => {
    const repo = new WizardRepository();
    const harry = repo.add({ name: "Harry Potter", house: "Gryffindor", level: 3, active: true });
    assert.equal(harry.id, 1);
    assert.deepEqual(repo.findById(1), {
      id: 1,
      name: "Harry Potter",
      house: "Gryffindor",
      level: 3,
      active: true,
    });
    assert.equal(repo.size, 1);
  });
});
