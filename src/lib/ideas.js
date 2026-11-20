// Dinner ideas: a theme, a table mood, and a menu by course. Planning one saves its recipes to your box.

const r = (title, course, servings, minutes, ingredients, steps, tags = []) => ({
  course, recipe: { title, servings, minutes, tags: [course === 'main' ? 'main' : course, ...tags], ingredients, steps },
});

export const ideas = [
  {
    id: 'bbq',
    name: 'Backyard BBQ',
    blurb: 'Smoky, sticky and easy to share.',
    mood: 'citrus',
    dishes: [
      r('Grilled corn with chili lime butter', 'starter', 4, 20, [
        '4 ears corn', '4 tbsp butter, softened', '1 lime, zested and juiced', '1 tsp chili flakes', '¼ cup grated parmesan',
      ], [
        'Mix the butter with lime zest, lime juice and chili flakes.',
        'Grill the corn over high heat for 10 minutes, turning, until charred in spots.',
        'Brush with the butter and finish with parmesan.',
      ]),
      r('Sticky BBQ ribs', 'main', 4, 180, [
        '2 racks pork ribs', '2 tbsp brown sugar', '1 tbsp smoked paprika', '1 tsp garlic powder', '1 cup barbecue sauce', 'Salt',
      ], [
        'Rub the ribs with sugar, paprika, garlic powder and salt.',
        'Wrap in foil and bake at 300°F (150°C) for 2 hours 30 minutes, until tender.',
        'Unwrap, brush with barbecue sauce and grill for 10 minutes, turning, until sticky.',
        'Rest for 5 minutes, then cut between the bones.',
      ], ['bbq']),
      r('Charred potato salad', 'side', 4, 40, [
        '1kg baby potatoes', '3 tbsp olive oil', '½ cup mayonnaise', '1 tbsp dijon mustard', '3 scallions, sliced', '1 handful dill, chopped',
      ], [
        'Boil the potatoes for 15 minutes, until just tender, then halve them.',
        'Toss with olive oil and grill cut side down for 10 minutes, until charred.',
        'Mix the mayonnaise and mustard, then fold in the potatoes, scallions and dill.',
      ], ['make ahead']),
      r('Crunchy slaw', 'side', 4, 15, [
        '½ red cabbage, shredded', '2 carrots, grated', '3 tbsp apple cider vinegar', '2 tbsp olive oil', '1 tsp honey', '1 handful cilantro',
      ], [
        'Whisk the vinegar, olive oil and honey with a pinch of salt.',
        'Toss with the cabbage, carrots and cilantro and leave for 10 minutes to soften slightly.',
      ]),
      r('Grilled peaches with mascarpone', 'dessert', 4, 15, [
        '4 peaches, halved', '1 tbsp olive oil', '1 cup mascarpone', '2 tbsp honey', '¼ cup toasted almonds',
      ], [
        'Brush the peaches with oil and grill cut side down for 5 minutes.',
        'Serve warm with mascarpone, honey and almonds.',
      ]),
    ],
  },
  {
    id: 'japanese',
    name: 'Japanese night',
    blurb: 'Clean flavours, small plates and rice.',
    mood: 'garden',
    dishes: [
      r('Edamame with chili salt', 'starter', 4, 10, ['500g frozen edamame', '1 tsp flaky salt', '½ tsp chili flakes', '1 tsp sesame oil'], [
        'Boil the edamame for 5 minutes, then drain.',
        'Toss with sesame oil, salt and chili flakes.',
      ]),
      r('Smashed cucumber salad', 'starter', 4, 15, [
        '2 cucumbers', '2 tbsp rice vinegar', '1 tbsp soy sauce', '1 tsp sesame oil', '1 tsp sugar', '1 tbsp toasted sesame seeds',
      ], [
        'Smash the cucumbers lightly with a rolling pin and break into pieces.',
        'Whisk the vinegar, soy sauce, sesame oil and sugar, then toss with the cucumber.',
        'Chill for 10 minutes and finish with sesame seeds.',
      ]),
      r('Miso glazed salmon', 'main', 4, 30, [
        '4 salmon fillets', '3 tbsp white miso', '2 tbsp mirin', '1 tbsp honey', '1 tbsp soy sauce', '2 scallions, sliced',
      ], [
        'Mix the miso, mirin, honey and soy sauce.',
        'Spread over the salmon and leave for 15 minutes.',
        'Broil for 8 minutes, until caramelised, and top with scallions.',
      ], ['japanese']),
      r('Steamed rice', 'side', 4, 35, ['2 cups short grain rice', '2 ½ cups water'], [
        'Rinse the rice until the water runs clear.',
        'Simmer covered for 15 minutes, then rest off the heat for 10 minutes.',
      ]),
      r('Sesame green beans', 'side', 4, 15, ['400g green beans', '2 tbsp tahini', '1 tbsp soy sauce', '1 tsp sugar', '1 tbsp toasted sesame seeds'], [
        'Boil the beans for 4 minutes, then cool in cold water.',
        'Whisk the tahini, soy sauce and sugar with a splash of water, then toss with the beans and sesame seeds.',
      ]),
      r('Matcha panna cotta', 'dessert', 6, 30, ['2 cups cream', '1 cup milk', '⅓ cup sugar', '2 tsp matcha', '3 tsp gelatin'], [
        'Bloom the gelatin in a little cold milk for 5 minutes.',
        'Warm the cream, remaining milk, sugar and matcha, whisking until smooth, then stir in the gelatin.',
        'Pour into glasses and chill for at least 4 hours.',
        'Serve cold.',
      ], ['make ahead']),
    ],
  },
  {
    id: 'roast',
    name: 'Sunday roast',
    blurb: 'Slow, golden and made for the long table.',
    mood: 'candlelight',
    dishes: [
      r('Leek and potato soup', 'starter', 6, 40, [
        '3 leeks, sliced', '3 potatoes, chopped', '2 tbsp butter', '4 cups chicken stock', '½ cup cream', '1 bunch chives, chopped',
      ], [
        'Soften the leeks in butter for 10 minutes.',
        'Add the potatoes and stock and simmer for 20 minutes.',
        'Blend until smooth, stir in the cream and top with chives.',
      ], ['make ahead']),
      r('Roast beef with gravy', 'main', 6, 120, [
        '1.5kg beef sirloin roast', '2 tbsp olive oil', '4 sprigs rosemary', '4 cloves garlic', '2 tbsp flour', '2 cups beef stock',
      ], [
        'Take the beef out of the fridge an hour before and heat the oven to 450°F (230°C).',
        'Rub with oil, salt, rosemary and garlic and roast for 15 minutes.',
        'Lower the oven to 350°F (175°C) and roast for 45 minutes more for medium rare.',
        'Rest the beef for 20 minutes while you whisk the flour and stock into the pan juices for gravy.',
      ], ['roast']),
      r('Crispy roast potatoes', 'side', 6, 70, ['1.5kg russet potatoes', '½ cup olive oil', '4 sprigs rosemary', 'Flaky salt'], [
        'Boil the potatoes for 10 minutes, drain and shake to rough up the edges.',
        'Roast in hot oil at 425°F (220°C) for 50 minutes, turning once, until crisp.',
        'Finish with rosemary and flaky salt.',
      ]),
      r('Honey glazed carrots', 'side', 6, 35, ['1kg carrots, halved', '2 tbsp butter', '2 tbsp honey', '1 tbsp thyme leaves'], [
        'Toss the carrots with butter, honey and thyme.',
        'Roast at 425°F (220°C) for 30 minutes, until glossy.',
      ]),
      r('Apple crumble', 'dessert', 6, 60, [
        '6 apples, sliced', '2 tbsp sugar', '1 tsp cinnamon', '1 cup flour', '½ cup brown sugar', '½ cup cold butter', '½ cup oats', '1 cup cream',
      ], [
        'Toss the apples with sugar and cinnamon in a baking dish.',
        'Rub the flour, brown sugar and butter into crumbs, then stir in the oats.',
        'Scatter over the apples and bake at 375°F (190°C) for 40 minutes.',
        'Serve warm with cream.',
      ], ['make ahead']),
    ],
  },
  {
    id: 'italian',
    name: 'Italian trattoria',
    blurb: 'Big bowls of pasta and something cold for dessert.',
    mood: 'ice',
    dishes: [
      r('Tomato bruschetta', 'starter', 6, 20, [
        '1 baguette, sliced', '4 tomatoes, diced', '1 clove garlic', '3 tbsp olive oil', '1 handful basil leaves', 'Flaky salt',
      ], [
        'Toast the bread for 5 minutes, then rub with the cut garlic.',
        'Mix the tomatoes with olive oil, basil and salt and pile onto the toast.',
      ]),
      r('Rigatoni alla vodka', 'main', 4, 30, [
        '400g rigatoni', '2 tbsp butter', '1 shallot, minced', '3 tbsp tomato paste', '¼ cup vodka', '¾ cup cream', '½ cup grated parmesan',
      ], [
        'Cook the pasta for 11 minutes, saving a cup of pasta water.',
        'Soften the shallot in butter for 3 minutes, then cook the tomato paste for 5 minutes, until deep red.',
        'Add the vodka and cream and simmer for 2 minutes.',
        'Toss with the pasta, parmesan and pasta water until glossy.',
      ], ['italian']),
      r('Arugula and parmesan salad', 'side', 4, 10, ['4 handfuls arugula', '1 lemon', '3 tbsp olive oil', '½ cup shaved parmesan'], [
        'Dress the arugula with lemon juice, olive oil and salt, then top with parmesan.',
      ]),
      r('Tiramisu', 'dessert', 8, 30, [
        '1 cup strong coffee, cooled', '3 tbsp coffee liqueur', '4 eggs', '½ cup sugar', '1 cup mascarpone', '24 ladyfingers', '2 tbsp cocoa powder',
      ], [
        'Whisk the yolks and sugar until pale, then fold in the mascarpone.',
        'Whip the whites to soft peaks and fold through.',
        'Dip the ladyfingers in the coffee and liqueur and layer with the cream.',
        'Chill for at least 6 hours, then dust with cocoa to serve.',
      ], ['make ahead']),
    ],
  },
  {
    id: 'tacos',
    name: 'Taco night',
    blurb: 'Build-your-own, bright and a little spicy.',
    mood: 'citrus',
    dishes: [
      r('Guacamole and chips', 'starter', 6, 15, ['3 avocados', '1 lime', '½ red onion, minced', '1 jalapeño, minced', '1 handful cilantro', '1 bag tortilla chips'], [
        'Mash the avocados with lime juice and salt.',
        'Stir in the onion, jalapeño and cilantro and serve with chips.',
      ]),
      r('Chicken tinga tacos', 'main', 6, 45, [
        '1kg chicken thighs', '1 onion, sliced', '3 cloves garlic', '1 can (400g) crushed tomatoes', '2 chipotles in adobo', '12 corn tortillas', '1 cup sour cream',
      ], [
        'Simmer the chicken in salted water for 20 minutes, then shred.',
        'Soften the onion and garlic for 5 minutes, then blend with the tomatoes and chipotles.',
        'Simmer the sauce with the chicken for 10 minutes.',
        'Warm the tortillas and serve with sour cream.',
      ], ['mexican']),
      r('Quick pickled red onions', 'side', 6, 30, ['2 red onions, thinly sliced', '1 cup white vinegar', '1 tbsp sugar', '1 tsp salt'], [
        'Warm the vinegar with sugar and salt until dissolved.',
        'Pour over the onions and leave for 30 minutes.',
      ], ['make ahead']),
      r('Smoky black beans', 'side', 6, 20, ['2 cans (400g) black beans', '1 tsp cumin', '1 tsp smoked paprika', '1 lime'], [
        'Warm the beans with their liquid, cumin and paprika for 15 minutes, mashing a few.',
        'Finish with lime juice.',
      ]),
      r('Mango with chili and lime', 'dessert', 6, 10, ['3 mangoes', '2 limes', '1 tsp chili powder', '1 tsp flaky salt'], [
        'Slice the mangoes and squeeze over the lime.',
        'Sprinkle with chili and salt just before serving.',
      ]),
    ],
  },
  {
    id: 'mezze',
    name: 'Mediterranean mezze',
    blurb: 'Lots of little plates and warm bread.',
    mood: 'linen',
    dishes: [
      r('Hummus with warm pita', 'starter', 6, 15, ['2 cans (400g) chickpeas', '⅓ cup tahini', '2 lemons', '1 clove garlic', '4 tbsp olive oil', '6 pita breads'], [
        'Blend the chickpeas, tahini, lemon juice, garlic and a splash of ice water until very smooth.',
        'Spread on a plate, drizzle with olive oil and serve with warm pita.',
      ], ['make ahead']),
      r('Whipped feta with honey', 'starter', 6, 10, ['200g feta', '½ cup Greek yogurt', '2 tbsp honey', '1 tsp thyme leaves', '2 tbsp olive oil'], [
        'Blend the feta and yogurt until smooth.',
        'Top with honey, thyme and olive oil.',
      ]),
      r('Lamb kofta', 'main', 6, 40, [
        '1kg ground lamb', '1 onion, grated', '3 cloves garlic, grated', '2 tsp cumin', '1 tsp cinnamon', '1 handful parsley, chopped', '1 cup Greek yogurt',
      ], [
        'Mix the lamb with onion, garlic, spices, parsley and salt.',
        'Shape onto skewers and chill for 15 minutes.',
        'Grill for 10 minutes, turning, until charred and cooked through.',
        'Serve with yogurt.',
      ], ['mediterranean']),
      r('Fattoush salad', 'side', 6, 20, [
        '2 pita breads', '3 tomatoes, chopped', '1 cucumber, chopped', '6 radishes, sliced', '1 handful mint', '1 lemon', '3 tbsp olive oil', '1 tsp sumac',
      ], [
        'Toast the torn pita for 8 minutes, until crisp.',
        'Toss the vegetables and mint with lemon juice, olive oil and sumac, then add the pita.',
      ]),
      r('Yogurt with honey and pistachios', 'dessert', 6, 5, ['3 cups Greek yogurt', '4 tbsp honey', '½ cup pistachios, chopped', '1 orange, zested'], [
        'Spoon the yogurt into bowls and top with honey, pistachios and orange zest.',
      ]),
    ],
  },
];

export const ideaFor = (id) => ideas.find((idea) => idea.id === id);
