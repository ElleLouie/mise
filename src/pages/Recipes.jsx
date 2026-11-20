import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import RecipeCard from '../components/RecipeCard';
import Icon from '../components/Icon';

function Recipes() {
  const recipes = useLiveQuery(() => db.recipes.orderBy('updatedAt').reverse().toArray(), []);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  if (!recipes) return null;

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
          <Link to="/recipes/new" className="button"><Icon name="plus" size={18} />New recipe</Link>
        </div>
      </header>

      <section className="section section-tight">
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

export default Recipes;
