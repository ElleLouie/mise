import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, blankParty, saveParty, deleteParty, partyFromIdea } from '../lib/db';
import { ideaFor } from '../lib/ideas';
import Icon from '../components/Icon';

// `idea` and `titles` come from planning a dinner idea: its menu is filled in when the party is saved
function Form({ party, isNew, idea, titles }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: idea?.name ?? party.name, date: party.date, time: party.time, guests: party.guests });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const details = { ...party, ...form, name: form.name.trim(), guests: Math.max(1, Number(form.guests) || 1) };
    if (idea) await partyFromIdea(details, idea, titles);
    else await saveParty(details);
    navigate(`/party/${party.id}${idea ? '?tab=menu' : ''}`, { replace: true });
  };

  return (
    <div className="page">
      <Link to={isNew ? (idea ? `/ideas/${idea.id}` : '/') : `/party/${party.id}`} className="back_link"><Icon name="back" size={18} />Back</Link>
      <form className="panel form" onSubmit={onSubmit}>
        <h1 className="page_title">{isNew ? 'New party' : 'Edit party'}</h1>
        {idea && <p className="lede">{idea.name} · {titles.length} dishes</p>}
        <label className="field">
          <span className="label">Name</span>
          <input value={form.name} onChange={set('name')} placeholder="Saturday supper" />
        </label>
        <div className="form_row">
          <label className="field">
            <span className="label">Date</span>
            <input type="date" required value={form.date} onChange={set('date')} />
          </label>
          <label className="field">
            <span className="label">Dinner at</span>
            <input type="time" required value={form.time} onChange={set('time')} />
          </label>
        </div>
        <label className="field">
          <span className="label">Guests <span className="hint">including you</span></span>
          <input type="number" min="1" max="24" inputMode="numeric" required value={form.guests} onChange={set('guests')} />
        </label>
        <button type="submit" className="button button-big">{isNew ? (idea ? 'Create party' : 'Plan the menu') : 'Save changes'}</button>
        {isNew && !idea && <p className="small center">Or start from a <Link to="/ideas" className="link">dinner idea</Link></p>}
        {!isNew && (
          <button
            type="button"
            className="link link-danger"
            onClick={async () => {
              if (window.confirm(`Delete "${party.name || 'this party'}"?`)) {
                await deleteParty(party.id);
                navigate('/', { replace: true });
              }
            }}
          >
            Delete party
          </button>
        )}
      </form>
    </div>
  );
}

function PartyForm() {
  const { id } = useParams();
  const { state } = useLocation();
  const idea = state?.idea ? ideaFor(state.idea) : null;
  const party = useLiveQuery(() => (id ? db.parties.get(id) : null), [id], 'loading');
  const [fresh] = useState(blankParty);

  if (!id) return <Form party={fresh} isNew idea={idea} titles={state?.titles ?? []} />;
  if (party === 'loading' || !party) return null;
  return <Form key={party.id} party={party} />;
}

export default PartyForm;
