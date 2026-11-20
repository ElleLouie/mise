# mise

A small dinner party planner. Pick a menu, and mise builds the shopping list, a cooking timeline that works back from dinner time, and a 3D table setting for inspiration.

## Features

- **Ideas:** six themed dinners (Backyard BBQ, Japanese night, Sunday roast, Italian trattoria, Taco night, Mediterranean mezze) with a full menu; plan one in a tap
- **Parties:** a date, a dinner time and a guest count
- **Menu:** starters, mains, sides and dessert, picked from your recipes
- **Shopping:** one list for the whole menu, scaled for your guests, combined and sorted by aisle
- **Timeline:** every step on one clock, ending as each course is served; desserts and make-ahead dishes are done before guests arrive
- **Table:** a 3D table set for your guests in one of five moods (Candlelight, Garden, Citrus, Plum & olive, Linen); drag to look around
- **Recipes:** save your own or find new ones on [TheMealDB](https://www.themealdb.com), with cook mode for one step at a time
- **Themes, offline and backup:** deep plum or light, installable on your phone, and everything exports as one JSON file

## Running locally

```bash
npm install
npm run dev
```

- `npm run build` builds the app into `dist/`
- `npm run preview` serves the production build
- `npm run lint` checks the code
- `npm test` runs the unit tests for ingredients, the shopping list, the timeline, aisles, timers and recipe import

Built with React, Vite, Fraunces and Figtree, three.js, Dexie (IndexedDB) and vite-plugin-pwa. Hosted on Netlify (settings in `netlify.toml`).
