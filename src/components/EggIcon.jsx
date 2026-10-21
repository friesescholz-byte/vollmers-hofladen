import React from 'react';

/**
 * Naturgetreues, warmes Hof-Eier-Icon mit echten Freiland-Eierschalenfarben
 * (warmes Goldbraun & zartes Creme, natürlichem Glanzlicht und feinen Sprenkeln).
 */
export default function EggIcon({ className = 'w-4 h-4', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Weicher Bodenschatten */}
        <radialGradient id="egg_ground_shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3E2E1F" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3E2E1F" stopOpacity="0" />
        </radialGradient>

        {/* Hinteres Ei: Zartes Natur-Creme / Sand */}
        <radialGradient id="egg_cream_grad" cx="36%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="40%" stopColor="#F7EAD7" />
          <stop offset="80%" stopColor="#DFC3A2" />
          <stop offset="100%" stopColor="#BE9D77" />
        </radialGradient>

        {/* Vorderes Haupt-Ei: Kräftiges Machtsumer Freiland-Goldbraun */}
        <radialGradient id="egg_brown_grad" cx="35%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#FDE6CE" />
          <stop offset="35%" stopColor="#ECA769" />
          <stop offset="75%" stopColor="#C97833" />
          <stop offset="100%" stopColor="#964C16" />
        </radialGradient>
      </defs>

      {/* Bodenschatten */}
      <ellipse cx="12" cy="21.2" rx="9.5" ry="2.2" fill="url(#egg_ground_shadow)" />

      {/* Hinteres Ei (leicht geneigt nach rechts) */}
      <g transform="rotate(14 16 12)">
        <path
          d="M15.5 3.5 C18.2 3.5, 20.8 7.5, 20.8 12.8 C20.8 17.2, 18.5 20.2, 15.5 20.2 C12.5 20.2, 10.2 17.2, 10.2 12.8 C10.2 7.5, 12.8 3.5, 15.5 3.5 Z"
          fill="url(#egg_cream_grad)"
          stroke="#9E7F5E"
          strokeWidth="0.65"
        />
        {/* Dezente Sprenkel auf dem Creme-Ei */}
        <circle cx="17.2" cy="11.5" r="0.45" fill="#8C6843" opacity="0.4" />
        <circle cx="14.8" cy="14.5" r="0.55" fill="#8C6843" opacity="0.35" />
      </g>

      {/* Vorderes Haupt-Ei (leicht nach links geneigt, kräftiges Freilandei-Braun) */}
      <g transform="rotate(-6 9 13)">
        <path
          d="M9.5 4.0 C12.6 4.0, 15.6 8.2, 15.6 13.6 C15.6 18.2, 13.0 21.0, 9.5 21.0 C6.0 21.0, 3.4 18.2, 3.4 13.6 C3.4 8.2, 6.4 4.0, 9.5 4.0 Z"
          fill="url(#egg_brown_grad)"
          stroke="#7A3C10"
          strokeWidth="0.75"
        />

        {/* Natürliches Lichtglanz-Highlight oben links */}
        <path
          d="M6.2 9.5 C5.6 11.2, 5.5 13.2, 5.8 14.8"
          stroke="#FFF"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.65"
        />
        <ellipse cx="8.2" cy="7.2" rx="1.2" ry="0.8" transform="rotate(-30 8.2 7.2)" fill="#FFF" opacity="0.45" />

        {/* Charakteristische braune Sprenkel eines echten Freilandeis */}
        <circle cx="7.8" cy="14.8" r="0.65" fill="#6A300A" opacity="0.55" />
        <circle cx="11.5" cy="12.2" r="0.5" fill="#6A300A" opacity="0.5" />
        <circle cx="10.2" cy="16.8" r="0.7" fill="#6A300A" opacity="0.6" />
        <circle cx="12.8" cy="15.2" r="0.45" fill="#6A300A" opacity="0.45" />
        <circle cx="7.2" cy="17.5" r="0.4" fill="#6A300A" opacity="0.4" />
      </g>
    </svg>
  );
}
