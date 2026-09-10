/* ==========================================================================
   DEFRULE MUSIC — main.js : nav, transiciones GSAP, reveals, WhatsApp,
   tarjetas de producto, modales, favoritos, bienvenida.
   ========================================================================== */

/* ---------- utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function waLink(productName) {
  const msg = productName
    ? `Hola DEFRULE MUSIC, me interesa el producto: ${productName}. Quisiera más información.`
    : 'Hola DEFRULE MUSIC, quiero más información sobre sus productos.';
  return `https://wa.me/${CONFIG.store.whatsapp}?text=${encodeURIComponent(msg)}`;
}

/* SVG oficial de WhatsApp (marca) — para botones externos */
const WA_ICON = `<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.59 4.47 1.71 6.41L3.2 28.8l6.55-1.72a12.74 12.74 0 0 0 6.25 1.63h.01c7.06 0 12.8-5.74 12.8-12.8s-5.75-12.71-12.81-12.71zm0 23.36h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.02 1.06 1.07-3.92-.25-.4a10.6 10.6 0 0 1-1.63-5.67c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.51 1.11 7.52 3.12a10.56 10.56 0 0 1 3.11 7.52c0 5.87-4.77 10.63-10.64 10.63zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.51-.16-.72.16-.21.32-.83 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.58-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.09 1.3 3.3.16.21 2.25 3.44 5.46 4.82.76.33 1.36.52 1.82.67.77.24 1.46.21 2.01.13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z"/></svg>`;

function icon(name, attrs = '') { return `<i data-lucide="${name}" ${attrs}></i>`; }

