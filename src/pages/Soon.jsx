import { Link } from 'react-router-dom';

// A placeholder for screens that come in later steps.
function Soon({ title, text }) {
  return (
    <div className="page">
      <div className="panel soon">
        <p className="label label-accent">Coming soon</p>
        <h1 className="display">{title}</h1>
        <p className="lede">{text}</p>
        <Link to="/" className="label link">&larr; Back to the recipe box</Link>
      </div>
    </div>
  );
}

export default Soon;
