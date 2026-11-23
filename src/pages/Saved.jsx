import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import {
  isUpcoming, partyTime, seatsFor, clockLabel,
} from '../lib/party';
import { planView, vibeTitle, vibeEmoji } from '../lib/vibes';
import DateTile from '../components/DateTile';
import Icon from '../components/Icon';

const when = (party) => {
  const date = partyTime(party.date, party.time);
  return `${date.toLocaleDateString('en-US', { weekday: 'long' })} · ${clockLabel(date, party.date)} · ${seatsFor(party)} guests`;
};

const savedOn = (vibe) => new Date(vibe.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// a saved vibe: a swatch of its colours, its name and the start of its menu
function VibeCard({ vibe }) {
  const { palette } = vibe;
  const party = vibe.plan ? planView(vibe) : null;
  return (
    <Link to={`/vibe/${vibe.id}`} className="vibe_card">
      <span className="vibe_swatch" style={{ background: palette.backdrop }} aria-hidden="true">
        <span className="dots">
          {[palette.check ?? palette.cloth, palette.napkin, palette.flowers[0], palette.charger].map((c, i) => <i key={`${i}-${c}`} style={{ background: c }} />)}
        </span>
      </span>
      <span className="vibe_text">
        <span className="idea_name"><span aria-hidden="true">{vibeEmoji(vibe)}</span> {vibeTitle(vibe)}</span>
        {vibe.menu.length > 0 && <span className="idea_blurb">{vibe.menu.slice(0, 3).join(' · ')}{vibe.menu.length > 3 ? ' …' : ''}</span>}
        <span className="idea_foot">
          {party ? `Hosted ${partyTime(party.date, party.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : `Saved ${savedOn(vibe)}`} · {palette.name}
        </span>
      </span>
    </Link>
  );
}

function HostingRow({ party }) {
  return (
    <li>
      <Link to={`/vibe/${party.id}/plan`} className="party_row">
        <DateTile party={party} />
        <span className="next_text">
          <span className="party_name">{party.name || 'Dinner party'}</span>
          <span className="row_sub">{when(party)}</span>
        </span>
        <Icon name="chevron" size={18} />
      </Link>
    </li>
  );
}

// Saved: dinners you're hosting soon, then every vibe you've kept, newest first.
function Saved() {
  const vibes = useLiveQuery(() => db.vibes.orderBy('savedAt').reverse().toArray(), []);
  const [now] = useState(() => Date.now());
  if (!vibes) return null;

  const hosting = vibes.filter((v) => v.plan && isUpcoming(planView(v), now));
  const rest = vibes.filter((v) => !hosting.includes(v));
  const upcoming = hosting.map(planView).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  return (
    <div className="page">
      <header className="page_head">
        <h1 className="page_title">Saved</h1>
        <Link to="/" className="button button-quiet"><Icon name="reroll" size={18} />Discover</Link>
      </header>

      {upcoming.length > 0 && (
        <section className="section">
          <h2 className="section_title">Hosting</h2>
          <ul className="party_list">{upcoming.map((party) => <HostingRow key={party.id} party={party} />)}</ul>
        </section>
      )}

      {rest.length > 0 ? (
        <section className="section">
          {upcoming.length > 0 && <h2 className="section_title">Vibes</h2>}
          <ul className="idea_grid">{rest.map((vibe) => <li key={vibe.id}><VibeCard vibe={vibe} /></li>)}</ul>
        </section>
      ) : !upcoming.length && (
        <p className="lede">
          Nothing saved yet. <Link to="/" className="link">Roll a few vibes</Link> and save the ones you like,
          or start from a <Link to="/ideas" className="link">dinner idea</Link>.
        </p>
      )}
    </div>
  );
}

export default Saved;
