import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * HofladenHeroButton
 * 
 * Kompakter, eleganter 3D-Hero-Button nach Scholz & Friese Design-Standards:
 * - Kompakte Breite & wohlproportionierte Maße (bleibt genauso groß wie zuvor gewünscht)
 * - Echtes 3D-Chassis mit 5px Tiefensockel & physischem Klick-Druck
 * - Subtile, lebendige Hofladen-Themenwelt:
 *    1. Goldene Morgensonne (Tag) -> verwandelt sich bei Hover in eine leuchtende Mondsichel mit Sternen
 *    2. Sanft rollende grüne Börde-Hügel
 *    3. Kleines süßes Duroc-Weideschwein auf der Wiese (links)
 *    4. Gemütlicher 24/7 Hofladen mit warmem Fensterschein bei Hover (Mitte)
 *    5. Feine goldene Weizenähren (Mitte-Rechts)
 *    6. Kleines, pickendes Freiland-Hühnchen rechts neben dem Weizenfeld
 *    7. Die historische Machtsumer Bockwindmühle dezent & klein im Hintergrund auf dem Hügel
 * - Tag/Nacht-Transition: Von frischem Creme-Weiß (#FFFFFF) zu edlem Waldgrün (#12271D)
 */
export default function HofladenHeroButton({
  onClick,
  text = 'Sortiment entdecken',
  subtext = '24/7 Hofladen',
  className = ''
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex items-center select-none focus:outline-none hofladen-hero-btn filter drop-shadow-[0_10px_20px_rgba(27,59,43,0.16)] active:drop-shadow-[0_4px_8px_rgba(27,59,43,0.22)] text-left ${className}`}
    >
      {/* 3D-BUTTON CONTAINER (Kompaktere, voll responsive Breite für alle Smartphones) */}
      <div className="relative w-[288px] min-[360px]:w-[320px] sm:w-[382px] h-[66px] sm:h-[72px] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 active:translate-y-[4px]">
        
        {/* 1. SVG 3D CHASSIS (Physischer 3D-Sockel + Frontfläche mit Dachschrägen-Chamfer) */}
        <svg 
          className="absolute inset-0 w-full h-full overflow-visible" 
          viewBox="0 0 382 72" 
          preserveAspectRatio="none"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Exakter ClipPath für die Innenfläche */}
            <clipPath id="hofladenHeroClip">
              <path d="M 32,1 L 356,1 L 376,17 L 376,47 A 18 18 0 0 1 358,65 L 32,65 A 32 32 0 0 1 32,1 Z" />
            </clipPath>
          </defs>

          {/* A) 3D PHYSICAL EXTRUSION SOCKEL (5px sichtbare 3D-Tiefe an der Unterkante) */}
          <path
            d="M 32,6 L 356,6 L 376,22 L 376,52 A 18 18 0 0 1 358,70 L 32,70 A 32 32 0 0 1 32,6 Z"
            className="fill-[#132A1E] group-hover:fill-[#0A1710] transition-colors duration-500"
          />

          {/* B) BUTTON-FRONTFLÄCHE MIT DACH-CHAMFER & RAND */}
          <path
            d="M 32,1 L 356,1 L 376,17 L 376,47 A 18 18 0 0 1 358,65 L 32,65 A 32 32 0 0 1 32,1 Z"
            className="fill-[#FFFFFF] group-hover:fill-[#12271D] stroke-[#1B3B2B] group-hover:stroke-[#2E6B4B] transition-all duration-500"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* C) 3D LICHTKANTE (Feine Highlight-Reflexion am oberen Rand) */}
          <path
            d="M 32,2.5 L 354,2.5 L 374,17.5"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="group-hover:opacity-20 transition-opacity duration-500"
          />
        </svg>

        {/* 2. INNENLEBEN (Beschnitten durch die architektonische Scheunen-Form) */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            clipPath: 'url(#hofladenHeroClip)',
            WebkitClipPath: 'url(#hofladenHeroClip)'
          }}
        >
          {/* A) SANFTES ABENDLICHT (Hover-Effekt) */}
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out z-0">
            <svg className="w-full h-full" viewBox="0 0 382 66" fill="none">
              <circle cx="45" cy="16" r="1.1" fill="#FEF08A" opacity="0.8" />
              <circle cx="85" cy="12" r="1.2" fill="#FDE047" opacity="0.85" />
              <circle cx="130" cy="18" r="0.9" fill="#FEF08A" opacity="0.7" />
              <circle cx="170" cy="10" r="1.1" fill="#FDE047" opacity="0.75" />
              <circle cx="330" cy="11" r="1.0" fill="#FDE047" opacity="0.8" />
            </svg>
          </div>

          {/* B1) DIE GOLDENE MORGENSONNE (TAG):
              - Rotiert bei Hover dynamisch heraus
          */}
          <div className="absolute pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-center -top-[12px] -left-[12px] w-[74px] h-[74px] opacity-100 rotate-0 scale-100 group-hover:rotate-[240deg] group-hover:scale-[0.1] group-hover:-translate-x-10 group-hover:-translate-y-10 group-hover:opacity-0 z-20">
            <svg viewBox="0 0 74 74" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" className="group-hover:stroke-[#F59E0B] transition-colors duration-500">
                <line x1="37" y1="11" x2="37" y2="4" />
                <line x1="55" y1="19" x2="61" y2="13" />
                <line x1="63" y1="37" x2="70" y2="37" />
                <line x1="55" y1="55" x2="61" y2="61" />
                <line x1="37" y1="63" x2="37" y2="70" />
                <line x1="19" y1="55" x2="13" y2="61" />
                <line x1="11" y1="37" x2="4" y2="37" />
                <line x1="19" y1="19" x2="13" y2="13" />
              </g>
              <circle cx="37" cy="37" r="16" fill="#F59E0B" stroke="#D97706" strokeWidth="1.8" />
              <circle cx="33" cy="33" r="11.5" fill="#FDE047" opacity="0.95" />
            </svg>
          </div>

          {/* B2) DER LEUCHTENDE NACHTMOND (HOVER):
              - Rotiert bei Hover sanft herein
          */}
          <div className="absolute pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-center -top-[8px] -left-[8px] w-[70px] h-[70px] opacity-0 rotate-[-140deg] scale-[0.1] -translate-x-6 -translate-y-6 group-hover:opacity-100 group-hover:rotate-0 group-hover:scale-100 group-hover:translate-x-0 group-hover:translate-y-0 z-20">
            <svg viewBox="0 0 70 70" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Mondsichel */}
              <path 
                d="M 38,19 A 14 14 0 1 0 38,49 A 11 11 0 0 1 38,19 Z" 
                fill="#FEF08A" 
                stroke="#FACC15" 
                strokeWidth="1.6" 
                className="filter drop-shadow-[0_0_8px_rgba(254,240,138,0.95)]" 
              />
              <circle cx="28" cy="33" r="1.8" fill="#FDE047" opacity="0.75" />
              <circle cx="31" cy="40" r="1.3" fill="#FDE047" opacity="0.7" />
              {/* Sterne */}
              <path d="M 45,19 L 46.2,21.5 L 49,21.5 L 46.8,23.2 L 47.7,26 L 45,24.2 L 42.3,26 L 43.2,23.2 L 41,21.5 L 43.8,21.5 Z" fill="#FEF08A" className="filter drop-shadow-[0_0_3px_#FEF08A]" />
              <circle cx="18" cy="46" r="1.1" fill="#FEF08A" opacity="0.85" />
            </svg>
          </div>

          {/* C) DIE HARMONISCHE, AUFGERÄUMTE HOFLADEN-SZENE:
              - Links: Kleines süßes Duroc-Schwein auf der Wiese
              - Mitte: Der 24/7 Hofladen mit warmem Lichtfenster
              - Mitte-Rechts: 2 feine goldene Weizenähren
              - Rechts neben dem Weizenfeld: Das kleine pickende Hühnchen auf der Wiese
              - Rechts im Hintergrund: Die historische Bockwindmühle klein auf dem Hügel (dezent & stimmungsvoll)
          */}
          <div className="absolute right-1 sm:right-2 bottom-0 pointer-events-none transition-all duration-500 ease-out w-[130px] min-[360px]:w-[155px] sm:w-[175px] h-[65px] z-10">
            <svg viewBox="0 0 175 65" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
              
              {/* 1. SANFTE WIESENHÜGEL (Ruhiger Hintergrund) */}
              <path 
                d="M 0,55 Q 50,38 105,44 T 175,40 L 175,65 L 0,65 Z" 
                className="fill-[#A7F3D0] group-hover:fill-[#1E4D38] opacity-50 group-hover:opacity-80 transition-colors duration-500" 
              />
              <path 
                d="M 0,60 Q 55,48 115,53 T 175,50 L 175,65 L 0,65 Z" 
                className="fill-[#6EE7B7] group-hover:fill-[#163D2C] opacity-70 group-hover:opacity-95 transition-colors duration-500" 
              />

              {/* 2. DIE BOCKWINDMÜHLE – DEZENT & KLEIN IM HINTERGRUND AUF DEM HÜGEL (RECHTS) */}
              <g transform="translate(146, 13)">
                {/* Zierliches Bockgestell */}
                <line x1="5" y1="30" x2="11" y2="16" stroke="#78350F" className="group-hover:stroke-[#B45309] transition-colors" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="17" y1="30" x2="11" y2="16" stroke="#78350F" className="group-hover:stroke-[#B45309] transition-colors" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="11" y1="30" x2="11" y2="16" stroke="#92400E" className="group-hover:stroke-[#D97706] transition-colors" strokeWidth="1.4" strokeLinecap="round" />

                {/* Zierlicher Mühlen-Kasten */}
                <rect 
                  x="5.5" 
                  y="4" 
                  width="11" 
                  height="13" 
                  rx="1" 
                  className="fill-[#FEF3C7] group-hover:fill-[#1E293B] stroke-[#78350F] group-hover:stroke-[#F59E0B] transition-colors duration-500" 
                  strokeWidth="1" 
                />
                {/* Kleines rundes Mühlenfenster */}
                <circle 
                  cx="11" 
                  cy="8" 
                  r="1.4" 
                  className="fill-[#BAE6FD] group-hover:fill-[#FDE047] stroke-[#78350F] group-hover:stroke-[#F59E0B] transition-all duration-500" 
                  strokeWidth="0.6" 
                />

                {/* Spitzdach */}
                <polygon 
                  points="4,4 11,-2 18,4" 
                  className="fill-[#B91C1C] group-hover:fill-[#991B1B] stroke-[#78350F] transition-colors duration-500" 
                  strokeWidth="0.9" 
                  strokeLinejoin="round" 
                />

                {/* Feines, rotierendes Flügelkreuz */}
                <g style={{ transformOrigin: '11px 3px', animation: 'spinWindmillSails 10s linear infinite' }}>
                  <circle cx="11" cy="3" r="1.3" className="fill-[#78350F] group-hover:fill-[#F59E0B] transition-colors" />
                  
                  {/* Flügel 1 (Oben) */}
                  <line x1="11" y1="3" x2="11" y2="-5.5" stroke="#78350F" className="group-hover:stroke-[#F59E0B] transition-colors" strokeWidth="1" strokeLinecap="round" />
                  <rect x="11.4" y="-5" width="2.8" height="5.2" rx="0.3" className="fill-[#FDE68A] group-hover:fill-[#F59E0B] stroke-[#78350F] opacity-80" strokeWidth="0.5" />
                  
                  {/* Flügel 2 (Rechts) */}
                  <line x1="11" y1="3" x2="19.5" y2="3" stroke="#78350F" className="group-hover:stroke-[#F59E0B] transition-colors" strokeWidth="1" strokeLinecap="round" />
                  <rect x="12.5" y="3.4" width="5.2" height="2.8" rx="0.3" className="fill-[#FDE68A] group-hover:fill-[#F59E0B] stroke-[#78350F] opacity-80" strokeWidth="0.5" />
                  
                  {/* Flügel 3 (Unten) */}
                  <line x1="11" y1="3" x2="11" y2="11.5" stroke="#78350F" className="group-hover:stroke-[#F59E0B] transition-colors" strokeWidth="1" strokeLinecap="round" />
                  <rect x="7.8" y="4.2" width="2.8" height="5.2" rx="0.3" className="fill-[#FDE68A] group-hover:fill-[#F59E0B] stroke-[#78350F] opacity-80" strokeWidth="0.5" />
                  
                  {/* Flügel 4 (Links) */}
                  <line x1="11" y1="3" x2="2.5" y2="3" stroke="#78350F" className="group-hover:stroke-[#F59E0B] transition-colors" strokeWidth="1" strokeLinecap="round" />
                  <rect x="4.3" y="-1.6" width="5.2" height="2.8" rx="0.3" className="fill-[#FDE68A] group-hover:fill-[#F59E0B] stroke-[#78350F] opacity-80" strokeWidth="0.5" />
                </g>
              </g>

              {/* 3. DER 24/7 HOFLADEN (IN DER MITTE – AUFGERÄUMT & GEMÜTLICH) */}
              <g transform="translate(68, 0)">
                {/* Hütten-Korpus */}
                <rect 
                  x="4" 
                  y="30" 
                  width="38" 
                  height="26" 
                  rx="1.5" 
                  className="fill-[#FDFBF7] group-hover:fill-[#1E293B] stroke-[#1B3B2B] group-hover:stroke-[#34D399] transition-colors duration-500" 
                  strokeWidth="1.3" 
                />

                {/* Dach mit Überstand */}
                <polygon 
                  points="0,31 23,19 46,31 43,33 23,21 3,33" 
                  className="fill-[#1B3B2B] group-hover:fill-[#15803D] stroke-[#1B3B2B] group-hover:stroke-[#86EFAC] transition-colors duration-500" 
                  strokeWidth="0.8" 
                />

                {/* Giebelwand-Hintergrund */}
                <polygon 
                  points="4,31 23,20 42,31" 
                  className="fill-[#FDFBF7] group-hover:fill-[#1E293B] transition-colors duration-500" 
                />

                {/* Elegantes Hofladen Logo-Medaillon (Giebel-Wappen, ganz klein & schick) */}
                <g>
                  {/* Äußerer Medaillon-Ring mit Waldgrün-Kontur */}
                  <circle 
                    cx="23" 
                    cy="26.5" 
                    r="5.4" 
                    className="fill-[#FFFDF7] group-hover:fill-[#1E293B] stroke-[#1B3B2B] group-hover:stroke-[#34D399] transition-colors duration-500" 
                    strokeWidth="0.85" 
                  />
                  {/* Feiner goldener Zierring */}
                  <circle 
                    cx="23" 
                    cy="26.5" 
                    r="4.6" 
                    stroke="#D97706" 
                    strokeWidth="0.35" 
                    fill="none" 
                    opacity="0.85" 
                  />

                  {/* Vollmer's Hofladen Hahn-Logo (Ohne Text, ganz klein & schick) */}
                  <image 
                    href="/logo-rooster.webp" 
                    x="19.7" 
                    y="23.2" 
                    width="6.6" 
                    height="6.6" 
                    preserveAspectRatio="xMidYMid meet" 
                  />
                </g>

                {/* Großes Schaufenster (leuchtet einladend bei Hover) */}
                <rect 
                  x="7" 
                  y="36" 
                  width="16" 
                  height="13" 
                  rx="1" 
                  className="fill-[#FEF9C3] group-hover:fill-[#FDE047] stroke-[#1B3B2B] group-hover:stroke-[#F59E0B] group-hover:[filter:drop-shadow(0_0_6px_rgba(253,224,71,0.95))] transition-all duration-500" 
                  strokeWidth="1" 
                />
                <line x1="15" y1="36" x2="15" y2="49" className="stroke-[#1B3B2B] group-hover:stroke-[#F59E0B] transition-colors" strokeWidth="0.7" />
                <line x1="7" y1="42.5" x2="23" y2="42.5" className="stroke-[#1B3B2B] group-hover:stroke-[#F59E0B] transition-colors" strokeWidth="0.7" />

                {/* Ladentür */}
                <rect 
                  x="27" 
                  y="36" 
                  width="11" 
                  height="20" 
                  rx="1" 
                  className="fill-[#F1F5F9] group-hover:fill-[#334155] stroke-[#1B3B2B] group-hover:stroke-[#64748B] transition-colors duration-500" 
                  strokeWidth="1" 
                />
                <rect 
                  x="29" 
                  y="38.5" 
                  width="7" 
                  height="7" 
                  rx="0.8" 
                  className="fill-[#FEF9C3] group-hover:fill-[#FDE047] stroke-[#1B3B2B] group-hover:stroke-[#F59E0B] transition-all duration-500" 
                  strokeWidth="0.7" 
                />

                {/* Kleine Hoflaterne */}
                <circle 
                  cx="32.5" 
                  cy="33.5" 
                  r="1.4" 
                  className="fill-[#F59E0B] group-hover:fill-[#FEF08A] group-hover:[filter:drop-shadow(0_0_5px_#F59E0B)] transition-all duration-500" 
                />
              </g>

              {/* 4. DAS KLEINE DUROC-SCHWEIN AUF DER WIESE (LINKS – DEZENT & SÜSS) */}
              <g transform="translate(18, 0)">
                <g style={{ transformOrigin: '22px 52px' }}>
                  {/* Beinchen (Nahtlos und fest mit dem Körper verbunden) */}
                  <rect x="17.2" y="51" width="1.8" height="7.2" rx="0.6" className="fill-[#7C2D12] group-hover:fill-[#651A07] transition-colors" />
                  <rect x="19.5" y="50.5" width="1.8" height="7.0" rx="0.6" className="fill-[#9A3412] group-hover:fill-[#7C2D12] transition-colors" />
                  <rect x="23.2" y="51" width="1.8" height="7.2" rx="0.6" className="fill-[#7C2D12] group-hover:fill-[#651A07] transition-colors" />
                  <rect x="25.2" y="50.5" width="1.8" height="7.0" rx="0.6" className="fill-[#9A3412] group-hover:fill-[#7C2D12] transition-colors" />
                  
                  {/* Runder kupferner Körper */}
                  <ellipse cx="22" cy="51" rx="6.5" ry="4.5" className="fill-[#C2410C] group-hover:fill-[#9A3412] stroke-[#7C2D12]" strokeWidth="0.8" />
                  
                  {/* Köpfchen */}
                  <circle cx="27" cy="49.5" r="3.2" className="fill-[#C2410C] group-hover:fill-[#9A3412] stroke-[#7C2D12]" strokeWidth="0.7" />
                  
                  {/* Schlappohr */}
                  <polygon points="25.5,47 28.2,46.5 27.5,49" fill="#7C2D12" />
                  
                  {/* Rosa Rüsselchen */}
                  <ellipse cx="30.2" cy="50.2" rx="1.5" ry="1.8" fill="#FCA5A5" stroke="#7C2D12" strokeWidth="0.6" />
                  <circle cx="30.2" cy="49.6" r="0.25" fill="#7C2D12" />
                  <circle cx="30.2" cy="50.8" r="0.25" fill="#7C2D12" />
                  
                  {/* Auge */}
                  <circle cx="26.5" cy="48.5" r="0.45" fill="#1C1917" />
                  
                  {/* Animiertes Ringelschwänzchen */}
                  <path 
                    d="M 15.5,50 Q 13,48.5 14,47 Q 15.5,46 14.8,48.5" 
                    stroke="#C2410C" 
                    strokeWidth="1" 
                    fill="none" 
                    strokeLinecap="round" 
                    style={{ transformOrigin: '15px 50px', animation: 'durocTailWag 2.5s ease-in-out infinite' }} 
                  />
                </g>
              </g>

              {/* 5. FEINE GOLDENE WEIZENÄHREN (ZWISCHEN HAUS & HÜHNCHEN) */}
              <g transform="translate(114, 0)">
                <path d="M 4,58 Q 6,46 8,36" stroke="#D97706" className="group-hover:stroke-[#F59E0B] transition-colors" strokeWidth="1.1" strokeLinecap="round" fill="none" />
                <ellipse cx="8" cy="34" rx="1.4" ry="2.6" transform="rotate(20 8 34)" className="fill-[#F59E0B] group-hover:fill-[#FEF08A] transition-colors" />
                <ellipse cx="6" cy="39" rx="1.2" ry="2.2" transform="rotate(-22 6 39)" className="fill-[#F59E0B] group-hover:fill-[#FEF08A] transition-colors" />
                <ellipse cx="9" cy="43" rx="1.2" ry="2.2" transform="rotate(22 9 43)" className="fill-[#F59E0B] group-hover:fill-[#FEF08A] transition-colors" />

                <path d="M 11,58 Q 12,48 14,39" stroke="#D97706" className="group-hover:stroke-[#F59E0B] transition-colors" strokeWidth="1.1" strokeLinecap="round" fill="none" />
                <ellipse cx="14" cy="37" rx="1.3" ry="2.4" transform="rotate(18 14 37)" className="fill-[#F59E0B] group-hover:fill-[#FEF08A] transition-colors" />
                <ellipse cx="12" cy="42" rx="1.1" ry="2.1" transform="rotate(-20 12 42)" className="fill-[#F59E0B] group-hover:fill-[#FEF08A] transition-colors" />
              </g>

              {/* 6. DAS KLEINE PICKENDE HÜHNCHEN (RECHTS NEBEN DEM WEIZENFELD) */}
              <g transform="translate(131, 0)">
                <g style={{ transformOrigin: '7px 54px', animation: 'henPeckGrain 3.2s ease-in-out infinite' }}>
                  {/* Körper */}
                  <ellipse cx="7" cy="52" rx="4.2" ry="3.3" className="fill-[#FFFBEB] group-hover:fill-[#FEF3C7] stroke-[#92400E]" strokeWidth="0.8" />
                  {/* Bürzel / Schwanzfedern */}
                  <path d="M 3.2,51 L 1.2,47 L 5,50 Z" fill="#D97706" />
                  {/* Kopf */}
                  <circle cx="10.8" cy="50.2" r="2.1" className="fill-[#FFFBEB] group-hover:fill-[#FEF3C7] stroke-[#92400E]" strokeWidth="0.7" />
                  {/* Roter Kamm */}
                  <circle cx="10.8" cy="48.2" r="0.8" fill="#EF4444" />
                  {/* Schnabel */}
                  <polygon points="12.6,50.2 15,51.2 12.6,52" fill="#F59E0B" />
                  {/* Futterkörnchen */}
                  <circle cx="16.5" cy="55.5" r="0.7" fill="#D97706" />
                </g>
              </g>

            </svg>
          </div>
        </div>

        {/* 3. VORDERGRUND: TYPOGRAFIE & CTA ACTION PFEIL */}
        <div className="relative z-30 flex items-center justify-between h-[62px] sm:h-[68px] px-3.5 sm:px-5">
          <div className="flex items-center gap-2 sm:gap-3 pl-6 min-[360px]:pl-8 sm:pl-11">
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold text-[18px] min-[360px]:text-[19px] sm:text-[22px] tracking-tight text-[#132A1E] group-hover:text-white transition-colors duration-500 whitespace-nowrap drop-shadow-sm leading-tight">
                {text}
              </span>
              <span className="text-[9px] min-[360px]:text-[10px] sm:text-[11px] font-sans font-bold tracking-wider text-[#204532] group-hover:text-amber-300 transition-colors duration-500 uppercase mt-0.5">
                {subtext}
              </span>
            </div>

            {/* Action Kreis mit geschmeidigem Push */}
            <div className="flex items-center justify-center w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r from-[#D97706] to-[#F59E0B] group-hover:from-[#B45309] group-hover:to-[#D97706] text-white group-hover:translate-x-1 group-hover:scale-105 transition-all duration-300 flex-shrink-0 shadow-[0_2px_6px_rgba(217,119,6,0.3)]">
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Keyframe-Animationen */}
        <style>{`
          @keyframes spinWindmillSails {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes henPeckGrain {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }
            35% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(2px) rotate(16deg);
            }
            65% {
              transform: translateY(0) rotate(0deg);
            }
            80% {
              transform: translateY(2px) rotate(14deg);
            }
          }
          @keyframes durocTailWag {
            0%, 100% {
              transform: rotate(0deg);
            }
            50% {
              transform: rotate(20deg);
            }
          }
        `}</style>
      </div>
    </button>
  );
}
