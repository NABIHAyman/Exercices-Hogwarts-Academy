/**
 * academy.ts — Le service métier : la seule classe que le scénario manipule.
 * Il assemble les référentiels, le journal d'événements, les statistiques et la
 * configuration, et porte les règles métier. Les décorateurs ajoutent journalisation,
 * cache, mesure et contrôle d'accès sans alourdir le corps des méthodes.
 */
import { Audit, Cache, CheckSpellAccess, Log, Measure } from "./decorators";
import { EventLog } from "./events";
import { assertDefined, isNewWizard } from "./guards";
import { SpellRepository, WizardRepository } from "./repository";
import {
  HOUSES,
  type AcademyConfig,
  type AcademyEvent,
  type NewSpell,
  type NewWizard,
  type Spell,
  type SpellStats,
  type Wizard,
  type WizardSummary,
  type WizardUpdate,
} from "./types";

export class AcademyService {
  readonly wizards = new WizardRepository();
  readonly spells = new SpellRepository();
  readonly events = new EventLog<AcademyEvent>();
  /** Signature d'index : les clés (noms de sorts) apparaissent au fil des lancers. */
  readonly stats: SpellStats = {};
  readonly config: AcademyConfig;

  constructor(config: Partial<AcademyConfig> = {}) {
    // Les valeurs par défaut d'abord, puis ce que l'appelant fournit les écrase.
    this.config = { name: "Hogwarts Academy", maxLevel: 7, ...config };
  }

  // --- Sorciers -------------------------------------------------------------

  @Log
  enroll(data: NewWizard): Wizard {
    const wizard = this.wizards.add(data);
    this.events.record({ type: "wizard-enrolled", wizardId: wizard.id, house: wizard.house });
    return wizard;
  }

  /** Inscrit depuis une donnée NON typée : la garde de l'exercice 6 décide. */
  enrollFromUnknown(raw: unknown): Wizard | undefined {
    if (!isNewWizard(raw)) {
      console.warn(`[REJET] donnée invalide ignorée : ${JSON.stringify(raw)}`);
      return undefined;
    }
    return this.enroll(raw);
  }

  updateWizard(wizardId: number, patch: WizardUpdate): Wizard {
    const updated = this.wizards.update(wizardId, patch);
    assertDefined(updated, `Wizard ${wizardId} not found`);
    return updated;
  }

  @Log
  levelUp(wizardId: number): Wizard {
    const wizard = this.wizards.findById(wizardId);
    assertDefined(wizard, `Wizard ${wizardId} not found`);
    const newLevel = Math.min(wizard.level + 1, this.config.maxLevel);
    const updated = this.updateWizard(wizardId, { level: newLevel });
    this.events.record({ type: "level-up", wizardId, newLevel });
    return updated;
  }

  @Audit("expulsion")
  expel(wizardId: number, reason: string): boolean {
    const wizard = this.wizards.findById(wizardId);
    if (!wizard || !wizard.active) {
      return false;
    }
    this.updateWizard(wizardId, { active: false });
    this.events.record({ type: "wizard-expelled", wizardId, reason });
    return true;
  }

  // --- Sorts ----------------------------------------------------------------

  /** Le décorateur du référentiel peut refuser le sort : on transforme l'erreur en undefined. */
  registerSpell(data: NewSpell): Spell | undefined {
    try {
      return this.spells.add(data);
    } catch (error) {
      console.error(`[REJET] ${(error as Error).message}`);
      return undefined;
    }
  }

  /** Point d'entrée public : retrouve les entités, puis délègue à cast. */
  castSpell(wizardId: number, spellId: number): string {
    const wizard = this.wizards.findById(wizardId);
    assertDefined(wizard, `Wizard ${wizardId} not found`);
    const spell = this.spells.findById(spellId);
    assertDefined(spell, `Spell ${spellId} not found`);
    return this.cast(wizard, spell);
  }

  /** Le décorateur vérifie le niveau AVANT que le corps ne s'exécute. */
  @CheckSpellAccess
  private cast(wizard: Wizard, spell: Spell): string {
    if (!wizard.active) {
      throw new Error(`${wizard.name} has been expelled and cannot cast spells`);
    }
    this.stats[spell.name] = (this.stats[spell.name] ?? 0) + 1;
    this.events.record({ type: "spell-cast", wizardId: wizard.id, spellName: spell.name });
    return `${wizard.name} cast ${spell.name} (power ${spell.power})`;
  }

  /** Ordre des décorateurs : Cache (en bas) s'applique d'abord, Log l'enveloppe ensuite. */
  @Log
  @Cache
  calculatePower(basePower: number, wizardLevel: number): number {
    console.log("Calculating...");
    return basePower * wizardLevel;
  }

  // --- Lecture --------------------------------------------------------------

  /** La vue Pick : on décompose chaque sorcier et on ne garde que les trois champs. */
  summaries(): WizardSummary[] {
    return this.wizards.getAll().map(({ name, house, level }) => ({ name, house, level }));
  }

  @Measure
  report(): string[] {
    const lines: string[] = [`=== ${this.config.name} (niveau max ${this.config.maxLevel}) ===`];
    const byHouse = this.wizards.groupByHouse();
    for (const house of HOUSES) {
      const names = byHouse[house].map((w) => `${w.name}${w.active ? "" : " (expulsé)"}`);
      lines.push(`${house.padEnd(11)}: ${names.length ? names.join(", ") : "-"}`);
    }
    lines.push(`Sorts lancés : ${JSON.stringify(this.stats)}`);
    lines.push(`Événements   : ${JSON.stringify(this.events.countByType())}`);
    return lines;
  }
}
