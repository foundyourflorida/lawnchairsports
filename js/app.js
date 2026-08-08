/* Lawn Chair Sports — shared site JS: episodes, player, cart */

const LCS = {
  data: null,
  audio: new Audio(),
  currentIdx: null,
  playingList: [],
  rates: [1, 1.25, 1.5, 2, 0.75],
  rateIdx: 0,
};

/* ---------------- data ---------------- */
async function loadEpisodes() {
  if (LCS.data) return LCS.data;
  const res = await fetch('data/episodes.json');
  LCS.data = await res.json();
  return LCS.data;
}

function epThumbHTML(ep, idx) {
  return `
    <div class="ep-thumb">
      <img src="${ep.image || 'assets/artwork-800.jpg'}" alt="${escapeHtml(ep.title)}" loading="lazy">
      <button class="play-overlay" aria-label="Play episode" onclick="playEpisode(${idx})">
        <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#e0a52e"/><path d="M26 20l18 12-18 12z" fill="#123722"/></svg>
      </button>
    </div>`;
}

function escapeHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---------------- player ---------------- */
function fmtTime(s) {
  if (!isFinite(s)) return '0:00';
  s = Math.floor(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
}

const NOW_PLAYING_KEY = 'lcs_nowplaying_v1';

function playEpisode(idx) {
  const eps = LCS.playingList.length ? LCS.playingList : (LCS.data ? LCS.data.episodes : []);
  const ep = eps[idx];
  if (!ep) return;
  LCS.currentIdx = idx;
  // resume from saved position if it's the same episode
  let resumeAt = 0;
  try {
    const saved = JSON.parse(localStorage.getItem(NOW_PLAYING_KEY));
    if (saved && saved.audio === ep.audio && saved.time > 5) resumeAt = saved.time;
  } catch {}
  LCS.audio.src = ep.audio;
  if (resumeAt) LCS.audio.currentTime = resumeAt;
  LCS.audio.playbackRate = LCS.rates[LCS.rateIdx];
  LCS.audio.play();
  showPlayerBar(ep);
  updatePlayBtn(true);
  if (resumeAt) toast('Resuming where you left off ⏪');
  setMediaSession(ep);
  saveNowPlaying(ep);
}

function showPlayerBar(ep) {
  const bar = document.getElementById('player');
  bar.classList.add('visible');
  document.getElementById('playerTitle').textContent = ep.title;
  document.getElementById('playerDate').textContent = ep.dateDisplay + (ep.duration ? ' · ' + ep.duration : '');
  document.getElementById('playerArt').src = ep.image || 'assets/artwork-240.jpg';
}

function saveNowPlaying(ep) {
  localStorage.setItem(NOW_PLAYING_KEY, JSON.stringify({
    audio: ep.audio, title: ep.title, dateDisplay: ep.dateDisplay,
    duration: ep.duration, image: ep.image, time: LCS.audio.currentTime || 0,
  }));
}

function setMediaSession(ep) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: ep.title,
    artist: 'Lawn Chair Sports',
    album: 'Lawn Chair Sports Podcast',
    artwork: [{ src: ep.image || 'assets/artwork-800.jpg', sizes: '800x800', type: 'image/jpeg' }],
  });
  navigator.mediaSession.setActionHandler('play', () => togglePlay());
  navigator.mediaSession.setActionHandler('pause', () => togglePlay());
  navigator.mediaSession.setActionHandler('seekbackward', () => skip(-15));
  navigator.mediaSession.setActionHandler('seekforward', () => skip(30));
}

/* On page load, restore the last-played episode into the bar (paused). */
function restoreNowPlaying() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(NOW_PLAYING_KEY)); } catch {}
  if (!saved || !saved.audio || !(saved.time > 5)) return;
  showPlayerBar(saved);
  document.getElementById('curTime').textContent = fmtTime(saved.time);
  if (saved.duration) document.getElementById('durTime').textContent = saved.duration;
  // wire the play button to resume this episode
  LCS.resumePending = saved;
  updatePlayBtn(false);
}

function togglePlay() {
  // resume a restored episode from a previous visit
  if (!LCS.audio.src && LCS.resumePending) {
    const saved = LCS.resumePending;
    LCS.audio.src = saved.audio;
    LCS.audio.currentTime = saved.time;
    LCS.audio.playbackRate = LCS.rates[LCS.rateIdx];
    LCS.audio.play();
    updatePlayBtn(true);
    setMediaSession(saved);
    toast('Resuming where you left off ⏪');
    LCS.resumePending = null;
    return;
  }
  if (!LCS.audio.src) return;
  if (LCS.audio.paused) { LCS.audio.play(); updatePlayBtn(true); }
  else { LCS.audio.pause(); updatePlayBtn(false); }
}

