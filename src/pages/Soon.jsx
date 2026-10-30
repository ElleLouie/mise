import { Link } from 'react-router-dom';

// A placeholder ticket for screens that come in later steps.
function Soon({ title, text }) {
  return (
    <div className="page">
      <header className="head">
        <h1 className="logo">{title}</h1>
      </header>
      <div className="receipt receipt-note">
        <h2 className="receipt_title">Coming soon</h2>
        <p>{text}</p>
        <Link to="/" className="receipt_add">&larr; Back to recipes</Link>
      </div>
    </div>
  );
}

export default Soon;
