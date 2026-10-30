import { Link } from 'react-router-dom';
import { formatTime } from '../lib/format';
import Icon from './Icon';

// a tile colour for recipes without a photo, picked from the recipe's id (colours come from the theme)
const tintFor = (id) => `var(--tile-${([...id].reduce((n, c) => n + c.charCodeAt(0), 0) % 6) + 1})`;

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
