/* ============================================================
   Dólar en Colombia — Panel exploratorio
   Lógica: filtros + estadística + gráficos (Apache ECharts)
   ============================================================ */
'use strict';

/* ================= Datos ================= */
const D = window.DATOS;
const SERIES = D.series;
const META = D.meta;

const VARS = {
  trm:   { short: 'Dólar (TRM)',  label: 'TRM (USD/COP)',            unit: 'COP',     color: '#2c95e6' },
  brent: { short: 'Brent',        label: 'Petróleo Brent',           unit: 'USD/bbl', color: '#f59f00' },
  dxy:   { short: 'Índice USD',   label: 'Índice del dólar (EE.UU.)', unit: 'pts',     color: '#7048e8' },
  us10y: { short: 'Tasa US 10a',  label: 'Tasa 10 años (EE.UU.)',    unit: '%',       color: '#12b886' }
};
const KEYS = ['trm', 'brent', 'dxy', 'us10y'];
const AUX = ['brent', 'dxy', 'us10y'];

const DEFAULTS = {
  desde: META.desde, hasta: META.hasta,
  gran: 'diaria', view: 'nivel',
  aux: ['brent'],
  metric: 'pearson', rollWin: 30,
  scatX: 'brent', scatY: 'trm'
};
const state = {
  desde: DEFAULTS.desde, hasta: DEFAULTS.hasta,
  gran: DEFAULTS.gran, view: DEFAULTS.view,
  aux: new Set(DEFAULTS.aux),
  metric: DEFAULTS.metric, rollWin: DEFAULTS.rollWin,
  scatX: DEFAULTS.scatX, scatY: DEFAULTS.scatY
};

/* ================= Fechas y formato ================= */
const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function pdate(s) { const a = s.split('-'); return Date.UTC(+a[0], +a[1] - 1, +a[2]); }
function dayDiff(a, b) { return Math.round((pdate(b) - pdate(a)) / 86400000); }
function isWeekend(s) { const w = new Date(pdate(s)).getUTCDay(); return w === 0 || w === 6; }
function addDaysISO(s, n) { return new Date(pdate(s) + n * 86400000).toISOString().slice(0, 10); }
function fmtDate(s) { const a = s.split('-'); return `${a[2]}-${MONTHS_ES[+a[1] - 1]}-${a[0].slice(2)}`; }
function fmtMonthKey(ym) { const a = ym.split('-'); return `${MONTHS_ES[+a[1] - 1].toUpperCase().slice(0, 3)} ${a[0].slice(2)}`; }

const nfCOP  = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
const nfCOP0 = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf1 = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function fmtCOP(v) { return (v == null || !isFinite(v)) ? '—' : nfCOP.format(v); }
function fmtPct(v, dec = 1) {
  if (v == null || !isFinite(v)) return '—';
  return (v < 0 ? '−' : '+') + Math.abs(v).toFixed(dec).replace('.', ',') + '%';
}
function fmtNum(v, dec = 2) { return (v == null || !isFinite(v)) ? '—' : nf2.format(v); }

/* ================= Estadística ================= */
const sum = a => a.reduce((x, y) => x + y, 0);
function mean(a) { return a.length ? sum(a) / a.length : NaN; }
function sd(a) {
  if (a.length < 2) return NaN;
  const m = mean(a);
  return Math.sqrt(sum(a.map(v => (v - m) * (v - m))) / (a.length - 1));
}
function quantile(sorted, q) {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q, base = Math.floor(pos), rest = pos - base;
  return sorted[base + 1] !== undefined ? sorted[base] + rest * (sorted[base + 1] - sorted[base]) : sorted[base];
}
function skewness(a) {
  const n = a.length;
  if (n < 3) return NaN;
  const m = mean(a), s = sd(a);
  if (!s) return 0;
  return (n / ((n - 1) * (n - 2))) * sum(a.map(v => Math.pow((v - m) / s, 3)));
}
function ranks(a) {
  const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
  const r = new Array(a.length);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}
function pearson(x, y) {
  const n = x.length;
  if (n < 3) return NaN;
  const mx = mean(x), my = mean(y);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = x[i] - mx, b = y[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den ? num / den : NaN;
}
function spearman(x, y) { return pearson(ranks(x), ranks(y)); }
function corr(x, y) { return state.metric === 'spearman' ? spearman(x, y) : pearson(x, y); }
function rollingCorr(x, y, w) {
  const out = new Array(x.length).fill(null);
  for (let i = w - 1; i < x.length; i++) {
    out[i] = corr(x.slice(i - w + 1, i + 1), y.slice(i - w + 1, i + 1));
  }
  return out;
}
function rollingMean(a, w) {
  const out = new Array(a.length).fill(null);
  let acc = 0;
  for (let i = 0; i < a.length; i++) {
    acc += a[i];
    if (i >= w) acc -= a[i - w];
    if (i >= w - 1) out[i] = acc / w;
  }
  return out;
}
function maxDrawdown(v) {
  let peak = v[0], peakI = 0, dd = 0, ddPeakI = 0, ddTroughI = 0;
  for (let i = 1; i < v.length; i++) {
    if (v[i] > peak) { peak = v[i]; peakI = i; }
    const d = v[i] / peak - 1;
    if (d < dd) { dd = d; ddPeakI = peakI; ddTroughI = i; }
  }
  return { pct: dd, peakI, troughI: ddTroughI };
}

/* Filtros y tablas derivadas */
function filteredRows() {
  return SERIES.filter(r => r.fecha >= state.desde && r.fecha <= state.hasta);
}

/* Rendimientos logarítmicos diarios, solo pares lun–vie con 1 día de distancia */
function returnTable(rows) {
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r0 = rows[i - 1], r1 = rows[i];
    if (dayDiff(r0.fecha, r1.fecha) !== 1) continue;
    if (isWeekend(r0.fecha) || isWeekend(r1.fecha)) continue;
    out.push({
      fecha: r1.fecha,
      trm: Math.log(r1.trm / r0.trm),
      brent: Math.log(r1.brent / r0.brent),
      dxy: Math.log(r1.dxy / r0.dxy),
      us10y: Math.log(r1.us10y / r0.us10y)
    });
  }
  return out;
}

