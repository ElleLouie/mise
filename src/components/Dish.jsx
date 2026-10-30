import { useId, useMemo } from 'react';
import { compose } from '../lib/illustrate';

// One piece of food, drawn around (0, 0).
function Piece({ kind, colors: [main, light = main, accent = light], size: s }) {
  switch (kind) {
    case 'slice': {
      const spokes = Array.from({ length: 10 }, (_, i) => {
        const a = (i * Math.PI) / 5;
        return <path key={i} d={`M0 0L${(s * 0.76 * Math.cos(a)).toFixed(1)} ${(s * 0.76 * Math.sin(a)).toFixed(1)}`} stroke={accent} strokeWidth={s * 0.06} strokeLinecap="round" />;
      });
      return (
        <g className="dish_spin">
          <circle r={s} fill={main} />
          <circle r={s * 0.9} fill="#f7e3c8" />
          <circle r={s * 0.84} fill={light} />
          {spokes}
        </g>
      );
    }
    case 'leaf':
      return (
        <g className="dish_sway">
          <path d={`M0 0C${s * 0.4} ${-s * 0.55} ${s * 1.2} ${-s * 0.55} ${s * 1.6} 0C${s * 1.2} ${s * 0.55} ${s * 0.4} ${s * 0.55} 0 0Z`} fill={main} />
          <path d={`M${s * 0.1} 0L${s * 1.4} 0`} stroke="#ffffff55" strokeWidth={s * 0.06} />
        </g>
      );
    case 'fillet':
      return (
        <g>
          <rect x={-s * 0.9} y={-s * 0.55} width={s * 1.8} height={s * 1.1} rx={s * 0.4} fill={main} />
          {[-0.25, 0.05, 0.35].map((t) => (
            <path key={t} d={`M${-s * 0.6} ${s * t}L${s * 0.6} ${s * (t - 0.18)}`} stroke={light} strokeWidth={s * 0.1} strokeLinecap="round" />
          ))}
        </g>
      );
    case 'round':
      return (
        <g>
          <circle r={s * 0.75} fill={main} />
          <circle cx={-s * 0.22} cy={-s * 0.22} r={s * 0.28} fill={light} opacity="0.7" />
        </g>
      );
    case 'egg':
      return (
        <g>
          <ellipse rx={s * 0.85} ry={s * 0.7} fill={main} />
          <circle r={s * 0.34} fill={light} />
        </g>
      );
    case 'ring':
      return <circle r={s * 0.5} fill="none" stroke={light} strokeWidth={s * 0.14} />;
    case 'noodle':
      return (
        <g fill="none" stroke={main} strokeWidth={s * 0.16} strokeLinecap="round">
          <path d={`M${-s} 0c${s * 0.3} ${-s * 0.5} ${s * 0.7} ${s * 0.5} ${s} 0s${s * 0.7} ${s * 0.5} ${s} 0`} />
          <path d={`M${-s} ${s * 0.35}c${s * 0.3} ${-s * 0.5} ${s * 0.7} ${s * 0.5} ${s} 0s${s * 0.7} ${s * 0.5} ${s} 0`} stroke={light} />
        </g>
      );
    case 'dots':
      return (
        <g>
          {[[0, 0], [0.9, 0.3], [-0.8, 0.5], [0.3, -0.9], [-0.5, -0.6]].map(([x, y]) => (
            <circle key={`${x}${y}`} className="dish_twinkle" cx={x * s} cy={y * s} r={s * 0.38} fill={x > 0 ? light : main} />
          ))}
        </g>
      );
    default: {
      // a soft, irregular chunk
      const points = Array.from({ length: 7 }, (_, i) => {
        const a = (i * Math.PI * 2) / 7;
        const r = s * (0.62 + ((i * 37) % 10) / 40);
        return `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
      });
      return (
        <g>
          <path d={`M${points.join('L')}Z`} fill={main} stroke={main} strokeWidth={s * 0.35} strokeLinejoin="round" />
          <circle cx={-s * 0.2} cy={-s * 0.2} r={s * 0.22} fill={light} opacity="0.8" />
        </g>
      );
    }
  }
}

function Vessel({ vessel, base }) {
  if (vessel === 'tray') {
    return (
      <g>
        <rect x="34" y="34" width="332" height="332" rx="10" fill="#e6cfa6" />
        <rect x="34" y="34" width="332" height="332" rx="10" fill="none" stroke="#c9a877" strokeWidth="3" />
      </g>
    );
  }
  if (vessel === 'platter') {
    return (
      <g>
        <ellipse cx="208" cy="214" rx="186" ry="150" fill="rgba(0, 0, 0, 0.08)" />
        <ellipse cx="200" cy="205" rx="186" ry="150" fill="#fbfaf7" />
      </g>
    );
  }
  return (
    <g>
      <circle cx="207" cy="208" r="168" fill="rgba(0, 0, 0, 0.08)" />
      <circle cx="200" cy="200" r="168" fill="#e8e6e1" />
      <circle cx="200" cy="200" r="146" fill="#f4f2ee" />
      <circle cx="200" cy="200" r="128" fill={base} opacity="0.55" />
    </g>
  );
}

// A recipe's illustration. `still` turns off the motion (for small or repeated uses).
function Dish({ recipe, className = '', still = false }) {
  const id = useId().replace(/:/g, '');
  const { vessel, background, base, pieces } = useMemo(() => compose(recipe), [recipe]);

  return (
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" className={`dish ${still ? 'dish-still' : ''} ${className}`} aria-hidden="true">
      <defs>
        <filter id={`grain-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .09 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect width="400" height="400" fill={background} />
      <Vessel vessel={vessel} base={base} />
      {pieces.map((piece, i) => (
        <g key={i} transform={`translate(${piece.x.toFixed(1)} ${piece.y.toFixed(1)})`}>
          <g className="dish_drop" style={{ animationDelay: `${piece.delay}ms` }}>
            <g transform={`rotate(${piece.rot})`}>
              <Piece {...piece} />
            </g>
          </g>
        </g>
      ))}
      <rect width="400" height="400" fill="#fff" filter={`url(#grain-${id})`} />
    </svg>
  );
}

export default Dish;
