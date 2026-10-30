import { Link } from 'react-router-dom';
import { formatTime } from '../lib/format';
import Icon from './Icon';

// glaze pastels for recipes without a photo, picked from the recipe's id
const TINTS = ['#e3e3c4', '#fbe7b5', '#e6dbea', '#dfedf3', '#e2efd1', '#f0d8d3'];
const tintFor = (id) => TINTS[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % TINTS.length];

export function RecipeImage({ recipe, className = '' }) {
  if (recipe.image) return <img src={recipe.image} alt="" className={`recipe_image ${className}`} loading="lazy" />;
  return (
    <span className={`recipe_image recipe_image-empty ${className}`} style={{ background: tintFor(recipe.id) }}>
      <Icon name="utensils" size={28} />
    </span>
  );
}

// A recipe in the grid: picture, name, time and servings, plus a note like "Ready to cook".
function RecipeCard({ recipe, note }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="card">
      <RecipeImage recipe={recipe} />
      <span className="card_title">{recipe.title}</span>
      <span className="card_meta">
        {note ? <span className={note === 'Ready to cook' ? 'pill pill-ready' : 'pill'}>{note}</span> : null}
        {formatTime(recipe.minutes)} · Serves {recipe.servings}
      </span>
    </Link>
  );
}

export default RecipeCard;