function computeKpis(rows) {
  const v = rows.map(r => r.trm);
  const n = v.length;
  const sorted = [...v].sort((a, b) => a - b);
  const m = mean(v), med = quantile(sorted, .5), q1 = quantile(sorted, .25), q3 = quantile(sorted, .75);
  const s = sd(v);
  let minI = 0, maxI = 0;
  v.forEach((x, i) => { if (x < v[minI]) minI = i; if (x > v[maxI]) maxI = i; });
  const last = v[n - 1], first = v[0];
  const prev = n > 1 ? v[n - 2] : null;
  const varPeriod = n > 1 ? last / first - 1 : 0;
  const rets = returnTable(rows);
  const trmRets = rets.map(r => r.trm);
  const volAnn = trmRets.length >= 3 ? sd(trmRets) * Math.sqrt(252) : NaN;
  const dd = n >= 2 ? maxDrawdown(v) : null;
  const bigDays = trmRets.filter(r => Math.abs(r) >= 0.015).length;
  return {
    n, m, med, q1, q3, s, skew: skewness(v),
    min: v[minI], minDate: rows[minI].fecha,
    max: v[maxI], maxDate: rows[maxI].fecha,
    last, lastDate: rows[n - 1].fecha, first, firstDate: rows[0].fecha,
    prev, varPeriod, volAnn, dd, bigDays
  };
}

/* ================= KPIs ================= */
function renderKpis(k, rows) {
  const el = document.getElementById('kpis');
  const d = k.prev != null ? { v: k.last - k.prev, p: (k.last / k.prev - 1) * 100 } : null;
  const cards = [
    {
      cls: 'kpi--hero', label: 'TRM más reciente', value: fmtCOP(k.last),
      sub: d
        ? `${fmtDate(k.lastDate)} · <span class="${d.p >= 0 ? 'neg' : 'pos'}">${d.v < 0 ? '−' : '+'}${nf2.format(Math.abs(d.v))} (${d.p < 0 ? '−' : '+'}${Math.abs(d.p).toFixed(2).replace('.', ',')}%) vs día anterior</span>`
        : fmtDate(k.lastDate)
    },
    {
      cls: '', label: 'Variación del período', value: fmtPct(k.varPeriod * 100),
      cls2: k.varPeriod < 0 ? 'pos' : 'neg',
      sub: `de ${fmtCOP(k.first)} a ${fmtCOP(k.last)} · ${k.n} días${k.varPeriod < 0 ? ' · peso se apreció' : ' · peso se depreció'}`
    },
    { cls: '', label: 'Promedio (media)', value: fmtCOP(k.m), sub: `${k.n} días observados · σ ${fmtCOP(k.s)}` },
    { cls: '', label: 'Mediana', value: fmtCOP(k.med), sub: `IQR ${fmtCOP(k.q3 - k.q1)} · Q1 ${fmtCOP0.format(k.q1)} / Q3 ${fmtCOP0.format(k.q3)}` },
    { cls: '', label: 'Mínimo del período', value: fmtCOP(k.min), sub: fmtDate(k.minDate) },
    { cls: '', label: 'Máximo del período', value: fmtCOP(k.max), sub: fmtDate(k.maxDate) },
    {
      cls: '', label: 'Volatilidad (σ diaria)', value: fmtCOP(k.s),
      sub: isFinite(k.volAnn) ? `≈ ${nf1.format(k.volAnn * 100)} % anualizado (×√252)` : 'muestra pequeña'
    },
    {
      cls: '', label: 'Caída máxima (drawdown)',
      value: k.dd ? fmtPct(k.dd.pct * 100) : '—',
      sub: k.dd ? `pico ${fmtDate(rows[k.dd.peakI].fecha)} → fondo ${fmtDate(rows[k.dd.troughI].fecha)}` : '—'
    }
  ];
  el.innerHTML = cards.map(c => `
    <div class="kpi ${c.cls}">
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value${c.cls2 ? ' ' + c.cls2 : ''}" style="${c.cls2 ? `color:var(--${c.cls2 === 'pos' ? 'up' : 'down'})` : ''}">${c.value}</div>
      <div class="kpi-sub">${c.sub}</div>
    </div>`).join('');
}

