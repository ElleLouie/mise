import { Link } from 'react-router-dom';
import { keyIngredients } from '../lib/ingredients';
import { formatTime } from '../lib/format';

// A recipe in a grid: photo if it has one, tags, name, time and the main ingredients.
function RecipeCard({ recipe, compact = false }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className={compact ? 'jar jar-compact' : 'jar'}>
      <div className="jar_label">
        {recipe.image && <img src={recipe.image} alt="" className="jar_photo" loading="lazy" />}
        {!compact && recipe.tags.length > 0 && (
          <div className="jar_row">{recipe.tags.slice(0, 3).map((t) => <span key={t} className="tag">{t}</span>)}</div>
        )}
        <h3 className="jar_title">{recipe.title}</h3>
        <p className="jar_meta">{formatTime(recipe.minutes)} · Serves {recipe.servings}</p>
        {!compact && <p className="jar_keys">{keyIngredients(recipe.ingredients).join(', ')}</p>}
      </div>
    </Link>
  );
}

export default RecipeCard;
