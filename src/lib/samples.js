// A few recipes to start with. They can be edited or deleted like any other.

const DAY = 24 * 60 * 60 * 1000;

const recipes = [
  {
    title: 'Lemony white bean pasta',
    vessel: 'stoneware',
    food: 'golden',
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
    vessel: 'celadon',
    food: 'salmon',
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
    vessel: 'cobalt',
    food: 'greens',
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
    vessel: 'shino',
    food: 'bake',
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
];

export default function sampleRecipes() {
  const now = Date.now();
  // the oldest sample becomes No. 001
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
