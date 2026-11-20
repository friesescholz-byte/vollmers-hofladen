import React, { useId } from 'react';

/**
 * Organische Tier-Silhouetten (Hühner, Hahn, Duroc-Schweine)
 * im dezenten redaktionellen Linien- & Flächenstil (analog Dr. Amely Campe).
 */
const SILHOUETTES = {
  // 1. Stehendes Huhn (nach rechts blickend)
  henStanding: {
    viewBox: '0 0 240 220',
    path: `M 164,34
      C 166,26 172,24 176,29
      C 179,23 186,25 186,32
      C 191,30 194,35 191,40
      C 194,42 196,45 197,48
      L 211,51 L 198,57
      C 198,62 195,66 190,67
      C 191,73 185,77 181,73
      C 179,84 188,97 189,113
      C 190,132 175,151 151,156
      C 146,158 142,163 139,167
      L 139,192 L 152,195 L 138,196 L 135,200 L 128,199 L 133,193 L 132,166
      C 123,167 115,166 108,164
      C 104,167 101,170 98,172
      L 96,192 L 108,195 L 94,196 L 91,200 L 84,199 L 89,193 L 91,163
      C 65,154 44,136 33,111
      C 21,105 13,94 13,83
      C 13,77 25,80 39,88
      C 26,75 21,60 23,50
      C 25,44 40,56 52,72
      C 45,56 45,40 52,36
      C 59,32 70,56 78,81
      C 98,79 124,81 143,72
      C 155,66 158,53 159,43
      C 160,38 161,36 164,34 Z`,
    halo: { cx: 120, cy: 112, r: 102 },
  },

  // 2. Pickendes Huhn auf der Weide
  henPecking: {
    viewBox: '0 0 240 200',
    path: `M 40,42
      C 50,48 58,61 64,77
      C 62,61 65,40 72,34
      C 79,30 85,59 89,80
      C 112,73 139,77 159,94
      C 173,106 181,123 186,136
      C 192,133 197,134 199,139
      C 204,138 207,143 204,147
      C 207,150 206,154 202,156
      L 212,171 L 195,163
      C 190,165 186,162 185,157
      C 180,160 176,157 177,151
      C 170,145 162,141 153,142
      C 141,143 130,145 120,145
      L 122,175 L 134,178 L 120,179 L 117,183 L 110,182 L 115,176 L 112,144
      C 103,143 95,140 88,137
      L 84,175 L 95,178 L 82,179 L 79,183 L 72,182 L 77,176 L 79,133
      C 56,122 37,104 24,83
      C 16,74 13,62 15,53
      C 17,46 31,59 39,71
      C 33,57 34,45 40,42 Z`,
    halo: { cx: 118, cy: 108, r: 98 },
  },

  // 3. Stolzer Hahn mit geschwungenem Sichelschwanz
  roosterProud: {
    viewBox: '0 0 250 230',
    path: `M 166,28
      C 168,18 174,16 178,23
      C 181,15 188,16 189,24
      C 194,18 201,21 198,29
      C 203,28 206,33 202,38
      C 205,40 207,43 207,46
      L 223,50 L 208,56
      C 208,61 204,65 199,66
      C 200,72 193,76 189,71
      C 188,85 198,101 196,120
      C 193,142 173,160 146,163
      C 142,166 139,169 136,172
      L 136,198 L 150,201 L 135,202 L 132,206 L 124,205 L 129,199 L 128,164
      C 119,164 111,162 104,159
      L 97,198 L 111,201 L 96,202 L 93,206 L 85,205 L 90,199 L 94,153
      C 74,144 60,127 52,107
      C 36,96 20,96 9,110
      C 13,86 29,70 51,71
      C 34,60 19,63 11,76
      C 16,52 37,37 62,45
      C 45,31 30,31 20,42
      C 29,21 55,15 77,31
      C 90,41 97,58 100,77
      C 119,79 140,78 153,67
      C 162,59 160,44 162,35
      C 163,31 164,29 166,28 Z`,
    halo: { cx: 122, cy: 112, r: 108 },
  },

  // 4. Schickeres, naturnahes Duroc-Weideschwein
  durocStanding: {
    viewBox: '0 0 320 210',
    path: `M 48,90
      C 38,85 31,77 34,68
      C 36,62 43,63 42,69
      C 41,73 36,73 34,70
      C 32,76 38,85 48,91
      C 52,65 82,47 125,45
      C 162,43 196,49 224,62
      C 228,53 233,44 241,40
      C 246,43 248,50 247,56
      C 251,48 258,44 265,45
      C 267,52 265,61 262,67
      C 269,73 276,81 286,86
      L 289,98
      C 283,100 277,102 271,103
      C 269,110 264,116 256,119
      C 250,122 243,124 238,128
      C 235,135 232,141 229,146
      L 237,172 L 234,177 L 226,177 L 226,172 L 216,147
      C 211,148 206,148 201,147
      L 196,174 L 193,178 L 185,178 L 185,173 L 189,146
      C 161,149 129,148 106,143
      C 103,150 98,158 93,164
      L 88,176 L 84,180 L 76,180 L 77,174 L 84,155
      C 87,149 90,144 92,139
      C 85,137 79,134 74,131
      C 70,139 65,149 60,158
      L 53,176 L 49,180 L 41,180 L 42,174 L 51,148
      C 55,138 59,129 61,122
      C 49,114 45,102 48,90 Z`,
    halo: { cx: 162, cy: 112, rx: 145, ry: 90 },
  },

  // 5. Weidendes / wühlendes Duroc-Schwein
  durocPasture: {
    viewBox: '0 0 320 210',
    path: `M 46,88
      C 36,83 30,74 34,66
      C 37,61 43,63 41,68
      C 39,72 34,71 33,68
      C 31,74 36,83 45,89
      C 52,62 84,45 129,44
      C 168,43 203,52 228,67
      C 233,57 240,51 248,51
      C 252,55 253,61 251,66
      C 257,62 263,62 266,67
      C 267,73 264,79 261,83
      C 268,91 275,101 282,110
      L 279,122
      C 272,121 265,118 258,116
      C 251,116 244,120 238,126
      C 234,132 230,138 227,143
      L 231,171 L 228,176 L 220,176 L 220,171 L 213,145
      C 208,146 203,146 198,145
      L 192,172 L 189,176 L 181,176 L 181,171 L 186,144
      C 159,147 128,146 105,141
      C 101,149 96,157 92,163
      L 87,175 L 83,179 L 75,179 L 76,173 L 83,154
      C 86,148 89,143 91,138
      C 84,136 78,133 73,130
      C 69,138 64,148 59,157
      L 52,175 L 48,179 L 40,179 L 41,173 L 50,147
      C 54,137 58,128 60,121
      C 47,113 43,100 46,88 Z`,
    halo: { cx: 162, cy: 112, rx: 145, ry: 90 },
  },
};

