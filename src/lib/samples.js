// A few recipes to start with. They can be edited or deleted like any other.

const DAY = 24 * 60 * 60 * 1000;

const recipes = [
  {
    title: 'Lemony white bean pasta',
    servings: 2,
    minutes: 25,
    tags: ['quick', 'weeknight', 'vegetarian'],
    ingredients: [
      '200g short pasta',
      '1 can (400g) white beans, drained',
      '3 tbsp olive oil',
      '3 cloves garlic, sliced',
      '1 lemon, zested and juiced',
      '2 handfuls spinach',
      '½ cup grated parmesan',
      'Salt and pepper',
    ],
    steps: [
      'Cook the pasta in well-salted water for about 10 minutes, then save a cup of the pasta water before draining.',
      'Warm the olive oil in a wide pan and cook the garlic for 2 minutes, until just golden.',
      'Add the beans and lemon zest and cook for 5 minutes, mashing a few beans as you go.',
      'Toss in the pasta, spinach, lemon juice, parmesan and a splash of pasta water until glossy. Season to taste.',
    ],
    favorite: false,
  },
  {
    title: 'Miso butter salmon',
    servings: 2,
    minutes: 25,
    tags: ['quick', 'weeknight'],
    ingredients: [
      '2 salmon fillets',
      '2 tbsp white miso',
      '2 tbsp butter, softened',
      '1 tbsp honey',
      '1 lemon',
      '2 scallions, thinly sliced',
    ],
    steps: [
      'Heat the oven to 425°F (220°C).',
      'Mix the miso, butter and honey into a paste.',
      'Spread it over the salmon and bake for 12 minutes.',
      'Broil for 2 minutes for color, then finish with lemon and scallions.',
    ],
    favorite: true,
    notes: [{ text: 'More lemon next time. Broiling at the end is worth it.', rating: 5, daysAgo: 21 }],
  },
  {
    title: 'Crispy rice salad',
    servings: 4,
    minutes: 30,
    tags: ['fresh', 'vegetarian'],
    ingredients: [
      '3 cups cooked rice, cold',
      '3 tbsp neutral oil',
      '1 cucumber, chopped',
      '1 cup mint and cilantro leaves',
      '2 scallions, sliced',
      '¼ cup roasted peanuts, chopped',
      '3 tbsp lime juice',
      '1 tbsp soy sauce',
      '1 tsp sugar',
    ],
    steps: [
      'Press the rice into a thin layer in a hot, oiled pan and cook undisturbed for 8 minutes, until crisp underneath.',
      'Break it into pieces, flip, and cook for 4 minutes more.',
      'Whisk the lime juice, soy sauce and sugar into a dressing.',
      'Toss the cucumber, herbs and scallions with the dressing, then top with the crispy rice and peanuts.',
    ],
    favorite: false,
  },
  {
    title: 'Brown butter chocolate chip cookies',
    servings: 24,
    minutes: 45,
    tags: ['baking', 'sweet'],
    ingredients: [
      '1 cup (225g) butter',
      '1 cup brown sugar',
      '½ cup sugar',
      '2 eggs',
      '2 tsp vanilla',
      '2 1/4 cups flour',
      '1 tsp baking soda',
      '1 tsp salt',
      '2 cups chocolate chips',
    ],
    steps: [
      'Melt the butter over medium heat and keep cooking for about 5 minutes, until it smells nutty and turns golden brown. Let it cool for 10 minutes.',
      'Whisk in both sugars, then the eggs and vanilla.',
      'Stir in the flour, baking soda and salt, then the chocolate chips.',
      'Scoop onto a lined tray and bake at 350°F (175°C) for 10-12 minutes.',
      'Let them cool on the tray for 5 minutes before moving.',
    ],
    favorite: true,
  },
  {
    title: 'Burrata with blood oranges',
    servings: 4,
    minutes: 15,
    tags: ['starter', 'fresh', 'vegetarian'],
    ingredients: [
      '2 balls burrata',
      '3 blood oranges',
      '2 tbsp olive oil',
      '1 tbsp honey',
      '1 handful basil leaves',
      '¼ cup pistachios, chopped',
      'Flaky salt',
      '1 baguette',
    ],
    steps: [
      'Take the burrata out of the fridge 30 minutes before serving.',
      'Peel the oranges, slice them into rounds and arrange on a platter.',
      'Tear the burrata over the top, drizzle with olive oil and honey, and finish with basil, pistachios and flaky salt.',
    ],
    favorite: false,
  },
  {
    title: 'Herb roast chicken',
    servings: 4,
    minutes: 90,
    tags: ['main', 'dinner party'],
    ingredients: [
      '1 whole chicken (about 1.8kg)',
      '4 tbsp butter, softened',
      '1 lemon',
      '6 cloves garlic',
      '1 bunch thyme',
      '1 bunch rosemary',
      'Salt and pepper',
    ],
    steps: [
      'Heat the oven to 425°F (220°C) and pat the chicken dry.',
      'Mash the butter with chopped herbs and garlic, then rub it under and over the skin. Stuff the lemon inside.',
      'Roast for 1 hour, until the juices run clear.',
      'Rest the chicken for 15 minutes before carving.',
    ],
    favorite: true,
  },
  {
    title: 'Crispy smashed potatoes',
    servings: 4,
    minutes: 60,
    tags: ['side', 'vegetarian'],
    ingredients: [
      '1kg baby potatoes',
      '4 tbsp olive oil',
      '2 cloves garlic, grated',
      '1 handful parsley, chopped',
      '1 lemon, zested',
      'Flaky salt',
    ],
    steps: [
      'Boil the potatoes in salted water for 20 minutes, until tender.',
      'Drain, spread on an oiled tray and press each one flat with a glass.',
      'Drizzle with olive oil and roast at 425°F (220°C) for 30 minutes, until crisp.',
      'Toss with garlic, parsley, lemon zest and flaky salt.',
    ],
    favorite: false,
  },
  {
    title: 'Olive oil chocolate cake',
    servings: 8,
    minutes: 70,
    tags: ['dessert', 'sweet', 'make ahead'],
    ingredients: [
      '¾ cup olive oil',
      '1 cup sugar',
      '3 eggs',
      '1 cup flour',
      '½ cup cocoa powder',
      '1 tsp baking powder',
      '1 cup crème fraîche',
    ],
    steps: [
      'Heat the oven to 350°F (175°C) and line a 9-inch pan.',
      'Whisk the olive oil, sugar and eggs until pale, then fold in the flour, cocoa and baking powder.',
      'Bake for 40 minutes, then cool in the pan.',
      'Serve in slices with crème fraîche.',
    ],
    favorite: true,
  },
];

