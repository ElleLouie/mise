import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { moodFor } from '../lib/moods';
import { partyDateLabel, isUpcoming } from '../lib/party';
import { ideas } from '../lib/ideas';
import Icon from '../components/Icon';
import { IdeaCard } from './Ideas';

function PartyCard({ party }) {
  const mood = moodFor(party.mood);
  return (
    <Link to={`/party/${party.id}`} className="party_card">
      <span className="party_swatch" aria-hidden="true">
        {[mood.cloth, mood.napkin, mood.flowers[0], mood.plate].map((color) => <i key={color} style={{ background: color }} />)}
      </span>
      <span className="party_name">{party.name || 'Dinner party'}</span>
      <span className="card_meta">
        {partyDateLabel(party)} · {party.guests} guests · {party.dishes.length} {party.dishes.length === 1 ? 'dish' : 'dishes'}
      </span>
    </Link>
  );
}

function Parties() {
  const parties = useLiveQuery(() => db.parties.orderBy('date').toArray(), []);
  const [now] = useState(() => Date.now());
  if (!parties) return null;

  const upcoming = parties.filter((p) => isUpcoming(p, now));
  const past = parties.filter((p) => !isUpcoming(p, now)).reverse();

  return (
    <div className="page">
      <header className="page_head">
        <h1 className="page_title">Dinner parties</h1>
        <Link to="/party/new" className="button"><Icon name="plus" size={18} />New party</Link>
      </header>

      {upcoming.length > 0 && (
        <section className="section">
          <h2 className="section_title">Coming up</h2>
          <ul className="party_grid">
            {upcoming.map((party) => <li key={party.id}><PartyCard party={party} /></li>)}
          </ul>
        </section>
      )}

      {parties.length === 0 && (
        <p className="lede">Plan a dinner: pick a menu, and mise builds the shopping list, a cooking timeline and the table.</p>
      )}

      <section className="section">
        <div className="section_head">
          <h2 className="section_title">Dinner ideas</h2>
          <Link to="/ideas" className="link">See all</Link>
        </div>
        <ul className="party_grid grid-row-scroll">
          {ideas.slice(0, 3).map((idea) => <li key={idea.id}><IdeaCard idea={idea} /></li>)}
        </ul>
      </section>

      {past.length > 0 && (
        <section className="section">
          <h2 className="section_title">Past</h2>
          <ul className="party_grid">
            {past.map((party) => <li key={party.id}><PartyCard party={party} /></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}

export default Parties;