function updatePlayBtn(playing) {
  const btn = document.getElementById('playPauseBtn');
  if (!btn) return;
  btn.innerHTML = playing
    ? '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M8 5l12 7-12 7z"/></svg>';
}

function skip(delta) {
  if (LCS.audio.src) LCS.audio.currentTime = Math.max(0, LCS.audio.currentTime + delta);
}

function cycleRate() {
  LCS.rateIdx = (LCS.rateIdx + 1) % LCS.rates.length;
  LCS.audio.playbackRate = LCS.rates[LCS.rateIdx];
  document.getElementById('rateBtn').textContent = LCS.rates[LCS.rateIdx] + 'x';
}

function closePlayer() {
  LCS.audio.pause();
  document.getElementById('player').classList.remove('visible');
}

function initPlayer() {
  if (document.getElementById('player')) return;
  const bar = document.createElement('div');
  bar.className = 'player';
  bar.id = 'player';
  bar.innerHTML = `
    <div class="player-inner">
      <img class="player-art" id="playerArt" src="assets/artwork-240.jpg" alt="">
      <div class="player-mid">
        <div class="player-title" id="playerTitle"></div>
        <div class="player-controls">
          <span class="time" id="curTime">0:00</span>
          <input type="range" class="seek" id="seekBar" min="0" max="1000" value="0" aria-label="Seek">
          <span class="time" id="durTime">0:00</span>
        </div>
        <div style="font-size:.72rem;opacity:.7" id="playerDate"></div>
      </div>
      <div class="player-controls">
        <button class="rate-btn" id="rateBtn" onclick="cycleRate()" title="Playback speed">1x</button>
        <button class="pbtn" onclick="skip(-15)" title="Back 15s"><svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a6 6 0 11-6 6H4a8 8 0 108-8z"/><text x="9" y="16" font-size="7" font-weight="bold" fill="currentColor">15</text></svg></button>
        <button class="pbtn big" id="playPauseBtn" onclick="togglePlay()" title="Play/Pause"><svg viewBox="0 0 24 24"><path d="M8 5l12 7-12 7z"/></svg></button>
        <button class="pbtn" onclick="skip(30)" title="Forward 30s"><svg viewBox="0 0 24 24"><path d="M12 5V2l5 4-5 4V7a6 6 0 106 6h2a8 8 0 11-8-8z"/><text x="9" y="16" font-size="7" font-weight="bold" fill="currentColor">30</text></svg></button>
        <button class="pbtn player-close" onclick="closePlayer()" title="Close">✕</button>
      </div>
    </div>`;
  document.body.appendChild(bar);

  const seek = document.getElementById('seekBar');
  let lastSave = 0;
  LCS.audio.addEventListener('timeupdate', () => {
    document.getElementById('curTime').textContent = fmtTime(LCS.audio.currentTime);
    document.getElementById('durTime').textContent = fmtTime(LCS.audio.duration);
    if (isFinite(LCS.audio.duration) && LCS.audio.duration > 0) {
      seek.value = (LCS.audio.currentTime / LCS.audio.duration) * 1000;
    }
    // persist listening position every ~5s so we can resume next visit
    if (Date.now() - lastSave > 5000) {
      lastSave = Date.now();
      try {
        const saved = JSON.parse(localStorage.getItem(NOW_PLAYING_KEY));
        if (saved && saved.audio === LCS.audio.src) {
          saved.time = LCS.audio.currentTime;
          localStorage.setItem(NOW_PLAYING_KEY, JSON.stringify(saved));
        }
      } catch {}
    }
  });
  LCS.audio.addEventListener('ended', () => {
    updatePlayBtn(false);
    localStorage.removeItem(NOW_PLAYING_KEY); // finished — nothing to resume
  });
  seek.addEventListener('input', () => {
    if (isFinite(LCS.audio.duration)) {
      LCS.audio.currentTime = (seek.value / 1000) * LCS.audio.duration;
    }
  });
}

/* ---------------- product catalog ---------------- */
const ADMIN_PRODUCTS_KEY = 'lcs_products_admin_v1';

/* The storefront reads the admin's saved catalog (edited on admin.html) if one
   exists in this browser, otherwise the built-in catalog from products.js. */
function getProducts() {
  try {
    const o = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY));
    if (Array.isArray(o) && o.length) return o;
  } catch {}
  return window.PRODUCTS || [];
}

