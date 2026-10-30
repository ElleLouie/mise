import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, cookAgain } from '../lib/db';
import { keyIngredients } from '../lib/ingredients';
import { formatTime } from '../lib/format';

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const DAY = 24 * 60 * 60 * 1000;

// a short reason for each suggestion on today's table
function reason(recipe, again) {
  if (!again) return 'Newly added to the box';
  if (!recipe.lastCookedAt) return 'A favorite you haven’t made yet';
  const weeks = Math.round((Date.now() - recipe.lastCookedAt) / (7 * DAY));
  return `A favorite, last made ${weeks <= 1 ? 'a couple of weeks' : `${weeks} weeks`} ago`;
}

function Home() {
  const recipes = useLiveQuery(() => db.recipes.orderBy('updatedAt').reverse().toArray(), []);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState(null);

  if (!recipes) return null;

  const again = cookAgain(recipes);
  const table = [...again, ...recipes.filter((r) => !again.includes(r))].slice(0, 3);

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
          <p className="lede">Your recipes, what you have in the larder, and a few ideas for tonight.</p>

          <label className="search">
            <span className="visually_hidden">Search recipes</span>
            <input type="search" placeholder="Search recipes or ingredients" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>

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

        {table.length > 0 && (
          <aside className="menu_card">
            <p className="label label-accent">Today&rsquo;s table</p>
            <h2 className="menu_card_title">For tonight</h2>
            <ol>
              {table.map((recipe, i) => (
                <li key={recipe.id}>
                  <Link to={`/recipe/${recipe.id}`}>
                    <span className="menu_card_no label">{i + 1}</span>
                    <span>
                      <span className="menu_card_dish">{recipe.title}</span>
                      <span className="menu_card_why">{reason(recipe, again.includes(recipe))}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </section>

      <section className="box">
        <div className="section_head">
          <h2 className="section_title">The recipe box</h2>
          <Link to="/new" className="label link">+ Add a recipe</Link>
        </div>
        {shown.length === 0 && <p className="empty">Nothing matches. Try another word.</p>}
        <ul className="shelf">
          {shown.map((recipe) => (
            <li key={recipe.id}>
              <Link to={`/recipe/${recipe.id}`} className="jar">
                <div className="jar_label">
                  {recipe.tags.length > 0 && (
                    <div className="jar_row">{recipe.tags.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}</div>
                  )}
                  <h3 className="jar_title">{recipe.title}</h3>
                  <dl className="facts">
                    <div><dt className="label">Time</dt><dd>{formatTime(recipe.minutes)}</dd></div>
                    <div><dt className="label">Serves</dt><dd>{recipe.servings}</dd></div>
                    <div className="facts_wide"><dt className="label">Key</dt><dd>{keyIngredients(recipe.ingredients).join(' · ')}</dd></div>
                  </dl>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="footnote"><Link to="/settings" className="label link">Settings &amp; backup</Link></p>
    </div>
  );
}

export default Home;
