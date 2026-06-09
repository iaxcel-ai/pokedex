# Pokedex

A browser-based Pokédex that fetches live data from the [PokéAPI](https://pokeapi.co). Browse the first 50 Pokémon plus a curated set of legendaries, filter by type, search by name, and click any card to see full stats.

## Features

- **Grid view** — first 50 Pokémon loaded on startup, with a dedicated Legendaries section (Mewtwo, Lugia, Ho-Oh, Rayquaza, Kyogre, Groudon, Arceus, Zekrom)
- **Type filter** — click any type badge in the filter bar to show only Pokémon of that type; click again to clear
- **Live search** — type in the search box to filter by name in real time; works together with the type filter
- **Detail page** — click "View Details" on any card to open a page showing the Pokémon's sprite, types, height, weight, abilities, and base stats with visual bar charts
- **Dark / light theme** — toggle with the ☀️ / 🌙 button; preference is saved in `localStorage`

## Usage

No build step or dependencies required. Just open `index.html` in a browser — it fetches data from the PokéAPI over the network.

```
# Option 1: open directly
open index.html

# Option 2: serve locally (avoids any CORS edge cases)
npx serve .
# or
python -m http.server 8080
```

Then visit `http://localhost:8080` (if serving) or open the file directly.

## File structure

```
index.html    — main Pokédex grid page
details.html  — individual Pokémon detail page
app.js        — all fetching, rendering, filtering, and theme logic
style.css     — dark/light theme styles and responsive grid layout
```

## Data source

All Pokémon data is fetched at runtime from [https://pokeapi.co](https://pokeapi.co) — no API key needed.
