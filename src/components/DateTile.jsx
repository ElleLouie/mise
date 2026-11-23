import { partyTime } from '../lib/party';

// a small calendar tile: "NOV / 21"
function DateTile({ party, big = false }) {
  const date = partyTime(party.date, party.time);
  return (
    <span className={big ? 'date_tile date_tile-big' : 'date_tile'} aria-hidden="true">
      <span className="date_tile_month">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
      <span className="date_tile_day">{date.getDate()}</span>
    </span>
  );
}

export default DateTile;
