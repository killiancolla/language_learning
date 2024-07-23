### Instructions de configuration ESLint pour Tailwind CSS dans un projet Next.js

1. **Installer les dépendances nécessaires** :
   Utilise `pnpm` pour installer ESLint et les plugins nécessaires pour Tailwind CSS.

   ```bash
   pnpm add -D eslint eslint-config-next eslint-plugin-tailwindcss @typescript-eslint/parser @typescript-eslint/eslint-plugin
   ```

2. **Configurer ESLint** :
   Ouvre ton fichier `.eslintrc.json` et configure-le pour intégrer Tailwind CSS avec TypeScript. Voici un exemple de configuration :

   ```json
   {
     "parser": "@typescript-eslint/parser",
     "extends": [
       "next",
       "next/core-web-vitals",
       "plugin:@typescript-eslint/recommended",
       "plugin:tailwindcss/recommended"
     ],
     "plugins": ["@typescript-eslint", "tailwindcss"],
     "rules": {
       // Ajoute ici des règles personnalisées si nécessaire
     },
     "settings": {
       "tailwindcss": {
         "config": "tailwind.config.ts",
         "groups": {
           "colors": ["bg-red", "bg-green", "bg-blue"],
           "text": ["text-red", "text-green", "text-blue"]
         }
       }
     }
   }
   ```

   Cette configuration étend les configurations recommandées pour Next.js, TypeScript et Tailwind CSS, et ajoute les plugins nécessaires.

3. **Configurer Tailwind CSS** :
   Assure-toi que Tailwind CSS est correctement configuré dans ton projet. Voici un exemple de fichier `tailwind.config.ts` :

   ```typescript
   import { Config } from 'tailwindcss';

   const config: Config = {
     content: [
       './pages/**/*.{js,ts,jsx,tsx}',
       './components/**/*.{js,ts,jsx,tsx}'
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   };

   export default config;
   ```

4. **Ajouter des scripts dans le fichier `package.json`** :
   Ajoute des scripts pour exécuter ESLint. Par exemple :

   ```json
   "scripts": {
     "lint": "eslint . --ext .js,.ts,.jsx,.tsx",
     "lint:fix": "eslint . --ext .js,.ts,.jsx,.tsx --fix"
   }
   ```

5. **Exécuter ESLint** :
   Tu peux maintenant exécuter ESLint sur ton projet en utilisant les scripts définis :

   ```bash
   pnpm lint
   ```

   Pour corriger automatiquement les problèmes, tu peux utiliser :

   ```bash
   pnpm lint:fix
   ```

Cela devrait configurer ESLint pour fonctionner avec Tailwind CSS dans ton projet Next.js en utilisant `pnpm` et un fichier de configuration TypeScript pour Tailwind CSS. Assure-toi d'adapter les chemins et les configurations selon les besoins spécifiques de ton projet.
