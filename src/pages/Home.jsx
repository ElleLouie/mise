import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, cookAgain } from '../lib/db';
import { canMake } from '../lib/suggest';
import { ingredientName } from '../lib/ingredients';
import RecipeCard from '../components/RecipeCard';

// Suggestions: ready to cook with what's in the pantry, one ingredient away, or a favorite due a repeat.
function suggestions(recipes, pantry) {
  const picks = new Map();
  canMake(recipes, pantry).forEach(({ recipe, missing }) => {
    picks.set(recipe.id, { recipe, why: missing.length === 0 ? 'Ready to cook' : `Need ${ingredientName(missing[0])}` });
  });
  cookAgain(recipes).forEach((recipe) => {
    if (!picks.has(recipe.id)) picks.set(recipe.id, { recipe, why: 'Favorite' });
  });
  return [...picks.values()].slice(0, 3);
}

const STEPS = [
  { to: '/new', title: 'Save your recipes', text: 'Add your own or find new ones.' },
  { to: '/pantry', title: 'Add what you have', text: 'See what you can cook right now.' },
  { to: '/plan', title: 'Plan the week', text: 'Get one shopping list for it all.' },
];

function Home() {
  const recipes = useLiveQuery(() => db.recipes.orderBy('updatedAt').reverse().toArray(), []);
  const pantry = useLiveQuery(() => db.larder.toArray(), []);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState(null);

  if (!recipes || !pantry) return null;

  const picks = suggestions(recipes, pantry);
  const tags = [...new Set(recipes.flatMap((r) => r.tags))].sort();
  const needle = query.trim().toLowerCase();
  const shown = recipes.filter((r) => (!tag || r.tags.includes(tag))
    && (!needle || r.title.toLowerCase().includes(needle) || r.ingredients.some((i) => i.toLowerCase().includes(needle))));

  return (
    <div className="page home">
      <div className="page_head">
        <h1 className="display page_title">Recipes</h1>
        <div className="page_actions">
          <Link to="/discover" className="button button-quiet">Find new recipes</Link>
          <Link to="/new" className="button">+ New recipe</Link>
        </div>
      </div>

      {/* shown until the pantry is in use */}
      {pantry.length === 0 && (
        <section className="how" aria-label="How it works">
          <ol>
            {STEPS.map(({ to, title, text }, i) => (
              <li key={to}>
                <Link to={to}>
                  <span className="how_number">{i + 1}</span>
                  <span>
                    <span className="how_title">{title}</span>
                    <span className="how_text">{text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {picks.length > 0 && (
        <section className="suggest">
          <h2 className="section_label label">Cook tonight</h2>
          <ul className="items">
            {picks.map(({ recipe, why }) => (
              <li key={recipe.id}>
                <Link to={`/recipe/${recipe.id}`} className="items_link">{recipe.title}</Link>
                <span className={why === 'Ready to cook' ? 'pill pill-ready' : 'pill'}>{why}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="box">
        <label className="search">
          <span className="visually_hidden">Search recipes</span>
          <input type="search" placeholder="Search recipes or ingredients" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        {tags.length > 0 && (
          <div className="chips" role="group" aria-label="Filter by tag">
            <button type="button" className={`chip ${tag === null ? 'chip-on' : ''}`} aria-pressed={tag === null} onClick={() => setTag(null)}>All</button>
            {tags.map((t) => (
              <button key={t} type="button" className={`chip ${tag === t ? 'chip-on' : ''}`} aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>
                {t}
              </button>
            ))}
          </div>
        )}
        {shown.length === 0 && <p className="empty">No matches.</p>}
        <ul className="shelf">
          {shown.map((recipe) => <li key={recipe.id}><RecipeCard recipe={recipe} /></li>)}
        </ul>
      </section>
    </div>
  );
}

export default Home;