function renderMeta(rows) {
  document.getElementById('meta-periodo').textContent = `${fmtDate(rows[0].fecha)} — ${fmtDate(rows[rows.length - 1].fecha)}`;
  document.getElementById('meta-n').textContent = `${rows.length} días · ${state.metric === 'pearson' ? 'Pearson' : 'Spearman'}`;
  document.getElementById('ev-var').textContent = fmtPct(computeKpis(rows).varPeriod * 100);
}

/* ================= Gráficas ================= */
const AXIS = '#93a5b8', SPLIT = '#eaf1f7', INK = '#152433', MUTED = '#64778c';
const charts = {};
let chartsReady = false;

function tooltipStyle() {
  return {
    backgroundColor: '#ffffff', borderColor: '#dfe9f2', borderWidth: 1,
    padding: [10, 14], extraCssText: 'box-shadow:0 10px 28px -10px rgba(21,36,51,.28);border-radius:10px;',
    textStyle: { color: INK, fontSize: 12, fontFamily: 'Open Sans' }
  };
}
function messageOption(title, sub) {
  return {
    title: {
      text: title, subtext: sub, left: 'center', top: 'middle',
      textStyle: { color: '#93a5b8', fontSize: 14, fontWeight: 500, fontFamily: 'Open Sans' },
      subtextStyle: { color: '#93a5b8', fontSize: 12, fontFamily: 'Open Sans' }
    }
  };
}

function aggregate(rows, gran) {
  if (gran === 'diaria') {
    return {
      x: rows.map(r => r.fecha),
      trm: rows.map(r => r.trm),
      aux: { brent: rows.map(r => r.brent), dxy: rows.map(r => r.dxy), us10y: rows.map(r => r.us10y) }
    };
  }
  const groups = [];
  let cur = null;
  rows.forEach(r => {
    let key;
    if (gran === 'mensual') {
      key = r.fecha.slice(0, 7);
    } else {
      const d = new Date(pdate(r.fecha));
      const day = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() - (day - 1));
      key = d.toISOString().slice(0, 10);
    }
    if (!cur || cur.key !== key) { cur = { key, rows: [] }; groups.push(cur); }
    cur.rows.push(r);
  });
  const lastOf = (g, k) => {
    for (let i = g.rows.length - 1; i >= 0; i--) if (g.rows[i][k] != null) return g.rows[i][k];
    return null;
  };
  return {
    x: groups.map(g => gran === 'mensual' ? fmtMonthKey(g.key) : fmtDate(g.rows[0].fecha)),
    trm: groups.map(g => lastOf(g, 'trm')),
    aux: {
      brent: groups.map(g => lastOf(g, 'brent')),
      dxy: groups.map(g => lastOf(g, 'dxy')),
      us10y: groups.map(g => lastOf(g, 'us10y'))
    }
  };
}

