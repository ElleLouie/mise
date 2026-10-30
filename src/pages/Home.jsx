import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, cookAgain } from '../lib/db';
import { canMake } from '../lib/suggest';
import { ingredientName } from '../lib/ingredients';
import RecipeCard from '../components/RecipeCard';
import Icon from '../components/Icon';

// Suggestions: ready to cook with what's at home, one ingredient away, or a favorite due a repeat.
function suggestions(recipes, pantry) {
  const picks = new Map();
  canMake(recipes, pantry).forEach(({ recipe, missing }) => {
    picks.set(recipe.id, { recipe, note: missing.length === 0 ? 'Ready to cook' : `Need ${ingredientName(missing[0])}` });
  });
  cookAgain(recipes).forEach((recipe) => {
    if (!picks.has(recipe.id)) picks.set(recipe.id, { recipe, note: 'Favorite' });
  });
  return [...picks.values()].slice(0, 4);
}

const STEPS = [
  { to: '/new', icon: 'book', title: 'Save recipes', text: 'Add your own or find new ones.' },
  { to: '/plan', icon: 'calendar', title: 'Plan your week', text: 'Pick what to cook each day.' },
  { to: '/groceries', icon: 'bag', title: 'Shop with one list', text: 'Everything you need, sorted by aisle.' },
];

function Home() {
  const recipes = useLiveQuery(() => db.recipes.orderBy('updatedAt').reverse().toArray(), []);
  const pantry = useLiveQuery(() => db.larder.toArray(), []);
  const started = useLiveQuery(async () => (await db.plan.count()) + (await db.list.count()) + (await db.larder.count()), []);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  if (!recipes || !pantry || started === undefined) return null;

  const picks = suggestions(recipes, pantry);
  const tags = [...new Set(recipes.flatMap((r) => r.tags))].sort();
  const needle = query.trim().toLowerCase();
  const shown = recipes.filter((r) => (filter === 'all' || (filter === 'favorites' ? r.favorite : r.tags.includes(filter)))
    && (!needle || r.title.toLowerCase().includes(needle) || r.ingredients.some((i) => i.toLowerCase().includes(needle))));

  return (
    <div className="page">
      <header className="page_head">
        <h1 className="page_title">Recipes</h1>
        <div className="page_actions">
          <Link to="/discover" className="button button-quiet"><Icon name="compass" size={18} />Find new</Link>
          <Link to="/new" className="button"><Icon name="plus" size={18} />New recipe</Link>
        </div>
      </header>

      {started === 0 && (
        <ol className="how" aria-label="How it works">
          {STEPS.map(({ to, icon, title, text }) => (
            <li key={to}>
              <Link to={to}>
                <Icon name={icon} size={22} />
                <span className="how_title">{title}</span>
                <span className="how_text">{text}</span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {picks.length > 0 && (
        <section className="section">
          <h2 className="section_title">Cook tonight</h2>
          <ul className="grid grid-row">
            {picks.map(({ recipe, note }) => <li key={recipe.id}><RecipeCard recipe={recipe} note={note} /></li>)}
          </ul>
        </section>
      )}

      <section className="section">
        <h2 className="section_title">All recipes</h2>
        <label className="search">
          <Icon name="search" size={18} />
          <span className="visually_hidden">Search recipes</span>
          <input type="search" placeholder="Search recipes or ingredients" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="chips" role="group" aria-label="Filter">
          {['all', 'favorites', ...tags].map((f) => (
            <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => setFilter(filter === f ? 'all' : f)}>
              {f === 'all' ? 'All' : f === 'favorites' ? 'Favorites' : f}
            </button>
          ))}
        </div>
        {shown.length === 0 && <p className="empty">No matches.</p>}
        <ul className="grid">
          {shown.map((recipe) => <li key={recipe.id}><RecipeCard recipe={recipe} /></li>)}
        </ul>
      </section>
    </div>
  );
}

export default Home;
