/* ============================================================
   BEYOND PAGE — the collage. Each entry is one tile.

   Add a show by giving a tile a photo and its details:
     { shape: 'wide', src: './img/beyond/name.webp', alt: 'What is in the photo',
       title: 'Show name', place: 'Venue, city', year: '2025',
       text: 'A line or two about the show.' }

   Add art: 'rose', 'van', 'owl', 'blazer', 'mic' or 'smear' to give a card a cream
   back with that drawing on it (the drawings live in beyond-art.js).
   Add focus: '25% 50%' to choose which part of the photo the tile shows.

   shape: 'big', 'slab', 'wide', 'tall', or leave it out for a square.
   upright: a different shape for upright screens, where the grid is
   three across instead of six.
   A tile with no src stays an empty dark block.

   The collage always fits one screen, and these six tiles fill it
   exactly. Swap a tile's contents rather than reordering the shapes.
   ============================================================ */
const SHOWS = [
  {
    shape: 'big',
    src: './img/beyond-photo.webp',
    alt: 'Safayet Gazi Sopan performing on guitar',
    title: 'APAC After Hours',
    place: 'AIUB Amphitheatre',
    year: '2026',
    text: 'A bit of light and some roses called Ekanto Golap.',
    art: 'rose',
  },
  {
    shape: 'slab',
    src: './img/beyond-echoes.webp',
    alt: 'Safayet Gazi Sopan in a blue shirt singing into a microphone in front of a crowd and stage lights',
    title: 'Echoes of Expression',
    place: 'AIUB Amphitheatre',
    year: '2025',
    text: 'তা তা তা ......',
    art: 'smear',
  },
  {
    shape: 'tall',
    src: './img/beyond-boishakh.webp',
    alt: 'Safayet Gazi Sopan in white playing a teal guitar under purple stage lights',
    title: 'বৈশাখ ১৪৩৩',
    place: 'AIUB',
    year: '2026',
    text: 'A colorful one.',
    art: 'owl',
    focus: '42% 50%',
  },
  {
    shape: 'tall',
    src: './img/beyond-orientation.webp',
    alt: 'Safayet Gazi Sopan in a purple tie-dye shirt singing into a microphone and playing guitar',
    title: 'Orientation Photography Club',
    place: 'AIUB Multipurpose Hall',
    year: '2025',
    text: 'First show in university life it was.',
    art: 'mic',
    focus: '42% 50%',
  },
  {
    shape: 'wide',
    src: './img/beyond-qs-forum.webp',
    alt: 'Safayet Gazi Sopan in a grey blazer playing an acoustic guitar on stage in front of a glowing orange screen',
    title: 'QS Bangladesh Forum 2026',
    place: 'Sheraton Dhaka',
    year: '2026',
    text: 'Etiquette at its peak',
    art: 'blazer',
    focus: '50% 44%',
  },
  {
    shape: 'wide',
    upright: 'tall',
    src: './img/beyond-saptashur.webp',
    alt: 'Safayet Gazi Sopan playing guitar on stage in a double-exposure photo with neon light',
    title: 'সপ্তসুর',
    place: 'Khulna University',
    year: '2026',
    text: 'A broken car, long journey & unfinished songs.',
    art: 'van',
    focus: '50% 42%',
  },
];

(function buildCollage() {
  const bento = document.getElementById('bento');
  if (!bento) return;

  function makeEmptyTile() {
    const empty = document.createElement('div');
    empty.className = 'bento__tile bento__tile--empty';
    empty.dataset.tilt = '';
    const fill = document.createElement('span');
    fill.className = 'bento__fill';
    fill.dataset.tiltCard = '';
    empty.appendChild(fill);
    return empty;
  }

  function addText(parent, tag, className, text) {
    const el = document.createElement(tag);
    el.className = className;
    el.textContent = text;
    parent.appendChild(el);
  }

  function makeCard(show) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'bento__tile flip-card';
    card.dataset.tilt = '';
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', `${show.alt}. Flip for details.`);

    // tilting and flipping are separate layers so they never fight
    const tilt = document.createElement('span');
    tilt.className = 'flip-card__tilt';
    tilt.dataset.tiltCard = '';

    const inner = document.createElement('span');
    inner.className = 'flip-card__inner';

    const front = document.createElement('span');
    front.className = 'flip-card__face';
    const img = document.createElement('img');
    img.src = show.src;
    img.alt = '';
    img.decoding = 'async';
    if (show.focus) img.style.objectPosition = show.focus;
    front.appendChild(img);

    const back = document.createElement('span');
    back.className = 'flip-card__face flip-card__face--back';
    if (show.art) {
      back.classList.add('flip-card__face--paper');
      const art = document.createElement('span');
      art.className = 'flip-card__art';
      art.innerHTML = ART[show.art];
      back.appendChild(art);
    }
    addText(back, 'span', 'flip-card__title', show.title);
    addText(back, 'span', 'flip-card__place', `${show.place} · ${show.year}`);
    addText(back, 'span', 'flip-card__text', show.text);

    inner.append(front, back);
    tilt.appendChild(inner);
    card.appendChild(tilt);

    card.addEventListener('click', () => {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', String(flipped));
    });

    return card;
  }

  SHOWS.forEach((show, i) => {
    const tile = show.src ? makeCard(show) : makeEmptyTile();
    if (show.upright) {
      const upright = window.matchMedia('(orientation: portrait)');
      const setShape = () => {
        tile.classList.toggle(`bento__tile--${show.shape}`, !upright.matches);
        tile.classList.toggle(`bento__tile--${show.upright}`, upright.matches);
      };
      setShape();
      upright.addEventListener('change', setShape);
    } else if (show.shape) {
      tile.classList.add(`bento__tile--${show.shape}`);
    }
    tile.style.setProperty('--n', i);
    bento.appendChild(tile);
  });

  // the tiles rise in as the page opens
  document.addEventListener('site:ready', () => bento.classList.add('is-in'));
})();
