/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface OriginalSchematicImageProps {
  area: 1 | 2 | 3 | 4 | 'sotano';
  className?: string;
}

export const OriginalSchematicImage: React.FC<OriginalSchematicImageProps> = ({
  area,
  className = ''
}) => {
  const isSotano = area === 4 || area === 'sotano';

  // Area 1: Primera y Segunda Sección (Secadores 1 al 16, Rodillos y Piñones)
  if (area === 1) {
    return (
      <svg
        viewBox="0 0 1060 400"
        className={`w-full h-auto select-none ${className}`}
        style={{ background: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`
            .cyl-num { font-size: 26px; font-weight: 500; fill: #111827; text-anchor: middle; dominant-baseline: central; }
            .roll-num { font-size: 11px; font-weight: 600; fill: #111827; text-anchor: middle; }
            .roll-letter { font-size: 10px; font-weight: 600; fill: #111827; text-anchor: middle; }
            .pinion-text { font-size: 14px; font-weight: 700; fill: #111827; text-anchor: middle; dominant-baseline: central; }
            .sec-title { font-size: 18px; font-weight: 400; fill: #111827; letter-spacing: 4px; font-family: monospace, sans-serif; }
          `}</style>
        </defs>

        {/* Dashed cyan felt guide line for top rolls */}
        <polyline
          points="70,55 100,55 160,75 200,60 270,115 50,115 520,55 350,90 380,105 590,80 690,105 840,115 970,175"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.4"
          strokeDasharray="4 3"
        />
        <polyline
          points="315,310 350,250 365,305 340,315"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.4"
          strokeDasharray="4 3"
        />

        {/* Continuous paper line weaving through cylinders (Golden brown) */}
        <path
          d="M 985,175 L 945,170 C 910,165 890,140 855,140 C 820,140 810,255 770,255 C 730,255 725,140 685,140 C 645,140 640,255 600,255 C 560,255 555,140 515,140 C 475,140 470,255 430,255 C 390,255 385,140 345,140 L 320,255 C 290,255 285,140 250,140 C 215,140 210,255 175,255 C 140,255 135,140 100,140"
          fill="none"
          stroke="#b38827"
          strokeWidth="2.2"
        />

        {/* Felt Rolls (Orange circles with dual labels) */}
        {/* Top rolls row */}
        <g transform="translate(100, 55)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">31</text>
          <text x="0" y="-6" className="roll-letter">K</text>
        </g>
        <g transform="translate(160, 65)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">32</text>
          <text x="0" y="-6" className="roll-letter">J</text>
        </g>
        <g transform="translate(200, 60)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">33</text>
          <text x="0" y="-6" className="roll-letter">H</text>
        </g>
        <g transform="translate(60, 115)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">34</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>
        <g transform="translate(275, 115)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">35</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>
        <g transform="translate(510, 55)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">8</text>
          <text x="0" y="-6" className="roll-letter">H</text>
        </g>
        <g transform="translate(590, 75)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">10</text>
          <text x="0" y="-6" className="roll-letter">K</text>
        </g>
        <g transform="translate(690, 95)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">11</text>
          <text x="0" y="-6" className="roll-letter">J</text>
        </g>
        <g transform="translate(835, 115)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">12</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>
        <g transform="translate(970, 175)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">1</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>

        {/* Middle Pocket rolls */}
        <g transform="translate(85, 185)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">25</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>
        <g transform="translate(185, 185)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">24</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>
        <g transform="translate(280, 185)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">23</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>
        <g transform="translate(305, 185)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">6</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>
        <g transform="translate(345, 90)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">7</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>
        <g transform="translate(380, 105)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">9</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>
        <g transform="translate(410, 180)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">5</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>
        <g transform="translate(500, 180)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">4</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>
        <g transform="translate(595, 180)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">3</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>
        <g transform="translate(692, 180)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="-16" className="roll-num">2</text>
          <text x="0" y="-6" className="roll-letter">B</text>
        </g>

        {/* Bottom pocket rolls */}
        <g transform="translate(38, 230)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="18" className="roll-num">39</text>
          <text x="0" y="28" className="roll-letter">C</text>
        </g>
        <g transform="translate(133, 230)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="18" className="roll-num">38</text>
          <text x="0" y="28" className="roll-letter">C</text>
        </g>
        <g transform="translate(231, 230)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="18" className="roll-num">37</text>
          <text x="0" y="28" className="roll-letter">C</text>
        </g>
        <g transform="translate(340, 226)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="-16" y="-5" className="roll-num">36</text>
          <text x="-16" y="5" className="roll-letter">D</text>
        </g>
        <g transform="translate(355, 250)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="-15" y="2" className="roll-num">17</text>
          <text x="-15" y="12" className="roll-letter">E</text>
        </g>
        <g transform="translate(450, 230)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="18" className="roll-num">16</text>
          <text x="0" y="28" className="roll-letter">C</text>
        </g>
        <g transform="translate(548, 230)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="18" className="roll-num">15</text>
          <text x="0" y="28" className="roll-letter">C</text>
        </g>
        <g transform="translate(645, 230)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="18" className="roll-num">14</text>
          <text x="0" y="28" className="roll-letter">C</text>
        </g>
        <g transform="translate(740, 230)">
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" />
          <text x="0" y="18" className="roll-num">13</text>
          <text x="0" y="28" className="roll-letter">C</text>
        </g>

        {/* Cylinders: Upper Row (15, 13, 11, 9, 7, 5, 3, 1) */}
        <circle cx="140" cy="170" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <circle cx="140" cy="170" r="45" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.5" />
        <text x="140" y="170" className="cyl-num">15</text>

        <circle cx="235" cy="170" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <circle cx="235" cy="170" r="45" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.5" />
        <text x="235" y="170" className="cyl-num">13</text>

        <circle cx="355" cy="170" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <circle cx="355" cy="170" r="45" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.5" />
        <text x="355" y="170" className="cyl-num">11</text>

        <circle cx="455" cy="170" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <circle cx="455" cy="170" r="45" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.5" />
        <text x="455" y="170" className="cyl-num">9</text>

        <circle cx="550" cy="170" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <circle cx="550" cy="170" r="45" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.5" />
        <text x="550" y="170" className="cyl-num">7</text>

        <circle cx="645" cy="170" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <circle cx="645" cy="170" r="45" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.5" />
        <text x="645" y="170" className="cyl-num">5</text>

        <circle cx="742" cy="170" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <circle cx="742" cy="170" r="45" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.5" />
        <text x="742" y="170" className="cyl-num">3</text>

        <circle cx="840" cy="170" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <circle cx="840" cy="170" r="45" fill="none" stroke="#ea580c" strokeWidth="1" opacity="0.5" />
        <text x="840" y="150" className="cyl-num">1</text>
        {/* Pinion AA inside cylinder 1 */}
        <circle cx="840" cy="185" r="16" fill="#fff" stroke="#111827" strokeWidth="2" />
        <text x="840" y="185" className="pinion-text">AA</text>

        {/* Cylinders: Lower Row (16, 14, 12, 10, 8, 6, 4, 2) */}
        <circle cx="88" cy="265" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <text x="88" y="265" className="cyl-num">16</text>

        <circle cx="185" cy="265" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <text x="185" y="265" className="cyl-num">14</text>

        <circle cx="280" cy="265" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <text x="280" y="265" className="cyl-num">12</text>

        <circle cx="405" cy="265" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <text x="405" y="265" className="cyl-num">10</text>

        <circle cx="502" cy="265" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <text x="502" y="265" className="cyl-num">8</text>

        <circle cx="598" cy="265" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <text x="598" y="265" className="cyl-num">6</text>

        <circle cx="695" cy="265" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <text x="695" y="265" className="cyl-num">4</text>

        <circle cx="790" cy="265" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <text x="790" y="265" className="cyl-num">2</text>

        {/* Pinions Chain (III, C, II, B, I, A) */}
        <circle cx="380" cy="205" r="13" fill="#fff" stroke="#111827" strokeWidth="2" />
        <text x="380" y="205" className="pinion-text">III</text>
        <circle cx="392" cy="230" r="13" fill="#fff" stroke="#111827" strokeWidth="2" />
        <text x="392" y="230" className="pinion-text">C</text>

        <circle cx="435" cy="205" r="13" fill="#fff" stroke="#111827" strokeWidth="2" />
        <text x="435" y="205" className="pinion-text">II</text>
        <circle cx="425" cy="230" r="13" fill="#fff" stroke="#111827" strokeWidth="2" />
        <text x="425" y="230" className="pinion-text">B</text>

        <circle cx="470" cy="205" r="13" fill="#fff" stroke="#111827" strokeWidth="2" />
        <text x="470" y="205" className="pinion-text">I</text>
        <circle cx="488" cy="230" r="13" fill="#fff" stroke="#111827" strokeWidth="2" />
        <text x="488" y="230" className="pinion-text">A</text>

        {/* Section Names */}
        <text x="200" y="370" className="sec-title" textAnchor="middle">SEGUNDA SECCION</text>
        <text x="640" y="370" className="sec-title" textAnchor="middle">PRIMERA SECCION</text>
      </svg>
    );
  }

  // Area 2: Tercera Sección, Unidad Clupak M4 y Segunda Sección (Secadores 17 al 30)
  if (area === 2) {
    return (
      <svg
        viewBox="0 0 1250 420"
        className={`w-full h-auto select-none ${className}`}
        style={{ background: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`
            .cyl-num { font-size: 24px; font-weight: 500; fill: #111827; text-anchor: middle; dominant-baseline: central; }
            .roll-num { font-size: 11px; font-weight: 600; fill: #111827; text-anchor: middle; }
            .roll-letter { font-size: 10px; font-weight: 600; fill: #111827; text-anchor: middle; }
            .pinion-text { font-size: 11px; font-weight: 700; fill: #111827; text-anchor: middle; dominant-baseline: central; }
            .sec-title { font-size: 18px; font-weight: 400; fill: #111827; letter-spacing: 4px; font-family: monospace, sans-serif; }
          `}</style>
        </defs>

        <polyline points="30,85 170,60 110,115 250,75 370,115" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />
        <polyline points="690,115 720,70 860,85" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />

        {/* Paper Path */}
        <path d="M 980,170 C 950,170 945,265 915,265 C 885,265 880,170 850,170 C 820,170 815,265 785,265 C 755,265 750,170 720,170 L 690,170 L 600,215" fill="none" stroke="#b38827" strokeWidth="2.2" />
        <path d="M 550,300 L 440,300 C 420,300 410,265 375,265 C 345,265 340,170 310,170 C 280,170 275,265 245,265 C 215,265 210,170 180,170 C 150,170 145,265 115,265 C 85,265 80,170 50,170" fill="none" stroke="#b38827" strokeWidth="2.2" />

        {/* Top felt rolls Tercera */}
        <g transform="translate(30, 85)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">54</text><text x="0" y="-6" className="roll-letter">B</text></g>
        <g transform="translate(170, 60)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">55</text><text x="0" y="-6" className="roll-letter">H</text></g>
        <g transform="translate(110, 115)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">56</text><text x="0" y="-6" className="roll-letter">B</text></g>
        <g transform="translate(250, 75)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">57</text><text x="0" y="-6" className="roll-letter">K</text></g>
        <g transform="translate(370, 115)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">58</text><text x="0" y="-6" className="roll-letter">J</text></g>

        {/* Pocket rolls Tercera */}
        <g transform="translate(38, 185)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">53</text><text x="0" y="-6" className="roll-letter">B</text></g>
        <g transform="translate(122, 180)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">52</text><text x="0" y="-6" className="roll-letter">B</text></g>
        <g transform="translate(205, 180)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">51</text><text x="0" y="-6" className="roll-letter">B</text></g>
        <g transform="translate(288, 180)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">50</text><text x="0" y="-6" className="roll-letter">B</text></g>
        <g transform="translate(385, 190)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">59</text><text x="0" y="-6" className="roll-letter">B</text></g>

        {/* Bottom rolls Tercera */}
        <g transform="translate(65, 260)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="-16" y="-2" className="roll-num">62</text><text x="-16" y="8" className="roll-letter">E</text></g>
        <g transform="translate(165, 230)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="18" className="roll-num">61</text><text x="0" y="28" className="roll-letter">C</text></g>
        <g transform="translate(248, 230)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="18" className="roll-num">60</text><text x="0" y="28" className="roll-letter">C</text></g>
        <g transform="translate(330, 230)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="18" className="roll-num">91</text><text x="0" y="28" className="roll-letter">C</text></g>
        <g transform="translate(415, 290)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="18" className="roll-num">90</text><text x="0" y="28" className="roll-letter">C</text></g>

        {/* Cylinders Tercera */}
        <circle cx="80" cy="170" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="80" y="170" className="cyl-num">30</text>
        <circle cx="163" cy="170" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="163" y="170" className="cyl-num">28</text>
        <circle cx="246" cy="170" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="246" y="170" className="cyl-num">26</text>
        <circle cx="330" cy="170" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="330" y="170" className="cyl-num">24</text>

        <circle cx="122" cy="265" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="122" y="265" className="cyl-num">29</text>
        <circle cx="205" cy="265" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="205" y="265" className="cyl-num">27</text>
        <circle cx="288" cy="265" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="288" y="265" className="cyl-num">25</text>
        <circle cx="372" cy="265" r="42" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="372" y="265" className="cyl-num">23A</text>

        {/* Pinions Tercera */}
        <circle cx="95" cy="210" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="95" y="210" className="pinion-text">XIII</text>
        <circle cx="107" cy="230" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="107" y="230" className="pinion-text">M</text>
        <circle cx="142" cy="210" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="142" y="210" className="pinion-text">XII</text>
        <circle cx="134" cy="230" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="134" y="230" className="pinion-text">L</text>
        <circle cx="180" cy="210" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="180" y="210" className="pinion-text">XI</text>
        <circle cx="192" cy="230" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="192" y="230" className="pinion-text">K</text>
        <circle cx="225" cy="210" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="225" y="210" className="pinion-text">X</text>
        <circle cx="217" cy="230" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="217" y="230" className="pinion-text">J</text>
        <circle cx="260" cy="210" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="260" y="210" className="pinion-text">IX</text>
        <circle cx="272" cy="230" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="272" y="230" className="pinion-text">I</text>
        <circle cx="307" cy="210" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="307" y="210" className="pinion-text">VIII</text>
        <circle cx="299" cy="230" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="299" y="230" className="pinion-text">H</text>
        <circle cx="344" cy="210" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="344" y="210" className="pinion-text">VII</text>
        <circle cx="354" cy="230" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="354" y="230" className="pinion-text">G</text>

        {/* Unidad Clupak (Center) */}
        <g transform="translate(440, 80)" stroke="#0033cc" strokeWidth="1.8" fill="none">
          <rect x="30" y="25" width="12" height="200" stroke="#0033cc" fill="#f8fafc" />
          <rect x="135" y="80" width="14" height="145" stroke="#0033cc" fill="#f8fafc" />
          <path d="M 0,140 L 42,140 L 42,155 L 0,155 Z" fill="#0033cc" />
          <line x1="25" y1="225" x2="170" y2="225" stroke="#0033cc" strokeWidth="3" />
          <circle cx="75" cy="28" r="9" stroke="#0033cc" />
          <text x="75" y="15" stroke="none" fill="#0033cc" fontSize="11" fontWeight="bold">2</text>
          <circle cx="118" cy="15" r="11" stroke="#0033cc" />
          <text x="118" y="2" stroke="none" fill="#0033cc" fontSize="11" fontWeight="bold">3</text>
          <circle cx="160" cy="42" r="10" stroke="#0033cc" />
          <text x="160" y="28" stroke="none" fill="#0033cc" fontSize="11" fontWeight="bold">4</text>
          <rect x="103" y="35" width="32" height="38" stroke="#0033cc" fill="#f8fafc" />
          <path d="M 75,28 L 118,15 L 160,42 L 72,120 Z" stroke="#0033cc" strokeWidth="1.5" />
          <circle cx="72" cy="120" r="10" stroke="#0033cc" />
          <text x="55" y="122" stroke="none" fill="#0033cc" fontSize="11" fontWeight="bold">1</text>
          <circle cx="120" cy="130" r="34" stroke="#0033cc" strokeWidth="2" />
          <circle cx="120" cy="130" r="8" stroke="#0033cc" />
          <text x="120" y="152" stroke="none" fill="#0033cc" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">CLUPAK</text>
          <text x="120" y="161" stroke="none" fill="#0033cc" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">ROLL</text>
          <circle cx="165" cy="122" r="6" stroke="#0033cc" />
          <text x="175" y="125" stroke="none" fill="#0033cc" fontSize="11" fontWeight="bold">B</text>
          <circle cx="172" cy="136" r="6" stroke="#0033cc" />
          <text x="182" y="140" stroke="none" fill="#0033cc" fontSize="11" fontWeight="bold">A</text>
          <circle cx="125" cy="195" r="8" stroke="#0033cc" />
          <text x="137" y="197" stroke="none" fill="#0033cc" fontSize="11" fontWeight="bold">C</text>
          <circle cx="55" cy="190" r="8" stroke="#0033cc" />
          <text x="40" y="192" stroke="none" fill="#0033cc" fontSize="11" fontWeight="bold">D</text>
        </g>

        {/* Segunda Seccion (Right) */}
        <g transform="translate(860, 85)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">30</text><text x="0" y="-6" className="roll-letter">J</text></g>
        <g transform="translate(720, 70)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">29</text><text x="0" y="-6" className="roll-letter">B</text></g>
        <g transform="translate(690, 115)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">88</text><text x="0" y="-6" className="roll-letter">G</text></g>

        <g transform="translate(760, 180)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">28</text><text x="0" y="-6" className="roll-letter">B</text></g>
        <g transform="translate(845, 180)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">27</text><text x="0" y="-6" className="roll-letter">B</text></g>
        <g transform="translate(930, 180)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-16" className="roll-num">26</text><text x="0" y="-6" className="roll-letter">B</text></g>

        <g transform="translate(705, 260)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="-16" y="-2" className="roll-num">42</text><text x="-16" y="8" className="roll-letter">E</text></g>
        <g transform="translate(803, 230)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="18" className="roll-num">41</text><text x="0" y="28" className="roll-letter">C</text></g>
        <g transform="translate(890, 230)"><circle cx="0" cy="0" r="8" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="18" className="roll-num">40</text><text x="0" y="28" className="roll-letter">C</text></g>

        <circle cx="720" cy="170" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="720" y="170" className="cyl-num">23</text>
        <circle cx="803" cy="170" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="803" y="170" className="cyl-num">21</text>
        <circle cx="888" cy="170" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="888" y="170" className="cyl-num">19</text>
        <circle cx="975" cy="170" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="975" y="170" className="cyl-num">17</text>

        <circle cx="762" cy="265" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="762" y="265" className="cyl-num">22</text>
        <circle cx="845" cy="265" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="845" y="265" className="cyl-num">20</text>
        <circle cx="930" cy="265" r="40" fill="none" stroke="#b38827" strokeWidth="2.2" /><text x="930" y="265" className="cyl-num">18</text>

        <circle cx="734" cy="210" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="734" y="210" className="pinion-text">VI</text>
        <circle cx="746" cy="230" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="746" y="230" className="pinion-text">F</text>
        <circle cx="788" cy="210" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="788" y="210" className="pinion-text">V</text>
        <circle cx="778" cy="230" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="778" y="230" className="pinion-text">E</text>
        <circle cx="828" cy="210" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="828" y="210" className="pinion-text">IV</text>
        <circle cx="840" cy="230" r="10" fill="#fff" stroke="#111827" strokeWidth="1.8" /><text x="840" y="230" className="pinion-text">D</text>

        <text x="230" y="370" className="sec-title" textAnchor="middle">TERCERA SECCION</text>
        <text x="850" y="370" className="sec-title" textAnchor="middle">SEGUNDA SECCION</text>
      </svg>
    );
  }

  // Area 3: Cuarta Sección (Secadores 31 al 38)
  if (area === 3) {
    return (
      <svg
        viewBox="0 0 950 480"
        className={`w-full h-auto select-none ${className}`}
        style={{ background: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`
            .cyl-num { font-size: 28px; font-weight: 500; fill: #111827; text-anchor: middle; dominant-baseline: central; }
            .roll-num { font-size: 11px; font-weight: 600; fill: #111827; text-anchor: middle; }
            .roll-letter { font-size: 10px; font-weight: 600; fill: #111827; text-anchor: middle; }
            .pinion-text { font-size: 13px; font-weight: 700; fill: #111827; text-anchor: middle; dominant-baseline: central; }
            .sec-title { font-size: 20px; font-weight: 400; fill: #111827; letter-spacing: 4px; font-family: monospace, sans-serif; }
          `}</style>
        </defs>

        <polyline points="90,285 110,230 140,140 160,200 200,270 330,80 530,110 740,185 820,290" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />
        <path d="M 40,310 L 95,305 C 120,305 130,225 195,225 C 255,225 250,370 310,370 C 370,370 365,225 425,225 C 485,225 480,370 540,370 C 600,370 595,225 655,225 C 715,225 710,370 770,370 C 830,370 825,225 870,225 L 910,370" fill="none" stroke="#b38827" strokeWidth="2.4" />

        <g transform="translate(110, 230)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="-18" y="-3" className="roll-num">82</text><text x="-18" y="7" className="roll-letter">B</text></g>
        <g transform="translate(140, 140)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">83</text><text x="0" y="-8" className="roll-letter">B</text></g>
        <g transform="translate(200, 185)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">85</text><text x="0" y="-8" className="roll-letter">B</text></g>
        <g transform="translate(330, 80)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">84</text><text x="0" y="-8" className="roll-letter">H</text></g>
        <g transform="translate(530, 110)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">86</text><text x="0" y="-8" className="roll-letter">K</text></g>
        <g transform="translate(740, 185)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">87</text><text x="0" y="-8" className="roll-letter">J</text></g>

        <g transform="translate(285, 260)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">81</text><text x="0" y="-8" className="roll-letter">B</text></g>
        <g transform="translate(460, 260)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">80</text><text x="0" y="-8" className="roll-letter">B</text></g>
        <g transform="translate(630, 260)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">79</text><text x="0" y="-8" className="roll-letter">B</text></g>
        <g transform="translate(810, 265)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">78</text><text x="0" y="-8" className="roll-letter">B</text></g>

        <g transform="translate(88, 320)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">89</text><text x="0" y="30" className="roll-letter">M</text></g>

        <g transform="translate(195, 375)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="-18" y="-3" className="roll-num">72</text><text x="-18" y="7" className="roll-letter">E</text></g>
        <g transform="translate(372, 330)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">71</text><text x="0" y="30" className="roll-letter">C</text></g>
        <g transform="translate(545, 330)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">70</text><text x="0" y="30" className="roll-letter">C</text></g>
        <g transform="translate(720, 330)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">69</text><text x="0" y="30" className="roll-letter">C</text></g>
        <g transform="translate(915, 340)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">68</text><text x="0" y="30" className="roll-letter">D</text></g>

        <circle cx="195" cy="240" r="56" fill="none" stroke="#b38827" strokeWidth="2.4" /><text x="195" y="240" className="cyl-num">38</text>
        <circle cx="372" cy="240" r="56" fill="none" stroke="#b38827" strokeWidth="2.4" /><text x="372" y="240" className="cyl-num">36</text>
        <circle cx="545" cy="240" r="56" fill="none" stroke="#b38827" strokeWidth="2.4" /><text x="545" y="240" className="cyl-num">34</text>
        <circle cx="720" cy="240" r="56" fill="none" stroke="#b38827" strokeWidth="2.4" /><text x="720" y="240" className="cyl-num">32</text>

        <circle cx="285" cy="370" r="56" fill="none" stroke="#b38827" strokeWidth="2.4" /><text x="285" y="370" className="cyl-num">37</text>
        <circle cx="460" cy="370" r="56" fill="none" stroke="#b38827" strokeWidth="2.4" /><text x="460" y="370" className="cyl-num">35</text>
        <circle cx="630" cy="370" r="56" fill="none" stroke="#b38827" strokeWidth="2.4" /><text x="630" y="370" className="cyl-num">33</text>
        <circle cx="805" cy="370" r="56" fill="none" stroke="#b38827" strokeWidth="2.4" /><text x="805" y="370" className="cyl-num">31</text>

        <circle cx="232" cy="295" r="13" fill="#fff" stroke="#111827" strokeWidth="2" /><text x="232" y="295" className="pinion-text">XVI</text>
        <circle cx="258" cy="325" r="13" fill="#fff" stroke="#111827" strokeWidth="2" /><text x="258" y="325" className="pinion-text">P</text>
        <circle cx="346" cy="295" r="13" fill="#fff" stroke="#111827" strokeWidth="2" /><text x="346" y="295" className="pinion-text">XV</text>
        <circle cx="326" cy="325" r="13" fill="#fff" stroke="#111827" strokeWidth="2" /><text x="326" y="325" className="pinion-text">O</text>
        <circle cx="426" cy="295" r="13" fill="#fff" stroke="#111827" strokeWidth="2" /><text x="426" y="295" className="pinion-text">XIV</text>
        <circle cx="446" cy="325" r="13" fill="#fff" stroke="#111827" strokeWidth="2" /><text x="446" y="325" className="pinion-text">N</text>

        <text x="475" y="460" className="sec-title" textAnchor="middle">CUARTA SECCION</text>
      </svg>
    );
  }

  // Sótano: Retornos de lona (Primera, Segunda, Tercera y Cuarta Sección)
  return (
    <svg
      viewBox="0 0 1100 560"
      className={`w-full h-auto select-none ${className}`}
      style={{ background: '#ffffff', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <style>{`
          .roll-num { font-size: 12px; font-weight: 600; fill: #111827; text-anchor: middle; }
          .roll-letter { font-size: 11px; font-weight: 600; fill: #111827; text-anchor: middle; }
          .sec-title { font-size: 22px; font-weight: 400; fill: #111827; letter-spacing: 4px; font-family: monospace, sans-serif; }
        `}</style>
      </defs>

      {/* Top Left: Segunda Seccion */}
      <g id="sotano-segunda">
        <polyline points="20,40 33,180 230,165 300,165 440,135 480,165 520,195 560,30" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />
        <line x1="480" y1="165" x2="435" y2="275" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />
        <line x1="435" y1="275" x2="520" y2="195" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />

        <g transform="translate(33, 180)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">43</text><text x="0" y="32" className="roll-letter">B</text></g>
        <g transform="translate(230, 165)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">44</text><text x="0" y="32" className="roll-letter">B</text></g>
        <g transform="translate(300, 165)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">45</text><text x="0" y="32" className="roll-letter">J</text></g>
        <g transform="translate(440, 135)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">46</text><text x="0" y="-8" className="roll-letter">K</text></g>
        <g transform="translate(480, 165)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">47</text><text x="0" y="-8" className="roll-letter">J</text></g>
        <g transform="translate(435, 275)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">48</text><text x="0" y="-8" className="roll-letter">H</text></g>
        <g transform="translate(520, 195)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">49</text><text x="0" y="32" className="roll-letter">B</text></g>

        <text x="280" y="360" className="sec-title" textAnchor="middle">SEGUNDA SECCION</text>
      </g>

      {/* Top Right: Primera Seccion */}
      <g id="sotano-primera">
        <polyline points="600,40 605,175 750,125 825,165 940,205 970,30" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />
        <line x1="825" y1="165" x2="725" y2="300" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />
        <line x1="725" y1="300" x2="940" y2="205" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />

        <g transform="translate(605, 175)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">18</text><text x="0" y="32" className="roll-letter">J</text></g>
        <g transform="translate(750, 125)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">19</text><text x="0" y="-8" className="roll-letter">K</text></g>
        <g transform="translate(825, 165)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">20</text><text x="0" y="-8" className="roll-letter">J</text></g>
        <g transform="translate(725, 300)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">21</text><text x="0" y="-8" className="roll-letter">H</text></g>
        <g transform="translate(940, 205)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">22</text><text x="0" y="32" className="roll-letter">B</text></g>

        <text x="780" y="360" className="sec-title" textAnchor="middle">PRIMERA SECCION</text>
      </g>

      {/* Bottom Left: Cuarta Seccion */}
      <g id="sotano-cuarta" transform="translate(0, 360)">
        <polyline points="120,40 160,135 340,75 420,135 445,160 480,135 490,30" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />
        <line x1="420" y1="135" x2="265" y2="180" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />
        <line x1="265" y1="180" x2="445" y2="160" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />

        <g transform="translate(160, 135)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">73</text><text x="0" y="32" className="roll-letter">B</text></g>
        <g transform="translate(340, 75)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">74</text><text x="0" y="-8" className="roll-letter">K</text></g>
        <g transform="translate(420, 135)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">75</text><text x="0" y="-8" className="roll-letter">J</text></g>
        <g transform="translate(265, 180)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">76</text><text x="0" y="32" className="roll-letter">H</text></g>
        <g transform="translate(445, 160)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">77</text><text x="0" y="32" className="roll-letter">B</text></g>
        <g transform="translate(480, 135)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">63</text><text x="0" y="32" className="roll-letter">B</text></g>

        <text x="280" y="240" className="sec-title" textAnchor="middle">CUARTA SECCION</text>
      </g>

      {/* Bottom Right: Tercera Seccion */}
      <g id="sotano-tercera" transform="translate(0, 360)">
        <polyline points="685,75 765,135 870,165 910,30" fill="none" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />
        <line x1="765" y1="135" x2="650" y2="290" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />
        <line x1="650" y1="290" x2="870" y2="165" stroke="#38bdf8" strokeWidth="1.4" strokeDasharray="4 3" />

        <g transform="translate(685, 75)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">64</text><text x="0" y="-8" className="roll-letter">K</text></g>
        <g transform="translate(765, 135)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="-18" className="roll-num">65</text><text x="0" y="-8" className="roll-letter">J</text></g>
        <g transform="translate(650, 290)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">66</text><text x="0" y="32" className="roll-letter">H</text></g>
        <g transform="translate(870, 165)"><circle cx="0" cy="0" r="9" fill="#fff" stroke="#ea580c" strokeWidth="1.5" /><text x="0" y="20" className="roll-num">67</text><text x="0" y="32" className="roll-letter">B</text></g>

        <text x="780" y="240" className="sec-title" textAnchor="middle">TERCERA SECCION</text>
      </g>
    </svg>
  );
};
