import { useId } from 'react';
import { glazes, foods, glazeFor, foodFor } from '../lib/vessels';

// A handmade bowl or plate seen from above, glazed and speckled, with the dish in it.
function Vessel({ recipe, glaze: glazeKey, food: foodKey, className = '' }) {
  const id = useId().replace(/:/g, '');
  const glaze = glazes[glazeKey || glazeFor(recipe)];
  const [base, light, accent] = foods[foodKey || foodFor(recipe)];
  // the same recipe always gets the same wobble and speckles
  const seed = [...(recipe?.id || 'mise')].reduce((n, c) => n + c.charCodeAt(0), 0) % 97;
  const inner = glaze.bowl ? 86 : 96;

  return (
    <svg viewBox="0 0 300 300" className={`vessel ${className}`} aria-hidden="true">
      <defs>
        <filter id={`wobble-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale="9" />
        </filter>
        <filter id={`speckle-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="1" seed={seed + 9} />
          <feColorMatrix values={`0 0 0 0 .23 0 0 0 0 .18 0 0 0 0 .15 0 0 0 -22 ${(7.6 - (1 - glaze.speckle) * 1.6).toFixed(2)}`} />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`food-${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed={seed + 4} />
          <feDisplacementMap in="SourceGraphic" scale="12" />
        </filter>
        <filter id={`shadow-${id}`}>
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <radialGradient id={`outer-${id}`} cx=".38" cy=".32" r=".78">
          <stop offset="0" stopColor={glaze.inner} />
          <stop offset=".75" stopColor={glaze.outer} />
          <stop offset="1" stopColor={glaze.rim} />
        </radialGradient>
        <radialGradient id={`inner-${id}`} cx=".6" cy=".62" r=".8">
          <stop offset="0" stopColor={glaze.inner} />
          <stop offset="1" stopColor={glaze.outer} />
        </radialGradient>
        <radialGradient id={`dish-${id}`} cx=".4" cy=".35" r=".8">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={base} />
        </radialGradient>
      </defs>
      <ellipse cx="162" cy="166" rx="118" ry="112" fill="rgba(90, 74, 58, 0.25)" filter={`url(#shadow-${id})`} />
      <g filter={`url(#wobble-${id})`}>
        <circle cx="150" cy="150" r="118" fill={`url(#outer-${id})`} />
        <circle cx="150" cy="150" r="118" fill="#fff" filter={`url(#speckle-${id})`} />
        <circle cx="150" cy="150" r={inner} fill={`url(#inner-${id})`} stroke="rgba(0, 0, 0, 0.08)" strokeWidth="2" />
      </g>
      <g filter={`url(#food-${id})`}>
        <ellipse cx="150" cy="148" rx={inner - 26} ry={inner - 32} fill={`url(#dish-${id})`} />
        <circle cx="128" cy="134" r="12" fill={light} opacity="0.9" />
        <circle cx="176" cy="164" r="9" fill={accent} />
        <circle cx="124" cy="172" r="7" fill={accent} opacity="0.85" />
        <circle cx="170" cy="128" r="5" fill="#fff" opacity="0.45" />
      </g>
    </svg>
  );
}

export default Vessel;
