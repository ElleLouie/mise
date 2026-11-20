import { Link } from 'react-router-dom';
import { ideas } from '../lib/ideas';
import { moodFor } from '../lib/moods';

// The colours of an idea's table, as a small strip
export function Swatch({ mood }) {
  const m = moodFor(mood);
  return (
    <span className="party_swatch" aria-hidden="true">
      {[m.cloth, m.napkin, m.flowers[0], m.plate].map((color) => <i key={color} style={{ background: color }} />)}
    </span>
  );
}

export function IdeaCard({ idea }) {
  return (
    <Link to={`/ideas/${idea.id}`} className="party_card">
      <Swatch mood={idea.mood} />
      <span className="party_name">{idea.name}</span>
      <span className="card_meta">{idea.blurb}</span>
      <span className="card_dishes">{idea.dishes.map((dish) => dish.recipe.title).join(' · ')}</span>
    </Link>
  );
}

function Ideas() {
  return (
    <div className="page">
      <header className="page_head">
        <h1 className="page_title">Dinner ideas</h1>
      </header>
      <p className="lede">Pick a theme to start with its menu. You can change any dish after.</p>
      <ul className="party_grid">
        {ideas.map((idea) => <li key={idea.id}><IdeaCard idea={idea} /></li>)}
      </ul>
    </div>
  );
}

export default Ideas;
