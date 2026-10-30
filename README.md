# mise

A recipe box that cooks with you, designed like a restaurant kitchen pass: recipes are order tickets on a rail, and your recipe box prints like a receipt.

## Features

- **Recipe box:** add, edit and search recipes, filter by tag, and favorite the ones you love
- **Tonight's rail:** "cook again" suggestions for favorites you haven't made in a while
- **Servings stepper:** quantities rescale automatically (1½ cups → 3 cups)
- **Cook mode:** one step at a time in large type, swipe between steps, tap a time in a step ("bake 12 minutes") to start a timer, and the screen stays on
- **Last time notes:** jot down tweaks and a rating each time you cook something
- **Themes:** Steel, Tomato, Kraft and Night shift
- **Installable:** add it to your phone's home screen and it works offline
- **Backup:** recipes are stored in your browser; export and import them as a JSON file

Coming next: pantry and "what can I make", recipe recommendations, importing from a link, a shopping list and a weekly meal plan.

## Running locally

```bash
npm install
npm run dev
```

- `npm run build` builds the app into `dist/`
- `npm run preview` serves the production build
- `npm run lint` checks the code
- `npm test` runs the unit tests for ingredient scaling and timers

Built with React, Vite, Dexie (IndexedDB) and vite-plugin-pwa. Hosted on Netlify (settings in `netlify.toml`).
