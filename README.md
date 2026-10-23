# Hogwarts Academy — projet TypeScript

[![CI](https://github.com/NABIHAyman/Exercices-Hogwarts-Academy/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/NABIHAyman/Exercices-Hogwarts-Academy/actions/workflows/ci.yml)

Projet du module **Développement Web Front Avancé** (EHEIM, 5e année Génie Informatique option IA, S9 2026-2027), Pr. Mohammed IMAHRAIN.
Auteur : **Ayman NABIH**.

Une application en ligne de commande qui gère les sorciers, les sorts et les événements d'une académie de magie.
Le projet met en pratique les notions TypeScript du cours — génériques, types utilitaires, signatures d'index,
gardes de type, décorateurs de méthode, types conditionnels et `infer` — ainsi que les six exercices
« Hogwarts Academy » des slides.

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
│   └── index.ts       # point d'entrée provisoire (remplacé par le scénario final)
├── tests/             # les tests (node:test + node:assert/strict)
│   └── smoke.test.ts  # test de fumée : prouve que la chaîne de test fonctionne
├── tsconfig.json      # configuration du compilateur TypeScript (strict, décorateurs)
├── eslint.config.js   # ESLint « flat config » + typescript-eslint
├── .prettierrc.json   # règles de formatage (120 colonnes, LF)
├── .editorconfig      # mêmes conventions pour tous les éditeurs
├── .nvmrc             # version de Node attendue (22)
└── package.json       # scripts npm et dépendances de développement
```

## Feuille de route

Le projet se construit par étapes, chacune apportant une notion du cours :

1. ~~Intégration continue (GitHub Actions)~~ — fait
2. Modèle du domaine (`types.ts` : littéraux, `Omit`, unions discriminées)
3. Référentiel générique `Repository<T>` (exercice 1)
4. Filtres et types utilitaires (`Partial`, `Record`) (exercice 2)
5. Événements et `Extract`/`Exclude` (exercice 3)
6. Décorateur de validation (exercice 4)
7. Décorateur de cache (exercice 5)
8. Gardes de type strictes (exercice 6)
9. Décorateurs avancés, types conditionnels et `infer`
10. Service métier et signatures d'index
11. Scénario de démonstration de bout en bout

## Licence

MIT.
