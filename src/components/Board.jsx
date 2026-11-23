import {
  lazy, Suspense, useEffect, useRef, useState,
} from 'react';
import { SLOTS, themeFor } from '../lib/seeds';
import { roll, rollSlot, isRemix } from '../lib/reroll';
import { vibeTitle, vibeEmoji } from '../lib/vibes';
import { usePaletteTint } from '../lib/tint';
import Icon from './Icon';

// three.js only loads with the table
const TableScene = lazy(() => import('./TableScene'));

const ALL_KEYS = SLOTS.map((s) => s.key);

// keys that shouldn't reroll when pressed: typing, or a focused control's own action
const typing = (el) => el.closest?.('input, textarea, select, button, a, [contenteditable="true"]');

function SlotValue({ slot, vibe }) {
  const theme = themeFor(vibe.themeId);
  const value = slot === 'theme' ? theme : vibe[slot];
  if (slot === 'theme') {
    return theme ? <><span className="emoji" aria-hidden="true">{theme.emoji}</span> {theme.name}</> : <span className="slot_empty">Your own</span>;
  }
  if (slot === 'palette') {
    return (
      <>
        <span className="dots" aria-hidden="true">
          {[value.check ?? value.cloth, value.napkin, value.flowers[0], value.charger].map((c, i) => <i key={`${i}-${c}`} style={{ background: c }} />)}
        </span>
        {' '}{value.name}
      </>
    );
  }
  if (slot === 'menu') {
    return value?.length ? <ul className="slot_menu">{value.map((dish) => <li key={dish}>{dish}</li>)}</ul> : <span className="slot_empty">Nothing yet</span>;
  }
  return value ?? <span className="slot_empty">Nothing yet</span>;
}

// The board: the table on the left, the six slots on the right, each with reroll and lock.
// `vibe` holds the slots and their locks; `onChange` gets the next vibe. Space rerolls everything unlocked.
function Board({
  vibe, onChange, actions, kicker = 'Tonight',
}) {
  const [flipped, setFlipped] = useState({ keys: ALL_KEYS, round: 0 });
  const [toast, setToast] = useState('');
  const [spin, setSpin] = useState(0);
  const latest = useRef({ vibe, onChange });
  usePaletteTint(vibe.palette);

  useEffect(() => { latest.current = { vibe, onChange }; });

  const theme = themeFor(vibe.themeId);
  const locks = vibe.locks ?? [];

  const show = (next, changed) => {
    setFlipped((f) => ({ keys: changed, round: f.round + 1 }));
    latest.current.onChange(next);
  };

  const rollAll = () => {
    const { vibe: current } = latest.current;
    const { vibe: next, changed } = roll(current, ALL_KEYS, current.locks ?? []);
    if (!changed.length) {
      setToast('Everything is locked. Unlock something to reroll it.');
      return;
    }
    setSpin((n) => n + 1);
    show(next, changed);
  };

  useEffect(() => {
    if (!toast) return undefined;
    const clear = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(clear);
  }, [toast]);

  // space rerolls, unless you're typing or on a control
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.repeat || e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
      e.preventDefault();
      rollAll();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const toggleLock = (key) => onChange({ ...vibe, locks: locks.includes(key) ? locks.filter((k) => k !== key) : [...locks, key] });

  return (
    <div className="board">
      <div className="board_table">
        <Suspense fallback={<div className="table_scene" />}>
          <TableScene palette={vibe.palette} guests={6} />
        </Suspense>
        <p className="board_hint">Drag to look around</p>
      </div>

      <div className="board_side">
        <header className="board_head">
          <p className="board_kicker">{kicker}{isRemix(vibe) ? ' · remixed' : ''}</p>
          <h1 className="page_title"><span aria-hidden="true">{vibeEmoji(vibe)}</span> {vibeTitle(vibe)}</h1>
          {theme && <p className="board_blurb">{theme.blurb}</p>}
        </header>

        <ul className="slots">
          {SLOTS.map(({ key, label }) => {
            const locked = locks.includes(key);
            return (
              <li key={key} className={locked ? 'slot slot-locked' : 'slot'}>
                <span className="slot_label">{label}</span>
                <div key={flipped.keys.includes(key) ? flipped.round : 'still'} className={flipped.keys.includes(key) ? 'slot_value slot_value-flip' : 'slot_value'}>
                  <SlotValue slot={key} vibe={vibe} />
                </div>
                <div className="slot_buttons">
                  <button
                    type="button"
                    className="icon_button"
                    disabled={locked}
                    aria-label={`Reroll ${label}`}
                    title="Reroll just this"
                    onClick={() => show(rollSlot(vibe, key), [key])}
                  >
                    <Icon name="reroll" size={18} />
                  </button>
                  <button
                    type="button"
                    className="icon_button slot_lock"
                    aria-pressed={locked}
                    aria-label={`${locked ? 'Unlock' : 'Lock'} ${label}`}
                    title={locked ? 'Unlock' : 'Keep this'}
                    onClick={() => toggleLock(key)}
                  >
                    <Icon name={locked ? 'lock' : 'unlock'} size={18} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="board_actions">
          <button type="button" className="button board_roll" onClick={rollAll}>
            <span key={spin} className={spin ? 'spin' : ''}><Icon name="reroll" size={18} /></span>
            Reroll <kbd>Space</kbd>
          </button>
          {actions}
        </div>
      </div>

      {toast && <div className="toast" role="status"><span>{toast}</span></div>}
    </div>
  );
}

export default Board;
