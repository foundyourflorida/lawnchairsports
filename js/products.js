/* Lawn Chair Sports — merch catalog (shared so the cart works on every page) */

const BADGE = `<g id="badge"><circle cx="0" cy="0" r="16" fill="#f4ead6"/><circle cx="0" cy="0" r="16" fill="none" stroke="#1b4d2e" stroke-width="2"/><circle cx="0" cy="0" r="9" fill="#1b4d2e"/><path d="M-3.5 -4.5 h7 l-1 6 h-5 z M-4.5 1.5 l1.5 5 M4.5 1.5 l-1.5 5 M-3.5 4 h7" stroke="#f4ead6" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>`;

window.PRODUCTS = [
  {
    id: 'tee-classic',
    name: 'The Classic Logo Tee',
    tag: 'Apparel',
    price: 28.00,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    desc: 'Heavyweight cream cotton with the full-color badge. The official uniform of doing nothing productive on a Sunday.',
    art: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#e8f0e4" rx="12"/>
      <path d="M60 50 L83 38 Q100 48 117 38 L140 50 L158 76 L136 90 L132 74 L132 162 L68 162 L68 74 L64 90 L42 76 Z" fill="#f4ead6" stroke="#1b4d2e" stroke-width="4" stroke-linejoin="round"/>
      <g transform="translate(100,105) scale(1.5)">${BADGE}</g>
    </svg>`
  },
  {
    id: 'hoodie',
    name: 'Backyard Banter Hoodie',
    tag: 'Apparel',
    price: 52.00,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    desc: 'Forest green fleece, gold stitch logo, kangaroo pocket sized for exactly two cold ones.',
    art: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f0e6d0" rx="12"/>
      <path d="M62 56 Q80 40 100 40 Q120 40 138 56 L156 84 L136 96 L133 80 L133 164 L67 164 L67 80 L64 96 L44 84 Z" fill="#1b4d2e" stroke="#123722" stroke-width="4" stroke-linejoin="round"/>
      <path d="M80 46 Q100 62 120 46 Q118 66 100 66 Q82 66 80 46 Z" fill="#123722"/>
      <path d="M78 128 L122 128 L116 156 L84 156 Z" fill="#123722" stroke="#0d281a" stroke-width="2"/>
      <g transform="translate(100,100) scale(1.15)"><circle cx="0" cy="0" r="16" fill="none" stroke="#e0a52e" stroke-width="2"/><circle cx="0" cy="0" r="9" fill="#e0a52e"/><path d="M-3.5 -4.5 h7 l-1 6 h-5 z M-4.5 1.5 l1.5 5 M4.5 1.5 l-1.5 5 M-3.5 4 h7" stroke="#1b4d2e" stroke-width="1.1" fill="none" stroke-linecap="round"/></g>
    </svg>`
  },
  {
    id: 'dad-hat',
    name: 'Cold One Dad Hat',
    tag: 'Headwear',
    price: 24.00,
    sizes: null,
    desc: 'Adjustable cream twill with the embroidered chair. Shields your eyes from the sun and bad takes.',
    art: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#e4ecf0" rx="12"/>
      <path d="M52 106 Q52 56 100 56 Q148 56 148 106 L148 116 L52 116 Z" fill="#f4ead6" stroke="#1b4d2e" stroke-width="4"/>
      <path d="M100 56 L100 116" stroke="#1b4d2e" stroke-width="2.5"/>
      <path d="M70 62 L82 112 M130 62 L118 112" stroke="#1b4d2e" stroke-width="2" fill="none"/>
      <path d="M50 116 Q100 100 150 116 Q160 122 154 130 Q100 116 46 130 Q40 122 50 116 Z" fill="#1b4d2e" stroke="#123722" stroke-width="3"/>
      <g transform="translate(100,88) scale(0.9)"><circle cx="0" cy="0" r="13" fill="#1b4d2e"/><path d="M-4.5 -6 h9 l-1.3 8 h-6.4 z M-6 2 l2 7 M6 2 l-2 7 M-4.5 5.5 h9" stroke="#f4ead6" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>
    </svg>`
  },
  {
    id: 'koozie',
    name: 'Crack-a-Cold-One Koozie (3-pack)',
    tag: 'Tailgate Gear',
    price: 15.00,
    sizes: null,
    desc: 'Three foam koozies in green, cream, and gold. Keeps the beverage cold and the takes hot.',
    art: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f0e6d0" rx="12"/>
      <g transform="translate(48,100) rotate(-8)"><rect x="-22" y="-38" width="44" height="76" rx="10" fill="#1b4d2e" stroke="#123722" stroke-width="3"/><rect x="-14" y="-52" width="28" height="16" rx="4" fill="#c8cdd0" stroke="#8b9296" stroke-width="2"/><circle cx="0" cy="2" r="13" fill="#f4ead6"/><path d="M-4 -4 h8 l-1.2 7 h-5.6 z M-5 3 l1.7 6 M5 3 l-1.7 6" stroke="#1b4d2e" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>
      <g transform="translate(100,106)"><rect x="-22" y="-38" width="44" height="76" rx="10" fill="#f4ead6" stroke="#1b4d2e" stroke-width="3"/><rect x="-14" y="-52" width="28" height="16" rx="4" fill="#c8cdd0" stroke="#8b9296" stroke-width="2"/><circle cx="0" cy="2" r="13" fill="#1b4d2e"/><path d="M-4 -4 h8 l-1.2 7 h-5.6 z M-5 3 l1.7 6 M5 3 l-1.7 6" stroke="#f4ead6" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>
      <g transform="translate(152,100) rotate(8)"><rect x="-22" y="-38" width="44" height="76" rx="10" fill="#e0a52e" stroke="#b8860b" stroke-width="3"/><rect x="-14" y="-52" width="28" height="16" rx="4" fill="#c8cdd0" stroke="#8b9296" stroke-width="2"/><circle cx="0" cy="2" r="13" fill="#1b4d2e"/><path d="M-4 -4 h8 l-1.2 7 h-5.6 z M-5 3 l1.7 6 M5 3 l-1.7 6" stroke="#e0a52e" stroke-width="1.4" fill="none" stroke-linecap="round"/></g>
    </svg>`
  },
  {
    id: 'lawn-chair',
    name: 'The Official Lawn Chair',
    tag: 'Big Ticket',
    price: 65.00,
    sizes: null,
    desc: 'Aluminum frame, green-and-gold webbing, logo on the headrest. The exact chair the takes are recorded from.',
    art: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#dcead4" rx="12"/>
      <!-- frame -->
      <path d="M58 34 Q58 26 66 26 L134 26 Q142 26 142 34 L142 120" fill="none" stroke="#9aa2a6" stroke-width="7" stroke-linecap="round"/>
      <path d="M58 34 L58 120" fill="none" stroke="#9aa2a6" stroke-width="7" stroke-linecap="round"/>
      <!-- backrest webbing -->
      <rect x="63" y="34" width="74" height="76" rx="6" fill="#f4ead6" stroke="#1b4d2e" stroke-width="3"/>
      <rect x="66" y="40" width="68" height="13" fill="#1b4d2e"/>
      <rect x="66" y="59" width="68" height="13" fill="#e0a52e"/>
      <rect x="66" y="78" width="68" height="13" fill="#1b4d2e"/>
      <rect x="66" y="97" width="68" height="10" fill="#c4552a"/>
      <rect x="76" y="36" width="11" height="72" fill="#f4ead6" opacity=".55"/>
      <rect x="95" y="36" width="11" height="72" fill="#f4ead6" opacity=".55"/>
      <rect x="114" y="36" width="11" height="72" fill="#f4ead6" opacity=".55"/>
      <!-- badge on headrest -->
      <circle cx="100" cy="46" r="9" fill="#f4ead6" stroke="#1b4d2e" stroke-width="1.6"/>
      <path d="M97 42.5 h6 l-.9 5 h-4.2 z M96 48.5 l1.3 4 M104 48.5 l-1.3 4" stroke="#1b4d2e" stroke-width="1.1" fill="none" stroke-linecap="round"/>
      <!-- armrests -->
      <path d="M46 118 L58 118 M142 118 L154 118" stroke="#9aa2a6" stroke-width="7" stroke-linecap="round"/>
      <path d="M46 118 Q40 118 40 124 L40 130 M154 118 Q160 118 160 124 L160 130" fill="none" stroke="#9aa2a6" stroke-width="7" stroke-linecap="round"/>
      <!-- seat -->
      <rect x="52" y="114" width="96" height="16" rx="6" fill="#e0a52e" stroke="#1b4d2e" stroke-width="3"/>
      <rect x="66" y="116" width="10" height="12" fill="#f4ead6" opacity=".6"/>
      <rect x="88" y="116" width="10" height="12" fill="#f4ead6" opacity=".6"/>
      <rect x="110" y="116" width="10" height="12" fill="#f4ead6" opacity=".6"/>
      <rect x="130" y="116" width="10" height="12" fill="#f4ead6" opacity=".6"/>
      <!-- legs -->
      <path d="M60 130 L52 172 M140 130 L148 172 M52 132 L120 172 M148 132 L80 172" fill="none" stroke="#9aa2a6" stroke-width="6" stroke-linecap="round"/>
      <path d="M44 172 L86 172 M114 172 L156 172" stroke="#9aa2a6" stroke-width="7" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'stickers',
    name: 'Hot Take Sticker Pack',
    tag: 'Accessories',
    price: 9.00,
    sizes: null,
    desc: 'Six die-cut vinyl stickers: the badge, the chair, "PULL UP A CHAIR," and three takes too hot to print here.',
    art: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f0e6d0" rx="12"/>
      <g transform="translate(64,68) rotate(-12) scale(1.7)">${BADGE}</g>
      <g transform="translate(140,60) rotate(9)"><rect x="-30" y="-14" width="60" height="28" rx="8" fill="#c4552a"/><text x="0" y="5" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="11" fill="#f4ead6">HOT TAKE</text></g>
      <g transform="translate(60,146) rotate(6)"><rect x="-34" y="-16" width="68" height="32" rx="8" fill="#1b4d2e"/><text x="0" y="-1" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="9" fill="#e0a52e">PULL UP</text><text x="0" y="10" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="9" fill="#e0a52e">A CHAIR</text></g>
      <g transform="translate(146,140) rotate(-7)"><circle r="26" fill="#e0a52e"/><path d="M-7 -9 h14 l-2 12 h-10 z M-9 3 l3 10 M9 3 l-3 10 M-7 8 h14" stroke="#1b4d2e" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>
    </svg>`
  },
];
