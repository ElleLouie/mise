# mise

A recipe box that cooks with you: calm, warm and easy to read from across the kitchen.

## Features

- **Recipes:** save your own or find new ones, search, filter by tag or favorites
- **Cook tonight:** recipes you can make with what's at home, one ingredient away, or favorites due a repeat
- **Recipe page:** servings that rescale quantities, "Have" marks, add missing ingredients to groceries, add to your plan, notes, and "More like this"
- **Cook mode:** one step at a time in large type, tap-to-start timers, and the screen stays on
- **Plan:** pick what to cook each day, then add the whole week to groceries in one tap
- **Groceries:** "To buy", sorted by aisle, and "At home"; bought items move to At home
- **Find new recipes:** search [TheMealDB](https://www.themealdb.com) by ingredient and save with one tap
- **Light, dark or automatic** appearance
- **Installable:** add it to your phone's home screen and it works offline
- **Backup:** everything is stored in your browser; export and import it as a JSON file

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