/* ---------- 1. Evolución ---------- */
function buildEvol(rows) {
  if (rows.length < 2) return messageOption('Selecciona un rango con al menos 2 días', 'usa los filtros de fecha');
  const { x, trm, aux } = aggregate(rows, state.gran);
  const isIndex = state.view === 'indice';
  const k = computeKpis(rows);
  const norm = arr => {
    const b = arr.find(v => v != null);
    return arr.map(v => v == null ? null : v / b * 100);
  };
  const trmData = isIndex ? norm(trm) : trm;
  const showSym = rows.length <= 21;

  const series = [];
  const trmS = {
    __key: 'trm', name: VARS.trm.short, type: 'line', data: trmData,
    symbol: showSym ? 'circle' : 'none', symbolSize: 6,
    lineStyle: { width: 2.6, color: VARS.trm.color },
    itemStyle: { color: VARS.trm.color },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(44,149,230,.16)' },
          { offset: 1, color: 'rgba(44,149,230,0)' }
        ]
      }
    },
    emphasis: { focus: 'series' }, z: 10
  };
  if (state.gran === 'diaria' && !isIndex) {
    trmS.markPoint = {
      symbol: 'pin', symbolSize: 46,
      label: { fontSize: 10, fontWeight: 600, fontFamily: 'Poppins', color: '#fff' },
      data: [
        { type: 'max', name: 'Máx', value: k.max, itemStyle: { color: '#e8590c' } },
        { type: 'min', name: 'Mín', value: k.min, itemStyle: { color: '#0ca678' } }
      ]
    };
    trmS.markLine = {
      symbol: 'none',
      lineStyle: { type: 'dotted', color: '#93a5b8', width: 1.2 },
      label: { formatter: `Mediana ${nfCOP.format(k.med)}`, position: 'insideEndTop', color: MUTED, fontSize: 10.5 },
      data: [{ type: 'median', name: 'Mediana' }]
    };
  }
  series.push(trmS);

  if (state.gran === 'diaria' && !isIndex && trm.length >= 8) {
    series.push({
      name: 'Media móvil 7d', type: 'line', data: rollingMean(trm, 7),
      symbol: 'none', lineStyle: { width: 1.6, type: 'dashed', color: '#5c7186' },
      emphasis: { focus: 'series' }, z: 9
    });
  }

  const yAxes = [{
    type: 'value', scale: true,
    name: isIndex ? 'Índice (inicio = 100)' : 'COP',
    nameTextStyle: { color: '#93a5b8', fontSize: 11, align: 'left' },
    axisLabel: {
      color: AXIS, fontSize: 11,
      formatter: isIndex ? v => nf1.format(v) : v => nfCOP0.format(v)
    },
    splitLine: { lineStyle: { color: SPLIT } }
  }];

  let ai = 0;
  AUX.forEach(key => {
    if (!state.aux.has(key)) return;
    const data = isIndex ? norm(aux[key]) : aux[key];
    const s = {
      __key: key, name: VARS[key].short, type: 'line', data,
      symbol: showSym ? 'circle' : 'none', symbolSize: 5,
      lineStyle: { width: 2, color: VARS[key].color },
      itemStyle: { color: VARS[key].color },
      emphasis: { focus: 'series' }, z: 5
    };
    if (!isIndex) {
      s.yAxisIndex = 1 + ai;
      yAxes.push({ type: 'value', scale: true, show: false });
      ai++;
    }
    series.push(s);
  });

  document.getElementById('evol-note').textContent =
    `Mín ${fmtCOP(k.min)} (${fmtDate(k.minDate)}) · Máx ${fmtCOP(k.max)} (${fmtDate(k.maxDate)}) · Mediana ${fmtCOP(k.med)} · Media ${fmtCOP(k.m)}` +
    (state.gran === 'diaria' ? ' · Media móvil: 7 días' : '') +
    (isIndex ? ' · Escala índice: el primer valor de la selección = 100' : '');

  return {
    color: KEYS.map(k2 => VARS[k2].color),
    grid: { left: 10, right: 16, top: 42, bottom: 6, containLabel: true },
    legend: {
      top: 0, left: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 3, itemGap: 16,
      textStyle: { color: MUTED, fontSize: 12, fontFamily: 'Open Sans' }
    },
    xAxis: {
      type: 'category', data: x, boundaryGap: false,
      axisLine: { lineStyle: { color: '#dfe9f2' } }, axisTick: { show: false },
      axisLabel: {
        color: AXIS, fontSize: 11, hideOverlap: true,
        formatter: state.gran === 'diaria' ? v => fmtDate(v) : v => v
      }
    },
    yAxis: yAxes,
    dataZoom: [{ type: 'inside', throttle: 60 }],
    tooltip: {
      trigger: 'axis', ...tooltipStyle(),
      axisPointer: { type: 'line', lineStyle: { color: '#cfe0ef' } },
      formatter: params => {
        if (!params.length) return '';
        const raw = (state.gran === 'diaria' ? params[0].axisValue : params[0].axisValue);
        let html = `<div style="font-family:Poppins;font-weight:600;margin-bottom:5px">${state.gran === 'diaria' ? fmtDate(raw) : raw}</div>`;
        params.forEach(p => {
          if (p.value == null || !isFinite(p.value)) return;
          const key = p.series.__key;
          const val = isIndex
            ? nf1.format(p.value) + ' pts'
            : (key && key !== 'trm' ? nf2.format(p.value) + ' ' + VARS[key].unit : nfCOP.format(p.value) + ' COP');
          html += `<div style="display:flex;align-items:center;gap:7px;margin-top:3px">
            <span style="width:9px;height:9px;border-radius:3px;background:${p.color};flex:0 0 auto"></span>
            <span style="color:${MUTED}">${p.seriesName}</span>
            <span style="margin-left:auto;font-weight:600;color:${INK};padding-left:18px">${val}</span></div>`;
        });
        return html;
      }
    },
    series
  };
}

