/**
 * data.ts — Les données de démonstration du scénario.
 * SEED_* sont typées à la main ; RAW_IMPORT imite un JSON reçu de l'extérieur :
 * volontairement unknown[], c'est le terrain de jeu des gardes de l'exercice 6.
 */
import type { NewSpell, NewWizard } from "./types";

export const SEED_WIZARDS: NewWizard[] = [
  { name: "Harry Potter", house: "Gryffindor", level: 3, active: true },
  { name: "Hermione Granger", house: "Gryffindor", level: 5, active: true },
  { name: "Draco Malfoy", house: "Slytherin", level: 4, active: true },
  { name: "Luna Lovegood", house: "Ravenclaw", level: 3, active: true },
  { name: "Cedric Diggory", house: "Hufflepuff", level: 6, active: true },
];

export const SEED_SPELLS: NewSpell[] = [
  { name: "Lumos", category: "charm", power: 5, minLevel: 1 },
  { name: "Expelliarmus", category: "defense", power: 30, minLevel: 2 },
  { name: "Episkey", category: "healing", power: 20, minLevel: 3 },
  { name: "Sectumsempra", category: "curse", power: 90, minLevel: 6 },
];

/** Données « venues de l'extérieur » : une valide, quatre invalides. */
export const RAW_IMPORT: unknown[] = [
  { name: "Ginny Weasley", house: "Gryffindor", level: 2, active: true },
  { name: "Viktor Krum", house: "Durmstrang", level: 5, active: true }, // maison inconnue
  { name: "Nymphadora Tonks", house: "Hufflepuff", level: "7", active: true }, // level en chaîne
  { name: "Cho Chang", house: "Ravenclaw", level: 4 }, // active manquant
  "pas un objet",
];

/** Simule un appel réseau asynchrone qui renvoie des données non typées. */
export async function fetchWizards(): Promise<unknown[]> {
  await new Promise((resolve) => setTimeout(resolve, 10));
  return RAW_IMPORT;
}
