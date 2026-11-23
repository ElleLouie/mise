import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveParty, deleteRecipe } from '../lib/db';
import { scaleIngredient } from '../lib/ingredients';
import { courseFor, isUpcoming } from '../lib/party';
import { planView } from '../lib/vibes';
import { formatTime } from '../lib/format';
import Icon from '../components/Icon';
import Soon from './Soon';

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function Recipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = useLiveQuery(() => db.recipes.get(id), [id], 'loading');
  // hosted vibes, as parties
  const parties = useLiveQuery(async () => (await db.vibes.toArray()).filter((v) => v.plan).map(planView), []);
  const [servings, setServings] = useState(null);
  const [checked, setChecked] = useState(() => new Set());
  const [added, setAdded] = useState(null);
  const [now] = useState(() => Date.now());

  if (recipe === 'loading') return null;
  if (!recipe) return <Soon title="Not found" text="This recipe was deleted." />;

  const portions = servings ?? recipe.servings;
  const factor = portions / recipe.servings;
  const upcoming = (parties || []).filter((p) => isUpcoming(p, now));
  const toggle = (i) => setChecked((prev) => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });
  return (
    <div className="page recipe">
      <Link to="/recipes" className="back_link"><Icon name="back" size={18} />Recipes</Link>

      {recipe.image && <img src={recipe.image} alt="" className="recipe_hero" />}

      <header className="recipe_head">
        <h1 className="page_title">{recipe.title}</h1>
        <div className="recipe_meta">
          <span className="meta_item"><Icon name="clock" size={18} />{formatTime(recipe.minutes)}</span>
          <span className="meta_item servings">
            <Icon name="people" size={18} />
            <button type="button" className="step_button" aria-label="Fewer servings" onClick={() => setServings(Math.max(1, portions - 1))}>−</button>
            <output aria-live="polite">{portions}</output>
            <button type="button" className="step_button" aria-label="More servings" onClick={() => setServings(portions + 1)}>+</button>
          </span>
        </div>

        <div className="actions">
          {upcoming.length > 0 && (
            <label className="button select_button">
              <Icon name="calendar" size={18} />
              <span>Add to a party</span>
              <select
                value=""
                aria-label="Add to a party"
                onChange={async (e) => {
                  const party = upcoming.find((p) => p.id === e.target.value);
                  if (!party.dishes.some((d) => d.recipeId === id)) {
                    await saveParty({ ...party, dishes: [...party.dishes, { recipeId: id, course: courseFor(recipe) }] });
                  }
                  setAdded(party);
                }}
              >
                <option value="" disabled>Add to a party</option>
                {upcoming.map((p) => <option key={p.id} value={p.id}>{p.name || 'Dinner party'}</option>)}
              </select>
            </label>
          )}
          <Link to={`/recipe/${id}/edit`} className="button button-quiet button-icon" aria-label="Edit recipe"><Icon name="edit" size={18} /></Link>
        </div>
        {added && (
          <p className="small" role="status">
            On the menu for {added.name || 'your party'} · <Link to={`/vibe/${added.id}/plan`} className="link">View plan</Link>
          </p>
        )}
      </header>

      <div className="recipe_body">
        <section>
          <h2 className="section_title">Ingredients</h2>
          <ul className="ingredients">
            {recipe.ingredients.map((line, i) => (
              <li key={`${i}-${line}`}>
                <label className={checked.has(i) ? 'checked' : ''}>
                  <input type="checkbox" checked={checked.has(i)} onChange={() => toggle(i)} />
                  <span>{scaleIngredient(line, factor)}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="section_title">Steps</h2>
          <ol className="steps">
            {recipe.steps.map((step, i) => <li key={`${i}-${step}`}>{step}</li>)}
          </ol>
          {recipe.source && (
            <p className="source small">
              Source: <a href={recipe.source} target="_blank" rel="noreferrer">{hostname(recipe.source)}</a>
            </p>
          )}
        </section>
      </div>

      <button
        type="button"
        className="link link-danger"
        onClick={async () => {
          if (window.confirm(`Delete "${recipe.title}"?`)) {
            await deleteRecipe(id);
            navigate('/recipes');
          }
        }}
      >
        Delete recipe
      </button>
    </div>
  );
}

export default Recipe;