/* ---------- 2. Histograma ---------- */
function buildHist(rows) {
  const vals = rows.map(r => r.trm);
  if (vals.length < 5) return messageOption('Muestra pequeña para el histograma', 'selecciona al menos 5 días');
  const sorted = [...vals].sort((a, b) => a - b);
  const lo = sorted[0], hi = sorted[vals.length - 1];
  const m = mean(vals), s = sd(vals), med = quantile(sorted, .5);

  let binW = 1;
  if (hi > lo) {
    const nB = Math.max(6, Math.min(16, Math.round(Math.sqrt(vals.length) * 1.4)));
    const raw = (hi - lo) / nB;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    binW = [1, 2, 2.5, 5, 10].map(x => x * pow).find(v => v >= raw) || 10 * pow;
  }
  const start = Math.floor(lo / binW) * binW;
  const edges = [];
  for (let e = start; e < hi + 1e-9; e += binW) edges.push(e);
  edges.push(edges[edges.length - 1] + binW);
  const counts = new Array(edges.length - 1).fill(0);
  vals.forEach(v => { counts[Math.min(edges.length - 2, Math.floor((v - start) / binW))]++; });
  const labels = counts.map((_, i) => nfCOP0.format(edges[i] + binW / 2));

  const pdf = x => Math.exp(-Math.pow(x - m, 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
  const curve = edges.slice(0, -1).map(c => (isFinite(s) && s > 0 ? pdf(c) * vals.length * binW : null));

  const idxM = Math.max(0, Math.min(counts.length - 1, Math.round((m - start - binW / 2) / binW)));
  const idxMd = Math.max(0, Math.min(counts.length - 1, Math.round((med - start - binW / 2) / binW)));

  document.getElementById('hist-note').textContent =
    `Media ${fmtCOP(m)} · Mediana ${fmtCOP(med)} · σ ${fmtCOP(s)} · Sesgo ${isFinite(skewness(vals)) ? nf2.format(skewness(vals)) : '—'} (negativo = cola larga hacia la izquierda)`;

  return {
    grid: { left: 10, right: 14, top: 36, bottom: 6, containLabel: true },
    legend: {
      top: 0, left: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 3, itemGap: 14,
      textStyle: { color: MUTED, fontSize: 12, fontFamily: 'Open Sans' }
    },
    xAxis: {
      type: 'category', data: labels,
      axisLine: { lineStyle: { color: '#dfe9f2' } }, axisTick: { show: false },
      axisLabel: { color: AXIS, fontSize: 10.5, interval: 'auto', hideOverlap: true }
    },
    yAxis: {
      type: 'value', name: 'Días',
      nameTextStyle: { color: '#93a5b8', fontSize: 11, align: 'left' },
      axisLabel: { color: AXIS, fontSize: 11 },
      splitLine: { lineStyle: { color: SPLIT } }
    },
    tooltip: {
      trigger: 'axis', ...tooltipStyle(),
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(44,149,230,.06)' } },
      formatter: params => {
        const p = params[0];
        const i = p.dataIndex;
        return `<div style="font-family:Poppins;font-weight:600;margin-bottom:4px">Entre ${nfCOP0.format(edges[i])} y ${nfCOP0.format(edges[i + 1])} COP</div>
          <div style="color:${MUTED}">Días: <strong style="color:${INK}">${counts[i]}</strong></div>`;
      }
    },
    series: [
      {
        name: 'Frecuencia', type: 'bar', data: counts, barMaxWidth: 44,
        itemStyle: { color: 'rgba(44,149,230,.72)', borderRadius: [5, 5, 0, 0] },
        markLine: {
          symbol: 'none',
          data: [
            {
              xAxis: labels[idxM],
              lineStyle: { color: INK, type: 'solid', width: 1.6 },
              label: { formatter: 'Media', position: 'insideEndTop', color: INK, fontSize: 10.5, fontWeight: 600 }
            },
            {
              xAxis: labels[idxMd],
              lineStyle: { color: '#0ca678', type: 'solid', width: 1.6 },
              label: { formatter: 'Mediana', position: 'insideEndBottom', color: '#0ca678', fontSize: 10.5, fontWeight: 600 }
            }
          ]
        }
      },
      {
        name: 'Normal (ajuste)', type: 'line', data: curve, symbol: 'none',
        lineStyle: { width: 2.2, color: INK }, itemStyle: { color: INK }, z: 10
      }
    ]
  };
}

/* ---------- 3. Box por mes ---------- */
function buildBox(rows) {
  if (rows.length < 3) return messageOption('Muestra pequeña para el boxplot', 'selecciona al menos 3 días');
  const groups = [];
  let cur = null;
  rows.forEach(r => {
    const key = r.fecha.slice(0, 7);
    if (!cur || cur.key !== key) { cur = { key, vals: [] }; groups.push(cur); }
    cur.vals.push(r.trm);
  });
  const cats = groups.map(g => fmtMonthKey(g.key));
  const stats = groups.map(g => {
    const srt = [...g.vals].sort((a, b) => a - b);
    return {
      min: srt[0], q1: quantile(srt, .25), med: quantile(srt, .5),
      q3: quantile(srt, .75), max: srt[srt.length - 1], n: srt.length
    };
  });

  document.getElementById('box-note').textContent =
    `${groups.length} mes(es) en la selección · cada caja resume los días hábiles de su mes`;

  return {
    grid: { left: 10, right: 14, top: 26, bottom: 6, containLabel: true },
    xAxis: {
      type: 'category', data: cats,
      axisLine: { lineStyle: { color: '#dfe9f2' } }, axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: 11.5, fontFamily: 'Poppins', fontWeight: 600 }
    },
    yAxis: {
      type: 'value', scale: true,
      axisLabel: { color: AXIS, fontSize: 11, formatter: v => nfCOP0.format(v) },
      splitLine: { lineStyle: { color: SPLIT } }
    },
    tooltip: {
      trigger: 'item', ...tooltipStyle(),
      formatter: p => {
        if (p.seriesType === 'scatter') {
          return `<div style="font-family:Poppins;font-weight:600">${cats[p.dataIndex]}</div>Mediana: <strong>${nfCOP.format(p.value)} COP</strong>`;
        }
        const d = p.data;
        return `<div style="font-family:Poppins;font-weight:600;margin-bottom:4px">${cats[p.dataIndex]} <span style="color:${MUTED};font-weight:400">(${stats[p.dataIndex].n} días)</span></div>
          <div style="color:${MUTED}">Máx: <strong style="color:${INK}">${nfCOP.format(d[4])}</strong></div>
          <div style="color:${MUTED}">Q3: <strong style="color:${INK}">${nfCOP.format(d[3])}</strong></div>
          <div style="color:${MUTED}">Mediana: <strong style="color:${INK}">${nfCOP.format(d[2])}</strong></div>
          <div style="color:${MUTED}">Q1: <strong style="color:${INK}">${nfCOP.format(d[1])}</strong></div>
          <div style="color:${MUTED}">Mín: <strong style="color:${INK}">${nfCOP.format(d[0])}</strong></div>`;
      }
    },
    series: [
      {
        name: 'TRM', type: 'boxplot',
        data: stats.map(s => [s.min, s.q1, s.med, s.q3, s.max]),
        itemStyle: { color: 'rgba(44,149,230,.14)', borderColor: VARS.trm.color, borderWidth: 1.8 },
        boxWidth: ['26%', '44%']
      },
      {
        name: 'Mediana', type: 'scatter', symbol: 'diamond', symbolSize: 9,
        data: stats.map(s => s.med),
        itemStyle: { color: INK }, z: 10, silent: false
      }
    ]
  };
}

/* ---------- 4. Mapa de calor ---------- */
function buildHeat(rows) {
  const rets = returnTable(rows);
  if (rets.length < 10) {
    return messageOption('Ventana muy corta para correlación', 'se necesitan al menos 10 días hábiles consecutivos en la selección');
  }
  const arrs = {};
  KEYS.forEach(k => arrs[k] = rets.map(r => r[k]));
  const data = [];
  for (let i = 0; i < KEYS.length; i++) {
    for (let j = 0; j < KEYS.length; j++) {
      const v = i === j ? 1 : corr(arrs[KEYS[i]], arrs[KEYS[j]]);
      data.push([j, i, +v.toFixed(4)]);
    }
  }
  const names = KEYS.map(k => VARS[k].short);

  document.getElementById('heat-note').textContent =
    `${state.metric === 'pearson' ? 'Pearson' : 'Spearman'} sobre rendimientos diarios (log) · n = ${rets.length} días hábiles · azul = se mueven juntos, naranja = en sentido contrario`;

  return {
    grid: { left: 8, right: 8, top: 8, bottom: 66, containLabel: true },
    xAxis: {
      type: 'category', data: names, position: 'top',
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: 11.5, fontFamily: 'Poppins', fontWeight: 600, margin: 12 }
    },
    yAxis: {
      type: 'category', data: names,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: MUTED, fontSize: 11.5, fontFamily: 'Poppins', fontWeight: 600 }
    },
    visualMap: {
      min: -1, max: 1, calculable: false,
      orient: 'horizontal', left: 'center', bottom: 2,
      itemWidth: 150, itemHeight: 10,
      text: ['Mismo sentido', 'Contrario'], textStyle: { color: MUTED, fontSize: 10.5 },
      inRange: { color: ['#e8590c', '#f7e8dd', '#f2f7fb', '#2c95e6'] }
    },
    tooltip: {
      ...tooltipStyle(),
      formatter: p => {
        const [j, i, v] = p.value;
        return `<div style="font-family:Poppins;font-weight:600;margin-bottom:3px">${names[i]} × ${names[j]}</div>
          ${state.metric === 'pearson' ? 'r de Pearson' : 'ρ de Spearman'}: <strong>${nf2.format(v)}</strong>`;
      }
    },
    series: [{
      type: 'heatmap', data,
      label: {
        show: true, fontSize: 12.5, fontFamily: 'Poppins', fontWeight: 600,
        formatter: p => p.value[2].toFixed(2).replace('.', ','),
        color: p => (Math.abs(p.value[2]) > 0.55 ? '#fff' : INK)
      },
      itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 6 },
      emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(21,36,51,.25)' } }
    }]
  };
}

