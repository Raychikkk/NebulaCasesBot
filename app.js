// === Telegram ===
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor?.('#0f1419');
  tg.setBackgroundColor?.('#0f1419');
}

// === State ===
const STORAGE_KEY = 'casedrop_state_v1';
let state = loadState() || {
  balance: 1000,
  inventory: [],
  stats: { opened: 0, spent: 0, won: 0 },
};
function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

const $ = (sel) => document.querySelector(sel);

function updateBalance() {
  $('#balance').textContent = state.balance.toLocaleString('ru-RU');
}
function haptic(type = 'light') {
  tg?.HapticFeedback?.impactOccurred?.(type);
}

// === Lottie helpers (с поддержкой .tgs через pako) ===
const previewCache = new Map();
const tgsCache = new Map();

async function loadLottieData(path) {
  if (tgsCache.has(path)) return tgsCache.get(path);
  const res = await fetch(path);
  if (!res.ok) throw new Error('not found');
  if (path.toLowerCase().endsWith('.tgs')) {
    const buf = await res.arrayBuffer();
    const unzipped = pako.ungzip(new Uint8Array(buf), { to: 'string' });
    const data = JSON.parse(unzipped);
    tgsCache.set(path, data);
    return data;
  } else {
    const data = await res.json();
    tgsCache.set(path, data);
    return data;
  }
}

async function renderLottieStatic(container, path, size = 100) {
  const img = document.createElement('img');
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'contain';

  try {
    if (previewCache.has(path)) {
      img.src = previewCache.get(path);
      container.appendChild(img);
      return;
    }

    const animationData = await loadLottieData(path);

    const tmp = document.createElement('div');
    tmp.style.width = size + 'px';
    tmp.style.height = size + 'px';
    tmp.style.position = 'absolute';
    tmp.style.left = '-9999px';
    document.body.appendChild(tmp);

    const anim = lottie.loadAnimation({
      container: tmp,
      renderer: 'canvas',
      loop: false,
      autoplay: false,
      animationData,
    });

    await new Promise(res => anim.addEventListener('DOMLoaded', res));
    anim.goToAndStop(0, true);
    await new Promise(res => setTimeout(res, 40));

    const canvas = tmp.querySelector('canvas');
    const url = canvas.toDataURL('image/png');
    previewCache.set(path, url);
    img.src = url;
    container.appendChild(img);
    anim.destroy();
    tmp.remove();
  } catch (e) {
    container.dataset.lottieFailed = '1';
  }
}

async function renderLottieAnimated(container, path) {
  const box = document.createElement('div');
  box.className = 'lottie-box';
  container.appendChild(box);

  try {
    const animationData = await loadLottieData(path);
    const anim = lottie.loadAnimation({
      container: box,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData,
    });
    return anim;
  } catch (e) {
    box.remove();
    container.dataset.lottieFailed = '1';
    return null;
  }
}

function itemVisual(itemKey, container, { animated = false } = {}) {
  const it = ITEMS[itemKey];
  container.innerHTML = '';

  if (it.lottie) {
    const p = animated
      ? renderLottieAnimated(container, it.lottie)
      : renderLottieStatic(container, it.lottie);
    p.then(() => {
      if (container.dataset.lottieFailed) {
        delete container.dataset.lottieFailed;
        container.innerHTML = `<div class="emoji-fallback">${it.emoji}</div>`;
      }
    });
    return;
  }

  container.innerHTML = `<div class="emoji-fallback">${it.emoji}</div>`;
}

// === Navigation ===
function showScreen(name) {
  document.querySelectorAll('main.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name)?.classList.add('active');
  document.querySelectorAll('.bottom-nav button').forEach(b => {
    b.classList.toggle('active', b.dataset.nav === name);
  });
  if (name === 'inventory') renderInventory();
  if (name === 'profile') renderProfile();
}
function goHome() { showScreen('home'); }

// === Cases ===
function renderCases() {
  const list = $('#cases-list');
  list.innerHTML = '';
  CASES.forEach(c => {
    const card = document.createElement('div');
    card.className = 'case-card';
    card.innerHTML = `
      <div class="case-icon" style="background:${c.gradient}">${c.emoji}</div>
      <div class="case-info">
        <div class="case-name">${c.title}</div>
        <div class="case-price">Цена: <b>${c.price} ⭐</b></div>
      </div>
      <div style="font-size:22px;color:var(--muted)">›</div>
    `;
    card.onclick = () => openCase(c.id);
    list.appendChild(card);
  });
}

let currentCase = null;
let isSpinning = false;

function openCase(id) {
  const c = CASES.find(x => x.id === id);
  if (!c) return;
  currentCase = c;
  $('#case-title').textContent = c.title;
  $('#case-price').textContent = c.price;
  $('#drop-result').innerHTML = '';
  buildRoulette(c);
  showScreen('case');
  haptic('light');
}

function weightedPick(pool) {
  const total = pool.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const p of pool) {
    r -= p.weight;
    if (r <= 0) return p.item;
  }
  return pool[pool.length - 1].item;
}

