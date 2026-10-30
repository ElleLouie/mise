import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, planRecipe, unplan, addToList } from '../lib/db';
import { missingFor } from '../lib/suggest';
import { weekDays, dayLabel, dayNumber, today } from '../lib/week';

function weekTitle(offset) {
  if (offset === 0) return 'This week';
  if (offset === 1) return 'Next week';
  if (offset === -1) return 'Last week';
  return dayLabel(weekDays(offset)[0], 'short');
}

// A small list of recipes to choose from, with search.
function Picker({ recipes, onPick, onClose }) {
  const [query, setQuery] = useState('');
  const shown = recipes.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="picker">
      <div className="toolbar">
        <label className="search">
          <span className="visually_hidden">Find a recipe</span>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input autoFocus type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a recipe" />
        </label>
        <button type="button" className="button button-quiet" onClick={onClose}>Cancel</button>
      </div>
      <ul className="items">
        {shown.map((recipe) => (
          <li key={recipe.id}>
            <button type="button" className="items_pick" onClick={() => onPick(recipe.id)}>{recipe.title}</button>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="empty">No matches.</p>}
    </div>
  );
}

function Table() {
  const [offset, setOffset] = useState(0);
  const [picking, setPicking] = useState(null);
  const [message, setMessage] = useState('');
  const days = weekDays(offset);
  const plan = useLiveQuery(() => db.plan.where('date').between(days[0], days[6], true, true).toArray(), [days[0]]);
  const recipes = useLiveQuery(() => db.recipes.orderBy('title').toArray(), []);
  const larder = useLiveQuery(() => db.larder.toArray(), []);

  if (!plan || !recipes || !larder) return null;

  const byId = new Map(recipes.map((r) => [r.id, r]));
  const entries = plan.filter((entry) => byId.has(entry.recipeId));

  const shop = async () => {
    // one pass per recipe, so each item notes which recipe it's for
    let count = 0;
    const seen = new Set();
    for (const entry of entries) {
      if (seen.has(entry.recipeId)) continue;
      seen.add(entry.recipeId);
      const recipe = byId.get(entry.recipeId);
      count += await addToList(missingFor(recipe, larder), recipe.title);
    }
    setMessage(count === 0 ? 'Everything is already on your shopping list or in your pantry' : `Added ${count} to your shopping list`);
  };

  return (
    <div className="page narrow">
      <h1 className="display page_title">Plan</h1>
      <p className="lede">Plan the week, then get one shopping list.</p>

      <div className="week_nav">
        <button type="button" className="button button-quiet button-icon" aria-label="Previous week" onClick={() => { setOffset(offset - 1); setMessage(''); }}>&larr;</button>
        <span className="week_title">{weekTitle(offset)}</span>
        <button type="button" className="button button-quiet button-icon" aria-label="Next week" onClick={() => { setOffset(offset + 1); setMessage(''); }}>&rarr;</button>
      </div>

      <ol className="week">
        {days.map((day) => {
          const meals = entries.filter((entry) => entry.date === day);
          return (
            <li key={day} className={day === today() ? 'day day-today' : 'day'}>
              <div className="day_head">
                <span className="day_name">{dayLabel(day)}</span>
                <span className="day_date">{dayNumber(day)}</span>
              </div>
              <ul className="day_meals">
                {meals.map((entry) => (
                  <li key={entry.id}>
                    <Link to={`/recipe/${entry.recipeId}`} className="day_meal">{byId.get(entry.recipeId).title}</Link>
                    <button type="button" className="icon_button" aria-label={`Remove ${byId.get(entry.recipeId).title}`} onClick={() => unplan(entry.id)}>×</button>
                  </li>
                ))}
              </ul>
              {picking === day ? (
                <Picker
                  recipes={recipes}
                  onClose={() => setPicking(null)}
                  onPick={async (id) => {
                    await planRecipe(day, id);
                    setPicking(null);
                  }}
                />
              ) : (
                <button type="button" className="day_add" onClick={() => setPicking(day)}>+ Add</button>
              )}
            </li>
          );
        })}
      </ol>

      {entries.length > 0 && (
        <div className="sticky_action">
          <button type="button" className="button button-primary button-full" onClick={shop}>Add this week to shopping list</button>
        </div>
      )}
      {message && <p className="small" role="status">{message} · <Link to="/shopping" className="link">View shopping list</Link></p>}
    </div>
  );
}

export default Table;