/* ---------- toast ---------- */
let toastTimer = null;
function toast(msg, icon = 'sparkles') {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.innerHTML = `${icon(icon)}<span>${msg}</span>`;
  requestAnimationFrame(() => { lucide.createIcons(); t.classList.add('show'); });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- precio ---------- */
function priceHTML(p, big = false) {
  const pr = priceOf(p);
  return `
    <div class="price">
      ${pr.wasCop ? `<span class="was">${moneyCOP(pr.wasCop)}</span>` : ''}
      <span class="now ${big ? '' : ''}">${moneyCOP(pr.cop)}</span>
      <span class="usd">ref. US$ ${p.usd.toLocaleString('en-US')}</span>
    </div>`;
}
function discBadge(p) {
  const d = discountOf(p);
  return d ? `<span class="badge disc">-${d}%</span>` : '';
}

/* ---------- tarjeta de producto ---------- */
function cardHTML(p, i) {
  const cat = CATS[p.cat];
  return `
  <article class="card" data-reveal data-id="${p.id}" style="animation-delay:${(i % 6) * .35}s">
    <div class="card-media">
      <div class="card-badge">${discBadge(p)}<span class="badge cat">${cat.label}</span></div>
      <button class="icon-btn card-fav ${''}" data-fav="${p.id}" aria-label="Favorito">${icon('heart')}</button>
      <img src="${p.imgs[0]}" alt="${p.name}" loading="lazy">
      <div class="card-thumbs">
        ${p.imgs.map((src, k) => `<img src="${src}" data-swap="${k}" class="${k === 0 ? 'sel' : ''}" alt="${p.name} foto ${k + 1}">`).join('')}
      </div>
    </div>
    <div class="card-body">
      <span class="card-brand">${p.brand}</span>
      <h3 class="card-title">${p.name}</h3>
      <div class="card-specs">${p.specs.slice(0, 3).map(s => `<span class="tag">${s}</span>`).join('')}</div>
      <div class="card-foot">
        ${priceHTML(p)}
        <div class="card-actions">
          <button class="icon-btn" data-detail="${p.id}" aria-label="Ver detalle">${icon('eye')}</button>
          <a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waLink(p.name)}" aria-label="WhatsApp">${WA_ICON}</a>
        </div>
      </div>
    </div>
  </article>`;
}

/* ---------- detalle de producto (modal) ---------- */
function openProduct(p) {
  let m = $('#pmodal');
  if (!m) {
    m = document.createElement('div'); m.id = 'pmodal'; m.className = 'modal';
    document.body.appendChild(m);
  }
  const pr = priceOf(p);
  m.innerHTML = `
    <div class="modal-panel" style="width:min(920px,100%)">
      <button class="icon-btn modal-close" data-close>${icon('x')}</button>
      <div class="pd">
        <div class="pd-media">
          <img src="${p.imgs[0]}" alt="${p.name}">
          <div class="thumbs">${p.imgs.map((s, k) => `<img src="${s}" data-pdswap="${k}" class="${k === 0 ? 'sel' : ''}">`).join('')}</div>
        </div>
        <div class="pd-info">
          <span class="card-brand">${p.brand} · ${CATS[p.cat].label}</span>
          <h3>${p.name}</h3>
          <div style="display:flex;gap:8px;align-items:center">
            ${icon('star', 'style="color:var(--accent);width:16px"')}<b>${p.rating}</b>
            <span style="color:var(--muted);font-size:.85rem">(${p.reviews.toLocaleString('es-CO')} reseñas)</span>
            ${discBadge(p)}
          </div>
          <p class="short">${p.short}</p>
          <table class="spec-table">${Object.entries(p.table).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
          <div class="card-foot" style="margin-top:4px">${priceHTML(p, true)}
            <div class="card-actions">
              <button class="icon-btn" data-fav="${p.id}">${icon('heart')}</button>
            </div>
          </div>
          <a class="btn btn-wa btn-block btn-lg" style="margin-top:16px" target="_blank" rel="noopener" href="${waLink(p.name)}">
            ${WA_ICON} Pedir por WhatsApp
          </a>
        </div>
      </div>
    </div>`;
  requestAnimationFrame(() => { lucide.createIcons(); m.classList.add('open'); document.body.style.overflow = 'hidden'; });
  m.onclick = e => { if (e.target === m || e.target.closest('[data-close]')) closeProduct(); };
  m.querySelectorAll('[data-pdswap]').forEach(th => th.onclick = () => {
    m.querySelector('.pd-media>img').src = th.src;
    m.querySelectorAll('[data-pdswap]').forEach(x => x.classList.remove('sel')); th.classList.add('sel');
  });
  bindFavs(m);
  DB.trackView(p.id).then(refreshRecent);
}
function closeProduct() { const m = $('#pmodal'); if (m) m.classList.remove('open'); document.body.style.overflow = ''; }

/* ---------- favoritos ---------- */
async function paintFavs(scope = document) {
  const favs = await DB.getFavs();
  $$('[data-fav]', scope).forEach(b => b.classList.toggle('on', favs.includes(b.dataset.fav)));
}
function bindFavs(scope = document) {
  $$('[data-fav]', scope).forEach(b => {
    if (b._favBound) return; b._favBound = true;
    b.addEventListener('click', async e => {
      e.stopPropagation();
      const id = b.dataset.fav;
      const on = await DB.toggleFav(id);
      const p = byId(id);
      toast(on ? `Añadido a favoritos: ${p.name}` : 'Quitado de favoritos', 'heart');
      paintFavs(document);
    });
  });
}

/* ---------- recientes ---------- */
function refreshRecent() {
  const host = $('#recent');
  if (!host) return;
  DB.getRecent().then(ids => {
    const prods = ids.map(byId).filter(Boolean).slice(0, 4);
    host.innerHTML = prods.length
      ? prods.map((p, i) => cardHTML(p, i)).join('')
      : '';
    const sec = $('#recent-sec'); if (sec) sec.style.display = prods.length ? '' : 'none';
    lucide.createIcons(); paintFavs(host); bindCards(host);
  });
}

/* ---------- click delegation for cards ---------- */
function bindCards(scope = document) {
  $$('[data-detail]', scope).forEach(b => { if (b._d) return; b._d = true; b.onclick = e => { e.stopPropagation(); openProduct(byId(b.dataset.detail)); }; });
  $$('.card', scope).forEach(c => { if (c._c) return; c._c = true;
    c.addEventListener('click', e => { if (e.target.closest('a,button,[data-swap]')) return; openProduct(byId(c.dataset.id)); });
    c.querySelectorAll('[data-swap]').forEach(th => th.onclick = e => {
      e.stopPropagation();
      c.querySelector('.card-media>img').src = th.src;
      c.querySelectorAll('[data-swap]').forEach(x => x.classList.remove('sel')); th.classList.add('sel');
    });
  });
}

/* ---------- GSAP: reveals + page transitions ---------- */
function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // entrada de página
  gsap.from('.page > *', { autoAlpha: 0, y: 18, duration: .6, stagger: .06, ease: 'power3.out', clearProps: 'all' });

  // reveals con scroll
  $$('[data-reveal]').forEach(el => {
    gsap.fromTo(el, { autoAlpha: 0, y: 34 }, {
      autoAlpha: 1, y: 0, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      clearProps: 'transform'
    });
  });

  // stagger de grupos
  $$('[data-reveal-group]').forEach(g => {
    gsap.fromTo(g.children, { autoAlpha: 0, y: 30 }, {
      autoAlpha: 1, y: 0, duration: .7, stagger: .08, ease: 'power3.out',
      scrollTrigger: { trigger: g, start: 'top 86%' }, clearProps: 'transform'
    });
  });

  // hover GSAP en botones/tarjetas (complemento al CSS)
  document.addEventListener('mouseenter', e => {
    const t = e.target.closest('.btn,.icon-btn,.chip');
    if (t) gsap.to(t, { scale: 1.04, duration: .25, ease: 'power2.out' });
  }, true);
  document.addEventListener('mouseleave', e => {
    const t = e.target.closest('.btn,.icon-btn,.chip');
    if (t) gsap.to(t, { scale: 1, duration: .25, ease: 'power2.out' });
  }, true);
}

