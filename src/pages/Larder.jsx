import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addToLarder, removeFromLarder } from '../lib/db';
import { canMake } from '../lib/suggest';
import { ingredientName, covers } from '../lib/ingredients';

const STAPLES = [
  'olive oil', 'butter', 'eggs', 'garlic', 'onions', 'lemons', 'rice', 'pasta',
  'flour', 'sugar', 'milk', 'soy sauce', 'honey', 'parmesan', 'tomatoes', 'spinach',
];

function Larder() {
  const larder = useLiveQuery(() => db.larder.orderBy('name').toArray(), []);
  const recipes = useLiveQuery(() => db.recipes.toArray(), []);
  const [text, setText] = useState('');

  if (!larder || !recipes) return null;

  const have = (name) => larder.some((item) => covers(item.name, name) || covers(name, item.name));
  const suggestions = STAPLES.filter((name) => !have(name));
  const ready = canMake(recipes, larder);

  return (
    <div className="page narrow">
      <h1 className="display page_title">Larder</h1>

      <form
        className="toolbar"
        onSubmit={async (e) => {
          e.preventDefault();
          // "lemons, rice, 2 cans chickpeas" adds three items
          await addToLarder(text.split(',').map((part) => ingredientName(part) || part));
          setText('');
        }}
      >
        <label className="search">
          <span className="visually_hidden">Add to larder</span>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add items" />
        </label>
        <button type="submit" className="button" disabled={!text.trim()}>Add</button>
      </form>

      {suggestions.length > 0 && (
        <div className="chips" role="group" aria-label="Common items">
          {suggestions.map((name) => (
            <button key={name} type="button" className="chip" onClick={() => addToLarder([name])}>+ {name}</button>
          ))}
        </div>
      )}

      <section className="panel_section">
        <h2 className="section_label label">In your larder · {larder.length}</h2>
        {larder.length === 0 && <p className="empty">Nothing yet.</p>}
        <ul className="items">
          {larder.map((item) => (
            <li key={item.name}>
              <span>{item.name}</span>
              <button type="button" className="icon_button" aria-label={`Remove ${item.name}`} onClick={() => removeFromLarder(item.name)}>×</button>
            </li>
          ))}
        </ul>
      </section>

      {ready.length > 0 && (
        <section className="panel_section">
          <h2 className="section_label label">You can make</h2>
          <ul className="items">
            {ready.map(({ recipe, missing }) => (
              <li key={recipe.id}>
                <Link to={`/recipe/${recipe.id}`} className="items_link">{recipe.title}</Link>
                <span className={missing.length === 0 ? 'pill pill-ready' : 'pill'}>
                  {missing.length === 0 ? 'Ready' : `Need ${ingredientName(missing[0])}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default Larder;
