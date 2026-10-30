import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addToList, toggleListItem, removeListItem, putAway } from '../lib/db';
import { aisleFor, aisleOrder } from '../lib/aisles';

function List() {
  const items = useLiveQuery(() => db.list.orderBy('addedAt').toArray(), []);
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');

  if (!items) return null;

  const byAisle = aisleOrder
    .map((aisle) => [aisle, items.filter((item) => aisleFor(item.name) === aisle)])
    .filter(([, group]) => group.length > 0);
  const done = items.filter((item) => item.done).length;

  return (
    <div className="page narrow">
      <h1 className="display page_title">List</h1>

      <form
        className="toolbar"
        onSubmit={async (e) => {
          e.preventDefault();
          await addToList(text.split(','));
          setText('');
        }}
      >
        <label className="search">
          <span className="visually_hidden">Add to list</span>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add an item" />
        </label>
        <button type="submit" className="button" disabled={!text.trim()}>Add</button>
      </form>

      {items.length === 0 && <p className="empty">Your list is empty. Add items here or from a recipe.</p>}

      {byAisle.map(([aisle, group]) => (
        <section key={aisle} className="panel_section">
          <h2 className="section_label label">{aisle}</h2>
          <ul className="items">
            {group.map((item) => (
              <li key={item.id} className={item.done ? 'item-done' : ''}>
                <label className="items_check">
                  <input type="checkbox" checked={Boolean(item.done)} onChange={() => toggleListItem(item)} />
                  <span>{item.text}</span>
                </label>
                {item.recipe && <span className="small items_from">{item.recipe}</span>}
                <button type="button" className="icon_button" aria-label={`Remove ${item.text}`} onClick={() => removeListItem(item.id)}>×</button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {done > 0 && (
        <div className="sticky_action">
          <button
            type="button"
            className="button button-primary button-full"
            onClick={async () => {
              const count = await putAway();
              setMessage(`Moved ${count} to your larder`);
            }}
          >
            Move {done} checked to larder
          </button>
        </div>
      )}
      {message && <p className="small" role="status">{message}</p>}
    </div>
  );
}

export default List;