/* transición de página (MPA) */
function goTo(href) {
  const tl = gsap.timeline();
  tl.to('.page', { autoAlpha: 0, y: -16, duration: .35, ease: 'power2.in', onComplete: () => { location.href = href; } });
}
function bindNav() {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-nav]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    e.preventDefault(); goTo(href);
  });
}

/* ---------- navbar ---------- */
function initNav() {
  const nav = $('.nav');
  const toggle = $('.nav-toggle');
  const links = $('.nav-links');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 10), { passive: true });
  if (toggle) toggle.onclick = () => links.classList.toggle('open');
  links && links.addEventListener('click', e => { if (e.target.closest('a')) links.classList.remove('open'); });
}

/* ---------- modal bienvenida (descuento 10%, estético) ---------- */
function initWelcome() {
  const KEY = 'welcome-shown';
  if (sessionStorage.getItem(KEY)) { maybeShowDiscountChip(); return; }
  const m = $('#welcome'); if (!m) return;
  setTimeout(() => { m.classList.add('open'); }, 500);
  sessionStorage.setItem(KEY, '1');
  const accept = $('#welcome-accept');
  accept.onclick = async () => {
    await DB.setMeta('discount', CONFIG.welcomeDiscount);
    m.classList.remove('open');
    document.body.style.overflow = '';
    toast(`Descuento del ${CONFIG.welcomeDiscount}% reservado para tu primera compra`, 'badge-percent');
    maybeShowDiscountChip(true);
  };
  $('#welcome-close').onclick = () => { m.classList.remove('open'); document.body.style.overflow = ''; };
}
async function maybeShowDiscountChip(force) {
  const v = force ? CONFIG.welcomeDiscount : await DB.getMeta('discount');
  const chip = $('#discount-chip');
  if (chip && v) chip.hidden = false;
}

