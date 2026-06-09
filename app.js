const API = 'https://pokeapi.co/api/v2/pokemon';

// ── THEME TOGGLE ─────────────────────────────────────────────
function applyTheme() {
  const light = localStorage.getItem('theme') === 'light';
  document.body.classList.toggle('light', light);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = light ? '🌙' : '☀️';
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  document.getElementById('theme-toggle').textContent = isLight ? '🌙' : '☀️';
}

applyTheme();

const TYPE_COLORS = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F8D030',
  ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0', ground: '#E0C068',
  flying: '#A890F0', psychic: '#F85888', bug: '#A8B820', rock: '#B8A038',
  ghost: '#705898', dragon: '#7038F8', dark: '#705848', steel: '#B8B8D0',
  fairy: '#EE99AC', normal: '#A8A878'
};

const LEGENDARIES = [
  'mewtwo', 'lugia', 'ho-oh', 'rayquaza',
  'kyogre', 'groudon', 'arceus', 'zekrom'
];

function idFromUrl(url) {
  return url.split('/').filter(Boolean).pop();
}

function buildCard(p, isLegendary = false) {
  const primaryType = p.types[0].type.name;
  const color = isLegendary ? '#FFD700' : (TYPE_COLORS[primaryType] || '#888');
  const badges = p.types.map(t =>
    `<span class="badge" style="background:${TYPE_COLORS[t.type.name] || '#888'}">${t.type.name}</span>`
  ).join('');

  const card = document.createElement('div');
  card.className = isLegendary ? 'card legendary' : 'card';
  card.style.borderTopColor = color;
  card.innerHTML = `
    ${isLegendary ? '<p class="legend-tag">★ Legendary</p>' : ''}
    <p class="id">#${String(p.id).padStart(3, '0')}</p>
    <img src="${p.sprites.front_default}" alt="${p.name}" />
    <h3>${p.name}</h3>
    <div>${badges}</div>
    <button onclick="location.href='details.html?name=${p.name}'">View Details</button>
  `;
  return card;
}

// ── INDEX PAGE ──────────────────────────────────────────────
async function loadPokedex() {
  const grid = document.getElementById('poke-grid');
  if (!grid) return;

  grid.innerHTML = '<p class="loading">Loading Pokémon...</p>';

  const [listRes, ...legendaryData] = await Promise.all([
    fetch(`${API}?limit=50`).then(r => r.json()),
    ...LEGENDARIES.map(name => fetch(`${API}/${name}`).then(r => r.json()))
  ]);

  const details = await Promise.all(
    listRes.results.map(p => fetch(p.url).then(r => r.json()))
  );

  grid.innerHTML = '';

  for (const p of details) {
    grid.appendChild(buildCard(p, false));
  }

  // Legendaries section divider
  const divider = document.createElement('div');
  divider.className = 'section-divider';
  divider.textContent = '★ Legendaries';
  grid.appendChild(divider);

  for (const p of legendaryData) {
    grid.appendChild(buildCard(p, true));
  }

  // Build type filter buttons from loaded cards
  const typeSeen = new Set();
  document.querySelectorAll('.card').forEach(card => {
    card.querySelectorAll('.badge').forEach(b => typeSeen.add(b.textContent.trim()));
  });

  const filterBar = document.getElementById('type-filters');
  let activeType = null;

  typeSeen.forEach(type => {
    const btn = document.createElement('button');
    btn.className = 'type-btn';
    btn.textContent = type;
    btn.style.background = TYPE_COLORS[type] || '#888';
    btn.addEventListener('click', () => {
      if (activeType === type) {
        activeType = null;
        btn.classList.remove('active');
      } else {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeType = type;
      }
      applyFilters();
    });
    filterBar.appendChild(btn);
  });

  // Live search filter
  document.getElementById('poke-search').addEventListener('input', applyFilters);

  function applyFilters() {
    const q = document.getElementById('poke-search').value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const name = card.querySelector('h3').textContent.toLowerCase();
      const types = [...card.querySelectorAll('.badge')].map(b => b.textContent.trim());
      const matchSearch = name.includes(q);
      const matchType = !activeType || types.includes(activeType);
      card.style.display = matchSearch && matchType ? '' : 'none';
    });
  }
}

// ── DETAILS PAGE ─────────────────────────────────────────────
async function loadDetail() {
  const detail = document.getElementById('poke-info');
  if (!detail) return;

  const name = new URLSearchParams(location.search).get('name');
  if (!name) { detail.innerHTML = '<p>No Pokémon specified.</p>'; return; }

  detail.innerHTML = '<p class="loading">Loading...</p>';

  const res = await fetch(`${API}/${name}`);
  const p = await res.json();

  const primaryType = p.types[0].type.name;
  detail.style.borderTopColor = TYPE_COLORS[primaryType] || '#e63946';

  const types = p.types.map(t =>
    `<span style="background:${TYPE_COLORS[t.type.name] || '#888'}">${t.type.name}</span>`
  ).join('');

  const statBars = p.stats.map(s => `
    <div class="stat-row">
      <span class="label">${s.stat.name}</span>
      <span class="value">${s.base_stat}</span>
      <div class="bar-bg">
        <div class="bar-fill" style="width:${Math.min((s.base_stat / 255) * 100, 100)}%;
          background:${s.base_stat >= 100 ? '#78C850' : s.base_stat >= 60 ? '#F8D030' : '#e63946'}">
        </div>
      </div>
    </div>
  `).join('');

  const abilities = p.abilities.map(a => a.ability.name).join(', ');

  detail.innerHTML = `
    <img src="${p.sprites.front_default}" alt="${p.name}" />
    <h2>${p.name} <small style="color:#888;font-size:1rem">#${String(p.id).padStart(3,'0')}</small></h2>
    <div class="types">${types}</div>
    <div class="info-row">
      <div>Height<span>${p.height / 10} m</span></div>
      <div>Weight<span>${p.weight / 10} kg</span></div>
      <div>Abilities<span style="font-size:0.75rem">${abilities}</span></div>
    </div>
    <div class="stats">${statBars}</div>
  `;

  document.title = p.name.charAt(0).toUpperCase() + p.name.slice(1);
}

loadPokedex();
loadDetail();
