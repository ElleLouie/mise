import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, blankRecipe, saveRecipe } from '../lib/db';
import { findByIngredient, lookup, toRecipe } from '../lib/mealdb';
import Icon from '../components/Icon';

const IDEAS = ['chicken', 'salmon', 'beef', 'pasta', 'rice', 'tofu', 'mushrooms', 'lemon'];

function Discover() {
  const navigate = useNavigate();
  const larder = useLiveQuery(() => db.larder.toArray(), []);
  const saved = useLiveQuery(() => db.recipes.toArray(), []);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('chicken');
  const [state, setState] = useState({ status: 'loading', results: [] });
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    let current = true;
    findByIngredient(search)
      .then((results) => current && setState({ status: 'done', results }))
      .catch(() => current && setState({ status: 'error', results: [] }));
    return () => { current = false; };
  }, [search]);

  const run = (term) => {
    if (!term.trim() || term === search) return;
    setState({ status: 'loading', results: [] });
    setSearch(term.trim().toLowerCase());
  };

  const save = async (id) => {
    setSaving(id);
    try {
      const meal = await lookup(id);
      const recipe = { ...blankRecipe(), ...toRecipe(meal) };
      await saveRecipe(recipe);
      navigate(`/recipe/${recipe.id}`);
    } catch {
      setSaving(null);
      setState((s) => ({ ...s, status: 'error' }));
    }
  };

  // ideas from the pantry first
  const ideas = [...new Set([...(larder || []).map((item) => item.name), ...IDEAS])].slice(0, 10);
  const savedTitles = new Set((saved || []).map((r) => r.title));

  return (
    <div className="page">
      <Link to="/" className="back_link"><Icon name="back" size={18} />Recipes</Link>
      <h1 className="page_title">Find new recipes</h1>

      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          run(query);
        }}
      >
        <label className="search">
          <span className="visually_hidden">Search by ingredient</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by ingredient" />
        </label>
        <button type="submit" className="button" disabled={!query.trim()}>Search</button>
      </form>

      <div className="chips" role="group" aria-label="Ideas">
        {ideas.map((idea) => (
          <button key={idea} type="button" className={`chip ${search === idea ? 'chip-on' : ''}`} aria-pressed={search === idea} onClick={() => run(idea)}>
            {idea}
          </button>
        ))}
      </div>

      {state.status === 'loading' && <p className="empty">Loading…</p>}
      {state.status === 'error' && <p className="empty">Couldn&apos;t load recipes. Check your connection.</p>}
      {state.status === 'done' && state.results.length === 0 && <p className="empty">No recipes with {search}.</p>}

      <ul className="discover">
        {state.results.slice(0, 24).map((meal) => (
          <li key={meal.id} className="discover_item">
            <img src={`${meal.image}/medium`} alt="" loading="lazy" />
            <h3>{meal.title}</h3>
            {savedTitles.has(meal.title) ? (
              <span className="pill pill-ready">Saved</span>
            ) : (
              <button type="button" className="button button-quiet" disabled={saving === meal.id} onClick={() => save(meal.id)}>
                {saving === meal.id ? 'Saving…' : '+ Save'}
              </button>
            )}
          </li>
        ))}
      </ul>
      <p className="small credit">Recipes from <a href="https://www.themealdb.com" target="_blank" rel="noreferrer">TheMealDB</a></p>
    </div>
  );
}

export default Discover;
