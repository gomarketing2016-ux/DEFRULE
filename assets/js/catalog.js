/* ==========================================================================
   DEFRULE MUSIC — catalog.js : filtros (6+) + grilla bento de productos
   ========================================================================== */

const state = {
  q: '',
  cat: 'all',
  brand: 'all',
  price: 'all',      // rango COP
  disc: 'all',       // descuento
  sort: 'rec'
};

const PRICE_RANGES = {
  all:   [0, Infinity],
  p1:    [0, 500000],
  p2:    [500000, 1500000],
  p3:    [1500000, 4000000],
  p4:    [4000000, Infinity]
};

function applyFilters() {
  let list = PRODUCTS.slice();

  if (state.q) {
    const q = state.q.toLowerCase();
    list = list.filter(p =>
      (p.name + ' ' + p.brand + ' ' + p.short + ' ' + p.specs.join(' ')).toLowerCase().includes(q));
  }
  if (state.cat !== 'all') list = list.filter(p => p.cat === state.cat);
  if (state.brand !== 'all') list = list.filter(p => p.brand === state.brand);
  if (state.price !== 'all') {
    const [lo, hi] = PRICE_RANGES[state.price];
    list = list.filter(p => { const c = priceOf(p).cop; return c >= lo && c < hi; });
  }
  if (state.disc !== 'all') {
    list = list.filter(p => {
      const d = discountOf(p);
      if (state.disc === 'any') return d > 0;
      return d >= parseInt(state.disc, 10);
    });
  }

  switch (state.sort) {
    case 'price-asc':  list.sort((a, b) => a.usd - b.usd); break;
    case 'price-desc': list.sort((a, b) => b.usd - a.usd); break;
    case 'disc':       list.sort((a, b) => discountOf(b) - discountOf(a)); break;
    case 'rating':     list.sort((a, b) => b.rating - a.rating); break;
    default:           list.sort((a, b) => b.reviews - a.reviews); // recomendados
  }
  return list;
}

function render() {
  const grid = $('#grid');
  const list = applyFilters();
  $('#count').textContent = `${list.length} producto${list.length === 1 ? '' : 's'}`;
  if (!list.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1">${icon('search')}
      <p>No encontramos productos con esos filtros.</p></div>`;
    lucide.createIcons(); return;
  }
  grid.innerHTML = list.map((p, i) => cardHTML(p, i)).join('');
  lucide.createIcons();
  paintFavs(grid);
  bindCards(grid);

  // entrada GSAP escalonada
  gsap.fromTo('#grid .card', { autoAlpha: 0, y: 26, scale: .98 },
    { autoAlpha: 1, y: 0, scale: 1, duration: .55, stagger: .05, ease: 'power3.out', clearProps: 'all' });
}

function bindFilters() {
  const q = $('#f-q'); q.addEventListener('input', e => { state.q = e.target.value; render(); });

  $$('.chip[data-cat]').forEach(c => c.addEventListener('click', () => {
    state.cat = c.dataset.cat;
    $$('.chip[data-cat]').forEach(x => x.classList.toggle('active', x === c));
    render();
  }));

  const bind = (id, key) => $(id).addEventListener('change', e => { state[key] = e.target.value; render(); });
  bind('#f-brand', 'brand');
  bind('#f-price', 'price');
  bind('#f-disc', 'disc');
  bind('#f-sort', 'sort');

  $('#f-clear').addEventListener('click', () => {
    Object.assign(state, { q: '', cat: 'all', brand: 'all', price: 'all', disc: 'all', sort: 'rec' });
    q.value = ''; $('#f-brand').value = 'all'; $('#f-price').value = 'all'; $('#f-disc').value = 'all'; $('#f-sort').value = 'rec';
    $$('.chip[data-cat]').forEach(x => x.classList.toggle('active', x.dataset.cat === 'all'));
    render();
  });
}

function fillBrands() {
  const sel = $('#f-brand');
  sel.innerHTML = `<option value="all">Todas las marcas</option>` +
    brands().map(b => `<option value="${b}">${b}</option>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  fillBrands();
  bindFilters();
  render();
  // contadores de categoría
  const n = c => PRODUCTS.filter(p => p.cat === c).length;
  const set = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  set('#n-guit', n('guitarras')); set('#n-perc', n('percusion')); set('#n-acc', n('accesorios'));
});
