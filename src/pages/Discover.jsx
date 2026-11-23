import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db, newId, saveVibe, deleteVibe, hostVibe,
} from '../lib/db';
import { firstVibe, sameVibe } from '../lib/reroll';
import { paletteFor } from '../lib/seeds';
import { vibeTitle } from '../lib/vibes';
import Board from '../components/Board';
import Icon from '../components/Icon';

// the vibe you're rolling, remembered on this device so it's still there when you come back
const KEY = 'mise-draft';
function loadDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(KEY));
    // keep the palette current with the seeds, by id
    if (draft?.palette) return { ...draft, palette: paletteFor(draft.palette.id) ?? draft.palette };
  } catch {
    // nothing saved, or private browsing
  }
  return firstVibe();
}

// Discover: roll a vibe, lock what you like, save it, or host it.
function Discover() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(loadDraft);
  const [message, setMessage] = useState(null);
  const vibes = useLiveQuery(() => db.vibes.toArray(), []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(draft));
    } catch {
      // private browsing: the draft just won't be remembered
    }
  }, [draft]);

  useEffect(() => {
    if (!message) return undefined;
    const clear = setTimeout(() => setMessage(null), 3600);
    return () => clearTimeout(clear);
  }, [message]);

  const saved = vibes?.find((v) => sameVibe(v, draft));

  const save = async () => {
    if (saved && !saved.plan) {
      await deleteVibe(saved.id);
      setMessage({ text: 'Removed from saved' });
      return;
    }
    if (saved) {
      navigate(`/vibe/${saved.id}/plan`);
      return;
    }
    const vibe = {
      ...draft, id: newId(), name: '', savedAt: Date.now(), plan: null,
    };
    await saveVibe(vibe);
    setMessage({ text: `Saved "${vibeTitle(vibe)}"`, link: '/saved' });
  };

  // hosting saves the vibe (if it isn't already) and starts a plan from its menu
  const host = async () => {
    const vibe = saved ?? {
      ...draft, id: newId(), name: '', savedAt: Date.now(), plan: null,
    };
    const hosted = await hostVibe(vibe);
    navigate(`/vibe/${hosted.id}/plan`);
  };

  return (
    <div className="page board_page">
      <Board
        vibe={draft}
        onChange={setDraft}
        actions={(
          <>
            <button type="button" className="button button-quiet" aria-pressed={Boolean(saved)} onClick={save}>
              <Icon name="heart" size={18} filled={Boolean(saved)} />{saved ? 'Saved' : 'Save'}
            </button>
            <button type="button" className="button button-quiet" onClick={host}>
              <Icon name="calendar" size={18} />{saved?.plan ? 'Open plan' : 'Host this'}
            </button>
          </>
        )}
      />
      {message && (
        <div className="toast" role="status">
          <span>{message.text}</span>
          {message.link && <Link to={message.link} className="toast_action">View</Link>}
        </div>
      )}
    </div>
  );
}

export default Discover;
