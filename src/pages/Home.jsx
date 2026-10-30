import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, cookAgain } from '../lib/db';
import { canMake } from '../lib/suggest';
import { ingredientName } from '../lib/ingredients';
import RecipeCard from '../components/RecipeCard';

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

// Tonight's suggestions: ready to cook, one ingredient away, then favorites due a repeat.
function tonight(recipes, larder) {
  const picks = new Map();
  canMake(recipes, larder).forEach(({ recipe, missing }) => {
    picks.set(recipe.id, { recipe, why: missing.length === 0 ? 'Ready to cook' : `Need ${ingredientName(missing[0])}` });
  });
  cookAgain(recipes).forEach((recipe) => {
    if (!picks.has(recipe.id)) picks.set(recipe.id, { recipe, why: 'Favorite' });
  });
  return [...picks.values()].slice(0, 3);
}

function Home() {
  const recipes = useLiveQuery(() => db.recipes.orderBy('updatedAt').reverse().toArray(), []);
  const larder = useLiveQuery(() => db.larder.toArray(), []);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState(null);

  if (!recipes || !larder) return null;

  const picks = tonight(recipes, larder);
  const tags = [...new Set(recipes.flatMap((r) => r.tags))].sort();
  const needle = query.trim().toLowerCase();
  const shown = recipes.filter((r) => (!tag || r.tags.includes(tag))
    && (!needle || r.title.toLowerCase().includes(needle) || r.ingredients.some((i) => i.toLowerCase().includes(needle))));

  return (
    <div className="page home">
      <section className="hero">
        <div className="hero_text">
          <p className="label label-accent">{today}</p>
          <h1 className="display">Good ingredients, <em>cooked simply.</em></h1>
          <div className="toolbar">
            <label className="search">
              <span className="visually_hidden">Search recipes</span>
              <input type="search" placeholder="Search recipes" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <Link to="/new" className="button">+ New recipe</Link>
          </div>
          {tags.length > 0 && (
            <div className="chips label" role="group" aria-label="Filter by tag">
              <button type="button" className={`chip ${tag === null ? 'chip-on' : ''}`} aria-pressed={tag === null} onClick={() => setTag(null)}>All</button>
              {tags.map((t) => (
                <button key={t} type="button" className={`chip ${tag === t ? 'chip-on' : ''}`} aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <aside className="menu_card">
          <h2 className="menu_card_title">Tonight</h2>
          {picks.length > 0 ? (
            <ol>
              {picks.map(({ recipe, why }) => (
                <li key={recipe.id}>
                  <Link to={`/recipe/${recipe.id}`}>
                    <span className="menu_card_dish">{recipe.title}</span>
                    <span className={why === 'Ready to cook' ? 'pill pill-ready' : 'pill'}>{why}</span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty">Add what you have to see what you can make.</p>
          )}
          <Link to="/larder" className="button button-quiet button-full">Update larder</Link>
        </aside>
      </section>

      <section className="box">
        <h2 className="section_title">Recipes</h2>
        {shown.length === 0 && <p className="empty">No matches.</p>}
        <ul className="shelf">
          {shown.map((recipe) => <li key={recipe.id}><RecipeCard recipe={recipe} /></li>)}
        </ul>
      </section>
    </div>
  );
}

export default Home;
