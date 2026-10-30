import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveRecipe, deleteRecipe, addNote } from '../lib/db';
import { scaleIngredient, keyIngredients } from '../lib/ingredients';
import { formatTime, formatDate } from '../lib/format';
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
    <span className="rating" role="radiogroup" aria-label="How did it turn out?">
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

  if (!open) return <button type="button" className="label link" onClick={() => setOpen(true)}>+ I made this</button>;

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
        <span className="label">How did it go? Any tweaks?</span>
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="More garlic, two minutes less in the oven…" />
      </label>
      <Rating value={rating} onChange={setRating} />
      <div className="form_actions">
        <button type="button" className="label link" onClick={() => setOpen(false)}>Cancel</button>
        <button type="submit" className="button">Save note</button>
      </div>
    </form>
  );
}

function Recipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = useLiveQuery(() => db.recipes.get(id), [id], 'loading');
  const [servings, setServings] = useState(null);
  const [checked, setChecked] = useState(() => new Set());

  if (recipe === 'loading') return null;
  if (!recipe) return <Soon title="Not found" text="This recipe isn't in the box anymore." />;

  const portions = servings ?? recipe.servings;
  const factor = portions / recipe.servings;
  const toggle = (i) => setChecked((prev) => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });

  return (
    <div className="page recipe">
      <div className="crumbs">
        <Link to="/" className="label link">&larr; The recipe box</Link>
        <div className="crumbs_actions">
          <button
            type="button"
            className="label link"
            aria-pressed={recipe.favorite}
            onClick={() => saveRecipe({ ...recipe, favorite: !recipe.favorite })}
          >
            {recipe.favorite ? '★ Favorite' : '☆ Favorite'}
          </button>
          <Link to={`/recipe/${id}/edit`} className="label link">Edit</Link>
        </div>
      </div>

      <header className="recipe_head">
        <div className="recipe_label">
          {recipe.tags.length > 0 && (
            <div className="jar_row">{recipe.tags.map((t) => <span key={t} className="tag">{t}</span>)}</div>
          )}
          <h1 className="display recipe_title">{recipe.title}</h1>
          <dl className="facts">
            <div><dt className="label">Time</dt><dd>{formatTime(recipe.minutes)}</dd></div>
            <div>
              <dt className="label">Serves</dt>
              <dd className="servings">
                <button type="button" className="step_button" aria-label="Fewer servings" onClick={() => setServings(Math.max(1, portions - 1))}>−</button>
                <output aria-live="polite">{portions}</output>
                <button type="button" className="step_button" aria-label="More servings" onClick={() => setServings(portions + 1)}>+</button>
                {factor !== 1 && <button type="button" className="label link" onClick={() => setServings(null)}>Reset</button>}
              </dd>
            </div>
            <div className="facts_wide"><dt className="label">Key</dt><dd>{keyIngredients(recipe.ingredients).join(' · ')}</dd></div>
          </dl>
          <Link to={`/recipe/${id}/cook?servings=${portions}`} className="button button-big">Start cooking</Link>
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
            <p className="source label">
              From <a href={recipe.source} target="_blank" rel="noreferrer">{hostname(recipe.source)}</a>
            </p>
          )}
        </section>
      </div>

      <section className="notes">
        <h2 className="section_title">Last time</h2>
        {recipe.notes.length === 0 && <p className="empty">No notes yet. After you cook it, jot down what you&apos;d change.</p>}
        <ul>
          {recipe.notes.map((note) => (
            <li key={note.id} className="note">
              <span className="label">
                {formatDate(note.date)}
                {note.rating > 0 && <span className="note_rating" aria-label={`${note.rating} of 5`}> {'●'.repeat(note.rating)}{'○'.repeat(5 - note.rating)}</span>}
              </span>
              {note.text && <p>{note.text}</p>}
            </li>
          ))}
        </ul>
        <NoteForm recipe={recipe} />
      </section>

      <button
        type="button"
        className="label link link-danger"
        onClick={async () => {
          if (window.confirm(`Delete "${recipe.title}"? This can't be undone.`)) {
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
