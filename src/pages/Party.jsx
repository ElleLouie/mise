import { lazy, Suspense, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveParty } from '../lib/db';
import {
  COURSES, menuDishes, shoppingList, timeline, clockLabel, partyDateLabel, partyTime,
} from '../lib/party';
import { aisleFor, aisleOrder } from '../lib/aisles';
import { moods, moodFor, vibeWords, decorFor } from '../lib/moods';
import { formatTime } from '../lib/format';
import { RecipeImage } from '../components/RecipeCard';
import Icon from '../components/Icon';
import Soon from './Soon';

// three.js is large, so the table only loads when you open it
const TableScene = lazy(() => import('../components/TableScene'));

const TABS = [
  { id: 'menu', name: 'Menu' },
  { id: 'shop', name: 'Shopping' },
  { id: 'timeline', name: 'Timeline' },
  { id: 'table', name: 'Table' },
];

// A short list of recipes to choose from, with search.
function Picker({ recipes, onPick, onClose }) {
  const [query, setQuery] = useState('');
  const shown = recipes.filter((r) => r.title.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div className="picker">
      <div className="toolbar">
        <label className="search">
          <span className="visually_hidden">Find a recipe</span>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input autoFocus type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a recipe" />
        </label>
        <button type="button" className="button button-quiet" onClick={onClose}>Cancel</button>
      </div>
      <ul className="items">
        {shown.map((recipe) => (
          <li key={recipe.id}>
            <button type="button" className="items_pick" onClick={() => onPick(recipe.id)}>{recipe.title}</button>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="empty">No matches. <Link to="/recipes/new" className="link">New recipe</Link></p>}
    </div>
  );
}

function Menu({ party, recipes, dishes }) {
  const [picking, setPicking] = useState(null);
  const update = (next) => saveParty({ ...party, dishes: next });

  return (
    <div className="courses">
      {COURSES.map((course) => {
        const here = dishes.filter((dish) => dish.course === course.id);
        return (
          <section key={course.id} className="course">
            <h2 className="group_title">{course.name}</h2>
            {/* each course is one card: its dishes, then a row to add another */}
            <ul className="rows">
              {here.map((dish) => (
                <li key={dish.recipeId} className="row dish">
                  <RecipeImage recipe={dish.recipe} className="dish_image" />
                  <Link to={`/recipe/${dish.recipeId}`} className="row_link">
                    {dish.recipe.title}
                    <span className="row_sub">{formatTime(dish.recipe.minutes)} · makes {dish.recipe.servings}</span>
                  </Link>
                  <button
                    type="button"
                    className="icon_button"
                    aria-label={`Remove ${dish.recipe.title}`}
                    onClick={() => update(party.dishes.filter((d) => !(d.recipeId === dish.recipeId && d.course === course.id)))}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </li>
              ))}
              <li className="row row-add">
                {picking === course.id ? (
                  <Picker
                    recipes={recipes.filter((r) => !party.dishes.some((d) => d.recipeId === r.id))}
                    onClose={() => setPicking(null)}
                    onPick={async (recipeId) => {
                      await update([...party.dishes, { recipeId, course: course.id }]);
                      setPicking(null);
                    }}
                  />
                ) : (
                  <button type="button" className="add_button" onClick={() => setPicking(course.id)}>
                    <span className="add_icon"><Icon name="plus" size={16} /></span>
                    Add {course.id === 'dessert' ? 'a dessert' : `a ${course.name.toLowerCase().replace(/s$/, '')}`}
                  </button>
                )}
              </li>
            </ul>
          </section>
        );
      })}
      <p className="small">
        {dishes.length === 0 ? 'Not sure where to start? ' : 'Need more? '}
        <Link to="/ideas" className="link">Browse dinner ideas</Link> or <Link to="/discover" className="link">find new recipes</Link>
      </p>
    </div>
  );
}

function Shopping({ party, dishes }) {
  const items = shoppingList(dishes);
  const bought = new Set(party.bought);
  const toggle = (key) => {
    const next = new Set(bought);
    if (next.has(key)) next.delete(key); else next.add(key);
    saveParty({ ...party, bought: [...next] });
  };
  const byAisle = aisleOrder
    .map((aisle) => [aisle, items.filter((item) => aisleFor(item.name) === aisle)])
    .filter(([, group]) => group.length > 0);
  const left = items.filter((item) => !bought.has(item.key)).length;

  if (items.length === 0) return <p className="empty">Add dishes to the menu to build the list.</p>;

  return (
    <>
      <p className="small">For {party.guests} guests · {left} of {items.length} left to buy</p>
      {byAisle.map(([aisle, group]) => (
        <section key={aisle} className="group">
          <h2 className="group_title">{aisle}</h2>
          <ul className="rows">
            {group.map((item) => (
              <li key={item.key} className={bought.has(item.key) ? 'row row-done' : 'row'}>
                <label className="row_check">
                  <input type="checkbox" checked={bought.has(item.key)} onChange={() => toggle(item.key)} />
                  <span>{item.text}</span>
                </label>
                <span className="row_note">{item.dishes.join(', ')}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="small">Salt, pepper and water are left off.</p>
    </>
  );
}

function Timeline({ party, dishes }) {
  const [now] = useState(() => Date.now());
  const events = timeline(party, dishes);
  if (dishes.length === 0) return <p className="empty">Add dishes to the menu to build the timeline.</p>;

  const sitDown = partyTime(party.date, party.time);
  return (
    <>
      <p className="small">
        Start at <strong>{clockLabel(events[0].at, party.date)}</strong> for dinner at {clockLabel(sitDown, party.date)}
      </p>
      <ol className="timeline">
        {events.map((event, i) => (
          <li
            key={i}
            className={`moment ${event.serve ? 'moment-serve' : ''} ${event.at.getTime() + (event.minutes ?? 0) * 60000 < now ? 'moment-past' : ''}`}
          >
            <span className="moment_time">{clockLabel(event.at, party.date)}</span>
            <span className="moment_body">
              <span className="moment_text">{event.text}</span>
              {event.dish && <Link to={`/recipe/${event.recipeId}`} className="moment_dish">{event.dish}</Link>}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

// Saved on blur, so typing stays smooth
function NoteField({ label, value, placeholder, onSave }) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <input defaultValue={value} placeholder={placeholder} onBlur={(e) => e.target.value !== value && onSave(e.target.value.trim())} />
    </label>
  );
}

function AddLine({ label, placeholder, onAdd }) {
  const [text, setText] = useState('');
  return (
    <form
      className="add_row"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) onAdd(text.trim());
        setText('');
      }}
    >
      <label className="field_inline">
        <span className="visually_hidden">{label}</span>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} />
      </label>
      <button type="submit" className="button button-quiet" disabled={!text.trim()}>Add</button>
    </form>
  );
}

// The table: see it in 3D, set the vibe, name the guests and gather what goes on it.
function Table({ party }) {
  const mood = moodFor(party.mood);
  const names = party.names ?? [];
  const vibe = { words: [], dress: '', music: '', ...party.vibe };
  const done = new Set(party.decorDone ?? []);
  const seats = Math.max(party.guests, names.length);
  const save = (changes) => saveParty({ ...party, ...changes });
  const setVibe = (changes) => save({ vibe: { ...vibe, ...changes } });
  const toggleWord = (word) => setVibe({ words: vibe.words.includes(word) ? vibe.words.filter((w) => w !== word) : [...vibe.words, word] });
  const words = [...new Set([...vibe.words, ...vibeWords(mood.id)])];
  const decor = decorFor(mood.id, seats);

  return (
    <>
      <div className="table_frame">
        <Suspense fallback={<div className="table_scene" />}>
          <TableScene mood={mood} guests={Math.min(seats, 14)} names={names} />
        </Suspense>
      </div>
      <p className="small">Drag to look around.</p>

      <div className="table_tools">
        <section className="tool">
          <h2 className="section_title">Vibe</h2>
          <div className="moods" role="radiogroup" aria-label="Table style">
            {moods.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={m.id === mood.id}
                className={`mood ${m.id === mood.id ? 'mood-on' : ''}`}
                onClick={() => save({ mood: m.id })}
              >
                <span className="party_swatch" aria-hidden="true">
                  {[m.check ?? m.cloth, m.napkin, m.flowers[0], m.plate].map((color, i) => <i key={`${i}-${color}`} style={{ background: color }} />)}
                </span>
                <span className="mood_name">{m.name}</span>
              </button>
            ))}
          </div>
          <div className="chips" role="group" aria-label="Vibe words">
            {words.map((word) => (
              <button key={word} type="button" className="chip chip-word" aria-pressed={vibe.words.includes(word)} onClick={() => toggleWord(word)}>
                {word}
              </button>
            ))}
          </div>
          <AddLine label="Add a word" placeholder="Add your own word" onAdd={(word) => !vibe.words.includes(word) && setVibe({ words: [...vibe.words, word] })} />
          <NoteField key={`dress-${party.id}`} label="Dress code" value={vibe.dress} placeholder="Linen and sandals" onSave={(dress) => setVibe({ dress })} />
          <NoteField key={`music-${party.id}`} label="Music" value={vibe.music} placeholder="Old soul records, then jazz" onSave={(music) => setVibe({ music })} />
        </section>

        <div className="tool_column">
          <section className="tool">
            <h2 className="section_title">Guests</h2>
            <p className="small">{seats} seats · {names.length} named</p>
            {names.length > 0 && (
              <ul className="rows">
                {names.map((name, i) => (
                  <li key={`${i}-${name}`} className="row">
                    <span className="row_text">{name}</span>
                    <button
                      type="button"
                      className="icon_button"
                      aria-label={`Remove ${name}`}
                      onClick={() => save({ names: names.filter((_, j) => j !== i) })}
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <AddLine
              label="Add a guest"
              placeholder="Add a guest"
              onAdd={(name) => save({ names: [...names, name], guests: Math.max(party.guests, names.length + 1) })}
            />
          </section>

          <section className="tool">
            <h2 className="section_title">For the table</h2>
            <ul className="rows">
              {decor.map((item) => (
                <li key={item} className={done.has(item) ? 'row row-done' : 'row'}>
                  <label className="row_check">
                    <input
                      type="checkbox"
                      checked={done.has(item)}
                      onChange={() => save({ decorDone: done.has(item) ? [...done].filter((d) => d !== item) : [...done, item] })}
                    />
                    <span>{item}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}

function Party() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const party = useLiveQuery(() => db.parties.get(id), [id], 'loading');
  const recipes = useLiveQuery(() => db.recipes.orderBy('title').toArray(), []);

  if (party === 'loading' || !recipes) return null;
  if (!party) return <Soon title="Not found" text="This party was deleted." />;

  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'menu';
  const dishes = menuDishes(party, recipes);

  return (
    <div className={tab === 'table' ? 'page' : 'page narrow'}>
      <Link to="/" className="back_link"><Icon name="back" size={18} />Parties</Link>
      <header className="page_head party_head">
        <div>
          <h1 className="page_title">{party.name || 'Dinner party'}</h1>
          <p className="recipe_meta">
            <span className="meta_item"><Icon name="calendar" size={18} />{partyDateLabel(party)}, {clockLabel(partyTime(party.date, party.time), party.date)}</span>
            <span className="meta_item"><Icon name="people" size={18} />{party.guests} guests</span>
          </p>
        </div>
        <Link to={`/party/${id}/edit`} className="button button-quiet button-icon" aria-label="Edit party"><Icon name="edit" size={18} /></Link>
      </header>

      <div className="segmented" role="tablist" aria-label="Party">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setParams(t.id === 'menu' ? {} : { tab: t.id }, { replace: true })}>
            {t.name}
          </button>
        ))}
      </div>

      <div className="tab_body">
        {tab === 'menu' && <Menu party={party} recipes={recipes} dishes={dishes} />}
        {tab === 'shop' && <Shopping party={party} dishes={dishes} />}
        {tab === 'timeline' && <Timeline party={party} dishes={dishes} />}
        {tab === 'table' && <Table party={party} />}
      </div>
    </div>
  );
}

export default Party;
