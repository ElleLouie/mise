import { Link } from 'react-router-dom';
import { formatTime } from '../lib/format';
import Dish from './Dish';

// A square tile in the recipe box: the photo or illustration, with a small label.
function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="tile">
      {recipe.image
        ? <img src={recipe.image} alt="" className="tile_art" loading="lazy" />
        : <Dish recipe={recipe} className="tile_art" />}
      <span className="tile_label">
        <span className="tile_title">{recipe.title}</span>
        <span className="tile_meta">{formatTime(recipe.minutes)} · Serves {recipe.servings}</span>
      </span>
    </Link>
  );
}

export default RecipeCard;
