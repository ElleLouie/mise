// Kitchen helpers for party night: timers that beep, and keeping the screen on.
import { useEffect, useRef, useState } from 'react';

// a short kitchen-timer beep, without needing a sound file
export function beep() {
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
export function useWakeLock(active = true) {
  useEffect(() => {
    if (!active) return undefined;
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
  }, [active]);
}

export function useTimers() {
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