export function samplePartyFor(recipes) {
  const byTitle = (title) => recipes.find((recipe) => recipe.title === title)?.id;
  // next Saturday
  const date = new Date();
  date.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7 || 7));
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name: 'Saturday supper',
    date: iso,
    time: '19:30',
    guests: 6,
    mood: 'gingham',
    dishes: [
      { recipeId: byTitle('Burrata with blood oranges'), course: 'starter' },
      { recipeId: byTitle('Herb roast chicken'), course: 'main' },
      { recipeId: byTitle('Crispy smashed potatoes'), course: 'side' },
      { recipeId: byTitle('Crispy rice salad'), course: 'side' },
      { recipeId: byTitle('Olive oil chocolate cake'), course: 'dessert' },
    ].filter((dish) => dish.recipeId),
    bought: [],
    createdAt: now,
    updatedAt: now,
  };
}

export default function sampleRecipes() {
  const now = Date.now();
  // the first sample is the oldest
  return recipes.map(({ notes = [], ...recipe }, i, list) => {
    const datedNotes = notes.map(({ daysAgo, ...note }) => ({ ...note, id: crypto.randomUUID(), date: now - daysAgo * DAY }));
    return {
      ...recipe,
      id: crypto.randomUUID(),
      source: '',
      notes: datedNotes,
      createdAt: now - (list.length - i) * 1000,
      updatedAt: now - (list.length - i) * 1000,
      lastCookedAt: datedNotes[0]?.date ?? null,
    };
  });
}
