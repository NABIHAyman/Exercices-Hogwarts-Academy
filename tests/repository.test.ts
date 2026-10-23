/**
 * repository.test.ts — Tests du référentiel générique (exercices 1 et 2).
 * Le référentiel est testé avec une entité inventée (Potion) : la preuve qu'il ne
 * connaît ni les sorciers ni les sorts ; puis WizardRepository couvre l'inscription
 * (exercice 1) et les requêtes par maison (exercice 2).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Repository, SpellRepository, WizardRepository } from "../src/repository";
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

  it("met à jour partiellement, sans jamais changer l'id (exercice 2)", () => {
    const repo = new Repository<Potion>();
    const potion = repo.add({ name: "Veritaserum" });
    assert.deepEqual(repo.update(potion.id, { name: "Amortentia" }), { id: 1, name: "Amortentia" });
    assert.equal(repo.update(42, { name: "x" }), undefined);
    // @ts-expect-error l'id n'est pas dans le patch : Partial<Omit<T, "id">> le refuse
    repo.update(potion.id, { id: 5 });
    // Même si le patch fautif s'exécute, l'id réaffirmé en dernier reste 1.
    assert.equal(repo.findById(1)?.name, "Amortentia");
  });

  it("supprime une entité et dit si elle existait (exercice 2)", () => {
    const repo = new Repository<Potion>();
    const potion = repo.add({ name: "Veritaserum" });
    assert.equal(repo.remove(potion.id), true);
    assert.equal(repo.remove(potion.id), false);
    assert.equal(repo.findById(potion.id), undefined);
    assert.equal(repo.size, 0);
  });

  it("filtre avec un prédicat typé (exercice 2)", () => {
    const repo = new Repository<Potion>();
    repo.add({ name: "Amortentia" });
    repo.add({ name: "Polynectar" });
    repo.add({ name: "Aiguise-Méninges" });
    assert.deepEqual(
      repo.filter((p) => p.name.startsWith("A")).map((p) => p.name),
      ["Amortentia", "Aiguise-Méninges"],
    );
  });
});

describe("WizardRepository (exercices 1 et 2)", () => {
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

  /** Trois sorciers de maisons différentes, dont un inactif : le décor de l'exercice 2. */
  function setup(): WizardRepository {
    const repo = new WizardRepository();
    repo.add({ name: "Harry", house: "Gryffindor", level: 3, active: true });
    repo.add({ name: "Luna", house: "Ravenclaw", level: 3, active: true });
    repo.add({ name: "Draco", house: "Slytherin", level: 4, active: false });
    return repo;
  }

  it("filtre par maison (exercice 2)", () => {
    const repo = setup();
    assert.deepEqual(
      repo.findByHouse("Gryffindor").map((w) => w.name),
      ["Harry"],
    );
    assert.deepEqual(repo.findByHouse("Hufflepuff"), []);
  });

  it("refuse une maison inconnue à la compilation (type à accès indexé)", () => {
    const repo = setup();
    // @ts-expect-error "Durmstrang" n'est pas une House : Wizard["house"] le refuse
    assert.deepEqual(repo.findByHouse("Durmstrang"), []);
  });

  it("ne liste que les sorciers actifs", () => {
    assert.deepEqual(
      setup()
        .findActive()
        .map((w) => w.name),
      ["Harry", "Luna"],
    );
  });

  it("regroupe par maison en prévoyant les quatre maisons, même vides (Record)", () => {
    const groups = setup().groupByHouse();
    assert.deepEqual(Object.keys(groups), ["Gryffindor", "Slytherin", "Ravenclaw", "Hufflepuff"]);
    assert.deepEqual(
      groups.Slytherin.map((w) => w.name),
      ["Draco"],
    );
    assert.deepEqual(groups.Hufflepuff, []);
  });
});

describe("SpellRepository (exercice 4)", () => {
  it("accepte un sort valide et lui attribue un id", () => {
    const repo = new SpellRepository();
    const lumos = repo.add({ name: "Lumos", category: "charm", power: 5, minLevel: 1 });
    assert.equal(lumos.id, 1);
    assert.equal(repo.size, 1);
  });

  it("refuse un sort de puissance négative et ne stocke rien", () => {
    const repo = new SpellRepository();
    assert.throws(
      () => repo.add({ name: "Broken", category: "curse", power: -1, minLevel: 1 }),
      /Spell power cannot be negative/,
    );
    assert.equal(repo.size, 0);
  });

  it("filtre par catégorie", () => {
    const repo = new SpellRepository();
    repo.add({ name: "Lumos", category: "charm", power: 5, minLevel: 1 });
    repo.add({ name: "Protego", category: "defense", power: 50, minLevel: 2 });
    repo.add({ name: "Expelliarmus", category: "defense", power: 30, minLevel: 2 });
    assert.deepEqual(
      repo.findByCategory("defense").map((s) => s.name),
      ["Protego", "Expelliarmus"],
    );
    assert.deepEqual(repo.findByCategory("healing"), []);
  });
});
