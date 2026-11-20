import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import RecipeCard from '../components/RecipeCard';
import Icon from '../components/Icon';

function Recipes() {
  const recipes = useLiveQuery(() => db.recipes.orderBy('updatedAt').reverse().toArray(), []);
  const [query, setQuery] = useState('');

  if (!recipes) return null;

  const needle = query.trim().toLowerCase();
  const shown = recipes.filter((r) => !needle || r.title.toLowerCase().includes(needle) || r.ingredients.some((i) => i.toLowerCase().includes(needle)));

  return (
    <div className="page">
      <header className="page_head">
        <h1 className="page_title">Recipes</h1>
        <div className="page_actions">
          <Link to="/recipes/new" className="button"><Icon name="plus" size={18} />New recipe</Link>
        </div>
      </header>

      <section className="section section-tight">
                <label className="search">
          <Icon name="search" size={18} />
          <span className="visually_hidden">Search recipes</span>
          <input type="search" placeholder="Search recipes or ingredients" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        {shown.length === 0 && <p className="empty">No matches.</p>}
        <ul className="grid">
          {shown.map((recipe) => <li key={recipe.id}><RecipeCard recipe={recipe} /></li>)}
        </ul>
      </section>
    </div>
  );
}

export default Recipes;