function productArtHTML(p) {
  if (p.image) return `<img src="${p.image}" alt="${escapeHtml(p.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;" loading="lazy">`;
  if (p.art) return p.art;
  // fallback: brand badge
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0e6d0" rx="12"/><circle cx="100" cy="100" r="56" fill="#1b4d2e"/><path d="M78 74h44l-6 38h-32zM72 116l10 30M128 116l-10 30M80 138h40" stroke="#f4ead6" stroke-width="7" fill="none" stroke-linecap="round"/></svg>`;
}

/* ---------------- cart ---------------- */
const CART_KEY = 'lcs_cart_v1';
const FREE_SHIP_THRESHOLD = 50;

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartCount();
  renderCartDrawer();
}
function cartCount() { return getCart().reduce((n, i) => n + i.qty, 0); }
function renderCartCount() {
  document.querySelectorAll('.cart-count').forEach(el => { el.textContent = cartCount(); });
}

function addToCart(productId, size) {
  const p = getProducts().find(x => x.id === productId);
  if (!p) return;
  if (p.sizes && !size) { toast('Pick a size first 👇'); return; }
  const cart = getCart();
  const key = productId + (size ? ':' + size : '');
  const existing = cart.find(i => i.key === key);
  if (existing) existing.qty += 1;
  else cart.push({ key, id: productId, size: size || null, qty: 1 });
  saveCart(cart);
  toast(`${p.name} added to cart 🌭`);
}

function changeQty(key, delta) {
  let cart = getCart();
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.key !== key);
  saveCart(cart);
}

function removeItem(key) {
  saveCart(getCart().filter(i => i.key !== key));
}

function cartTotal() {
  return getCart().reduce((sum, i) => {
    const p = getProducts().find(x => x.id === i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
}

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('drawerBackdrop').classList.add('open');
}
function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('drawerBackdrop').classList.remove('open');
}

function renderCartDrawer() {
  const box = document.getElementById('cartItems');
  if (!box) return;
  const cart = getCart();
  if (!cart.length) {
    box.innerHTML = '<div class="drawer-empty">Your cart is empty.<br>Pull up a chair and grab some merch. 🪑</div>';
  } else {
    box.innerHTML = cart.map(i => {
      const p = getProducts().find(x => x.id === i.id);
      if (!p) return '';
      return `
      <div class="cart-item">
        <div class="cart-item-art">${productArtHTML(p)}</div>
        <div>
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-meta">${i.size ? 'Size ' + i.size + ' · ' : ''}$${p.price.toFixed(2)}</div>
          <div class="qty-row">
            <button onclick="changeQty('${i.key}',-1)" aria-label="Decrease">−</button>
            <span>${i.qty}</span>
            <button onclick="changeQty('${i.key}',1)" aria-label="Increase">+</button>
          </div>
          <button class="remove-btn" onclick="removeItem('${i.key}')">Remove</button>
        </div>
        <div class="cart-item-price">$${(p.price * i.qty).toFixed(2)}</div>
      </div>`;
    }).join('');
  }
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = '$' + cartTotal().toFixed(2);

  // free-shipping progress
  const ship = document.getElementById('shipProgress');
  if (ship) {
    const total = cartTotal();
    const pct = Math.min(100, (total / FREE_SHIP_THRESHOLD) * 100);
    ship.querySelector('.ship-bar-fill').style.width = pct + '%';
    ship.querySelector('.ship-label').innerHTML = total >= FREE_SHIP_THRESHOLD
      ? '🎉 <strong>Free shipping unlocked!</strong>'
      : `Add <strong>$${(FREE_SHIP_THRESHOLD - total).toFixed(2)}</strong> more for free shipping`;
  }
}

function checkout() {
  if (!getCart().length) { toast('Cart is empty!'); return; }
  toast('Checkout coming soon — payments not wired up yet! 🛠️');
}

function initCartUI() {
  if (document.getElementById('cartDrawer')) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'drawer-backdrop';
  backdrop.id = 'drawerBackdrop';
  backdrop.onclick = closeCart;
  const drawer = document.createElement('aside');
  drawer.className = 'drawer';
  drawer.id = 'cartDrawer';
  drawer.innerHTML = `
    <div class="drawer-head">
      <h3>Your Cart</h3>
      <button onclick="closeCart()" aria-label="Close cart">✕</button>
    </div>
    <div class="drawer-items" id="cartItems"></div>
    <div class="drawer-foot">
      <div class="ship-progress" id="shipProgress">
        <div class="ship-label"></div>
        <div class="ship-bar"><div class="ship-bar-fill"></div></div>
      </div>
      <div class="total-row"><span>Total</span><span class="amt" id="cartTotal">$0.00</span></div>
      <button class="btn btn-rust" onclick="checkout()">Checkout</button>
      <div class="fine">Free shipping on orders over $50 · Demo store</div>
    </div>`;
  document.body.appendChild(backdrop);
  document.body.appendChild(drawer);
  renderCartDrawer();
  renderCartCount();
}

/* ---------------- videos ---------------- */
async function loadVideos() {
  if (LCS.videos) return LCS.videos;
  const res = await fetch('data/videos.json');
  LCS.videos = await res.json();
  return LCS.videos;
}

function videoCardHTML(v) {
  return `
    <button class="video-card" onclick="openVideo('${v.id}', ${v.kind === 'short'})" aria-label="Play ${escapeHtml(v.title)}">
      <div class="video-thumb">
        <img src="${v.thumbnail_hd}" onerror="this.onerror=null;this.src='${v.thumbnail}'" alt="${escapeHtml(v.title)}" loading="lazy">
        ${v.duration ? `<span class="duration">${v.duration}</span>` : ''}
        <span class="yt-play"><svg viewBox="0 0 64 64"><rect x="6" y="14" width="52" height="36" rx="10" fill="#c4552a"/><path d="M27 23l14 9-14 9z" fill="#f4ead6"/></svg></span>
      </div>
      <div class="video-body">
        <div class="video-title">${escapeHtml(v.title)}</div>
        <div class="video-meta">
          ${v.views ? `<span>${escapeHtml(v.views)}</span>` : ''}
          ${v.published ? `<span class="dot">${escapeHtml(v.published)}</span>` : (v.date ? `<span class="dot">${escapeHtml(v.date)}</span>` : '')}
        </div>
      </div>
    </button>`;
}

function shortCardHTML(v) {
  return `
    <button class="short-card" onclick="openVideo('${v.id}', true)" aria-label="Play short ${escapeHtml(v.title)}">
      <img src="${v.thumbnail}" alt="${escapeHtml(v.title)}" loading="lazy">
      ${v.views ? `<span class="short-views">${escapeHtml(v.views)}</span>` : ''}
      <span class="short-overlay">${escapeHtml(v.title)}</span>
    </button>`;
}

function initVideoModal() {
  if (document.getElementById('videoModal')) return;
  const m = document.createElement('div');
  m.className = 'video-modal';
  m.id = 'videoModal';
  m.innerHTML = `
    <div class="video-modal-box" id="videoModalBox">
      <button class="video-modal-close" onclick="closeVideo()" aria-label="Close video">✕</button>
      <div class="video-modal-frame" id="videoModalFrame"></div>
      <div class="video-modal-title" id="videoModalTitle"></div>
    </div>`;
  m.addEventListener('click', e => { if (e.target === m) closeVideo(); });
  document.body.appendChild(m);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideo(); });
}

