import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db, saveVibe, deleteVibe, hostVibe,
} from '../lib/db';
import { sameVibe } from '../lib/reroll';
import { vibeTitle } from '../lib/vibes';
import Board from '../components/Board';
import Icon from '../components/Icon';
import Soon from './Soon';

// A saved vibe on its board. Rerolls stay here until you save them.
function SavedBoard({ stored }) {
  const navigate = useNavigate();
  const [vibe, setVibe] = useState(stored);
  const changed = !sameVibe(vibe, stored);

  const save = () => saveVibe({ ...vibe, savedAt: stored.savedAt });
  const host = async () => {
    const hosted = await hostVibe(changed ? vibe : stored);
    navigate(`/vibe/${hosted.id}/plan`);
  };
  const remove = async () => {
    const text = stored.plan
      ? `Delete "${vibeTitle(stored)}" and its plan? This can't be undone.`
      : `Delete "${vibeTitle(stored)}"?`;
    if (!window.confirm(text)) return;
    await deleteVibe(stored.id);
    navigate('/saved', { replace: true });
  };

  return (
    <div className="page board_page">
      <Link to="/saved" className="back_link"><Icon name="back" size={18} />Saved</Link>
      <Board
        vibe={vibe}
        onChange={setVibe}
        kicker={changed ? 'Saved · changed' : 'Saved'}
        actions={(
          <>
            {changed ? (
              <button type="button" className="button button-quiet" onClick={save}><Icon name="heart" size={18} filled />Save changes</button>
            ) : (
              <button type="button" className="button button-quiet" onClick={remove}><Icon name="trash" size={18} />Delete</button>
            )}
            <button type="button" className="button button-quiet" onClick={host}>
              <Icon name="calendar" size={18} />{stored.plan ? 'Open plan' : 'Host this'}
            </button>
          </>
        )}
      />
    </div>
  );
}

function Vibe() {
  const { id } = useParams();
  const stored = useLiveQuery(() => db.vibes.get(id), [id], 'loading');
  if (stored === 'loading') return null;
  if (!stored) return <Soon title="Not found" text="This vibe isn't saved here." />;
  return <SavedBoard key={stored.id} stored={stored} />;
}

export default Vibe;
