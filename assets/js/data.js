/* ==========================================================================
   DEFRULE MUSIC — Catálogo de productos (investigado en línea, sep 2026)   Precios base en USD (street price USA). convertidos a COP en runtime:
   cop = usd *fx*importeFactor (ver CONFIG). editable aquí.   ========================================================================== */

const CONFIG = {
  store: {
    name: 'DEFRULE MUSIC',
    city: 'Bogotá, Colombia',
    whatsapp: '573219585712',            // wa.me — sin + ni espacios
    whatsappVisible: '+57 321 958 5712',
    email: 'hola@defrulemusic.co',
    address: 'Cra 13 # 45-20, Chapinero, Bogotá',
    hours: 'Lun–Sáb · 9:00 a. m. – 7:00 p. m.',
    ig: '@defrulemusic'
  },
  // TRM sep/2026 ≈ 3.116 COP/USD + arancel/IVA/margen de importación
  fx: 3116,
  importFactor: 1.35,

  welcomeDiscount: 10 // % primera compra (estético)
};

/* ---------- helpers de precio ---------- */
function usdToCop(usd){ return Math.round((usd * CONFIG.fx * CONFIG.importFactor) / 1000) * 1000; }
function moneyCOP(cop){ return '$' + cop.toLocaleString('es-CO'); }
function discountOf(p){ return p.was ? Math.round((1 - p.usd / p.was) * 100) : 0; }
function priceOf(p){ return { cop: usdToCop(p.usd), wasCop: p.was ? usdToCop(p.was) : null, disc: discountOf(p) }; }

/* ---------- CATÁLOGO ---------- */
/* cat: guitarras | percusion | accesorios
   imgs: 3 fotos por producto (assets/img)                          */
