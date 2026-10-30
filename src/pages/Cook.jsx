import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { scaleIngredient } from '../lib/ingredients';
import { splitStep, formatClock } from '../lib/timers';

// a short kitchen-timer beep, without needing a sound file
function beep() {
  try {
    const audio = new AudioContext();
    [0, 0.35, 0.7].forEach((offset) => {
      const tone = audio.createOscillator();
      const gain = audio.createGain();
      tone.frequency.value = 880;
      gain.gain.setValueAtTime(0.25, audio.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + offset + 0.25);
      tone.connect(gain).connect(audio.destination);
      tone.start(audio.currentTime + offset);
      tone.stop(audio.currentTime + offset + 0.3);
    });
  } catch {
    // no sound available
  }
  navigator.vibrate?.([300, 150, 300]);
}

// keep the screen on while cooking
function useWakeLock() {
  useEffect(() => {
    let lock = null;
    const request = async () => {
      try {
        lock = await navigator.wakeLock?.request('screen');
      } catch {
        // not supported or not allowed
      }
    };
    const onVisible = () => document.visibilityState === 'visible' && request();
    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release();
    };
  }, []);
}

function useTimers() {
  const [timers, setTimers] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const rang = useRef(new Set());

  useEffect(() => {
    if (timers.length === 0) return undefined;
    const tick = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(tick);
  }, [timers.length]);

  // ring once when each timer runs out
  useEffect(() => {
    timers.forEach((t) => {
      if (t.endsAt <= now && !rang.current.has(t.id)) {
        rang.current.add(t.id);
        beep();
      }
    });
  }, [now, timers]);

  const start = (label, seconds) => {
    setNow(Date.now());
    setTimers((list) => [...list, { id: crypto.randomUUID(), label, endsAt: Date.now() + seconds * 1000 }]);
  };
  const stop = (id) => setTimers((list) => list.filter((t) => t.id !== id));
  return { timers, now, start, stop };
}

function Cook() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const recipe = useLiveQuery(() => db.recipes.get(id), [id], 'loading');
  const [step, setStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const { timers, now, start, stop } = useTimers();
  const swipe = useRef(null);
  useWakeLock();

  if (recipe === 'loading' || !recipe) return null;

  const total = recipe.steps.length;
  const factor = (Number(params.get('servings')) || recipe.servings) / recipe.servings;
  const go = (next) => setStep(Math.max(0, Math.min(total, next)));
  const finished = step === total;

  return (
    <div className="cook">
      <header className="cook_head">
        <Link to={`/recipe/${id}`} className="mono_label">&times; Close</Link>
        <span className="mono_label">{recipe.title}</span>
        <button type="button" className="mono_label text_button" aria-expanded={showIngredients} onClick={() => setShowIngredients(!showIngredients)}>
          Ingredients
        </button>
      </header>

      {showIngredients && (
        <ul className="cook_ingredients">
          {recipe.ingredients.map((line) => <li key={line}>{scaleIngredient(line, factor)}</li>)}
        </ul>
      )}

      <div
        className="cook_step"
        onPointerDown={(e) => { swipe.current = e.clientX; }}
        onPointerUp={(e) => {
          if (swipe.current === null) return;
          const dx = e.clientX - swipe.current;
          if (dx < -50) go(step + 1);
          if (dx > 50) go(step - 1);
          swipe.current = null;
        }}
      >
        {finished ? (
          <>
            <p className="mono_label">Order up</p>
            <p className="cook_text">Enjoy! Add a note about how it went so you remember next time.</p>
            <Link to={`/recipe/${id}`} className="button button-big">Write a note</Link>
          </>
        ) : (
          <>
            <p className="mono_label">Step {step + 1} of {total}</p>
            <p className="cook_text">
              {splitStep(recipe.steps[step]).map((part, i) => (part.timer ? (
                <button key={i} type="button" className="timer_chip" onClick={() => start(part.timer.label, part.timer.seconds)}>
                  ⏱ {part.text}
                </button>
              ) : <span key={i}>{part.text}</span>))}
            </p>
          </>
        )}
      </div>

      {timers.length > 0 && (
        <ul className="timers" aria-live="polite">
          {timers.map((t) => (
            <li key={t.id} className={t.endsAt <= now ? 'timer timer-done' : 'timer'}>
              <span className="timer_clock">{t.endsAt <= now ? 'Done!' : formatClock((t.endsAt - now) / 1000)}</span>
              <span className="mono_label">{t.label}</span>
              <button type="button" className="text_button" onClick={() => stop(t.id)}>{t.endsAt <= now ? 'OK' : 'Stop'}</button>
            </li>
          ))}
        </ul>
      )}

      <nav className="cook_nav">
        <button type="button" className="button button-ghost" onClick={() => go(step - 1)} disabled={step === 0}>&larr; Back</button>
        <button type="button" className="button" onClick={() => go(step + 1)} disabled={finished}>{step === total - 1 ? 'Finish' : 'Next'} &rarr;</button>
      </nav>
    </div>
  );
}

export default Cook;