function buildRoulette(c) {
  const strip = $('#roulette');
  strip.style.transition = 'none';
  strip.style.transform = 'translateX(0)';
  strip.innerHTML = '';

  const slots = [];
  for (let i = 0; i < 55; i++) slots.push(weightedPick(c.pool));
  const winningItem = weightedPick(c.pool);
  slots[45] = winningItem;

  slots.forEach(key => {
    const it = ITEMS[key];
    const r = RARITY[it.rarity];
    const el = document.createElement('div');
    el.className = 'roulette-item';
    el.style.borderColor = r.color;
    el.style.boxShadow = `inset 0 0 20px ${r.glow}`;
    itemVisual(key, el, { animated: false });
    strip.appendChild(el);
  });

  requestAnimationFrame(() => { strip.style.transition = ''; });
  return winningItem;
}

function spin() {
  if (isSpinning || !currentCase) return;
  if (state.balance < currentCase.price) {
    $('#drop-result').innerHTML = '<span style="color:#ef4444">Недостаточно звёзд</span>';
    haptic('rigid');
    return;
  }

  isSpinning = true;
  state.balance -= currentCase.price;
  state.stats.spent += currentCase.price;
  state.stats.opened += 1;
  updateBalance();
  saveState();

  $('#spin-btn').disabled = true;
  $('#drop-result').innerHTML = '';
  haptic('medium');

  const winningItem = buildRoulette(currentCase);
  const strip = $('#roulette');

  const itemWidth = 110;
  const containerWidth = strip.parentElement.clientWidth;
  const targetIndex = 45;
  const jitter = (Math.random() - 0.5) * 40;
  const offset = -(targetIndex * itemWidth + itemWidth / 2 - containerWidth / 2 + jitter);

  requestAnimationFrame(() => {
    strip.style.transform = `translateX(${offset}px)`;
  });

  setTimeout(() => finishSpin(winningItem), 5100);
}

function finishSpin(itemKey) {
  const it = ITEMS[itemKey];
  const r = RARITY[it.rarity];

  state.inventory.push({ key: itemKey, ts: Date.now() });
  state.stats.won += 1;
  saveState();

  const box = $('#drop-result');
  box.innerHTML = '';
  const visual = document.createElement('div');
  box.appendChild(visual);
  itemVisual(itemKey, visual, { animated: true });

  const name = document.createElement('div');
  name.className = 'win-name';
  name.style.color = r.color;
  name.textContent = it.name;
  box.appendChild(name);

  const rar = document.createElement('div');
  rar.className = 'win-rarity';
  rar.style.color = r.color;
  rar.textContent = r.name;
  box.appendChild(rar);

  const hint = document.createElement('div');
  hint.className = 'win-hint';
  hint.textContent = '(демо — предмет не выдан)';
  box.appendChild(hint);

  $('#spin-btn').disabled = false;
  isSpinning = false;
  haptic('heavy');
  tg?.HapticFeedback?.notificationOccurred?.(it.rarity === 'legendary' ? 'success' : 'warning');
}

// === Inventory ===
function renderInventory() {
  const list = $('#inventory-list');
  const empty = $('#inv-empty');
  list.innerHTML = '';
  if (state.inventory.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  const sorted = [...state.inventory].sort((a, b) => b.ts - a.ts);
  sorted.forEach(inv => {
    const it = ITEMS[inv.key];
    const r = RARITY[it.rarity];
    const el = document.createElement('div');
    el.className = 'inv-item';
    el.style.borderColor = r.color;
    el.style.boxShadow = `inset 0 0 24px ${r.glow}`;
    list.appendChild(el);
    itemVisual(inv.key, el, { animated: true });
    const label = document.createElement('small');
    label.style.color = r.color;
    label.textContent = r.name;
    el.appendChild(label);
  });
}

// === Profile ===
function renderProfile() {
  $('#stat-opened').textContent = state.stats.opened;
  $('#stat-spent').textContent = state.stats.spent.toLocaleString('ru-RU');
  $('#stat-won').textContent = state.stats.won;

  if (tg?.initDataUnsafe?.user) {
    const u = tg.initDataUnsafe.user;
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'Гость';
    $('#uname').textContent = name;
    $('#avatar').textContent = (u.first_name?.[0] || '?').toUpperCase();
  }
}

function resetAll() {
  if (!confirm('Точно сбросить весь прогресс?')) return;
  state = { balance: 1000, inventory: [], stats: { opened: 0, spent: 0, won: 0 } };
  saveState();
  updateBalance();
  renderCases();
  renderInventory();
  renderProfile();
  haptic('rigid');
}

// === Nav ===
document.querySelectorAll('.bottom-nav button').forEach(b => {
  b.onclick = () => { showScreen(b.dataset.nav); haptic('light'); };
});

// === Init ===
$('#spin-btn').onclick = spin;
updateBalance();
renderCases();
renderProfile();
renderInventory();