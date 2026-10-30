// Finds durations in recipe steps ("bake 10-12 minutes", "rest for 1 hour") so they can become timers.

const DURATION = /(\d+(?:\.\d+)?)(?:\s*(?:-|–|to)\s*(\d+(?:\.\d+)?))?\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)\b/gi;

const SECONDS_PER_UNIT = { h: 3600, m: 60, s: 1 };

export function findTimers(text) {
  return [...text.matchAll(DURATION)].map((match) => ({
    label: match[0],
    // start with the shorter end of a range, so food gets checked early
    seconds: Math.round(Number(match[1]) * SECONDS_PER_UNIT[match[3][0].toLowerCase()]),
    index: match.index,
    length: match[0].length,
  }));
}

// Splits a step into plain text and timer pieces for display.
export function splitStep(text) {
  const parts = [];
  let cursor = 0;
  findTimers(text).forEach((timer) => {
    if (timer.index > cursor) parts.push({ text: text.slice(cursor, timer.index) });
    parts.push({ text: timer.label, timer });
    cursor = timer.index + timer.length;
  });
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return parts;
}

export function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
