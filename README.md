# Hogwarts Academy — projet TypeScript

[![CI](https://github.com/NABIHAyman/Exercices-Hogwarts-Academy/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/NABIHAyman/Exercices-Hogwarts-Academy/actions/workflows/ci.yml)

Projet du module **Développement Web Front Avancé** (EHEIM, 5e année Génie Informatique option IA, S9 2026-2027), Pr. Mohammed IMAHRAIN.
Auteur : **Ayman NABIH**.

Une application en ligne de commande qui gère les sorciers, les sorts et les événements d'une académie de magie.
Le projet met en pratique les notions TypeScript du cours — génériques, types utilitaires, signatures d'index,
gardes de type, décorateurs de méthode, types conditionnels et `infer` — ainsi que les six exercices
« Hogwarts Academy » des slides. `npm start` déroule un scénario de démonstration en sept sections,
et 78 tests `node:test` couvrent chaque notion.

Le projet a été construit par étapes — outillage, intégration continue, puis une notion du cours par
commit : l'historique Git retrace la progression.

## Prérequis

- [Node.js](https://nodejs.org) 22 ou plus récent (`node -v` pour vérifier ; version attendue dans `.nvmrc`)
- npm (installé avec Node) : `npm -v`

## Installation et lancement

```bash
npm install          # installe TypeScript et l'outillage (aucune dépendance d'exécution)
npm run build        # compile src/ et tests/ vers out/
npm start            # exécute le programme
npm test             # compile puis lance les tests (node:test, sans bibliothèque externe)
```

## Scripts npm

| Script               | Rôle                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| `npm run build`      | compile le TypeScript vers `out/`                                           |
| `npm start`          | exécute le programme compilé                                                |
| `npm run dev`        | recompilation continue (`tsc --watch`)                                      |
| `npm run typecheck`  | vérifie les types sans rien produire (`tsc --noEmit`)                       |
| `npm run lint`       | ESLint (typescript-eslint, règles appuyées sur les types)                   |
| `npm run format`     | formate tout le projet avec Prettier (`format:check` vérifie sans modifier) |
| `npm test`           | compile puis lance les tests `node:test`                                    |
| `npm run test:watch` | relance les tests à chaque changement                                       |
| `npm run verify`     | la vérification complète : formatage, lint, types, tests                    |

## Intégration continue

Le workflow [`ci.yml`](.github/workflows/ci.yml) rejoue la vérification complète sur une machine neuve
(Ubuntu) à chaque push et chaque pull request, sur **Node 22 et 24** : installation reproductible
(`npm ci`), formatage, lint, types, compilation, tests, audit des dépendances
(`npm audit --audit-level=high`), puis contrôle que la CI n'a modifié aucun fichier suivi
(`git status --porcelain` vide). Le badge en haut de ce fichier reflète l'état de `main`.

## Structure

```
hogwarts-academy/
├── .github/
│   └── workflows/
│       └── ci.yml     # intégration continue (GitHub Actions)
├── src/               # le code de l'application
│   ├── academy.ts     # AcademyService : les règles métier, décorées
│   ├── advanced-types.ts  # types conditionnels, infer, types mappés
│   ├── data.ts        # données de démonstration + import non typé (unknown[])
│   ├── decorators.ts  # ValidateSpellPower, Cache, Log, Measure, CheckSpellAccess, Audit(…)
│   ├── events.ts      # journal générique EventLog<E> : ofType avec Extract (exercice 3)
│   ├── guards.ts      # gardes de type et fonction d'assertion (exercice 6)
│   ├── main.ts        # runScenario() : le scénario de démonstration en 7 sections
│   ├── repository.ts  # Repository<T>, WizardRepository, SpellRepository (exercices 1, 2, 4)
│   └── types.ts       # modèle : House, Wizard, Spell, événements, signatures d'index, vues
├── tests/             # les tests (node:test + node:assert/strict)
│   ├── academy.test.ts # règles métier du service et décorateurs en situation
│   ├── decorators.test.ts # chaque décorateur isolé sur une petite classe de test
│   ├── events.test.ts # journal d'événements et extraction typée par ofType
│   ├── guards.test.ts # gardes de type : cas valides et triangulation des cas tordus
│   ├── repository.test.ts # référentiel générique, inscription et requêtes par maison
│   ├── scenario.test.ts # test de bout en bout : l'état final du scénario complet
│   └── types.test.ts  # tests de type : modèle, événements, types avancés (@ts-expect-error)
├── tsconfig.json      # configuration du compilateur TypeScript (strict, décorateurs)
├── eslint.config.js   # ESLint « flat config » + typescript-eslint
├── .prettierrc.json   # règles de formatage (120 colonnes, LF)
├── .editorconfig      # mêmes conventions pour tous les éditeurs
├── .nvmrc             # version de Node attendue (22)
└── package.json       # scripts npm et dépendances de développement
```

## Notions du cours → où les trouver

| Notion                                                                                                  | Fichier(s)                                                 |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Génériques (`Repository<T extends Entity>`, `EventLog<E>`)                                              | `src/repository.ts`, `src/events.ts`                       |
| Types utilitaires (`Omit`, `Partial`, `Pick`, `Record`, `Readonly`, `Extract`, `Exclude`, `ReturnType`) | `src/types.ts`, `src/repository.ts`, `src/main.ts`         |
| Signatures d'index (`SpellStats`, `AcademyConfig`, `countByType`)                                       | `src/types.ts`, `src/events.ts`                            |
| Types littéraux et gardes de type                                                                       | `src/types.ts`, `src/guards.ts`                            |
| Décorateurs de méthode (et fabrique `Audit(…)`)                                                         | `src/decorators.ts`, `src/repository.ts`, `src/academy.ts` |
| Types conditionnels, `infer`, types mappés                                                              | `src/advanced-types.ts`, `src/events.ts`                   |

## Les six exercices du cours

| Exercice                                    | Où le trouver                                                           |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| 1. Ajouter un sorcier sans id (`NewWizard`) | `Repository.add(Omit<T, "id">)` — `src/repository.ts`                   |
| 2. Filtrer par maison                       | `WizardRepository.findByHouse(Wizard["house"])` — `src/repository.ts`   |
| 3. Événement de sort (`Extract`)            | `EventOfType<K>` — `src/types.ts` ; `EventLog.ofType` — `src/events.ts` |
| 4. Valider la puissance d'un sort           | `@ValidateSpellPower` — `src/decorators.ts`, sur `SpellRepository.add`  |
| 5. Méthode mise en cache                    | `@Cache` (WeakMap + Map par instance) — `src/decorators.ts`             |
| 6. Garde de type stricte                    | `isHouse` et ses semblables — `src/guards.ts`                           |

## Les tests comme spécification

78 tests `node:test` (aucune bibliothèque de test externe) :

| Fichier                    | Tests | Ce qu'il spécifie                                                  |
| -------------------------- | ----- | ------------------------------------------------------------------ |
| `tests/academy.test.ts`    | 18    | les règles métier du service, les décorateurs en situation réelle  |
| `tests/repository.test.ts` | 16    | le référentiel générique et ses spécialisations                    |
| `tests/types.test.ts`      | 15    | le modèle et les types avancés (tests de type, `@ts-expect-error`) |
| `tests/guards.test.ts`     | 13    | les gardes de type : cas valides et triangulation des cas tordus   |
| `tests/decorators.test.ts` | 11    | chaque décorateur, isolé sur une petite classe de test             |
| `tests/events.test.ts`     | 4     | le journal d'événements générique                                  |
| `tests/scenario.test.ts`   | 1     | le scénario complet, de bout en bout                               |

## Licence

MIT.
