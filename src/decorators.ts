/**
 * decorators.ts — Les décorateurs de méthode (forme « legacy » à trois paramètres,
 * activée par experimentalDecorators, celle du cours).
 * Schéma commun : garder la méthode d'origine, la remplacer par une enveloppe,
 * appeler l'originale avec `original.apply(this, args)`.
 */
import { isSpell, isWizard } from "./guards";

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

/** Affiche le nom de la méthode et ses arguments à chaque appel, puis laisse faire. */
export function Log(_target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  const original = descriptor.value as AnyMethod;
  descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
    const shown = args.map((a) => JSON.stringify(a)).join(", ");
    console.log(`[LOG] ${String(propertyKey)}(${shown})`);
    return original.apply(this, args);
  };
}

/** Mesure le temps d'exécution de la méthode (performance.now : fractions de milliseconde). */
export function Measure(_target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  const original = descriptor.value as AnyMethod;
  descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
    const start = performance.now();
    const result = original.apply(this, args);
    const ms = (performance.now() - start).toFixed(2);
    console.log(`[TIME] ${String(propertyKey)} : ${ms} ms`);
    return result;
  };
}

/**
 * Contrôle d'accès aux sorts restreints : la méthode décorée doit recevoir (wizard, spell).
 * Les gardes de l'exercice 6 vérifient les arguments (reçus en unknown), puis la règle
 * métier compare niveau du sorcier et niveau minimal du sort — AVANT d'exécuter le corps.
 */
export function CheckSpellAccess(_target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
  const original = descriptor.value as AnyMethod;
  descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
    const [wizard, spell] = args;
    if (!isWizard(wizard) || !isSpell(spell)) {
      throw new Error(`${String(propertyKey)} expects (Wizard, Spell)`);
    }
    if (wizard.level < spell.minLevel) {
      throw new Error(
        `Access denied: ${wizard.name} (level ${wizard.level}) cannot cast ${spell.name} (requires level ${spell.minLevel})`,
      );
    }
    return original.apply(this, args);
  };
}

/**
 * Une FABRIQUE de décorateur : Audit("expulsion") RENVOIE le décorateur.
 * C'est la seule façon de paramétrer un décorateur, dont la signature à trois
 * paramètres est imposée. Journalise APRÈS l'appel, avec le résultat.
 */
export function Audit(action: string) {
  return function (_target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
    const original = descriptor.value as AnyMethod;
    descriptor.value = function (this: unknown, ...args: unknown[]): unknown {
      const result = original.apply(this, args);
      console.log(`[AUDIT] ${action} via ${String(propertyKey)}(${args.join(", ")}) -> ${JSON.stringify(result)}`);
      return result;
    };
  };
}
