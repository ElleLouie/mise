import { Link } from 'react-router-dom';
import { ideas } from '../lib/ideas';
import { moodFor } from '../lib/moods';

// The colours of a table mood, as a few small dots
export function Swatch({ mood }) {
  const m = moodFor(mood);
  return (
    <span className="dots" aria-hidden="true">
      {[m.check ?? m.cloth, m.napkin, m.flowers[0], m.charger].map((color, i) => <i key={`${i}-${color}`} style={{ background: color }} />)}
    </span>
  );
}

export function IdeaCard({ idea }) {
  const main = idea.dishes.find((dish) => dish.course === 'main')?.recipe.title;
  return (
    <Link to={`/ideas/${idea.id}`} className="idea_card">
      <Swatch mood={idea.mood} />
      <span className="idea_name">{idea.name}</span>
      <span className="idea_blurb">{idea.blurb}</span>
      <span className="idea_foot">{idea.dishes.length} dishes{main ? ` · ${main}` : ''}</span>
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
      <ul className="idea_grid">
        {ideas.map((idea) => <li key={idea.id}><IdeaCard idea={idea} /></li>)}
      </ul>
    </div>
  );
}

export default Ideas;