/* ---------- 5. Dispersa de pares ---------- */
function buildScat(rows) {
  const rets = returnTable(rows);
  const info = document.getElementById('scat-info');
  if (rets.length < 10) {
    info.textContent = 'ventana corta';
    return messageOption('Ventana muy corta para la dispersa', 'se necesitan al menos 10 días hábiles consecutivos');
  }
  const xk = state.scatX, yk = state.scatY;
  const x = rets.map(r => r[xk] * 100);
  const y = rets.map(r => r[yk] * 100);
  const r = corr(x, y);
  info.textContent = `r = ${nf2.format(r)} · R² = ${nf2.format(r * r)} · n = ${x.length}`;

  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0;
  for (let i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += Math.pow(x[i] - mx, 2); }
  const b = sxx ? sxy / sxx : 0, a = my - b * mx;
  const xmin = Math.min(...x), xmax = Math.max(...x);
  const pad = (xmax - xmin) * 0.04 || 0.5;

  const points = rets.map((r2, i) => ({ value: [x[i], y[i]], fecha: r2.fecha }));

  return {
    grid: { left: 10, right: 16, top: 30, bottom: 8, containLabel: true },
    xAxis: {
      type: 'value', scale: true,
      name: VARS[xk].short, nameLocation: 'middle', nameGap: 26,
      nameTextStyle: { color: MUTED, fontSize: 11, fontWeight: 600 },
      axisLabel: { color: AXIS, fontSize: 11, formatter: v => nf1.format(v) + '%' },
      splitLine: { lineStyle: { color: SPLIT } }
    },
    yAxis: {
      type: 'value', scale: true,
      name: VARS[yk].short, nameLocation: 'middle', nameGap: 40,
      nameTextStyle: { color: MUTED, fontSize: 11, fontWeight: 600 },
      axisLabel: { color: AXIS, fontSize: 11, formatter: v => nf1.format(v) + '%' },
      splitLine: { lineStyle: { color: SPLIT } }
    },
    tooltip: {
      ...tooltipStyle(),
      formatter: p => {
        if (p.seriesType === 'line') return '';
        const d = p.data;
        return `<div style="font-family:Poppins;font-weight:600">${fmtDate(d.fecha)}</div>
          <div style="color:${MUTED}">${VARS[xk].short}: <strong style="color:${INK}">${nf2.format(d.value[0])}%</strong></div>
          <div style="color:${MUTED}">${VARS[yk].short}: <strong style="color:${INK}">${nf2.format(d.value[1])}%</strong></div>`;
      }
    },
    series: [
      {
        name: 'Días', type: 'scatter', data: points, symbolSize: 7,
        itemStyle: { color: 'rgba(44,149,230,.45)' },
        emphasis: { itemStyle: { color: VARS.trm.color } }
      },
      {
        name: 'Ajuste', type: 'line', silent: true, symbol: 'none',
        data: [[xmin - pad, a + b * (xmin - pad)], [xmax + pad, a + b * (xmax + pad)]],
        lineStyle: { width: 2, color: INK }, itemStyle: { color: INK }
      }
    ]
  };
}

