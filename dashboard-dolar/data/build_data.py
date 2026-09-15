#!/usr/bin/env python3
"""
build_data.py — Unifica las series crudas de data/raw/ en data/datos.js (y datos.json).

Fuentes (descargadas 2026-09-15):
  - TRM oficial USD/COP  : Superintendencia Financiera, via datos.gov.co (dataset mcec-87by)
  - Brent USD/bbl        : FRED / EIA  (DCOILBRENTEU)
  - Indice dolar (broad) : FRED / BIS  (DTWEXBGS)
  - Tasa 10 anos EE.UU.  : FRED        (DGS10)

La parrilla de fechas son los dias habiles con TRM (lo que en Colombia se
considera "un dia de dolar"). Las demas series se alinean por fecha y se
rellenan hacia adelante (ffill) cuando FRED tiene huecos de publicacion.
"""
import csv, json, os

HERE = os.path.dirname(os.path.abspath(__file__))

def read_csv(name):
    rows = []
    with open(os.path.join(HERE, "raw", name), newline="", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            v = r[list(r)[1]].strip()
            rows.append((r[list(r)[0]].strip(), float(v) if v else None))
    return rows

trm = read_csv("trm.csv")        # grilla: (fecha, valor)
brent_raw = read_csv("brent.csv")
dxy_raw = read_csv("dxy.csv")
us10y_raw = read_csv("us10y.csv")

def ffill_lookup(rows, fecha):
    """Ultimo valor publicado en `fecha` o antes (cubre sabados de TRM y huecos)."""
    best = None
    for d, v in rows:  # rows ya vienen ordenadas por fecha
        if d > fecha:
            break
        if v is not None:
            best = v
    return best

brent_m = {d: ffill_lookup(brent_raw, d) for d, _ in trm}
dxy_m = {d: ffill_lookup(dxy_raw, d) for d, _ in trm}
us10y_m = {d: ffill_lookup(us10y_raw, d) for d, _ in trm}

series = []
for fecha, trm_v in trm:
    series.append({
        "fecha": fecha,
        "trm": round(trm_v, 2),
        "brent": brent_m.get(fecha),
        "dxy": round(dxy_m[fecha], 4) if dxy_m.get(fecha) is not None else None,
        "us10y": us10y_m.get(fecha),
    })

# sanity: no deben quedar huecos
missing = [s["fecha"] for s in series if any(s[k] is None for k in ("brent", "dxy", "us10y"))]
assert not missing, f"valores faltantes en: {missing[:5]}"

meta = {
    "nombre": "Dolar en Colombia — ultimos 6 meses",
    "moneda_principal": "COP",
    "serie_principal": "TRM (Tasa Representativa del Mercado), fijada por la Superintendencia Financiera",
    "desde": series[0]["fecha"],
    "hasta": series[-1]["fecha"],
    "n": len(series),
    "generado": "2026-09-15",
    "fuentes": {
        "trm": "Superintendencia Financiera de Colombia via datos.gov.co (mcec-87by)",
        "brent": "FRED / EIA — DCOILBRENTEU (petroleo Brent, USD por barril)",
        "dxy": "FRED / BIS — DTWEXBGS (indice amplio del dolar estadounidense)",
        "us10y": "FRED — DGS10 (tasa de interes a 10 anos, EE.UU., %)",
    },
    "notas": "Parrilla de dias habiles colombianos (fecha de vigencia de la TRM). Huecos de FRED rellenados hacia adelante. La TRM del fin de semana aplica la ultima tasa fija.",
}

data = {"meta": meta, "series": series}

with open(os.path.join(HERE, "datos.json"), "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

with open(os.path.join(HERE, "datos.js"), "w", encoding="utf-8") as f:
    f.write("/* Generado por build_data.py — no editar a mano. */\n")
    f.write("window.DATOS = ")
    json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    f.write(";\n")

# Resumen rapido para validar
vals = [s["trm"] for s in series]
import statistics
print(f"rows={len(series)}  {meta['desde']} .. {meta['hasta']}")
print(f"TRM: min={min(vals):.2f} max={max(vals):.2f} mean={statistics.mean(vals):.2f} median={statistics.median(vals):.2f}")
print(f"Brent ultimo={series[-1]['brent']}  DXY ultimo={series[-1]['dxy']}  US10Y ultimo={series[-1]['us10y']}")
print(f"Variacion TRM: {(vals[-1]/vals[0]-1)*100:+.2f}%")
