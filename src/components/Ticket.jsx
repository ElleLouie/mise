import { Link } from 'react-router-dom';

// An order ticket clipped to the rail.
function Ticket({ to, number, when, title, meta, stamp }) {
  return (
    <Link to={to} className="ticket">
      <span className="ticket_clip" aria-hidden="true" />
      <span className="ticket_top">
        <span>#{String(number).padStart(3, '0')}</span>
        <span>{when}</span>
      </span>
      <span className="ticket_title">{title}</span>
      <span className="ticket_meta">{meta}</span>
      {stamp && <span className="stamp">{stamp}</span>}
    </Link>
  );
}

export default Ticket;
