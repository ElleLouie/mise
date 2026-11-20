import {
  Fragment, lazy, Suspense, useEffect, useState,
} from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveParty } from '../lib/db';
import {
  COURSES, menuDishes, partyShopping, seatsFor, timeline, clockLabel, partyDateLabel, partyTime,
  serveOffset, servedCourses, ovenClashes, nowAndNext,
} from '../lib/party';
import { findTimers, formatClock } from '../lib/timers';
import { useTimers, useWakeLock } from '../lib/kitchen';
import { aisleOrder } from '../lib/aisles';
import { moods, moodFor } from '../lib/moods';
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

// Pick a saved recipe, or type anything ("Baguette", "Maya brings wine") to add it as a simple item.
function Picker({ recipes, onPick, onText, onClose }) {
  const [query, setQuery] = useState('');
  const text = query.trim();
  const shown = recipes.filter((r) => r.title.toLowerCase().includes(text.toLowerCase()));
  return (
    <div className="picker">
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          if (shown.length === 1) onPick(shown[0].id);
          else if (text) onText(text);
        }}
      >
        <label className="search">
          <span className="visually_hidden">Find a recipe or type a dish</span>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input autoFocus type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a recipe or type a dish" />
        </label>
        <button type="button" className="button button-quiet" onClick={onClose}>Cancel</button>
      </form>
      <ul className="items">
        {text && (
          <li>
            <button type="button" className="items_pick items_pick-text" onClick={() => onText(text)}>
              <Icon name="plus" size={16} />Add &ldquo;{text}&rdquo;
            </button>
          </li>
        )}
        {shown.map((recipe) => (
          <li key={recipe.id}>
            <button type="button" className="items_pick" onClick={() => onPick(recipe.id)}>{recipe.title}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Menu({ party, recipes, dishes, removed }) {
  const [picking, setPicking] = useState(null);
  const update = (next) => saveParty({ ...party, dishes: next });
  const remove = (entry, title) => {
    removed(title);
    update(party.dishes.filter((d) => d !== entry));
  };

  return (
    <div className="courses">
      {COURSES.map((course) => {
        const here = party.dishes.filter((dish) => dish.course === course.id);
        return (
          <section key={course.id} className="course">
            <h2 className="group_title">{course.name}</h2>
            {/* each course is one card: its dishes, then a row to add another */}
            <ul className="rows">
              {here.map((entry) => {
                const dish = dishes.find((d) => d.recipeId && d.recipeId === entry.recipeId);
                if (entry.recipeId && !dish) return null;
                return (
                  <li key={entry.recipeId ?? `text-${entry.text}`} className="row dish">
                    {dish ? (
                      <>
                        <RecipeImage recipe={dish.recipe} className="dish_image" />
                        <Link to={`/recipe/${dish.recipeId}`} className="row_link">
                          {dish.recipe.title}
                          <span className="row_sub">{formatTime(dish.recipe.minutes)} · scaled for {seatsFor(party)}</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <span className="dish_image dish_image-text" aria-hidden="true"><Icon name="bag" size={18} /></span>
                        <span className="row_link">
                          {entry.text}
                          <span className="row_sub">On the shopping list</span>
                        </span>
                      </>
                    )}
                    <button type="button" className="icon_button" aria-label={`Remove ${dish?.recipe.title ?? entry.text}`} onClick={() => remove(entry, dish?.recipe.title ?? entry.text)}>
                      <Icon name="close" size={16} />
                    </button>
                  </li>
                );
              })}
              <li className="row row-add">
                {picking === course.id ? (
                  <Picker
                    recipes={recipes.filter((r) => !party.dishes.some((d) => d.recipeId === r.id))}
                    onClose={() => setPicking(null)}
                    onPick={async (recipeId) => {
                      await update([...party.dishes, { recipeId, course: course.id }]);
                      setPicking(null);
                    }}
                    onText={async (text) => {
                      await update([...party.dishes, { text, course: course.id }]);
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
      {party.dishes.length === 0 && (
        <p className="small">Not sure where to start? <Link to="/ideas" className="link">Browse dinner ideas</Link></p>
      )}
    </div>
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

// One list for the party: the menu's ingredients, simple items, your own extras and what goes on the table.
function Shopping({ party, dishes, removed }) {
  const items = partyShopping(party, dishes);
  const bought = new Set(party.bought);
  const have = new Set(party.have ?? []);
  const toggle = (list, key) => (list.has(key) ? [...list].filter((k) => k !== key) : [...list, key]);
  const save = (changes) => saveParty({ ...party, ...changes });
  const needed = items.filter((item) => !have.has(item.key));
  const atHome = items.filter((item) => have.has(item.key));
  const groups = [...aisleOrder, 'For the table']
    .map((aisle) => [aisle, needed.filter((item) => item.aisle === aisle)])
    .filter(([, group]) => group.length > 0);
  const left = needed.filter((item) => !bought.has(item.key)).length;

  const row = (item) => (
    <li key={item.key} className={bought.has(item.key) ? 'row row-done' : 'row'}>
      <label className="row_check">
        <input type="checkbox" checked={bought.has(item.key)} onChange={() => save({ bought: toggle(bought, item.key) })} />
        <span className="row_text">
          {item.text}
          {item.dishes?.length > 0 && <span className="row_sub">{item.dishes.join(', ')}</span>}
        </span>
      </label>
      <button type="button" className="text_button" onClick={() => save({ have: toggle(have, item.key) })}>Have it</button>
      {item.extra && (
        <button type="button" className="icon_button" aria-label={`Remove ${item.text}`} onClick={() => { removed(item.text); save({ extras: party.extras.filter((x) => x.id !== item.extra) }); }}>
          <Icon name="close" size={16} />
        </button>
      )}
    </li>
  );

  return (
    <>
      <p className="small">For {seatsFor(party)} guests · {left === 0 ? 'all done' : `${left} left to buy`}</p>
      <AddLine label="Add to the list" placeholder="Add something, like wine or ice" onAdd={(text) => save({ extras: [...(party.extras ?? []), { id: crypto.randomUUID(), text }] })} />
      {groups.map(([aisle, group]) => (
        <section key={aisle} className="group">
          <h2 className="group_title">{aisle}</h2>
          <ul className="rows">{group.map(row)}</ul>
        </section>
      ))}
      {atHome.length > 0 && (
        <details className="group at_home">
          <summary className="group_title">Already have · {atHome.length}</summary>
          <ul className="rows">
            {atHome.map((item) => (
              <li key={item.key} className="row">
                <span className="row_text">{item.text}</span>
                <button type="button" className="text_button" onClick={() => save({ have: toggle(have, item.key) })}>Need it</button>
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="small">Salt, pepper and water are left off.</p>
    </>
  );
}

// A few seconds to take back the last removal
function useUndo() {
  const [last, setLast] = useState(null);
  useEffect(() => {
    if (!last) return undefined;
    const clear = setTimeout(() => setLast(null), 6000);
    return () => clearTimeout(clear);
  }, [last]);
  return {
    last,
    offer: (label, before) => setLast({ label, before }),
    take: (restore) => {
      restore(last.before);
      setLast(null);
    },
  };
}

const toClock = (date) => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
const SERVE_LABELS = { starter: 'Starters', main: 'Mains and sides', dessert: 'Dessert' };

// When each course goes out; changing one moves its dishes on the timeline
function ServingTimes({ party, dishes }) {
  const sitDown = partyTime(party.date, party.time);
  const courses = servedCourses(party, dishes);
  const setTime = (course, value) => {
    if (!value) return;
    const [h, m] = value.split(':').map(Number);
    const at = new Date(sitDown);
    at.setHours(h, m, 0, 0);
    saveParty({ ...party, serve: { ...party.serve, [course]: Math.round((at - sitDown) / 60000) } });
  };
  return (
    <div className="serving">
      {courses.map((course) => (
        <label key={course} className="serving_time">
          <span className="label">{SERVE_LABELS[course]}</span>
          <input type="time" value={toClock(new Date(sitDown.getTime() + serveOffset(party, course) * 60000))} onChange={(e) => setTime(course, e.target.value)} />
        </label>
      ))}
    </div>
  );
}

function StepTimers({ text, onStart }) {
  return findTimers(text).map((timer) => (
    <button key={timer.index} type="button" className="timer_start" onClick={() => onStart(timer.label, timer.seconds)}>
      <Icon name="clock" size={14} />Start {timer.label}
    </button>
  ));
}

// The night itself: what to do now, what's next, and timers that beep
function NowCard({ party, events, done, now, toggle, startTimer }) {
  const { current, next, late } = nowAndNext(events, done, now);
  const minutesTo = next ? Math.round((next.at.getTime() - now) / 60000) : 0;
  return (
    <section className="now" aria-live="polite">
      <p className="now_label">Now · {clockLabel(new Date(now), party.date)}</p>
      {current.length === 0 && <p className="now_idle">Nothing to do this minute.</p>}
      {current.map((event) => (
        <div key={event.key} className="now_step">
          <p className="now_text">{event.text}</p>
          {event.dish && <p className="now_dish">{event.dish}</p>}
          <div className="now_actions">
            <StepTimers text={event.text} onStart={startTimer} />
            <button type="button" className="button" onClick={() => toggle(event.key)}><Icon name="check" size={16} />Done</button>
          </div>
        </div>
      ))}
      {next && (
        <p className="now_next">
          <strong>Next{minutesTo > 0 ? ` in ${minutesTo} min` : ''}:</strong> {next.text}
          {next.dish ? ` · ${next.dish}` : ''}
        </p>
      )}
      {late.length > 0 && <p className="now_late">{late.length} earlier {late.length === 1 ? 'step is' : 'steps are'} not ticked off yet</p>}
    </section>
  );
}

function Timeline({ party, dishes }) {
  const [now, setNow] = useState(() => Date.now());
  const { timers, now: tick, start, stop } = useTimers();
  const events = timeline(party, dishes);
  const done = new Set(party.stepsDone ?? []);
  const sitDown = partyTime(party.date, party.time);
  // party day: from three hours before the first step until dinner is well over
  const first = events[0]?.at.getTime() ?? sitDown.getTime();
  const live = now > first - 3 * 60 * 60 * 1000 && now < sitDown.getTime() + 4 * 60 * 60 * 1000;
  useWakeLock(live);

  useEffect(() => {
    const clock = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(clock);
  }, []);

  if (party.dishes.length === 0) return <p className="empty">Add dishes to the menu to build the timeline.</p>;

  const toggle = (key) => saveParty({ ...party, stepsDone: done.has(key) ? [...done].filter((k) => k !== key) : [...done, key] });
  const clashes = ovenClashes(events);
  const nowIndex = live ? events.findIndex((event) => event.at.getTime() > now) : -1;

  return (
    <>
      {/* on the night, what to do now comes first */}
      {live && <NowCard party={party} events={events} done={done} now={now} toggle={toggle} startTimer={start} />}
      <p className="small">
        Start at <strong>{clockLabel(events[0].at, party.date)}</strong> for dinner at {clockLabel(sitDown, party.date)}
      </p>
      <ServingTimes party={party} dishes={dishes} />

      {clashes.map(({ a, b, from, to }) => (
        <p key={`${a.dish}-${b.dish}`} className="notice">
          <strong>Oven clash</strong> {a.dish} ({a.temperature}°F) and {b.dish} ({b.temperature}°F) both need the oven
          {' '}{clockLabel(from, party.date)}–{clockLabel(to, party.date)}. Try serving one earlier, or making it ahead.
        </p>
      ))}

      <ol className="timeline">
        {events.map((event, i) => (
          <Fragment key={event.key}>
            {i === nowIndex && <li className="now_line"><span>Now</span></li>}
            <li className={`moment ${event.serve ? 'moment-serve' : ''} ${done.has(event.key) ? 'moment-done' : ''}`}>
              <span className="moment_time">{clockLabel(event.at, party.date)}</span>
              <span className="moment_body">
                {event.serve ? (
                  <span className="moment_text">{event.text}</span>
                ) : (
                  <label className="moment_check">
                    <input type="checkbox" checked={done.has(event.key)} onChange={() => toggle(event.key)} />
                    <span className="moment_text">{event.text}</span>
                  </label>
                )}
                {event.dish && <Link to={`/recipe/${event.recipeId}`} className="moment_dish">{event.dish}</Link>}
                {!event.serve && !done.has(event.key) && <span className="moment_timers"><StepTimers text={event.text} onStart={start} /></span>}
              </span>
            </li>
          </Fragment>
        ))}
      </ol>

      {timers.length > 0 && (
        <div className="timer_bar" role="status">
          {timers.map((timer) => {
            const left = (timer.endsAt - tick) / 1000;
            return (
              <div key={timer.id} className={left <= 0 ? 'timer timer-done' : 'timer'}>
                <span className="timer_clock">{left <= 0 ? 'Done' : formatClock(left)}</span>
                <span className="timer_label">{timer.label}</span>
                <button type="button" className="icon_button" aria-label="Stop timer" onClick={() => stop(timer.id)}><Icon name="close" size={16} /></button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// The table: see it in 3D, pick its style, and name the guests for the place cards.
function Table({ party, removed }) {
  const mood = moodFor(party.mood);
  const names = party.names ?? [];
  const seats = seatsFor(party);
  const save = (changes) => saveParty({ ...party, ...changes });

  return (
    <>
      <div className="table_frame">
        <Suspense fallback={<div className="table_scene" />}>
          <TableScene mood={mood} guests={Math.min(seats, 14)} names={names} />
        </Suspense>
      </div>
      <p className="small">Drag to look around. The table&apos;s flowers, candles and linens are on the shopping list.</p>

      <div className="table_tools">
        <section className="tool">
          <h2 className="section_title">Style</h2>
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
        </section>

        <section className="tool">
          <h2 className="section_title">Guests</h2>
          <p className="small">Names go on the place cards. {names.length > 0 && `${names.length} of ${seats} named.`}</p>
          {names.length > 0 && (
            <ul className="rows">
              {names.map((name, i) => (
                <li key={`${i}-${name}`} className="row">
                  <span className="row_text">{name}</span>
                  <button type="button" className="icon_button" aria-label={`Remove ${name}`} onClick={() => { removed(name); save({ names: names.filter((_, j) => j !== i) }); }}>
                    <Icon name="close" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <AddLine label="Add a guest" placeholder="Add a guest" onAdd={(name) => save({ names: [...names, name] })} />
        </section>
      </div>
    </>
  );
}

function Party() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const party = useLiveQuery(() => db.parties.get(id), [id], 'loading');
  const undo = useUndo();
  const recipes = useLiveQuery(() => db.recipes.orderBy('title').toArray(), []);

  if (party === 'loading' || !recipes) return null;
  if (!party) return <Soon title="Not found" text="This party was deleted." />;

  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'menu';
  const dishes = menuDishes(party, recipes);
  // remember the party as it was, so a removal can be taken back
  const removed = (label) => undo.offer(label, party);

  return (
    <div className={tab === 'table' ? 'page' : 'page narrow'}>
      <Link to="/" className="back_link"><Icon name="back" size={18} />Parties</Link>
      <header className="page_head party_head">
        <div>
          <h1 className="page_title">{party.name || 'Dinner party'}</h1>
          <p className="recipe_meta">
            <span className="meta_item"><Icon name="calendar" size={18} />{partyDateLabel(party)}, {clockLabel(partyTime(party.date, party.time), party.date)}</span>
            <span className="meta_item"><Icon name="people" size={18} />{seatsFor(party)} guests</span>
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
        {tab === 'menu' && <Menu party={party} recipes={recipes} dishes={dishes} removed={removed} />}
        {tab === 'shop' && <Shopping party={party} dishes={dishes} removed={removed} />}
        {tab === 'timeline' && <Timeline party={party} dishes={dishes} />}
        {tab === 'table' && <Table party={party} removed={removed} />}
      </div>
      {undo.last && (
        <div className="toast" role="status">
          <span>Removed {undo.last.label}</span>
          <button type="button" className="toast_action" onClick={() => undo.take(saveParty)}>Undo</button>
        </div>
      )}
    </div>
  );
}

export default Party;
