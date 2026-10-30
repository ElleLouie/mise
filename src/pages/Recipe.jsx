import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveRecipe, deleteRecipe, addNote } from '../lib/db';
import { scaleIngredient } from '../lib/ingredients';
import Soon from './Soon';

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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

  if (!open) return <button type="button" className="text_button" onClick={() => setOpen(true)}>+ I made this</button>;

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
      <label>
        <span className="mono_label">How did it go? Any tweaks?</span>
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="+ more garlic, 2 min less in the oven…" />
      </label>
      <Rating value={rating} onChange={setRating} />
      <div className="form_actions">
        <button type="button" className="text_button" onClick={() => setOpen(false)}>Cancel</button>
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
  if (!recipe) return <Soon title="86'd" text="This recipe isn't in the box anymore." />;

  const portions = servings ?? recipe.servings;
  const factor = portions / recipe.servings;
  const toggle = (i) => setChecked((prev) => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });

  return (
    <div className="page">
      <header className="subhead">
        <Link to="/" className="mono_label">&larr; Recipe box</Link>
        <div className="subhead_actions">
          <button
            type="button"
            className="icon_button"
            aria-pressed={recipe.favorite}
            aria-label={recipe.favorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={() => saveRecipe({ ...recipe, favorite: !recipe.favorite })}
          >
            {recipe.favorite ? '★' : '☆'}
          </button>
          <Link to={`/recipe/${id}/edit`} className="mono_label">Edit</Link>
        </div>
      </header>

      <article className="order">
        <div className="order_top">
          <span>Order</span>
          <span>{recipe.minutes} min</span>
        </div>
        <h1 className="order_title">{recipe.title}</h1>
        {recipe.tags.length > 0 && (
          <div className="order_tags">{recipe.tags.map((t) => <span key={t} className="stamp stamp-small">{t}</span>)}</div>
        )}

        <div className="servings">
          <span className="mono_label">Serves</span>
          <button type="button" className="step_button" aria-label="Fewer servings" onClick={() => setServings(Math.max(1, portions - 1))}>−</button>
          <output aria-live="polite">{portions}</output>
          <button type="button" className="step_button" aria-label="More servings" onClick={() => setServings(portions + 1)}>+</button>
          {factor !== 1 && <button type="button" className="text_button" onClick={() => setServings(null)}>reset</button>}
        </div>

        <h2 className="order_section">Ingredients</h2>
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

        <h2 className="order_section">Method</h2>
        <ol className="steps">
          {recipe.steps.map((step, i) => <li key={`${i}-${step}`}>{step}</li>)}
        </ol>

        {recipe.source && (
          <p className="source mono_label">
            From <a href={recipe.source} target="_blank" rel="noreferrer">{hostname(recipe.source)}</a>
          </p>
        )}
      </article>

      <Link to={`/recipe/${id}/cook?servings=${portions}`} className="button button-big">Start cooking &rarr;</Link>

      <section className="last_time">
        <h2 className="order_section">Last time</h2>
        {recipe.notes.length === 0 && <p className="empty">No notes yet. After you cook it, jot down what you&apos;d change.</p>}
        <ul>
          {recipe.notes.map((note) => (
            <li key={note.id} className="note">
              <span className="mono_label">
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
        className="text_button text_button-danger"
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
