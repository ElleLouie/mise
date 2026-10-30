import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, cookAgain } from '../lib/db';
import Ticket from '../components/Ticket';

const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

const formatMinutes = (minutes) => (minutes >= 60 ? `${Math.round((minutes / 60) * 10) / 10}H` : `${minutes}M`);

function Home() {
  const recipes = useLiveQuery(() => db.recipes.orderBy('updatedAt').reverse().toArray(), []);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState(null);

  if (!recipes) return null;

  // tonight's rail: recipes worth cooking again, topped up with the newest ones
  const again = cookAgain(recipes);
  const rail = [...again, ...recipes.filter((r) => !again.includes(r))].slice(0, 4);

  const tags = [...new Set(recipes.flatMap((r) => r.tags))].sort();
  const needle = query.trim().toLowerCase();
  const shown = recipes.filter((r) => (!tag || r.tags.includes(tag))
    && (!needle || r.title.toLowerCase().includes(needle) || r.ingredients.some((i) => i.toLowerCase().includes(needle))));

  return (
    <div className="page">
      <header className="head">
        <h1 className="logo">Mise</h1>
        <div className="head_side">
          <span className="mono_label">The pass · {today}</span>
          <Link to="/settings" className="icon_button" aria-label="Settings">⚙</Link>
        </div>
      </header>

      <div className="rail_bar" />
      <div className="rail" aria-label="Tonight">
        {rail.map((recipe, i) => (
          <Ticket
            key={recipe.id}
            to={`/recipe/${recipe.id}`}
            number={i + 1}
            when={i === 0 ? 'Tonight' : 'Up next'}
            title={recipe.title}
            meta={`Serves ${recipe.servings} · ${recipe.minutes} min`}
            stamp={again.includes(recipe) ? 'Cook again' : null}
          />
        ))}
      </div>

      <label className="search">
        <span className="visually_hidden">Search recipes</span>
        <span aria-hidden="true">&gt;</span>
        <input
          type="search"
          placeholder={`Search ${recipes.length} recipes`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      {tags.length > 0 && (
        <div className="chips" role="group" aria-label="Filter by tag">
          {tags.map((t) => (
            <button key={t} type="button" className={`chip ${tag === t ? 'chip-on' : ''}`} aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>
              {t}
            </button>
          ))}
        </div>
      )}

      <section className="receipt">
        <h2 className="receipt_title">Recipe box</h2>
        {shown.length === 0 && <p className="empty">Nothing matches. Try another word.</p>}
        <ul>
          {shown.map((recipe) => (
            <li key={recipe.id}>
              <Link to={`/recipe/${recipe.id}`} className="line">
                <span>{recipe.title}</span>
                <span className="leader" aria-hidden="true" />
                <span>{formatMinutes(recipe.minutes)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/new" className="receipt_add">+ New ticket</Link>
      </section>
    </div>
  );
}

export default Home;
