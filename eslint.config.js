// Configuration ESLint « flat » (format par défaut depuis ESLint 9) : un tableau d'objets,
// chacun pouvant cibler des fichiers, déclarer un parseur et des règles.
// typescript-eslint fournit le parseur TypeScript et les règles « type-checked »,
// qui s'appuient sur les types calculés par tsc et pas seulement sur la syntaxe.
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  // Jamais linter : le code généré, les dépendances, la documentation du cours,
  // les rapports d'étape, ni ce fichier de configuration lui-même (il n'est pas dans le tsconfig).
  { ignores: ["out/**", "node_modules/**", "Bulk/**", "_rapports/**", "eslint.config.js"] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      // projectService : ESLint réutilise le tsconfig du projet pour connaître les types.
      parserOptions: { projectService: true, tsconfigRootDir: __dirname },
    },
    rules: {
      // Le projet interdit `any` : la règle passe d'avertissement à erreur.
      "@typescript-eslint/no-explicit-any": "error",
      // Variables ou paramètres inutilisés : tolérés seulement s'ils commencent par `_`.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    // `test()` et `describe()` de node:test renvoient une promesse que le lanceur gère lui-même :
    // exiger un await dans les fichiers de tests n'apporterait rien.
    files: ["tests/**/*.ts"],
    rules: { "@typescript-eslint/no-floating-promises": "off" },
  },
);
