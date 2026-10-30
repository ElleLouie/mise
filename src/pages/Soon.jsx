import { Link } from 'react-router-dom';

// A placeholder for screens that come in later steps.
function Soon({ title, text }) {
  return (
    <div className="page">
      <div className="panel soon">
        <h1 className="display">{title}</h1>
        <p className="lede">{text}</p>
        <Link to="/" className="label link">&larr; Recipes</Link>
      </div>
    </div>
  );
}

export default Soon;
