/**
 * decorators.ts — Les décorateurs de méthode (forme « legacy » à trois paramètres,
 * activée par experimentalDecorators, celle du cours).
 * Schéma commun : garder la méthode d'origine, la remplacer par une enveloppe,
 * appeler l'originale avec `original.apply(this, args)`.
 */

/** Le type d'une méthode quelconque, pour éviter `any`. */
type AnyMethod = (...args: unknown[]) => unknown;

/**
 * Exercice 4 : refuse un sort dont la puissance est négative.
 * Le décorateur ne connaît pas le type des arguments (ils arrivent en unknown[]) :
 * il vérifie donc, étape par étape, que le premier argument a bien un champ
 * `power` numérique avant de le juger — un rétrécissement à la main.
 */
export function ValidateSpellPower(
  _target: object,
  _propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
): void {
  const original = descriptor.value as AnyMethod;
  descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
    const spell = args[0];
    if (
      typeof spell === "object" &&
      spell !== null &&
      "power" in spell &&
      typeof spell.power === "number" &&
      spell.power < 0
    ) {
      throw new Error("Spell power cannot be negative");
    }
    return original.apply(this, args);
  };
}

/**
 * Exercice 5 : met en cache les résultats — même instance + mêmes arguments = pas de recalcul.
 * Le décorateur s'exécute UNE fois par classe : un simple Map dans sa fermeture serait
 * partagé par toutes les instances. D'où la WeakMap instance → cache : chaque objet a
 * son Map privé, et la WeakMap n'empêche pas le ramasse-miettes de libérer une instance
 * abandonnée (clés « faibles »). La clé d'appel est JSON.stringify(args).
 */
export function Cache(_target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  const original = descriptor.value as AnyMethod;
  const caches = new WeakMap<object, Map<string, unknown>>();
  // `this: object` (pas unknown) : une WeakMap n'accepte que des objets comme clés.
  descriptor.value = function (this: object, ...args: unknown[]): unknown {
    let cache = caches.get(this);
    if (!cache) {
      cache = new Map();
      caches.set(this, cache);
    }
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log(`[CACHE HIT] ${String(propertyKey)}`);
      return cache.get(key);
    }
    console.log(`[CACHE MISS] ${String(propertyKey)}`);
    const result = original.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
