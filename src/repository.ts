/**
 * repository.ts — Le référentiel générique (exercice 1) et ses requêtes (exercice 2) :
 * stocker des entités, leur attribuer un identifiant, les retrouver, les mettre à jour,
 * les filtrer. Une seule implémentation pour toutes les entités du projet.
 */
import { ValidateSpellPower } from "./decorators";
import {
  HOUSES,
  type Entity,
  type NewSpell,
  type Spell,
  type SpellCategory,
  type Wizard,
  type WizardsByHouse,
} from "./types";

/**
 * T est un paramètre de type, contraint par `extends Entity` : on ne peut stocker
 * que des objets qui ont un `id: number` — le minimum dont le référentiel a besoin.
 */
export class Repository<T extends Entity> {
  /** Une Map id → entité : recherche par id en O(1), ordre d'insertion conservé. */
  protected readonly items = new Map<number, T>();
  private nextId = 1;

  /**
   * Exercice 1 : l'appelant fournit tout SAUF l'id, attribué ici (compteur croissant).
   * `id` est placé APRÈS la décomposition : même si un id parasite traînait dans
   * `data` à l'exécution, il serait écrasé par le nôtre.
   * Le cast `as T` est l'un des deux casts tolérés du projet : TypeScript ne sait pas
   * prouver que Omit<T, "id"> + { id } redonne exactement T tant que T est générique
   * (démonstration dans le rapport de l'étape 3).
   */
  add(data: Omit<T, "id">): T {
    const item = { ...data, id: this.nextId++ } as T;
    this.items.set(item.id, item);
    return item;
  }

  /** Une copie du contenu : l'appelant peut la trier ou la vider sans toucher au stock. */
  getAll(): T[] {
    return [...this.items.values()];
  }

  /** `T | undefined` force l'appelant à traiter le cas « introuvable ». */
  findById(id: number): T | undefined {
    return this.items.get(id);
  }

  /** Accesseur (get) : s'utilise comme une propriété, `repo.size`, sans parenthèses. */
  get size(): number {
    return this.items.size;
  }

  /**
   * Mise à jour partielle (exercice 2) : Partial rend chaque champ facultatif, et
   * Omit retire l'id du patch — l'identifiant ne peut pas changer. Il est de plus
   * réaffirmé en dernier dans la décomposition, au cas où.
   */
  update(id: number, patch: Partial<Omit<T, "id">>): T | undefined {
    const current = this.items.get(id);
    if (!current) {
      return undefined;
    }
    const updated = { ...current, ...patch, id };
    this.items.set(id, updated);
    return updated;
  }

  /** Supprime l'entité et dit si elle existait (Map.delete renvoie déjà ce booléen). */
  remove(id: number): boolean {
    return this.items.delete(id);
  }

  /** Filtre générique : le prédicat reçoit un T typé, jamais un `any`. */
  filter(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }
}

/** Le référentiel des sorciers : hérite de tout, ajoute les requêtes métier (exercice 2). */
export class WizardRepository extends Repository<Wizard> {
  /**
   * Exercice 2 : Wizard["house"] est un TYPE À ACCÈS INDEXÉ — le type de la propriété
   * `house` de Wizard, c'est-à-dire l'union House. Appeler findByHouse("Durmstrang")
   * est donc refusé à la compilation.
   */
  findByHouse(house: Wizard["house"]): Wizard[] {
    return this.filter((w) => w.house === house);
  }

  /** Les sorciers encore actifs (non expulsés). */
  findActive(): Wizard[] {
    return this.filter((w) => w.active);
  }

  /**
   * Regroupe par maison : Record<House, Wizard[]> oblige à prévoir les quatre maisons,
   * même vides. Le cast `{} as WizardsByHouse` est le second cast toléré du projet :
   * l'objet naît vide et la boucle sur HOUSES le remplit intégralement juste après
   * (démonstration dans le rapport d'étape).
   */
  groupByHouse(): WizardsByHouse {
    const groups = {} as WizardsByHouse;
    for (const house of HOUSES) {
      groups[house] = this.findByHouse(house);
    }
    return groups;
  }
}

/** Le référentiel des sorts : la création est protégée par un décorateur (exercice 4). */
export class SpellRepository extends Repository<Spell> {
  /**
   * `override` : le compilateur vérifie qu'on redéfinit bien une méthode du parent.
   * Le décorateur enveloppe la méthode : un sort de puissance négative est rejeté
   * AVANT que le corps (donc super.add) ne s'exécute. NewSpell = Omit<Spell, "id">,
   * la signature du parent est donc respectée.
   */
  @ValidateSpellPower
  override add(data: NewSpell): Spell {
    return super.add(data);
  }

  /** Le miroir de findByHouse pour les sorts (même recette : filter + littéraux). */
  findByCategory(category: SpellCategory): Spell[] {
    return this.filter((s) => s.category === category);
  }
}