/* ---------- 6. Correlación móvil ---------- */
function buildRoll(rows) {
  const rets = returnTable(rows);
  const w = state.rollWin;
  if (rets.length < w + 5) {
    return messageOption('Ventana corta para la correlación móvil', `se necesitan al menos ${w + 5} días hábiles consecutivos`);
  }
  const x = rets.map(r => r.fecha);
  const t = rets.map(r => r.trm);
  const series = AUX.map(key => ({
    __key: key,
    name: VARS[key].short, type: 'line', symbol: 'none',
    lineStyle: { width: 2, color: VARS[key].color },
    itemStyle: { color: VARS[key].color },
    data: rollingCorr(t, rets.map(r => r[key]), w),
    emphasis: { focus: 'series' }
  }));

  document.getElementById('roll-note').textContent =
    `Ventana móvil de ${w} días hábiles (medida: ${state.metric === 'pearson' ? 'Pearson' : 'Spearman'}) · las primeras observaciones no tienen ventana completa`;

  return {
    color: AUX.map(k => VARS[k].color),
    grid: { left: 10, right: 16, top: 38, bottom: 6, containLabel: true },
    legend: {
      top: 0, left: 0, icon: 'roundRect', itemWidth: 14, itemHeight: 3, itemGap: 16,
      textStyle: { color: MUTED, fontSize: 12, fontFamily: 'Open Sans' }
    },
    xAxis: {
      type: 'category', data: x, boundaryGap: false,
      axisLine: { lineStyle: { color: '#dfe9f2' } }, axisTick: { show: false },
      axisLabel: { color: AXIS, fontSize: 11, hideOverlap: true, formatter: v => fmtDate(v) }
    },
    yAxis: {
      type: 'value', min: -1, max: 1,
      axisLabel: { color: AXIS, fontSize: 11, formatter: v => nf1.format(v) },
      splitLine: { lineStyle: { color: SPLIT } }
    },
    dataZoom: [{ type: 'inside', throttle: 60 }],
    tooltip: {
      trigger: 'axis', ...tooltipStyle(),
      axisPointer: { type: 'line', lineStyle: { color: '#cfe0ef' } },
      valueFormatter: v => (v == null ? '—' : nf2.format(v)),
      formatter: params => {
        if (!params.length) return '';
        let html = `<div style="font-family:Poppins;font-weight:600;margin-bottom:5px">al ${fmtDate(params[0].axisValue)}</div>`;
        params.forEach(p => {
          if (p.value == null) return;
          html += `<div style="display:flex;align-items:center;gap:7px;margin-top:3px">
            <span style="width:9px;height:9px;border-radius:3px;background:${p.color};flex:0 0 auto"></span>
            <span style="color:${MUTED}">TRM × ${p.seriesName}</span>
            <span style="margin-left:auto;font-weight:600;color:${INK};padding-left:18px">${nf2.format(p.value)}</span></div>`;
        });
        return html;
      }
    },
    series: series.map(s => ({
      ...s,
      markLine: s === series[0] ? {
        symbol: 'none', silent: true,
        lineStyle: { type: 'dashed', color: '#b9c9d9', width: 1.2 },
        label: { show: false },
        data: [{ yAxis: 0 }]
      } : undefined
    }))
  };
}

/* ================= Orquestación ================= */
function renderCharts(rows) {
  if (!chartsReady) return;
  const builders = {
    evol: () => buildEvol(rows),
    hist: () => buildHist(rows),
    box: () => buildBox(rows),
    heat: () => buildHeat(rows),
    scat: () => buildScat(rows),
    roll: () => buildRoll(rows)
  };
  Object.keys(builders).forEach(id => {
    charts[id].setOption(builders[id](), { notMerge: true });
  });
}

function renderAll() {
  let rows = filteredRows();
  if (rows.length < 1) {
    state.desde = META.desde; state.hasta = META.hasta;
    syncDateInputs();
    rows = filteredRows();
  }
  const k = computeKpis(rows);
  renderKpis(k, rows);
  renderMeta(rows);
  document.getElementById('ev-dd').textContent = k.dd ? fmtPct(k.dd.pct * 100) : '—';
  document.getElementById('ev-dias2').textContent = `${k.bigDays} ${k.bigDays === 1 ? 'día' : 'días'}`;
  document.getElementById('ev-vol').textContent =
    isFinite(k.volAnn)
      ? `${fmtCOP(k.s)} COP por día (≈ ${nf1.format(k.volAnn * 100)} % anualizado)`
      : 'muestra pequeña';
  renderCharts(rows);
}

