import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveRecipe, deleteRecipe, addNote, addToList, planRecipe } from '../lib/db';
import { scaleIngredient } from '../lib/ingredients';
import { missingFor, similar } from '../lib/suggest';
import { formatTime, formatDate } from '../lib/format';
import { weekDays, dayLabel, today } from '../lib/week';
import RecipeCard from '../components/RecipeCard';
import Soon from './Soon';

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function Rating({ value, onChange }) {
  return (
    <span className="rating" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} of 5`} className={n <= value ? 'rating_on' : ''} onClick={() => onChange(n)}>●</button>
      ))}
    </span>
  );
}

function NoteForm({ recipe }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [open, setOpen] = useState(false);

  if (!open) return <button type="button" className="button button-quiet" onClick={() => setOpen(true)}>+ Add a note</button>;

  return (
    <form
      className="note_form"
      onSubmit={async (e) => {
        e.preventDefault();
        await addNote(recipe, { text: text.trim(), rating });
        setText('');
        setRating(0);
        setOpen(false);
      }}
    >
      <label className="field">
        <span className="visually_hidden">Note</span>
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="What would you change?" />
      </label>
      <Rating value={rating} onChange={setRating} />
      <div className="form_actions">
        <button type="button" className="button button-quiet" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" className="button">Save</button>
      </div>
    </form>
  );
}

function Recipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = useLiveQuery(() => db.recipes.get(id), [id], 'loading');
  const recipes = useLiveQuery(() => db.recipes.toArray(), []);
  const larder = useLiveQuery(() => db.larder.toArray(), []);
  const [servings, setServings] = useState(null);
  const [checked, setChecked] = useState(() => new Set());
  const [added, setAdded] = useState(null);

  if (recipe === 'loading') return null;
  if (!recipe) return <Soon title="Not found" text="This recipe was deleted." />;

  const portions = servings ?? recipe.servings;
  const factor = portions / recipe.servings;
  const missing = new Set(larder ? missingFor(recipe, larder) : recipe.ingredients);
  const toggle = (i) => setChecked((prev) => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });
  const addMissing = async () => {
    const lines = recipe.ingredients.filter((line) => missing.has(line)).map((line) => scaleIngredient(line, factor));
    const count = await addToList(lines, recipe.title);
    setAdded(count === 0 ? 'Already on your list' : `Added ${count} to your list`);
  };

  return (
    <div className="page recipe">
      <div className="crumbs">
        <Link to="/" className="label link">&larr; Recipes</Link>
      </div>

      <header className="recipe_label">
        {recipe.image && <img src={recipe.image} alt="" className="recipe_photo" />}
        <div className="recipe_label_text">
          {recipe.tags.length > 0 && (
            <div className="jar_row">{recipe.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
          )}
          <h1 className="display recipe_title">{recipe.title}</h1>
          <div className="recipe_meta">
            <span>{formatTime(recipe.minutes)}</span>
            <span className="servings">
              <button type="button" className="step_button" aria-label="Fewer servings" onClick={() => setServings(Math.max(1, portions - 1))}>−</button>
              <output aria-live="polite">Serves {portions}</output>
              <button type="button" className="step_button" aria-label="More servings" onClick={() => setServings(portions + 1)}>+</button>
            </span>
          </div>
          <div className="actions">
            <Link to={`/recipe/${id}/cook?servings=${portions}`} className="button button-primary">Start cooking</Link>
            {missing.size > 0 && (
              <button type="button" className="button button-quiet" onClick={addMissing}>
                Add {missing.size} missing to list
              </button>
            )}
            <label className="select_button">
              <span className="visually_hidden">Add to plan</span>
              <select
                value=""
                onChange={async (e) => {
                  const day = e.target.value;
                  await planRecipe(day, id);
                  setAdded(`Planned for ${dayLabel(day, 'short')}`);
                }}
              >
                <option value="" disabled>Add to plan</option>
                {[...weekDays(0), ...weekDays(1)].filter((day) => day >= today()).map((day) => (
                  <option key={day} value={day}>{dayLabel(day, 'short')}</option>
                ))}
              </select>
            </label>
            <Link to={`/recipe/${id}/edit`} className="button button-quiet">Edit</Link>
            <button
              type="button"
              className="button button-quiet button-icon"
              aria-pressed={recipe.favorite}
              aria-label={recipe.favorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={() => saveRecipe({ ...recipe, favorite: !recipe.favorite })}
            >
              {recipe.favorite ? '★' : '☆'}
            </button>
          </div>
          {added && (
            <p className="small" role="status">
              {added} · <Link to={added.startsWith('Planned') ? '/table' : '/list'} className="link">{added.startsWith('Planned') ? 'View plan' : 'View list'}</Link>
            </p>
          )}
        </div>
      </header>

      <div className="recipe_body">
        <section>
          <h2 className="section_label label">Ingredients</h2>
          <ul className="ingredients">
            {recipe.ingredients.map((line, i) => (
              <li key={`${i}-${line}`}>
                <label className={checked.has(i) ? 'checked' : ''}>
                  <input type="checkbox" checked={checked.has(i)} onChange={() => toggle(i)} />
                  <span>{scaleIngredient(line, factor)}</span>
                  {!missing.has(line) && <span className="have">Have</span>}
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="section_label label">Method</h2>
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

      <section className="notes">
        <h2 className="section_title">Notes</h2>
        <ul>
          {recipe.notes.map((note) => (
            <li key={note.id} className="note">
              <span className="small">
                {formatDate(note.date)}
                {note.rating > 0 && <span className="note_rating" aria-label={`${note.rating} of 5`}> {'●'.repeat(note.rating)}{'○'.repeat(5 - note.rating)}</span>}
              </span>
              {note.text && <p>{note.text}</p>}
            </li>
          ))}
        </ul>
        <NoteForm recipe={recipe} />
      </section>

      {recipes && similar(recipe, recipes).length > 0 && (
        <section className="related">
          <h2 className="section_title">More like this</h2>
          <ul className="shelf shelf-compact">
            {similar(recipe, recipes).map((other) => <li key={other.id}><RecipeCard recipe={other} compact /></li>)}
          </ul>
        </section>
      )}

      <button
        type="button"
        className="label link link-danger"
        onClick={async () => {
          if (window.confirm(`Delete "${recipe.title}"?`)) {
            await deleteRecipe(id);
            navigate('/');
          }
        }}
      >
        Delete recipe
      </button>
    </div>
  );
}

export default Recipe;