/**
 * Einzelne sauber skalierte Tier-Silhouette als flexibles Overlay-Element
 */
function AnimalSilhouette({ type, flipX = false, showHalo = false, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const shape = SILHOUETTES[type];
  if (!shape) return null;

  const vbParts = shape.viewBox.split(' ').map(Number);
  const vbW = vbParts[2] || 240;
  const vbH = vbParts[3] || 220;
  // Großzügige ViewBox mit Luft rundherum, damit Halos & Striche niemals beschnitten werden
  const paddedVB = `-40 -40 ${vbW + 80} ${vbH + 80}`;

  return (
    <svg
      viewBox={paddedVB}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto ${className}`}
    >
      <defs>
        <linearGradient id={`afill-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#274B35" stopOpacity="0.07" />
          <stop offset="60%" stopColor="#182019" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#274B35" stopOpacity="0.025" />
        </linearGradient>
        <linearGradient id={`astroke-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#274B35" stopOpacity="0.15" />
          <stop offset="70%" stopColor="#182019" stopOpacity="0.095" />
          <stop offset="100%" stopColor="#274B35" stopOpacity="0.045" />
        </linearGradient>
      </defs>

      {showHalo && shape.halo && (
        shape.halo.r ? (
          <circle
            cx={shape.halo.cx}
            cy={shape.halo.cy}
            r={shape.halo.r + 32}
            stroke="#274B35"
            strokeOpacity="0.045"
            strokeWidth="1.0"
            strokeDasharray="3 9"
            fill="none"
          />
        ) : (
          <ellipse
            cx={shape.halo.cx}
            cy={shape.halo.cy}
            rx={shape.halo.rx + 28}
            ry={shape.halo.ry + 24}
            stroke="#274B35"
            strokeOpacity="0.045"
            strokeWidth="1.0"
            strokeDasharray="3 9"
            fill="none"
          />
        )
      )}

      <g transform={flipX ? `translate(${vbW}, 0) scale(-1, 1)` : undefined}>
        <path
          d={shape.path}
          fill={`url(#afill-${uid})`}
          stroke={`url(#astroke-${uid})`}
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/**
 * Sanfte Börde-Konturlinie als durchgehendes dekoratives Band
 */
function ContourBand({ className = '' }) {
  const uid = useId().replace(/:/g, '');
  return (
    <div className={`pointer-events-none select-none absolute left-0 right-0 h-28 ${className}`}>
      <svg viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id={`cg-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#182019" stopOpacity="0" />
            <stop offset="25%" stopColor="#274B35" stopOpacity="0.045" />
            <stop offset="50%" stopColor="#274B35" stopOpacity="0.075" />
            <stop offset="75%" stopColor="#182019" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#182019" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M -60,65 C 280,15 680,105 1060,45 C 1260,15 1400,65 1500,45"
          stroke={`url(#cg-${uid})`}
          strokeWidth="1.05"
        />
      </svg>
    </div>
  );
}

/**
 * Sektions-Presets für HomePage (fixe Sektionshöhe)
 */
const SECTION_PRESETS = {
  'home-pasture': {
    viewBox: '0 0 1440 900',
    items: [
      { type: 'henPecking', x: -55, y: 38, scale: 0.92, opacity: 0.9, halo: { cx: 120, cy: 100, r: 175 } },
      { type: 'roosterProud', x: 645, y: 18, scale: 0.48, flipX: true, opacity: 0.72 },
      { type: 'henStanding', x: 1295, y: 72, scale: 0.78, flipX: true, opacity: 0.85 },
      { type: 'durocStanding', x: 42, y: 585, scale: 0.90, opacity: 0.96, halo: { cx: 160, cy: 105, rx: 220, ry: 125 } },
      { type: 'durocPasture', x: 1210, y: 590, scale: 0.88, flipX: true, opacity: 0.92 },
    ],
    streams: [
      'M -80,140 C 260,90 620,185 1020,120 C 1260,80 1440,140 1560,110',
      'M -100,470 C 280,415 640,510 1040,445 C 1300,395 1480,465 1600,435',
      'M -80,750 C 300,695 680,790 1060,725 C 1300,685 1460,750 1580,720',
    ],
  },
  'home-cta': {
    viewBox: '0 0 1440 540',
    items: [
      { type: 'roosterProud', x: -38, y: 90, scale: 1.08, opacity: 1.0, halo: { cx: 125, cy: 115, r: 195 } },
      { type: 'henPecking', x: 175, y: 245, scale: 0.58, opacity: 0.78 },
      { type: 'henStanding', x: 195, y: 45, scale: 0.44, flipX: true, opacity: 0.65 },
      { type: 'durocStanding', x: 1175, y: 145, scale: 0.92, flipX: true, opacity: 0.98, halo: { cx: 160, cy: 105, rx: 220, ry: 125 } },
      { type: 'henStanding', x: 1075, y: 38, scale: 0.44, flipX: true, opacity: 0.68 },
    ],
    streams: [
      'M -80,110 C 280,60 640,150 1020,90 C 1260,50 1440,110 1560,80',
      'M -100,280 C 260,225 620,315 1000,255 C 1260,215 1440,275 1580,245',
    ],
  },
};

/**
 * Verteilte Unterseiten-Kompositionen:
 * Locker über die gesamte Seitenhöhe verteilt (oben, Mitte, unten) statt oben geballt!
 * Links neben der Überschrift steht ein schickes Duroc-Schwein; Hühner & Hähne verteilen sich
 * abwechselnd links & rechts über die gesamte Seite.
 */
const PAGE_DISTRIBUTED_PRESETS = {
  products: {
    leftPig: 'durocStanding',
    topHeroRight: { type: 'roosterProud', flipX: true, showHalo: true },
    contours: ['top-[2%]', 'top-[24%]', 'top-[48%]', 'top-[72%]', 'top-[90%]'],
    scattered: [
      { type: 'henPecking', side: 'left', topClass: 'top-[19%]', sizeClass: 'w-44 lg:w-52 2xl:w-64', edgeOffsetClass: '-left-10 2xl:left-2' },
      { type: 'henStanding', side: 'right', topClass: 'top-[36%]', sizeClass: 'w-40 lg:w-48 2xl:w-60', edgeOffsetClass: '-right-8 2xl:right-3', flipX: true },
      { type: 'roosterProud', side: 'left', topClass: 'top-[54%]', sizeClass: 'w-48 lg:w-56 2xl:w-72', edgeOffsetClass: '-left-12 2xl:left-1', showHalo: true },
      { type: 'henPecking', side: 'right', topClass: 'top-[71%]', sizeClass: 'w-40 lg:w-48 2xl:w-56', edgeOffsetClass: '-right-8 2xl:right-4', flipX: true },
      { type: 'henStanding', side: 'left', topClass: 'top-[86%]', sizeClass: 'w-44 lg:w-52 2xl:w-60', edgeOffsetClass: '-left-9 2xl:left-3' },
    ],
  },
  events: {
    leftPig: 'durocPasture',
    topHeroRight: { type: 'roosterProud', flipX: true, showHalo: true },
    contours: ['top-[4%]', 'top-[48%]', 'top-[84%]'],
    scattered: [
      { type: 'henStanding', side: 'left', topClass: 'top-[42%]', sizeClass: 'w-44 lg:w-52 2xl:w-60', edgeOffsetClass: '-left-10 2xl:left-3' },
      { type: 'henPecking', side: 'right', topClass: 'top-[68%]', sizeClass: 'w-40 lg:w-48 2xl:w-56', edgeOffsetClass: '-right-8 2xl:right-4', flipX: true },
    ],
  },
  contact: {
    leftPig: 'durocStanding',
    topHeroRight: { type: 'henStanding', flipX: true, showHalo: true },
    contours: ['top-[3%]', 'top-[30%]', 'top-[58%]', 'top-[84%]'],
    scattered: [
      { type: 'roosterProud', side: 'left', topClass: 'top-[25%]', sizeClass: 'w-44 lg:w-56 2xl:w-64', edgeOffsetClass: '-left-12 2xl:left-2' },
      { type: 'henPecking', side: 'right', topClass: 'top-[47%]', sizeClass: 'w-40 lg:w-48 2xl:w-60', edgeOffsetClass: '-right-8 2xl:right-3', flipX: true },
      { type: 'henStanding', side: 'left', topClass: 'top-[68%]', sizeClass: 'w-40 lg:w-48 2xl:w-56', edgeOffsetClass: '-left-9 2xl:left-4' },
      { type: 'roosterProud', side: 'right', topClass: 'top-[85%]', sizeClass: 'w-44 lg:w-52 2xl:w-64', edgeOffsetClass: '-right-10 2xl:right-2', flipX: true, showHalo: true },
    ],
  },
  about: {
    leftPig: 'durocStanding',
    topHeroRight: { type: 'roosterProud', flipX: true, showHalo: true },
    contours: ['top-[3%]', 'top-[29%]', 'top-[56%]', 'top-[84%]'],
    scattered: [
      { type: 'henPecking', side: 'left', topClass: 'top-[26%]', sizeClass: 'w-44 lg:w-52 2xl:w-60', edgeOffsetClass: '-left-10 2xl:left-3' },
      { type: 'henStanding', side: 'right', topClass: 'top-[48%]', sizeClass: 'w-40 lg:w-48 2xl:w-60', edgeOffsetClass: '-right-8 2xl:right-3', flipX: true },
      { type: 'roosterProud', side: 'left', topClass: 'top-[69%]', sizeClass: 'w-44 lg:w-56 2xl:w-64', edgeOffsetClass: '-left-11 2xl:left-2', showHalo: true },
      { type: 'henPecking', side: 'right', topClass: 'top-[86%]', sizeClass: 'w-40 lg:w-48 2xl:w-56', edgeOffsetClass: '-right-8 2xl:right-4', flipX: true },
    ],
  },
  freerange: {
    leftPig: 'durocPasture',
    topHeroRight: { type: 'roosterProud', flipX: true, showHalo: true },
    contours: ['top-[3%]', 'top-[30%]', 'top-[58%]', 'top-[85%]'],
    scattered: [
      { type: 'henStanding', side: 'left', topClass: 'top-[24%]', sizeClass: 'w-44 lg:w-52 2xl:w-60', edgeOffsetClass: '-left-10 2xl:left-3' },
      { type: 'henPecking', side: 'right', topClass: 'top-[46%]', sizeClass: 'w-40 lg:w-48 2xl:w-56', edgeOffsetClass: '-right-8 2xl:right-4', flipX: true },
      { type: 'durocStanding', side: 'left', topClass: 'top-[66%]', sizeClass: 'w-48 lg:w-56 2xl:w-72', edgeOffsetClass: '-left-12 2xl:left-2', showHalo: true },
      { type: 'henStanding', side: 'right', topClass: 'top-[86%]', sizeClass: 'w-40 lg:w-48 2xl:w-56', edgeOffsetClass: '-right-8 2xl:right-3', flipX: true },
    ],
  },
};

export default function FarmSilhouettePattern({ variant = 'home-cta', className = '' }) {
  const uid = useId().replace(/:/g, '');

  // A) Verteilte Unterseiten-Variante (über die ganze Seite von oben bis unten gestreut)
  const pagePreset = PAGE_DISTRIBUTED_PRESETS[variant];
  if (pagePreset) {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none select-none absolute inset-0 overflow-hidden z-0 ${className}`}
      >
        {/* Dezente Konturlinien über die gesamte Seitenhöhe verteilt */}
        {pagePreset.contours.map((topCls, idx) => (
          <ContourBand key={idx} className={topCls} />
        ))}

        {/* Schickes Duroc-Schwein links neben der Überschrift (auf großen Bildschirmen) */}
        {pagePreset.leftPig && (
          <div className="hidden 2xl:block absolute left-3 min-[1720px]:left-8 top-10 min-[1720px]:top-12 w-56 min-[1720px]:w-72">
            <AnimalSilhouette type={pagePreset.leftPig} />
          </div>
        )}

        {/* Einzelner ruhiger Blickfang rechts oben neben der Überschrift (nicht überladen) */}
        {pagePreset.topHeroRight && (
          <div className="hidden md:block absolute right-4 lg:right-12 min-[1720px]:right-28 top-6 lg:top-8 w-52 lg:w-64 2xl:w-80">
            <AnimalSilhouette
              type={pagePreset.topHeroRight.type}
              flipX={pagePreset.topHeroRight.flipX}
              showHalo={pagePreset.topHeroRight.showHalo}
            />
          </div>
        )}

        {/* Gleichmäßig über die restliche Seite verteilte Hühner, Hähne & Akzente */}
        {pagePreset.scattered.map((item, idx) => (
          <div
            key={idx}
            className={`hidden sm:block absolute ${item.topClass} ${item.edgeOffsetClass} ${item.sizeClass}`}
          >
            <AnimalSilhouette
              type={item.type}
              flipX={item.flipX}
              showHalo={item.showHalo}
            />
          </div>
        ))}
      </div>
    );
  }

  // B) Sektions-Variante für Startseite ("Tiere auf der Wiese" & "Frische Eier und mehr")
  const preset = SECTION_PRESETS[variant] || SECTION_PRESETS['home-cta'];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute inset-0 overflow-hidden z-0 ${className}`}
    >
      <svg
        viewBox={preset.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMin slice"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`streamGrad-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#182019" stopOpacity="0" />
            <stop offset="25%" stopColor="#274B35" stopOpacity="0.045" />
            <stop offset="50%" stopColor="#274B35" stopOpacity="0.075" />
            <stop offset="75%" stopColor="#182019" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#182019" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={`silFill-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#274B35" stopOpacity="0.07" />
            <stop offset="60%" stopColor="#182019" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#274B35" stopOpacity="0.025" />
          </linearGradient>

          <linearGradient id={`silStroke-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#274B35" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#182019" stopOpacity="0.095" />
            <stop offset="100%" stopColor="#274B35" stopOpacity="0.045" />
          </linearGradient>

          <pattern id={`dots-${uid}`} width="56" height="56" patternUnits="userSpaceOnUse">
            <circle cx="28" cy="28" r="0.8" fill="#182019" fillOpacity="0.025" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill={`url(#dots-${uid})`} />

        <g stroke={`url(#streamGrad-${uid})`} fill="none" strokeLinecap="round">
          {preset.streams.map((d, idx) => (
            <path
              key={idx}
              d={d}
              strokeWidth={idx % 2 === 0 ? '1.05' : '0.85'}
              strokeDasharray={idx % 2 === 1 ? '5 9' : undefined}
            />
          ))}
        </g>

        {preset.items.map((item, idx) => {
          const shape = SILHOUETTES[item.type];
          if (!shape) return null;

          const vbParts = shape.viewBox.split(' ').map(Number);
          const vbW = vbParts[2] || 240;

          const innerTransform = item.flipX
            ? `translate(${vbW}, 0) scale(-1, 1)`
            : undefined;

          return (
            <g
              key={idx}
              transform={`translate(${item.x}, ${item.y}) scale(${item.scale})`}
              opacity={item.opacity ?? 1}
            >
              {item.halo && (
                item.halo.r ? (
                  <circle
                    cx={item.halo.cx}
                    cy={item.halo.cy}
                    r={item.halo.r}
                    stroke="#274B35"
                    strokeOpacity="0.04"
                    strokeWidth="0.9"
                    strokeDasharray="3 9"
                    fill="none"
                  />
                ) : (
                  <ellipse
                    cx={item.halo.cx}
                    cy={item.halo.cy}
                    rx={item.halo.rx}
                    ry={item.halo.ry}
                    stroke="#274B35"
                    strokeOpacity="0.04"
                    strokeWidth="0.9"
                    strokeDasharray="3 9"
                    fill="none"
                  />
                )
              )}

              <g transform={innerTransform}>
                <path
                  d={shape.path}
                  fill={`url(#silFill-${uid})`}
                  stroke={`url(#silStroke-${uid})`}
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
