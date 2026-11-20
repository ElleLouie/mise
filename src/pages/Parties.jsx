import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import {
  isUpcoming, partyTime, menuDishes, partyShopping, seatsFor, timeline, clockLabel,
} from '../lib/party';
import { ideas } from '../lib/ideas';
import Icon from '../components/Icon';
import { IdeaCard } from './Ideas';

// a small calendar tile: "NOV / 21"
export function DateTile({ party, big = false }) {
  const date = partyTime(party.date, party.time);
  return (
    <span className={big ? 'date_tile date_tile-big' : 'date_tile'} aria-hidden="true">
      <span className="date_tile_month">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
      <span className="date_tile_day">{date.getDate()}</span>
    </span>
  );
}

const when = (party) => {
  const date = partyTime(party.date, party.time);
  return `${date.toLocaleDateString('en-US', { weekday: 'long' })} · ${clockLabel(date, party.date)} · ${seatsFor(party)} guests`;
};

// The next party, with what's left to do
function NextParty({ party, recipes }) {
  const dishes = menuDishes(party, recipes);
  const toBuy = partyShopping(party, dishes).filter((item) => !party.bought.includes(item.key) && !(party.have ?? []).includes(item.key)).length;
  const start = dishes.length ? clockLabel(timeline(party, dishes)[0].at, party.date) : null;
  const stats = [
    { value: dishes.length, label: dishes.length === 1 ? 'dish' : 'dishes', tab: 'menu' },
    { value: toBuy, label: 'to buy', tab: 'shop' },
    { value: start ?? '—', label: 'start cooking', tab: 'timeline' },
  ];
  return (
    <div className="next">
      <Link to={`/party/${party.id}`} className="next_head">
        <DateTile party={party} big />
        <span className="next_text">
          <span className="next_name">{party.name || 'Dinner party'}</span>
          <span className="next_when">{when(party)}</span>
        </span>
        <Icon name="chevron" size={20} />
      </Link>
      <div className="next_stats">
        {stats.map(({ value, label, tab }) => (
          <Link key={tab} to={`/party/${party.id}${tab === 'menu' ? '' : `?tab=${tab}`}`} className="stat">
            <span className="stat_value">{value}</span>
            <span className="stat_label">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PartyRow({ party }) {
  return (
    <li>
      <Link to={`/party/${party.id}`} className="party_row">
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

function Parties() {
  const parties = useLiveQuery(() => db.parties.orderBy('date').toArray(), []);
  const recipes = useLiveQuery(() => db.recipes.toArray(), []);
  const [now] = useState(() => Date.now());
  if (!parties || !recipes) return null;

  const upcoming = parties.filter((p) => isUpcoming(p, now));
  const past = parties.filter((p) => !isUpcoming(p, now)).reverse();
  const [next, ...later] = upcoming;

  return (
    <div className="page">
      <header className="page_head">
        <h1 className="page_title">Dinner parties</h1>
        <Link to="/party/new" className="button"><Icon name="plus" size={18} />New party</Link>
      </header>

      {next ? (
        <section className="section">
          <h2 className="section_title">Up next</h2>
          <NextParty party={next} recipes={recipes} />
          {later.length > 0 && <ul className="party_list">{later.map((party) => <PartyRow key={party.id} party={party} />)}</ul>}
        </section>
      ) : (
        <p className="lede">Pick a menu, and mise builds the shopping list, a cooking timeline and the table.</p>
      )}

      <section className="section">
        <div className="section_head">
          <h2 className="section_title">Dinner ideas</h2>
          <Link to="/ideas" className="link">See all</Link>
        </div>
        <ul className="idea_grid">
          {ideas.slice(0, 3).map((idea) => <li key={idea.id}><IdeaCard idea={idea} /></li>)}
        </ul>
      </section>

      {past.length > 0 && (
        <section className="section">
          <h2 className="section_title">Past</h2>
          <ul className="party_list">{past.map((party) => <PartyRow key={party.id} party={party} />)}</ul>
        </section>
      )}
    </div>
  );
}

export default Parties;