function initCharts() {
  ['evol', 'hist', 'box', 'heat', 'scat', 'roll'].forEach(id => {
    charts[id] = echarts.init(document.getElementById('chart-' + id));
  });
  chartsReady = true;
  let t = null;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => Object.values(charts).forEach(c => c.resize()), 120);
  });
  // Re-render cuando terminan de cargar las fuentes Google para que el texto
  // de los ejes use Poppins/Open Sans desde el primer vistazo.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (chartsReady) Object.values(charts).forEach(c => c.resize());
    });
  }
}

/* ================= Filtros UI ================= */
function syncDateInputs() {
  document.getElementById('f-desde').value = state.desde;
  document.getElementById('f-hasta').value = state.hasta;
}

function presetRange(preset) {
  const last = META.hasta;
  if (preset === '1m') return [Math.max(META.desde, addDaysISO(last, -30)), last];
  if (preset === '3m') return [Math.max(META.desde, addDaysISO(last, -91)), last];
  if (preset === 'mes') {
    const m = last.slice(0, 7);
    return [Math.max(META.desde, m + '-01'), last];
  }
  return [META.desde, last];
}

function syncPresetChips() {
  document.querySelectorAll('#chips-periodo .chip').forEach(ch => {
    const [a, b] = presetRange(ch.dataset.preset);
    ch.classList.toggle('is-active', a === state.desde && b === state.hasta);
  });
}

function setSeg(id, value) {
  document.querySelectorAll(`#${id} .seg-btn`).forEach(b => {
    b.classList.toggle('is-active', b.dataset.v === value);
  });
}

function syncControls() {
  syncDateInputs();
  syncPresetChips();
  setSeg('seg-gran', state.gran);
  setSeg('seg-view', state.view);
  setSeg('seg-metric', state.metric);
  document.querySelectorAll('#chips-vars .chip').forEach(ch => {
    ch.classList.toggle('is-active', state.aux.has(ch.dataset.var));
  });
  document.getElementById('sel-roll').value = String(state.rollWin);
  document.getElementById('sel-scatx').value = state.scatX;
  document.getElementById('sel-scaty').value = state.scatY;
}

function wireFilters() {
  const desde = document.getElementById('f-desde');
  const hasta = document.getElementById('f-hasta');
  desde.min = hasta.min = META.desde;
  desde.max = hasta.max = META.hasta;

  document.querySelectorAll('#chips-periodo .chip').forEach(ch => {
    ch.addEventListener('click', () => {
      const [a, b] = presetRange(ch.dataset.preset);
      state.desde = a; state.hasta = b;
      syncDateInputs();
      renderAll();
    });
  });

  function onDate() {
    let a = desde.value, b = hasta.value;
    if (!a || !b) return;
    if (a > b) { [a, b] = [b, a]; syncDateInputs(); }
    state.desde = a; state.hasta = b;
    renderAll();
  }
  desde.addEventListener('change', onDate);
  hasta.addEventListener('change', onDate);

  document.querySelectorAll('#seg-gran .seg-btn').forEach(b => b.addEventListener('click', () => {
    state.gran = b.dataset.v; setSeg('seg-gran', state.gran); renderAll();
  }));
  document.querySelectorAll('#seg-view .seg-btn').forEach(b => b.addEventListener('click', () => {
    state.view = b.dataset.v; setSeg('seg-view', state.view); renderAll();
  }));
  document.querySelectorAll('#seg-metric .seg-btn').forEach(b => b.addEventListener('click', () => {
    state.metric = b.dataset.v; setSeg('seg-metric', state.metric); renderAll();
  }));

  document.querySelectorAll('#chips-vars .chip').forEach(ch => ch.addEventListener('click', () => {
    const v = ch.dataset.var;
    if (state.aux.has(v)) state.aux.delete(v); else state.aux.add(v);
    ch.classList.toggle('is-active', state.aux.has(v));
    renderAll();
  }));

  document.getElementById('sel-roll').addEventListener('change', e => {
    state.rollWin = +e.target.value; renderAll();
  });
  document.getElementById('sel-scatx').addEventListener('change', e => {
    state.scatX = e.target.value; renderAll();
  });
  document.getElementById('sel-scaty').addEventListener('change', e => {
    state.scatY = e.target.value; renderAll();
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    state.desde = DEFAULTS.desde; state.hasta = DEFAULTS.hasta;
    state.gran = DEFAULTS.gran; state.view = DEFAULTS.view;
    state.aux = new Set(DEFAULTS.aux);
    state.metric = DEFAULTS.metric; state.rollWin = DEFAULTS.rollWin;
    state.scatX = DEFAULTS.scatX; state.scatY = DEFAULTS.scatY;
    syncControls();
    renderAll();
  });
}

/* ================= Inicio ================= */
function startCharts() {
  if (chartsReady) return;
  initCharts();
  renderAll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.echarts) startCharts();
  });
} else {
  if (window.echarts) startCharts();
}
window.addEventListener('echarts:ready', () => { if (window.echarts) startCharts(); }, { once: true });
