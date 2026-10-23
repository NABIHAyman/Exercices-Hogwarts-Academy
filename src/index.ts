/**
 * index.ts — Point d'entrée provisoire de l'étape 0.
 * Son rôle : prouver que la chaîne complète (compilation, exécution, test, lint) fonctionne.
 * Il sera remplacé par main.ts et le vrai scénario à l'étape 11.
 */

/** Une première fonction typée : le compilateur vérifie l'argument et le retour. */
export function greet(name: string): string {
  return `Hello ${name}!`;
}

// Exécuté seulement quand le fichier est lancé directement (npm start),
// pas quand un test l'importe : les tests restent silencieux.
if (require.main === module) {
  console.log(greet("Hogwarts"));
}
