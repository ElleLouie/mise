import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ideaFor } from '../lib/ideas';
import { COURSES } from '../lib/party';
import { moodFor } from '../lib/moods';
import { formatTime } from '../lib/format';
import Icon from '../components/Icon';
import { Swatch } from './Ideas';
import Soon from './Soon';

// One dinner idea: its menu by course, with every dish ticked to start.
function Idea() {
  const { id } = useParams();
  const navigate = useNavigate();
  const idea = ideaFor(id);
  const [picked, setPicked] = useState(() => new Set(idea?.dishes.map((dish) => dish.recipe.title)));

  if (!idea) return <Soon title="Not found" text="This idea doesn't exist." />;

  const toggle = (title) => setPicked((prev) => {
    const next = new Set(prev);
    if (next.has(title)) next.delete(title); else next.add(title);
    return next;
  });

  return (
    <div className="page narrow">
      <Link to="/ideas" className="back_link"><Icon name="back" size={18} />Ideas</Link>
      <h1 className="page_title">{idea.name}</h1>
      <p className="lede">{idea.blurb}</p>
      <div className="idea_mood">
        <Swatch mood={idea.mood} />
        <span className="small">{moodFor(idea.mood).name} table</span>
      </div>

      {COURSES.map((course) => {
        const dishes = idea.dishes.filter((dish) => dish.course === course.id);
        if (dishes.length === 0) return null;
        return (
          <section key={course.id} className="group">
            <h2 className="group_title">{course.name}</h2>
            <ul className="rows">
              {dishes.map(({ recipe }) => (
                <li key={recipe.title} className={picked.has(recipe.title) ? 'row' : 'row row-off'}>
                  <label className="row_check">
                    <input type="checkbox" checked={picked.has(recipe.title)} onChange={() => toggle(recipe.title)} />
                    <span className="row_link">
                      {recipe.title}
                      <span className="row_sub">{formatTime(recipe.minutes)} · {recipe.ingredients.length} ingredients</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div className="sticky_action">
        <button
          type="button"
          className="button button-wide"
          disabled={picked.size === 0}
          onClick={() => navigate('/plan/new', { state: { idea: idea.id, titles: [...picked] } })}
        >
          Plan this dinner · {picked.size} {picked.size === 1 ? 'dish' : 'dishes'}
        </button>
      </div>
    </div>
  );
}

export default Idea;