function openVideo(videoId, vertical) {
  initVideoModal();
  if (LCS.audio && !LCS.audio.paused) { LCS.audio.pause(); updatePlayBtn(false); }
  const all = LCS.videos ? LCS.videos.videos : [];
  const v = all.find(x => x.id === videoId);
  document.getElementById('videoModalBox').classList.toggle('vertical', !!vertical);
  document.getElementById('videoModalTitle').textContent = v ? v.title : '';
  document.getElementById('videoModalFrame').innerHTML =
    `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  document.getElementById('videoModal').classList.add('open');
}

function closeVideo() {
  const modal = document.getElementById('videoModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.getElementById('videoModalFrame').innerHTML = '';
}

/* ---------------- misc ---------------- */
let toastTimer;
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('open');
}

function subscribeNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if (input.value.includes('@')) {
    toast('You\'re on the list! 📬 (demo — not wired to a mailing service yet)');
    input.value = '';
  } else {
    toast('Enter a valid email');
  }
  return false;
}

/* ---------------- scroll reveal ---------------- */
const revealObserver = ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  ? new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); revealObserver.unobserve(e.target); }
      });
    }, { threshold: 0.12 })
  : null;

function observeReveals() {
  if (!revealObserver) return;
  document.querySelectorAll('.ep-card, .ep-row, .product-card, .video-card, .short-card, .host-card')
    .forEach(el => {
      if (!el.classList.contains('reveal-init') && !el.classList.contains('revealed')) {
        el.classList.add('reveal-init');
        revealObserver.observe(el);
      }
    });
}

document.addEventListener('DOMContentLoaded', () => {
  initPlayer();
  initCartUI();
  initVideoModal();
  restoreNowPlaying();
  observeReveals();
});
