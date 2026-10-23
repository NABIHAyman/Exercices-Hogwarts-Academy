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
