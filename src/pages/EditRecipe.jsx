import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, blankRecipe, saveRecipe } from '../lib/db';
import { glazes, foods, glazeFor, foodFor } from '../lib/vessels';
import Vessel from '../components/Vessel';

const lines = (text) => text.split('\n').map((line) => line.trim()).filter(Boolean);

function Form({ recipe, isNew }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    title: recipe.title,
    servings: recipe.servings,
    minutes: recipe.minutes,
    tags: recipe.tags.join(', '),
    ingredients: recipe.ingredients.join('\n'),
    steps: recipe.steps.join('\n'),
    source: recipe.source,
    vessel: glazeFor(recipe),
    food: foodFor(recipe),
  }));
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    await saveRecipe({
      ...recipe,
      title: form.title.trim(),
      servings: Math.max(1, Number(form.servings) || 1),
      minutes: Math.max(1, Number(form.minutes) || 1),
      tags: form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
      ingredients: lines(form.ingredients),
      steps: lines(form.steps),
      source: form.source.trim(),
      vessel: form.vessel,
      food: form.food,
    });
    navigate(`/recipe/${recipe.id}`, { replace: true });
  };

  return (
    <div className="page">
      <div className="crumbs">
        <Link to={isNew ? '/' : `/recipe/${recipe.id}`} className="label link">&larr; Cancel</Link>
      </div>
      <form className="panel form" onSubmit={onSubmit}>
        <p className="label label-accent">{isNew ? 'New recipe' : 'Edit recipe'}</p>
        <h1 className="display form_title">{form.title || 'Untitled'}</h1>
        <label className="field">
          <span className="label">Name</span>
          <input required value={form.title} onChange={set('title')} placeholder="Lemony white bean pasta" />
        </label>
        <div className="form_row">
          <label className="field">
            <span className="label">Serves</span>
            <input type="number" min="1" inputMode="numeric" value={form.servings} onChange={set('servings')} />
          </label>
          <label className="field">
            <span className="label">Minutes</span>
            <input type="number" min="1" inputMode="numeric" value={form.minutes} onChange={set('minutes')} />
          </label>
        </div>
        <label className="field">
          <span className="label">Tags, separated by commas</span>
          <input value={form.tags} onChange={set('tags')} placeholder="quick, weeknight, vegetarian" />
        </label>
        <label className="field">
          <span className="label">Ingredients, one per line</span>
          <textarea rows={8} required value={form.ingredients} onChange={set('ingredients')} placeholder={'200g pasta\n3 tbsp olive oil\n1 lemon'} />
        </label>
        <label className="field">
          <span className="label">Steps, one per line</span>
          <textarea rows={8} required value={form.steps} onChange={set('steps')} placeholder={'Cook the pasta for 10 minutes.\nWarm the oil…'} />
        </label>
        <label className="field">
          <span className="label">Original link (optional)</span>
          <input type="url" value={form.source} onChange={set('source')} placeholder="https://" />
        </label>
        <fieldset className="vessel_picker">
          <legend className="label">Served in</legend>
          <div className="vessel_options">
            {Object.entries(glazes).map(([key, glaze]) => (
              <label key={key} className={form.vessel === key ? 'vessel_option vessel_option-on' : 'vessel_option'}>
                <input type="radio" name="vessel" value={key} checked={form.vessel === key} onChange={set('vessel')} />
                <Vessel recipe={recipe} glaze={key} food={form.food} />
                <span className="label">{glaze.name}</span>
              </label>
            ))}
          </div>
          <div className="food_options" role="radiogroup" aria-label="Colours of the dish">
            {Object.entries(foods).map(([key, [base, light, accent]]) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={form.food === key}
                aria-label={key}
                className={form.food === key ? 'food_option food_option-on' : 'food_option'}
                style={{ background: `conic-gradient(${base} 0 50%, ${light} 50% 80%, ${accent} 80%)` }}
                onClick={() => setForm({ ...form, food: key })}
              />
            ))}
          </div>
        </fieldset>
        <button type="submit" className="button button-big">{isNew ? 'Add to the recipe box' : 'Save changes'}</button>
      </form>
    </div>
  );
}

function EditRecipe() {
  const { id } = useParams();
  const recipe = useLiveQuery(() => (id ? db.recipes.get(id) : null), [id], 'loading');
  const [fresh] = useState(blankRecipe);

  if (!id) return <Form recipe={fresh} isNew />;
  if (recipe === 'loading') return null;
  if (!recipe) return null;
  return <Form key={recipe.id} recipe={recipe} />;
}

export default EditRecipe;
