# mise

A recipe box that cooks with you: calm, warm and easy to read from across the kitchen.

## Features

- **Recipes:** add, edit, search and tag recipes, mark favorites
- **Tonight:** suggestions that are ready to cook with what you have, one ingredient away, or favorites due a repeat
- **Recipe page:** servings stepper that rescales quantities, "Have" marks for what's in your larder, add missing ingredients to your list, notes, and "More like this"
- **Cook mode:** one step at a time in large type, tap-to-start timers, and the screen stays on
- **Table:** plan the week, then add everything it needs (minus what's in the larder) to the list in one tap
- **Discover:** find new recipes by ingredient from [TheMealDB](https://www.themealdb.com) and save them with one tap
- **Larder:** what's in your kitchen, with one-tap staples and "You can make"
- **List:** shopping list grouped by aisle; checked items move into the larder
- **Themes:** Stone, Sage, Cobalt and Night (dark)
- **Installable:** add it to your phone's home screen and it works offline
- **Backup:** everything is stored in your browser; export and import it as a JSON file

Coming next: importing recipes from a link.

## Running locally

```bash
npm install
npm run dev
```

- `npm run build` builds the app into `dist/`
- `npm run preview` serves the production build
- `npm run lint` checks the code
- `npm test` runs the unit tests for ingredients, matching, suggestions, aisles, timers and recipe import

Built with React, Vite, Dexie (IndexedDB) and vite-plugin-pwa. Hosted on Netlify (settings in `netlify.toml`).
