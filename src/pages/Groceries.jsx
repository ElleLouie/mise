import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db, addToList, toggleListItem, removeListItem, putAway, addToLarder, removeFromLarder,
} from '../lib/db';
import { aisleFor, aisleOrder } from '../lib/aisles';
import { canMake } from '../lib/suggest';
import { ingredientName, covers } from '../lib/ingredients';
import Icon from '../components/Icon';

const STAPLES = [
  'olive oil', 'butter', 'eggs', 'garlic', 'onions', 'lemons', 'rice', 'pasta',
  'flour', 'sugar', 'milk', 'soy sauce', 'honey', 'parmesan', 'tomatoes', 'spinach',
];

function AddForm({ placeholder, label, onAdd }) {
  const [text, setText] = useState('');
  return (
    <form
      className="add_row"
      onSubmit={async (e) => {
        e.preventDefault();
        await onAdd(text.split(','));
        setText('');
      }}
    >
      <label className="field_inline">
        <span className="visually_hidden">{label}</span>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} />
      </label>
      <button type="submit" className="button" disabled={!text.trim()}>Add</button>
    </form>
  );
}

function ToBuy() {
  const items = useLiveQuery(() => db.list.orderBy('addedAt').toArray(), []);
  const [message, setMessage] = useState('');
  if (!items) return null;

  const byAisle = aisleOrder
    .map((aisle) => [aisle, items.filter((item) => aisleFor(item.name) === aisle)])
    .filter(([, group]) => group.length > 0);
  const bought = items.filter((item) => item.done).length;

  return (
    <>
      <AddForm label="Add to groceries" placeholder="Add an item" onAdd={(lines) => addToList(lines)} />
      {items.length === 0 && (
        <p className="empty">Nothing to buy. Add items from a recipe, your plan, or here.</p>
      )}
      {byAisle.map(([aisle, group]) => (
        <section key={aisle} className="group">
          <h2 className="group_title">{aisle}</h2>
          <ul className="rows">
            {group.map((item) => (
              <li key={item.id} className={item.done ? 'row row-done' : 'row'}>
                <label className="row_check">
                  <input type="checkbox" checked={Boolean(item.done)} onChange={() => toggleListItem(item)} />
                  <span>{item.text}</span>
                </label>
                {item.recipe && <span className="row_note">{item.recipe}</span>}
                <button type="button" className="icon_button" aria-label={`Remove ${item.text}`} onClick={() => removeListItem(item.id)}>
                  <Icon name="close" size={16} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {bought > 0 && (
        <div className="sticky_action">
          <button
            type="button"
            className="button button-wide"
            onClick={async () => setMessage(`Moved ${await putAway()} to At home`)}
          >
            Done shopping · move {bought} to At home
          </button>
        </div>
      )}
      {message && <p className="small" role="status">{message}</p>}
    </>
  );
}

function AtHome() {
  const pantry = useLiveQuery(() => db.larder.orderBy('name').toArray(), []);
  const recipes = useLiveQuery(() => db.recipes.toArray(), []);
  if (!pantry || !recipes) return null;

  const have = (name) => pantry.some((item) => covers(item.name, name) || covers(name, item.name));
  const staples = STAPLES.filter((name) => !have(name));
  const ready = canMake(recipes, pantry);

  return (
    <>
      <AddForm
        label="Add what you have"
        placeholder="What do you have? e.g. eggs, lemons"
        onAdd={(parts) => addToLarder(parts.map((part) => ingredientName(part) || part))}
      />
      {staples.length > 0 && (
        <div className="chips" role="group" aria-label="Common items">
          {staples.map((name) => (
            <button key={name} type="button" className="chip" onClick={() => addToLarder([name])}>+ {name}</button>
          ))}
        </div>
      )}
      {ready.length > 0 && (
        <section className="group">
          <h2 className="group_title">You can cook</h2>
          <ul className="rows">
            {ready.map(({ recipe, missing }) => (
              <li key={recipe.id} className="row">
                <Link to={`/recipe/${recipe.id}`} className="row_link">{recipe.title}</Link>
                <span className={missing.length === 0 ? 'pill pill-ready' : 'pill'}>
                  {missing.length === 0 ? 'Ready' : `Need ${ingredientName(missing[0])}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="group">
        <h2 className="group_title">At home · {pantry.length}</h2>
        {pantry.length === 0 && <p className="empty">Add what you have to see what you can cook.</p>}
        <ul className="rows">
          {pantry.map((item) => (
            <li key={item.name} className="row">
              <span className="row_text">{item.name}</span>
              <button type="button" className="icon_button" aria-label={`Remove ${item.name}`} onClick={() => removeFromLarder(item.name)}>
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Groceries() {
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'home' ? 'home' : 'buy';
  const toBuy = useLiveQuery(() => db.list.where('done').equals(0).count(), []);
  const atHome = useLiveQuery(() => db.larder.count(), []);

  return (
    <div className="page narrow">
      <h1 className="page_title">Groceries</h1>
      <div className="segmented" role="tablist" aria-label="Groceries">
        <button type="button" role="tab" aria-selected={view === 'buy'} onClick={() => setParams({})}>
          To buy{toBuy ? ` · ${toBuy}` : ''}
        </button>
        <button type="button" role="tab" aria-selected={view === 'home'} onClick={() => setParams({ view: 'home' })}>
          At home{atHome ? ` · ${atHome}` : ''}
        </button>
      </div>
      {view === 'buy' ? <ToBuy /> : <AtHome />}
    </div>
  );
}

export default Groceries;
