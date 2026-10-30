import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, cookAgain } from '../lib/db';
import { canMake } from '../lib/suggest';
import { ingredientName } from '../lib/ingredients';
import { formatTime } from '../lib/format';
import { jewelFor } from '../lib/illustrate';
import { weekDays } from '../lib/week';
import RecipeCard from '../components/RecipeCard';
import Dish from '../components/Dish';

// Tonight's suggestions: ready to cook, one ingredient away, then favorites due a repeat.
function tonight(recipes, larder) {
  const picks = new Map();
  canMake(recipes, larder).forEach(({ recipe, missing }) => {
    picks.set(recipe.id, { recipe, why: missing.length === 0 ? 'Ready to cook' : `Need ${ingredientName(missing[0])}` });
  });
  cookAgain(recipes).forEach((recipe) => {
    if (!picks.has(recipe.id)) picks.set(recipe.id, { recipe, why: 'A favorite' });
  });
  return [...picks.values()].slice(0, 3);
}

function Home() {
  const recipes = useLiveQuery(() => db.recipes.orderBy('updatedAt').reverse().toArray(), []);
  const larder = useLiveQuery(() => db.larder.toArray(), []);
  const week = weekDays(0);
  const planned = useLiveQuery(() => db.plan.where('date').between(week[0], week[6], true, true).count(), [week[0]]);
  const listCount = useLiveQuery(() => db.list.where('done').equals(0).count(), []);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState(null);

  if (!recipes || !larder) return null;

  const picks = tonight(recipes, larder);
  const feature = picks[0] ?? (recipes[0] && { recipe: recipes[0], why: 'From your box' });
  const tags = [...new Set(recipes.flatMap((r) => r.tags))].sort();
  const needle = query.trim().toLowerCase();
  const shown = recipes.filter((r) => (!tag || r.tags.includes(tag))
    && (!needle || r.title.toLowerCase().includes(needle) || r.ingredients.some((i) => i.toLowerCase().includes(needle))));

  return (
    <div className="page home">
      <section className="hero">
        {feature && (
          <div className="feature">
            {feature.recipe.image
              ? <img src={feature.recipe.image} alt="" className="feature_art" />
              : <Dish recipe={feature.recipe} className="feature_art" />}
            <div className="feature_card">
              <p className="kicker">Tonight · {feature.why}</p>
              <Link to={`/recipe/${feature.recipe.id}`} className="feature_title">{feature.recipe.title}</Link>
              <div className="feature_row">
                <Link to={`/recipe/${feature.recipe.id}/cook`} className="button">Start cooking</Link>
                <span className="pill">{formatTime(feature.recipe.minutes)}</span>
                <span className="pill">Serves {feature.recipe.servings}</span>
              </div>
            </div>
          </div>
        )}

        <div className="hero_side">
          <h1 className="display">What are we <em>making</em> tonight?</h1>
          <div className="toolbar">
            <label className="search">
              <span className="visually_hidden">Search recipes</span>
              <input type="search" placeholder="Search recipes" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <Link to="/new" className="button">+ New</Link>
          </div>
          {tags.length > 0 && (
            <div className="chips" role="group" aria-label="Filter by tag">
              <button type="button" className={`chip ${tag === null ? 'chip-on' : ''}`} aria-pressed={tag === null} onClick={() => setTag(null)}>All</button>
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`chip chip-jewel ${tag === t ? 'chip-on' : ''}`}
                  style={{ '--jewel': jewelFor(t) }}
                  aria-pressed={tag === t}
                  onClick={() => setTag(tag === t ? null : t)}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
          <div className="stats">
            <Link to="/table"><b>{planned ?? 0}</b>planned this week</Link>
            <Link to="/larder"><b>{larder.length}</b>in your larder</Link>
            <Link to="/list"><b>{listCount ?? 0}</b>on your list</Link>
          </div>
          {picks.length > 1 && (
            <ul className="also">
              {picks.slice(1).map(({ recipe, why }) => (
                <li key={recipe.id}>
                  <Link to={`/recipe/${recipe.id}`}>{recipe.title}</Link>
                  <span className={why === 'Ready to cook' ? 'pill pill-ready' : 'pill'}>{why}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="box">
        <div className="section_head">
          <h2 className="section_title">The box</h2>
          <span className="small">{recipes.length} recipes</span>
        </div>
        {shown.length === 0 && <p className="empty">No matches.</p>}
        <ul className="bento">
          {shown.map((recipe) => <li key={recipe.id}><RecipeCard recipe={recipe} /></li>)}
        </ul>
      </section>
    </div>
  );
}

export default Home;
