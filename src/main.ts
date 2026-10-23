/**
 * main.ts — Le scénario de démonstration : sept sections, une par famille de notions
 * du cours. Exporté sous forme de fonction pour être testable de bout en bout
 * (tests/scenario.test.ts). Lancer avec `npm run build` puis `npm start`.
 */
import { AcademyService } from "./academy";
import type { EntityOf, UnwrapPromise } from "./advanced-types";
import { fetchWizards, SEED_SPELLS, SEED_WIZARDS } from "./data";
import { describe, isSpellCast } from "./guards";
import type { EventOfType, FrozenSpell, NonSpellEvent, Wizard } from "./types";

function section(title: string): void {
  console.log(`\n--- ${title} ---`);
}

/** Essaie une action et affiche l'erreur au lieu d'arrêter le programme. */
function attempt(label: string, action: () => unknown): void {
  try {
    console.log(`${label} -> ${JSON.stringify(action())}`);
  } catch (error) {
    console.log(`${label} -> ERREUR : ${(error as Error).message}`);
  }
}

/** Déroule le scénario complet et renvoie l'académie dans son état final. */
export async function runScenario(): Promise<AcademyService> {
  const academy = new AcademyService({ name: "Hogwarts Academy", motto: "Draco dormiens nunquam titillandus" });

  section("1. Génériques : un référentiel pour les sorciers, un autre pour les sorts");
  for (const data of SEED_WIZARDS) {
    academy.enroll(data);
  }
  for (const data of SEED_SPELLS) {
    academy.registerSpell(data);
  }
  console.log(`${academy.wizards.size} sorciers, ${academy.spells.size} sorts`);
  console.log(
    "Gryffindor :",
    academy.wizards.findByHouse("Gryffindor").map((w) => w.name),
  );
  console.log(
    "Sorts de défense :",
    academy.spells.findByCategory("defense").map((s) => s.name),
  );

  section("2. Gardes de type : importer des données inconnues");
  const imported: UnwrapPromise<ReturnType<typeof fetchWizards>> = await fetchWizards();
  console.log(`${imported.length} entrées reçues`);
  for (const raw of imported) {
    academy.enrollFromUnknown(raw);
  }
  console.log(`Après import : ${academy.wizards.size} sorciers`);
  const harry = academy.wizards.findById(1);
  const lumos = academy.spells.findById(1);
  if (harry && lumos) {
    console.log(describe(harry));
    console.log(describe(lumos));
  }

  section("3. Décorateurs : validation, contrôle d'accès, cache, audit");
  attempt("Sort de puissance -10", () =>
    academy.registerSpell({ name: "Broken", category: "curse", power: -10, minLevel: 1 }),
  );
  attempt("Harry (niv. 3) lance Lumos", () => academy.castSpell(1, 1));
  attempt("Harry (niv. 3) lance Sectumsempra (niv. 6 requis)", () => academy.castSpell(1, 4));
  attempt("Cedric (niv. 6) lance Sectumsempra", () => academy.castSpell(5, 4));
  attempt("Sort inexistant", () => academy.castSpell(1, 99));
  console.log(academy.calculatePower(30, 3));
  console.log(academy.calculatePower(30, 3)); // mêmes arguments : servi par le cache
  console.log(academy.calculatePower(5, 2));
  attempt("Expulser Draco", () => academy.expel(3, "duel interdit"));
  attempt("Expulser Draco une 2e fois", () => academy.expel(3, "récidive"));
  attempt("Draco expulsé lance Lumos", () => academy.castSpell(3, 1));

  section("4. Types utilitaires : Partial, Pick, Record, Readonly");
  academy.levelUp(1);
  academy.updateWizard(4, { level: 5, house: "Ravenclaw" }); // Partial : seuls ces champs changent
  console.log("Résumés (Pick) :", academy.summaries().slice(0, 3));
  const byHouse = academy.wizards.groupByHouse(); // Record<House, Wizard[]>
  console.log("Effectifs (Record) :", Object.fromEntries(Object.entries(byHouse).map(([h, ws]) => [h, ws.length])));
  const frozen: FrozenSpell = academy.spells.getAll()[0];
  console.log("Sort figé (Readonly) :", frozen.name); // frozen.power = 1 serait refusé à la compilation

  section("5. Signatures d'index : statistiques et configuration");
  academy.castSpell(2, 2);
  academy.castSpell(2, 2);
  console.log("Stats :", academy.stats);
  console.log("Config :", academy.config);
  academy.config.openedAt = 990; // nouvelle clé acceptée par la signature d'index

  section("6. Union discriminée, Extract et types conditionnels");
  const casts: EventOfType<"spell-cast">[] = academy.events.ofType("spell-cast");
  console.log(
    "Lancers :",
    casts.map((e) => `${e.wizardId}:${e.spellName}`),
  );
  const others: NonSpellEvent[] = academy.events.all().filter((e): e is NonSpellEvent => !isSpellCast(e));
  console.log(
    "Autres événements :",
    others.map((e) => e.type),
  );
  type StoredEntity = EntityOf<typeof academy.wizards>; // = Wizard, déduit par infer
  const first: StoredEntity | undefined = academy.wizards.findById(1);
  const check: Wizard | undefined = first; // compile : StoredEntity EST Wizard
  console.log("EntityOf<WizardRepository> =", check ? "Wizard" : "?");

  section("7. Rapport");
  for (const line of academy.report()) {
    console.log(line);
  }
  return academy;
}

// Exécuté seulement quand le fichier est lancé directement (pas quand un test l'importe).
if (require.main === module) {
  runScenario().catch((error: unknown) => {
    console.error("Erreur fatale :", error);
    process.exitCode = 1;
  });
}
