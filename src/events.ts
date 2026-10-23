/**
 * events.ts — Le journal d'événements générique (exercice 3).
 * E est n'importe quelle union discriminée par un champ `type` de type chaîne :
 * le journal n'a pas besoin de connaître les événements de l'académie pour marcher.
 */
export class EventLog<E extends { type: string }> {
  private readonly events: E[] = [];

  /** Ajoute un événement en fin de journal (ordre chronologique conservé). */
  record(event: E): void {
    this.events.push(event);
  }

  /** Lecture seule : `readonly E[]` interdit à l'appelant push/pop sur le journal. */
  all(): readonly E[] {
    return this.events;
  }

  get size(): number {
    return this.events.length;
  }

  /**
   * Exercice 3 : ofType("spell-cast") renvoie SpellCastEvent[], pas E[].
   * K est DÉDUIT de l'argument ; Extract<E, { type: K }> garde le membre de l'union
   * dont le discriminant vaut K ; le prédicat `e is …` fait le même tri côté runtime.
   */
  ofType<K extends E["type"]>(type: K): Extract<E, { type: K }>[] {
    return this.events.filter((e): e is Extract<E, { type: K }> => e.type === type);
  }

  /** Nombre d'événements par type : une signature d'index remplie à l'exécution. */
  countByType(): { [type: string]: number } {
    const counts: { [type: string]: number } = {};
    for (const event of this.events) {
      counts[event.type] = (counts[event.type] ?? 0) + 1;
    }
    return counts;
  }
}