/* ---------- chrome compartido (nav + footer + welcome + fab) ---------- */
function navLinks(active) {
  const items = [['index.html', 'Inicio', 'inicio'], ['catalogo.html', 'Catálogo', 'catalogo'], ['nosotros.html', 'Nosotros', 'nosotros'], ['contacto.html', 'Contacto', 'contacto']];
  return items.map(([href, label, key]) =>
    `<a data-nav class="${key === active ? 'active' : ''}" href="${href}">${label}</a>`).join('');
}
function buildChrome() {
  if (document.querySelector('.nav')) return; // idempotente
  const page = document.body.dataset.page || 'inicio';
  const s = CONFIG.store;
  // NAV
  document.body.insertAdjacentHTML('afterbegin', `
  <nav class="nav" aria-label="principal">
    <div class="nav-inner">
      <a class="logo" data-nav href="index.html">
        <span class="mark">${icon('audio-waveform')}</span>
        DEFRULE<b>MUSIC</b>
      </a>
      <div class="nav-links" id="navlinks">${navLinks(page)}</div>
      <div class="nav-cta">
        <span class="tag" id="discount-chip" hidden>${icon('badge-percent')} 10% 1ª compra</span>
        <a class="btn btn-wa btn-sm" target="_blank" rel="noopener" href="${waLink()}">${WA_ICON} WhatsApp</a>
        <button class="nav-toggle" aria-label="menú">${icon('menu')}</button>
      </div>
    </div>
  </nav>
  <div style="height:var(--navh)"></div>`);
  // FAB
  document.body.insertAdjacentHTML('beforeend', `
  <a class="fab-wa" target="_blank" rel="noopener" href="${waLink()}" aria-label="WhatsApp">${WA_ICON}</a>`);
  // WELCOME MODAL
  document.body.insertAdjacentHTML('beforeend', `
  <div class="modal" id="welcome" role="dialog" aria-modal="true">
    <div class="modal-panel welcome">
      <button class="icon-btn modal-close" id="welcome-close">${icon('x')}</button>
      <div class="inner">
        <span class="eyebrow">${icon('sparkles')} Bienvenido a ${s.name}</span>
        <div class="disc grad">${CONFIG.welcomeDiscount}% OFF</div>
        <h3>Tu primera compra con descuento</h3>
        <p>Activa tu beneficio de bienvenida y explora guitarras, percusión y accesorios seleccionados para ti.</p>
        <div class="btn-container">
          <button class="btn-drawer transition-top"><span class="btn-text">Obtener</span></button>
          <button class="btn-drawer transition-bottom"><span class="btn-text">10% OFF</span></button>
          <button class="btn-uiverse" id="welcome-accept"><span class="btn-text">ACTIVAR</span></button>
          <svg class="btn-corner" viewBox="0 0 32 32"><path d="M32 0H22C27.5 0 32 4.5 32 10V0Z"/><path d="M0 0H10C4.5 0 0 4.5 0 10V0Z" transform="rotate(90) translate(0,-32)"/></svg>
          <svg class="btn-corner" viewBox="0 0 32 32"><path d="M32 0H22C27.5 0 32 4.5 32 10V0Z"/></svg>
          <svg class="btn-corner" viewBox="0 0 32 32"><path d="M32 0H22C27.5 0 32 4.5 32 10V0Z"/></svg>
          <svg class="btn-corner" viewBox="0 0 32 32"><path d="M32 0H22C27.5 0 32 4.5 32 10V0Z"/></svg>
        </div>
        <span style="color:var(--muted-2);font-size:.78rem">Beneficio estético de bienvenida · sin registro</span>
      </div>
    </div>
  </div>`);
  // FOOTER
  document.body.insertAdjacentHTML('beforeend', `
  <footer>
    <div class="container">
      <div class="foot-grid" data-reveal-group>
        <div>
          <a class="logo" data-nav href="index.html" style="margin-bottom:14px">
            <span class="mark">${icon('audio-waveform')}</span> DEFRULE<b>MUSIC</b>
          </a>
          <p style="color:var(--muted);max-width:320px">Tienda bogotana de instrumentos musicales. Guitarras eléctricas, percusión y accesorios de las mejores marcas, asesorados por músicos reales.</p>
        </div>
        <div>
          <h4>Tienda</h4>
          <a data-nav href="catalogo.html">Guitarras eléctricas</a>
          <a data-nav href="catalogo.html">Percusión</a>
          <a data-nav href="catalogo.html">Accesorios</a>
          <a data-nav href="catalogo.html">Ofertas</a>
        </div>
        <div>
          <h4>Empresa</h4>
          <a data-nav href="nosotros.html">Nosotros</a>
          <a data-nav href="contacto.html">Contacto</a>
          <a data-nav href="contacto.html">Garantías</a>
        </div>
        <div>
          <h4>Contacto</h4>
          <a target="_blank" rel="noopener" href="${waLink()}">${s.whatsappVisible}</a>
          <a href="mailto:${s.email}">${s.email}</a>
          <a href="#">${s.address}</a>
          <a href="#">${s.hours}</a>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© 2026 ${s.name} · ${s.city}</span>
        <span>Precios de referencia en COP · Hecho con HTML, CSS y JS</span>
      </div>
    </div>
  </footer>`);
}

/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.remove('no-js');
  buildChrome();
  initNav();
  initAnimations();
  bindNav();
  bindCards();
  bindFavs();
  paintFavs();
  initWelcome();
  refreshRecent();
  lucide.createIcons();

  // ripple en botones
  document.addEventListener('click', e => {
    const b = e.target.closest('.btn');
    if (!b) return;
    const r = document.createElement('span'); r.className = 'ripple';
    const rect = b.getBoundingClientRect();
    const d = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = d + 'px';
    r.style.left = (e.clientX - rect.left - d / 2) + 'px';
    r.style.top = (e.clientY - rect.top - d / 2) + 'px';
    b.appendChild(r); setTimeout(() => r.remove(), 600);
  });
});
