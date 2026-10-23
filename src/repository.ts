/**
 * repository.ts — Le référentiel générique (exercice 1) : stocker des entités,
 * leur attribuer un identifiant, les retrouver. Une seule implémentation pour
 * toutes les entités du projet : c'est tout l'intérêt des génériques.
 */
import type { Entity, Wizard } from "./types";

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
   * (démonstration dans le rapport d'étape).
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
}

/**
 * Le référentiel des sorciers : Repository<Wizard> avec un nom métier.
 * Ses requêtes propres (findByHouse, findActive, groupByHouse…) arrivent à l'étape 4.
 */
export class WizardRepository extends Repository<Wizard> {}
