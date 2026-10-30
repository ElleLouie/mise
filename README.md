# mise

A recipe box that cooks with you, designed like a specialty provisions shop: each recipe sits in its own handmade ceramic vessel with a jar-style label.

## Features

- **Recipe box:** add, edit and search recipes, filter by tag, favorite the ones you love, and choose the vessel each is served in
- **Today's table:** suggestions for tonight, like favorites you haven't made in a while
- **Servings stepper:** quantities rescale automatically (1½ cups → 3 cups)
- **Cook mode:** one step at a time in large type, swipe between steps, tap a time in a step ("bake 12 minutes") to start a timer, and the screen stays on
- **Last time notes:** jot down tweaks and a rating each time you cook something
- **Glaze themes:** Stoneware, Celadon, Cobalt and Tenmoku (dark)
- **Installable:** add it to your phone's home screen and it works offline
- **Backup:** recipes are stored in your browser; export and import them as a JSON file

Coming next: the Larder (pantry) and "what can I make", recipe recommendations, importing from a link, a shopping list and the Table (weekly meal plan).

## Running locally

```bash
npm install
npm run dev
```

- `npm run build` builds the app into `dist/`
- `npm run preview` serves the production build
- `npm run lint` checks the code
- `npm test` runs the unit tests for ingredient scaling, key ingredients and timers

Built with React, Vite, Dexie (IndexedDB) and vite-plugin-pwa. Hosted on Netlify (settings in `netlify.toml`).