const PRODUCTS = [

  /* ============ GUITARRAS ELÉCTRICAS (13) ============ */
  {
    id:'g1', cat:'guitarras', brand:'Fender', name:'Fender Player II Stratocaster',
    usd:849.99, was:949.99, rating:4.9, reviews:128,
    imgs:['assets/img/g1-1.jpg','assets/img/g1-2.jpg','assets/img/g1-3.jpg'],
    short:'El clásico de clásicos: cuerpo de alder, trío de single-coils Alnico V y trémolo de 2 puntos, listo para cualquier escenario.',
    specs:['Cuerpo de alder','Mástil maple Modern C','3× single-coil Alnico V','22 trastes medium jumbo','Trémolo 2 puntos'],
    table:{'Cuerpo':'Alder','Mástil':'Maple, perfil Modern C','Diapasón':'Palisandro / maple, radio 9.5"','Trastes':'22 medium jumbo','Pastillas':'3× Player Series Alnico V','Puente':'Trémolo 2 puntos','Escala':'25.5"'}
  },
  {
    id:'g2', cat:'guitarras', brand:'Fender', name:'Fender Player II Telecaster HH',
    usd:879.99, was:999.99, rating:4.8, reviews:96,
    imgs:['assets/img/g2-1.jpg','assets/img/g2-2.jpg','assets/img/g2-3.jpg'],
    short:'Twang Tele con doble humbucker: más cuerpo y pegada para rock, blues y country moderno.',
    specs:['Cuerpo de alder','2× humbucker Player II','Mástil Modern C','22 trastes medium jumbo'],
    table:{'Cuerpo':'Alder','Mástil':'Maple, Modern C','Diapasón':'Maple / palisandro 9.5"','Trastes':'22 medium jumbo','Pastillas':'2× humbucker Player II','Puente':'6 selletas','Escala':'25.5"'}
  },
  {
    id:'g3', cat:'guitarras', brand:'Fender', name:'Fender American Professional II Stratocaster',
    usd:1639.99, was:1799.99, rating:5.0, reviews:74,
    imgs:['assets/img/g3-1.jpg','assets/img/g3-2.jpg','assets/img/g3-3.jpg'],
    short:'La Strato de grado profesional hecha en EE. UU.: V-Mod II, mástil Deep C y acabados de lujo.',
    specs:['Hecha en USA','Pastillas V-Mod II','Mástil Deep C','Trémolo 2 puntos mejorado'],
    table:{'Cuerpo':'Alder','Mástil':'Maple, Deep C','Diapasón':'Maple / palisandro','Trastes':'22 narrow tall','Pastillas':'3× V-Mod II','Puente':'Trémolo 2 puntos','Escala':'25.5"'}
  },
  {
    id:'g4', cat:'guitarras', brand:'Gibson', name:'Gibson Les Paul Standard 50s',
    usd:2799.00, was:2999.00, rating:5.0, reviews:61,
    imgs:['assets/img/g4-1.jpg','assets/img/g4-2.jpg','assets/img/g4-3.jpg'],
    short:'Caoba + tapa de arce flameado y Burstbuckers: el sustain y la crema del PAF clásico.',
    specs:['Cuerpo caoba + arce','Burstbucker 1 y 2','Perfil Vintage 50s','Estuche rígido incluido'],
    table:{'Cuerpo':'Caoba, tapa arce','Mástil':'Caoba, Vintage 50s','Diapasón':'Palisandro','Trastes':'22 medium jumbo','Pastillas':'Burstbucker 1 / 2','Puente':'ABR-1 + Stop Bar','Escala':'24.75"'}
  },
  {
    id:'g5', cat:'guitarras', brand:'Gibson', name:'Gibson SG Standard 61',
    usd:1999.00, was:2199.00, rating:4.9, reviews:53,
    imgs:['assets/img/g5-1.jpg','assets/img/g5-2.jpg','assets/img/g5-3.jpg'],
    short:'Ligera, veloz y letal: doble cutaway, SlimTaper y Burstbuckers 60s con Orange Drops.',
    specs:['Cuerpo caoba','SlimTaper 60s','Burstbuckers 60s','Cableado Orange Drop'],
    table:{'Cuerpo':'Caoba','Mástil':'Caoba, SlimTaper','Diapasón':'Palisandro','Trastes':'22 medium jumbo','Pastillas':'2× Burstbucker 60s','Puente':'ABR-1 + Stop Bar','Escala':'24.75"'}
  },
  {
    id:'g6', cat:'guitarras', brand:'PRS', name:'PRS SE Custom 24',
    usd:849.00, was:949.00, rating:4.8, reviews:142,
    imgs:['assets/img/g6-1.jpg','assets/img/g6-2.jpg','assets/img/g6-3.jpg'],
    short:'Versatilidad total: 24 trastes, coil-split y la ergonomía PRS a precio SE.',
    specs:['Tapa arce flameado','85/15 "S" con coil-split','24 trastes','Trémolo PRS'],
    table:{'Cuerpo':'Caoba + tapa arce','Mástil':'Maple, Wide Thin','Diapasón':'Palisandro','Trastes':'24 medium jumbo','Pastillas':'2× 85/15 "S"','Puente':'Trémolo PRS','Escala':'25"'}
  },
  {
    id:'g7', cat:'guitarras', brand:'Ibanez', name:'Ibanez Genesis RG550',
    usd:1199.99, was:1349.99, rating:4.9, reviews:87,
    imgs:['assets/img/g7-1.jpg','assets/img/g7-2.jpg','assets/img/g7-3.jpg'],
    short:'La superstrat japonesa de los 80 renacida: Edge locking, V7/S1/V8 y mástil Wizard.',
    specs:['Hecha en Japón','Puente Edge locking','V7 / S1 / V8','Mástil Super Wizard'],
    table:{'Cuerpo':'Basswood','Mástil':'Maple/nogal, Super Wizard','Diapasón':'Maple, radio 17"','Trastes':'24 jumbo','Pastillas':'V7 / S1 / V8','Puente':'Edge doble bloqueo','Escala':'25.5"'}
  },
  {
    id:'g8', cat:'guitarras', brand:'Ibanez', name:'Ibanez AZ2204 Prestige',
    usd:2199.98, was:2399.98, rating:5.0, reviews:44,
    imgs:['assets/img/g8-1.jpg','assets/img/g8-2.jpg','assets/img/g8-3.jpg'],
    short:'La todoterreno japonesa de sesión: Seymour Duncan Hyperion, trastes de acero y Gotoh.',
    specs:['Hecha en Japón','Seymour Duncan Hyperion','Trastes acero inoxidable','Clavijeros con bloqueo'],
    table:{'Cuerpo':'Alder','Mástil':'Maple tostado, AZ Oval C','Diapasón':'Maple tostado','Trastes':'22 acero inox.','Pastillas':'Hyperion H + 2 S','Puente':'Gotoh T1702B','Escala':'25.5"'}
  },
  {
    id:'g9', cat:'guitarras', brand:'Epiphone', name:'Epiphone Les Paul Standard 50s',
    usd:599.00, was:699.00, rating:4.7, reviews:210,
    imgs:['assets/img/g9-1.jpg','assets/img/g9-2.jpg','assets/img/g9-3.jpg'],
    short:'La Les Paul licenciada con ProBuckers alnico II: el look y tono Gibson por mucho menos.',
    specs:['ProBucker 1 y 2','Tapa arce flameado','Perfil 50s Rounded C','Pots CTS'],
    table:{'Cuerpo':'Caoba + tapa arce','Mástil':'Caoba, 50s Rounded C','Diapasón':'Laurel indio','Trastes':'22 medium jumbo','Pastillas':'ProBucker 1 / 2','Puente':'LockTone TOM','Escala':'24.75"'}
  },
  {
    id:'g10', cat:'guitarras', brand:'Squier', name:'Squier Classic Vibe 60s Stratocaster',
    usd:499.99, was:569.99, rating:4.6, reviews:188,
    imgs:['assets/img/g10-1.jpg','assets/img/g10-2.jpg','assets/img/g10-3.jpg'],
    short:'Vibra sesentera con alnico diseñados por Fender: la mejor Strat de entrada, punto.',
    specs:['Alnico diseñados por Fender','Mástil tintado vintage','Radio 9.5"','Look 60s'],
    table:{'Cuerpo':'Poplar','Mástil':'Maple, C vintage','Diapasón':'Laurel indio','Trastes':'21 narrow tall','Pastillas':'3× alnico Fender','Puente':'Vintage 6 selletas','Escala':'25.5"'}
  },
  {
    id:'g11', cat:'guitarras', brand:'Yamaha', name:'Yamaha Pacifica 612VIIFM',
    usd:849.99, was:929.99, rating:4.8, reviews:96,
    imgs:['assets/img/g11-1.jpg','assets/img/g11-2.jpg','assets/img/g11-3.jpg'],
    short:'Superstrat de relación calidad-precio legendaria: Seymour Duncan SSL-1 + TB-14 y tapa flameada.',
    specs:['Tapa arce flameado','Seymour Duncan SSL-1/TB-14','Coil-split','Clavijeros con bloqueo'],
    table:{'Cuerpo':'Alder + tapa flameada','Mástil':'Maple','Diapasón':'Palisandro','Trastes':'22','Pastillas':'SSL-1 ×2 + TB-14','Puente':'Trémolo Wilkinson','Escala':'25.5"'}
  },
  {
    id:'g12', cat:'guitarras', brand:'ESP', name:'ESP LTD EC-256',
    usd:599.00, was:679.00, rating:4.7, reviews:154,
    imgs:['assets/img/g12-1.jpg','assets/img/g12-2.jpg','assets/img/g12-3.jpg'],
    short:'Single-cut de caoba con LH-150 y coil-split: metal y hard rock con clase.',
    specs:['Cuerpo caoba','LH-150 con coil-split','22 trastes XJ','Herrajes dorados'],
    table:{'Cuerpo':'Caoba','Mástil':'Caoba 3p, Thin U','Diapasón':'Palisandro','Trastes':'22 extra jumbo','Pastillas':'2× LH-150','Puente':'TOM + tailpiece','Escala':'24.75"'}
  },
  {
    id:'g13', cat:'guitarras', brand:'Jackson', name:'Jackson Pro Plus Soloist SL2',
    usd:1519.99, was:1699.99, rating:4.9, reviews:39,
    imgs:['assets/img/g13-1.jpg','assets/img/g13-2.jpg','assets/img/g13-3.jpg'],
    short:'Neck-through de alder con ébano, Floyd Rose y Seymour Duncan: velocidad sin límites.',
    specs:['Neck-through 3p maple','Ébano 12"–16"','JB TB-4 + 59','Floyd Rose'],
    table:{'Cuerpo':'Alder','Mástil':'Maple 3p, through-body','Diapasón':'Ébano, 12"–16"','Trastes':'24 jumbo','Pastillas':'JB TB-4 / SH-1 59','Puente':'Floyd Rose','Escala':'25.5"'}
  },

  /* ============ PERCUSIÓN (12) ============ */
  {
    id:'p1', cat:'percusion', brand:'Pearl', name:'Pearl Export EXX 5 piezas',
    usd:999.99, was:1149.99, rating:4.8, reviews:167,
    imgs:['assets/img/p1-1.jpg','assets/img/p1-2.jpg','assets/img/p1-3.jpg'],
    short:'La batería más vendida del mundo: cascos poplar/mahogany y hardware 830 incluido.',
    specs:['Cascos 6 capas 7.5 mm','Hardware 830 incluido','Opti-Loc suspension','Parches Remo'],
    table:{'Medidas':'22×18, 12×8, 13×9, 16×16, 14×5.5','Cascos':'Poplar / mahogany 6p','Herrajes':'Serie 830 + pedal P930','Parches':'Remo'}
  },
  {
    id:'p2', cat:'percusion', brand:'Yamaha', name:'Yamaha Stage Custom Birch 5 piezas',
    usd:899.99, was:999.99, rating:4.9, reviews:203,
    imgs:['assets/img/p2-1.jpg','assets/img/p2-2.jpg','assets/img/p2-3.jpg'],
    short:'100 % abedul con Air Seal System: ataque brillante y foco, favorita de estudio.',
    specs:['Cascos 100 % abedul','Air Seal System','Aros triple brida','Acabado lacado'],
    table:{'Medidas':'22×17, 10×7, 12×8, 16×15, 14×5.5','Cascos':'Abedul 6 capas','Sistema':'Yamaha Air Seal','Acabado':'Lacado alto brillo'}
  },
  {
    id:'p3', cat:'percusion', brand:'Tama', name:'Tama Imperialstar 5 piezas + Meinl HCS',
    usd:999.99, was:1099.99, rating:4.7, reviews:121,
    imgs:['assets/img/p3-1.jpg','assets/img/p3-2.jpg','assets/img/p3-3.jpg'],
    short:'Kit completo con platillos Meinl HCS y trono: saca tu batería de la caja y toca hoy.',
    specs:['Cascos poplar','Incluye platillos Meinl HCS','Hardware completo','Trono incluido'],
    table:{'Medidas':'22×16, 10×7, 12×8, 16×15, 14×5','Cascos':'Poplar','Incluye':'HH 14", crash 16", ride 20" HCS','Herrajes':'Serie completa Tama'}
  },
  {
    id:'p4', cat:'percusion', brand:'DW', name:'DW Design Series 5 piezas',
    usd:1849.00, was:2099.00, rating:4.9, reviews:58,
    imgs:['assets/img/p4-1.jpg','assets/img/p4-2.jpg','assets/img/p4-3.jpg'],
    short:'ADN Collector de DW: cascos de arce norteamericano y true-pitch hoops a precio de serie media.',
    specs:['Cascos de arce USA','True-pitch hoops','True-tone lugs','Hecho en USA (Oxnard)'],
    table:{'Medidas':'22×18, 10×8, 12×9, 16×14, 14×5.5','Cascos':'Arce norteamericano','Herrajes':'No incluidos','Origen':'EE. UU.'}
  },
  {
    id:'p5', cat:'percusion', brand:'Ludwig', name:'Ludwig Classic Maple 5 piezas',
    usd:2899.00, was:3199.00, rating:5.0, reviews:34,
    imgs:['assets/img/p5-1.jpg','assets/img/p5-2.jpg','assets/img/p5-3.jpg'],
    short:'El sonido de los discos que amas: arce de 7 capas hecho a mano en Monroe, NC.',
    specs:['Arce 7 capas RFST','Bearing edge 45°','Hecha en EE. UU.','Acabados wrap clásicos'],
    table:{'Medidas':'22×14, 10×8, 12×9, 16×16, 14×5.5','Cascos':'Arce 7p, 6 mm','Tecnología':'RFST','Origen':'Monroe, NC (USA)'}
  },
  {
    id:'p6', cat:'percusion', brand:'Roland', name:'Roland V-Drums TD-17KVX2',
    usd:2089.99, was:2299.99, rating:4.9, reviews:89,
    imgs:['assets/img/p6-1.jpg','assets/img/p6-2.jpg','assets/img/p6-3.jpg'],
    short:'Motor de sonido clase TD-50, snare de malla 12" y platillos de verdad: practica sin ruido.',
    specs:['Módulo TD-17 (70 kits)','Snare PDX-12 12"','Hi-hat / ride de movimiento','Bluetooth + USB'],
    table:{'Módulo':'TD-17, motor TD-50','Kits':'70 preset + user','Pads':'Malla PDX-8 ×3, PDX-12','Conectividad':'USB-MIDI, Bluetooth'}
  },
  {
    id:'p7', cat:'percusion', brand:'Alesis', name:'Alesis Nitro Max (malla)',
    usd:449.99, was:529.99, rating:4.6, reviews:312,
    imgs:['assets/img/p7-1.jpg','assets/img/p7-2.jpg','assets/img/p7-3.jpg'],
    short:'Kit electrónico todo-malla con sonidos BFD y Bluetooth: la mejor entrada al e-drumming.',
    specs:['Pads 100 % malla','Sonidos BFD (440)','Bluetooth audio','Rack aluminio 4 postes'],
    table:{'Módulo':'Nitro MAX, BFD','Kits':'32 + 16 user','Pads':'Snare 10" dual, toms 8"','Extras':'Drumeo incluido'}
  },
  {
    id:'p8', cat:'percusion', brand:'Meinl', name:'Meinl Headliner String Cajón',
    usd:169.99, was:199.99, rating:4.7, reviews:244,
    imgs:['assets/img/p8-1.jpg','assets/img/p8-2.jpg','assets/img/p8-3.jpg'],
    short:'Cajón de cuerdas con sizzle ajustable: el corazón del flamenco y del unplugged.',
    specs:['Cuerdas internas ajustables','Esquinas regulables','Superficie antideslizante','Tapa de fresno'],
    table:{'Alto':'18"','Material':'MDF / fresno','Cuerdas':'Sí, ajustables','Peso':'≈3.9 kg'}
  },
  {
    id:'p9', cat:'percusion', brand:'Latin Percussion', name:'LP Giovanni Hidalgo Compact Conga 11 3/4"',
    usd:369.99, was:419.99, rating:4.8, reviews:77,
    imgs:['assets/img/p9-1.jpg','assets/img/p9-2.jpg','assets/img/p9-3.jpg'],
    short:'Diseñada con el maestro Giovanni Hidalgo: conga compacta con sonido de estudio.',
    specs:['Diseño Giovanni Hidalgo','Formato compacto','Herrajes cromados','Parche natural'],
    table:{'Diámetro':'11 3/4"','Modelo':'LP826','Serie':'Giovanni Signature','Herrajes':'Cromo'}
  },
  {
    id:'p10', cat:'percusion', brand:'Remo', name:'Remo Mondo Djembe 14" afinación por llaves',
    usd:499.95, was:579.95, rating:4.8, reviews:96,
    imgs:['assets/img/p10-1.jpg','assets/img/p10-2.jpg','assets/img/p10-3.jpg'],
    short:'Djembe Skyndeep de Acousticon: cálido, potente y afinable en segundos, clima-proof.',
    specs:['Casco Acousticon','Parche Skyndeep','Afinación por llaves','14" × 25"'],
    table:{'Diámetro':'14"','Alto':'25"','Casco':'Acousticon reciclado','Parche':'Mondo Skyndeep'}
  },
  {
    id:'p11', cat:'percusion', brand:'Zildjian', name:'Zildjian A Custom Box Set 14/16/18/20',
    usd:1339.95, was:1499.95, rating:5.0, reviews:68,
    imgs:['assets/img/p11-1.jpg','assets/img/p11-2.jpg','assets/img/p11-3.jpg'],
    short:'Hi-hat 14", crashes 16"/18" y ride 20": el brillo moderno y dulce de la línea A Custom.',
    specs:['Aleación B20','Acabado brillante','Martillado rotatorio','Estuche incluido'],
    table:{'Incluye':'HH 14", crash 16", crash 18", ride 20"','Aleación':'B20','Sonido':'Brillante, moderno','Acabado':'Brilliant'}
  },
  {
    id:'p12', cat:'percusion', brand:'Sabian', name:'Sabian AA Performance Set 14/16/20',
    usd:1111.00, was:1249.00, rating:4.8, reviews:54,
    imgs:['assets/img/p12-1.jpg','assets/img/p12-2.jpg','assets/img/p12-3.jpg'],
    short:'Set "sonically matched" de bronce B20: vintage, brillante y listo para el escenario.',
    specs:['Bronce B20','Sonically matched','HH 14" + crash 16" + ride 20"','Estilo vintage brillante'],
    table:{'Incluye':'HH 14", crash 16", ride 20"','Aleación':'B20','Sonido':'Bright vintage','Acabado':'Martillado / torneado'}
  },

  /* ============ ACCESORIOS (16) ============ */
  {
    id:'a1', cat:'accesorios', brand:'Ernie Ball', name:'Ernie Ball Regular Slinky 10-46',
    usd:7.99, was:9.99, rating:4.9, reviews:5210,
    imgs:['assets/img/a1-1.jpg','assets/img/a1-2.jpg','assets/img/a1-3.jpg'],
    short:'El calibre estándar de la industria: níquel brillante y balance perfecto.',
    specs:['Calibre 10-46','Níquel entorchado','Núcleo hexagonal','Estándar de la industria'],
    table:{'Calibre':'.010–.046','Material':'Nickel-plated steel','Tipo':'Round wound','Uso':'Eléctrica'}
  },
  {
    id:'a2', cat:'accesorios', brand:'Dunlop', name:'Dunlop Tortex Standard .60 mm (12 pack)',
    usd:5.76, was:7.99, rating:4.9, reviews:3480,
    imgs:['assets/img/a2-1.jpg','assets/img/a2-2.jpg','assets/img/a2-3.jpg'],
    short:'Delrin con memoria y ataque snappy: el pick naranja que suena en todos los discos.',
    specs:['Delrin Tortex','Grosor .60 mm','12 unidades','Hecho en USA'],
    table:{'Material':'Delrin','Grosor':'.60 mm','Color':'Naranja','Cantidad':'12'}
  },
  {
    id:'a3', cat:'accesorios', brand:'Ernie Ball', name:'Ernie Ball Polypro 2" negra',
    usd:9.99, was:12.99, rating:4.8, reviews:2210,
    imgs:['assets/img/a3-1.jpg','assets/img/a3-2.jpg','assets/img/a3-3.jpg'],
    short:'Correa de polipropileno con puntas de cuero: cómoda, firme y eterna.',
    specs:['Ancho 2"','Puntas de cuero','Ajuste 41"–72"','Hebilla Delrin'],
    table:{'Ancho':'2"','Material':'Polipropileno','Largo':'41–72"','Color':'Negra'}
  },
  {
    id:'a4', cat:'accesorios', brand:"D'Addario", name:"D'Addario American Stage 10 ft",
    usd:57.99, was:69.99, rating:4.9, reviews:410,
    imgs:['assets/img/a4-1.jpg','assets/img/a4-2.jpg','assets/img/a4-3.jpg'],
    short:'Cobre libre de oxígeno 22 AWG y plug GEO-TIP Neutrik: tono puro de por vida.',
    specs:['22 AWG OFC','28 pF/ft','Plug GEO-TIP Neutrik','Blindaje 100 %'],
    table:{'Largo':'10 ft','Conductor':'OFC 22 AWG','Capacitancia':'28 pF/ft','Plug':'Neutrik GEO-TIP'}
  },
  {
    id:'a5', cat:'accesorios', brand:'Kyser', name:'Kyser Quick-Change capo',
    usd:24.95, was:29.95, rating:4.9, reviews:1890,
    imgs:['assets/img/a5-1.jpg','assets/img/a5-2.jpg','assets/img/a5-3.jpg'],
    short:'Cambio de tono con una mano: aluminio de grado aeronáutico que dura décadas.',
    specs:['Gatillo quick-change','Aluminio aeronáutico','Presión pareja','Para 6 cuerdas'],
    table:{'Material':'Aluminio','Mecanismo':'Trigger','Uso':'Guitarra 6 cuerdas','Origen':'USA'}
  },
  {
    id:'a6', cat:'accesorios', brand:'TC Electronic', name:'TC Electronic PolyTune 3',
    usd:119.99, was:139.99, rating:4.9, reviews:620,
    imgs:['assets/img/a6-1.jpg','assets/img/a6-2.jpg','assets/img/a6-3.jpg'],
    short:'Afinación polifónica de 109 LEDs con buffer BonaFide: afina todo el acorde de un rasgueo.',
    specs:['Polifónico + strobe 0.02¢','Buffer BonaFide','109 LEDs','True bypass'],
    table:{'Modos':'Poly / mono / strobe','Precisión':'0.02 cent','Buffer':'BonaFide','Alimentación':'9 V'}
  },
  {
    id:'a7', cat:'accesorios', brand:'Boss', name:'Boss DS-1 Distortion',
    usd:69.99, was:84.99, rating:4.8, reviews:4120,
    imgs:['assets/img/a7-1.jpg','assets/img/a7-2.jpg','assets/img/a7-3.jpg'],
    short:'El clásico naranja desde 1978: distorsión dura que respeta tu dinámica.',
    specs:['Distorsión clásica','Controles D/T/L','4 mA consumo','Garantía BOSS 5 años'],
    table:{'Tipo':'Distortion','Controles':'Distortion, Tone, Level','Alimentación':'9 V / pila','Origen':'1978–hoy'}
  },
  {
    id:'a8', cat:'accesorios', brand:'MXR', name:'MXR M101 Phase 90',
    usd:99.99, was:119.99, rating:4.8, reviews:980,
    imgs:['assets/img/a8-1.jpg','assets/img/a8-2.jpg','assets/img/a8-3.jpg'],
    short:'El phaser que definió el efecto: del shimmer sutil al warble de jet con una perilla.',
    specs:['Phase clásico','Control Speed','True hardwire bypass','Script vintage'],
    table:{'Tipo':'Phase','Controles':'Speed','Bypass':'Hardwire','Alimentación':'9 V'}
  },
  {
    id:'a9', cat:'accesorios', brand:'TC Electronic', name:'TC Electronic Ditto 2 Looper',
    usd:119.00, was:139.00, rating:4.7, reviews:730,
    imgs:['assets/img/a9-1.jpg','assets/img/a9-2.jpg','assets/img/a9-3.jpg'],
    short:'Loop de 5 min en formato de bolsillo: un switch, tono 24-bit y cero complicación.',
    specs:['5 min de loop','24-bit sin compresión','Undo/redo','True bypass'],
    table:{'Tiempo':'5 min','Calidad':'24-bit','Bypass':'Analog dry-through','Alimentación':'9 V'}
  },
  {
    id:'a10', cat:'accesorios', brand:'Boss', name:'Boss Katana 50 Gen 3',
    usd:349.99, was:399.99, rating:4.9, reviews:1560,
    imgs:['assets/img/a10-1.jpg','assets/img/a10-2.jpg','assets/img/a10-3.jpg'],
    short:'50 W clase A/B con 6 caracteres (incl. Pushed) y 5 secciones de efectos: el combo definitivo.',
    specs:['50 W, 1×12"','6 amp characters','5 secciones de FX','USB-C + Tone Studio'],
    table:{'Potencia':'50 W','Speaker':'12" custom','FX':'5 secciones','Conectividad':'USB-C, BT (opcional)'}
  },
  {
    id:'a11', cat:'accesorios', brand:'Fender', name:'Fender Mustang LT25',
    usd:179.99, was:209.99, rating:4.7, reviews:890,
    imgs:['assets/img/a11-1.jpg','assets/img/a11-2.jpg','assets/img/a11-3.jpg'],
    short:'25 W de modelado con 30 presets y pantalla a color: el amp ideal para empezar y grabar.',
    specs:['25 W, 1×8"','30 presets','Pantalla a color','USB para grabar'],
    table:{'Potencia':'25 W','Speaker':'8" Fender','Presets':'30','Salidas':'Headphones, USB'}
  },
  {
    id:'a12', cat:'accesorios', brand:'Hercules', name:'Hercules GS414B Plus (Auto Grip)',
    usd:61.49, was:74.99, rating:4.9, reviews:640,
    imgs:['assets/img/a12-1.jpg','assets/img/a12-2.jpg','assets/img/a12-3.jpg'],
    short:'El soporte que atrapa tu guitarra solo: Auto Grip System y espuma SFF que cuida el acabado.',
    specs:['Auto Grip System','Espuma SFF','Ajuste de altura instantáneo','Cuellos 40–52 mm'],
    table:{'Tipo':'Soporte individual','Sistema':'AGS','Espuma':'SFF','Rango':'40–52 mm'}
  },
  {
    id:'a13', cat:'accesorios', brand:'Vic Firth', name:'Vic Firth American Classic 5A',
    usd:14.99, was:17.99, rating:5.0, reviews:2760,
    imgs:['assets/img/a13-1.jpg','assets/img/a13-2.jpg','assets/img/a13-3.jpg'],
    short:'La baqueta más vendida del mundo: hickory USA con punta teardrop para címbalos ricos.',
    specs:['Hickory USA','Punta teardrop','0.565" × 16"','Par'],
    table:{'Material':'Hickory','Diámetro':'0.565"','Largo':'16"','Punta':'Wood teardrop'}
  },
  {
    id:'a14', cat:'accesorios', brand:'MONO', name:'MONO M80 Vertigo (estuche eléctrico)',
    usd:299.99, was:349.99, rating:4.9, reviews:310,
    imgs:['assets/img/a14-1.jpg','assets/img/a14-2.jpg','assets/img/a14-3.jpg'],
    short:'Protección de hardcase con peso de gig bag: Headlock, The Boot y apertura superior.',
    specs:['Headlock neck suspension','The Boot drop-proof','Paneles ABS','Apertura vertical'],
    table:{'Tipo':'Estuche eléctrico','Interior':'41.5×14.5×3"','Peso':'2.5 kg','Material':'ABS + textil'}
  },
  {
    id:'a15', cat:'accesorios', brand:'Shure', name:'Shure SM57',
    usd:109.00, was:129.00, rating:4.9, reviews:3120,
    imgs:['assets/img/a15-1.jpg','assets/img/a15-2.jpg','assets/img/a15-3.jpg'],
    short:'El micrófono de instrumento estándar de la industria: snare, amps y vientos, siempre.',
    specs:['Dinámico cardioide','40 Hz–15 kHz','Shock-mount interno','Indestructible'],
    table:{'Tipo':'Dinámico','Patrón':'Cardioide','Respuesta':'40 Hz–15 kHz','Conector':'XLR'}
  },
  {
    id:'a16', cat:'accesorios', brand:'Audio-Technica', name:'Audio-Technica ATH-M50x',
    usd:159.00, was:189.00, rating:4.8, reviews:2450,
    imgs:['assets/img/a16-1.jpg','assets/img/a16-2.jpg','assets/img/a16-3.jpg'],
    short:'Monitores cerrados de estudio: drivers 45 mm, aislamiento real y 3 cables desmontables.',
    specs:['Drivers 45 mm','Closed-back','15 Hz–28 kHz','3 cables incluidos'],
    table:{'Tipo':'Closed-back','Driver':'45 mm','Respuesta':'15 Hz–28 kHz','Impedancia':'38 Ω'}
  }
];

/* categorías visibles */
const CATS = {
  guitarras:{ label:'Guitarras eléctricas', icon:'guitar' },
  percusion:{ label:'Percusión', icon:'drum' },
  accesorios:{ label:'Accesorios', icon:'headphones' }
};

function byId(id){ return PRODUCTS.find(p => p.id === id); }
function brands(){ return [...new Set(PRODUCTS.map(p => p.brand))].sort(); }
