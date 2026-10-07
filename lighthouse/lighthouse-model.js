import * as THREE from 'three';

const stage = document.querySelector('three-d-stage');
await stage.ready;

/* ═══════════ procedural textures (fiber, moss, porous rock, sand) ═══════════ */
function canvas(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')];
}
function tex(c, rx = 1, ry = 1) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 4;
  return t;
}
function rnd(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/* 부직포 — 촘촘한 섬유 결 + 솜털 */
function feltMaps() {
  const [c, g] = canvas(512);
  const r = rnd(7);
  g.fillStyle = '#f3f1ea';
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 5200; i++) {           // 섬유 한 올씩
    const x = r() * 512, y = r() * 512, len = 6 + r() * 26, ang = (r() - 0.5) * 0.5 + Math.PI / 2;
    const v = r();
    g.strokeStyle = v > 0.5 ? `rgba(255,255,255,${0.10 + r() * 0.35})` : `rgba(198,193,181,${0.06 + r() * 0.22})`;
    g.lineWidth = 0.5 + r() * 1.3;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(ang) * len * (r() - 0.5) * 2, y + Math.sin(ang) * len);
    g.stroke();
  }
  for (let i = 0; i < 900; i++) {            // 보풀
    const x = r() * 512, y = r() * 512;
    g.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.3})`;
    g.beginPath();
    g.arc(x, y, 0.5 + r() * 1.6, 0, 6.3);
    g.fill();
  }
  return c;
}

/* 이끼 — 뭉친 알갱이 질감 */
function mossMaps() {
  const [c, g] = canvas(512);
  const r = rnd(23);
  g.fillStyle = '#5f7c3c';
  g.fillRect(0, 0, 512, 512);
  const cols = ['#78964a', '#8aa855', '#4e6a30', '#3f5827', '#9cb264', '#6c8a41'];
  for (let i = 0; i < 9000; i++) {
    const x = r() * 512, y = r() * 512, rad = 1 + r() * 6;
    g.fillStyle = cols[(r() * cols.length) | 0];
    g.globalAlpha = 0.35 + r() * 0.5;
    g.beginPath();
    g.arc(x, y, rad, 0, 6.3);
    g.fill();
  }
  g.globalAlpha = 1;
  for (let i = 0; i < 1400; i++) {           // 그늘진 틈
    const x = r() * 512, y = r() * 512;
    g.fillStyle = `rgba(34,48,22,${0.2 + r() * 0.5})`;
    g.beginPath();
    g.arc(x, y, 0.8 + r() * 2.4, 0, 6.3);
    g.fill();
  }
  return c;
}

/* 우드락 바위 — 다공질 표면 */
function rockMaps() {
  const [c, g] = canvas(512);
  const r = rnd(101);
  g.fillStyle = '#ded7c8';
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4200; i++) {           // 기포 구멍
    const x = r() * 512, y = r() * 512, rad = 1.5 + r() * 7;
    g.fillStyle = `rgba(120,110,92,${0.18 + r() * 0.45})`;
    g.beginPath();
    g.arc(x, y, rad, 0, 6.3);
    g.fill();
    g.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.4})`;
    g.beginPath();
    g.arc(x - rad * 0.3, y - rad * 0.35, rad * 0.55, 0, 6.3);
    g.fill();
  }
  for (let i = 0; i < 1800; i++) {
    const x = r() * 512, y = r() * 512;
    g.fillStyle = `rgba(90,82,66,${0.1 + r() * 0.3})`;
    g.fillRect(x, y, 1 + r() * 3, 1 + r() * 3);
  }
  return c;
}

/* 모래·자갈 */
function sandMaps() {
  const [c, g] = canvas(256);
  const r = rnd(55);
  g.fillStyle = '#e8e1d1';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9000; i++) {
    const x = r() * 256, y = r() * 256;
    g.fillStyle = r() > 0.55 ? `rgba(255,255,255,${r() * 0.7})` : `rgba(160,150,130,${r() * 0.5})`;
    g.beginPath();
    g.arc(x, y, 0.4 + r() * 1.5, 0, 6.3);
    g.fill();
  }
  return c;
}

const FELT = feltMaps(), MOSS = mossMaps(), ROCK = rockMaps(), SAND = sandMaps();

/* ═══════════ materials ═══════════ */
function mat(name, o) {
  const m = new THREE.MeshStandardMaterial(o);
  m.name = name;
  return m;
}
const M = {
  felt: mat('felt_nonwoven', {
    color: 0xffffff, map: tex(FELT, 2, 3), bumpMap: tex(FELT, 2, 3), bumpScale: 0.5,
    roughness: 1.0, metalness: 0,
  }),
  feltFlat: mat('felt_strand', { color: 0xf4f2ea, map: tex(FELT, 1, 6), bumpMap: tex(FELT, 1, 6), bumpScale: 0.6, roughness: 1.0, metalness: 0 }),
  moss: mat('moss_lichen', {
    color: 0xa9b49e, map: tex(MOSS, 1, 1), bumpMap: tex(MOSS, 1, 1), bumpScale: 1.1,
    roughness: 1.0, metalness: 0,
  }),
  rock: mat('rock_porous', {
    color: 0xdcd6c8, map: tex(ROCK, 2, 1), bumpMap: tex(ROCK, 2, 1), bumpScale: 1.4,
    roughness: 1.0, metalness: 0,
  }),
  sand: mat('sand_gravel', { color: 0xffffff, map: tex(SAND, 3, 2), bumpMap: tex(SAND, 3, 2), bumpScale: 0.7, roughness: 0.95, metalness: 0 }),
  sandFlat: mat('sand_bed_surface', { color: 0xf2ece0, map: tex(SAND, 34, 34), bumpMap: tex(SAND, 34, 34), bumpScale: 0.5, roughness: 0.95, metalness: 0 }),
  mossFlat: mat('moss_ground', { color: 0xa9b49e, map: tex(MOSS, 26, 26), bumpMap: tex(MOSS, 26, 26), bumpScale: 1.0, roughness: 1.0, metalness: 0 }),
  tree: mat('tree_green', { color: 0x4e7442, roughness: 0.9, metalness: 0 }),
  trunk: mat('wood_brown', { color: 0x6a533c, roughness: 0.9, metalness: 0 }),
  plastic: mat('plastic_white', { color: 0xf9f8f4, roughness: 0.42, metalness: 0 }),
  acrylic: mat('acrylic_deck', { color: 0xe8edec, roughness: 0.2, metalness: 0 }),
  film: mat('ohp_film', { color: 0xeaf4f6, roughness: 0.08, metalness: 0 }),
  water: mat('water', { color: 0x9fd6de, roughness: 0.05, metalness: 0 }),
  pcb: mat('pcb_green', { color: 0x1d6b46, roughness: 0.6, metalness: 0.1 }),
  uno: mat('arduino_teal', { color: 0x1c7f96, roughness: 0.55, metalness: 0.1 }),
  sensor: mat('sensor_orange', { color: 0xc4552e, roughness: 0.6, metalness: 0.05 }),
  dark: mat('metal_dark', { color: 0x3b3e43, roughness: 0.5, metalness: 0.35 }),
  pumpBody: mat('pump_shell', { color: 0xeeece7, roughness: 0.5, metalness: 0.05 }),
  glow: mat('lamp_glow', { color: 0xffd884, emissive: 0xffb43c, emissiveIntensity: 0.15, roughness: 0.4, metalness: 0 }),
  wireRed: mat('wire_red', { color: 0xa8382c, roughness: 0.7, metalness: 0 }),
  wireBlue: mat('wire_blue', { color: 0x2f4f7a, roughness: 0.7, metalness: 0 }),
};
const CLEAR = [[M.plastic, 0.26, 1.0], [M.acrylic, 0.30, 0.9], [M.film, 0.22, 0.55], [M.water, 0.34, 0.5]];
for (const [m] of CLEAR) { m.transparent = true; m.depthWrite = false; m.side = THREE.DoubleSide; }

/* ═══════════ helpers ═══════════ */
function mesh(name, geo, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, material);
  m.name = name;
  m.position.set(x, y, z);
  return m;
}
function roundedRect(w, d, r, Ctor = THREE.Shape) {
  const s = new Ctor(), x = w / 2, z = d / 2;
  s.moveTo(-x + r, -z);
  s.lineTo(x - r, -z);  s.quadraticCurveTo(x, -z, x, -z + r);
  s.lineTo(x, z - r);   s.quadraticCurveTo(x, z, x - r, z);
  s.lineTo(-x + r, z);  s.quadraticCurveTo(-x, z, -x, z - r);
  s.lineTo(-x, -z + r); s.quadraticCurveTo(-x, -z, -x + r, -z);
  return s;
}
function slab(shape, h) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 24 });
  g.rotateX(-Math.PI / 2);
  return g;
}
function jitter(geo, amp, seed = 1, freq = 1) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = Math.sin((x * 91 + z * 57 + y * 33) * seed * freq) * Math.sin((x * 37 - z * 71) * seed * 1.7 * freq);
    p.setXYZ(i, x + n * amp, y + n * amp * 0.6, z + n * amp);
  }
  geo.computeVertexNormals();
  return geo;
}
function tube(pts, r, material, name) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  return mesh(name, new THREE.TubeGeometry(curve, 44, r, 8, false), material);
}
function ring(r, t, seg = 40) {
  const g = new THREE.TorusGeometry(r, t, 8, seg);
  g.rotateX(Math.PI / 2);
  return g;
}

/* ═══════════ layers ═══════════ */
const model = new THREE.Group();
model.name = 'the_lighthouse_humidifier';
const layer = {};
const LAYERS = [
  ['case', 0], ['electronics', 0.100], ['deck', 0.170],
  ['water', 0.225], ['pump', 0.285], ['scape', 0.355], ['tower', 0.480],
];
for (const [k] of LAYERS) { layer[k] = new THREE.Group(); layer[k].name = 'layer_' + k; model.add(layer[k]); }

/* ── 1. 다이소 플라스틱 통 300×200×95 ── */
const W = 0.30, D = 0.20, H = 0.095, T = 0.005;
const FLOOR = 0.006;      // 통 내부 바닥
const BASE = 0.038;       // 아크릴 판 위 = 수반 기준면
const shell = roundedRect(W, D, 0.036);
shell.holes.push(roundedRect(W - T * 2, D - T * 2, 0.031, THREE.Path));
layer.case.add(mesh('tub_shell', slab(shell, H), M.plastic, 0, FLOOR, 0));
layer.case.add(mesh('tub_floor', slab(roundedRect(W, D, 0.036), FLOOR), M.plastic, 0, 0, 0));

const frontZ = D / 2;
const jack = new THREE.Group();
jack.name = 'dc_power_jack';
jack.position.set(-0.082, 0.026, frontZ - 0.006);
jack.rotation.x = Math.PI / 2;
jack.add(mesh('jack_barrel', new THREE.CylinderGeometry(0.0045, 0.0045, 0.011, 20), M.dark, 0, -0.003, 0));
jack.add(mesh('jack_flange', new THREE.CylinderGeometry(0.0062, 0.0062, 0.002, 20), M.dark, 0, 0.004, 0));
layer.case.add(jack);

const sw = new THREE.Group();
sw.name = 'toggle_switch';
sw.position.set(0.030, 0.026, frontZ - 0.004);
sw.rotation.x = Math.PI / 2;
sw.add(mesh('switch_bushing', new THREE.CylinderGeometry(0.0038, 0.0038, 0.009, 16), M.dark, 0, 0, 0));
sw.add(mesh('switch_nut', new THREE.CylinderGeometry(0.005, 0.005, 0.0018, 6), M.dark, 0, 0.0045, 0));
const lever = mesh('switch_lever', new THREE.CylinderGeometry(0.0015, 0.002, 0.009, 12), M.dark, 0, 0.009, 0);
lever.rotation.x = 0.5;
sw.add(lever);
layer.case.add(sw);

const ldr = new THREE.Group();
ldr.name = 'photoresistor';
ldr.position.set(-0.014, 0.026, frontZ - 0.004);
ldr.rotation.x = Math.PI / 2;
ldr.add(mesh('ldr_body', new THREE.CylinderGeometry(0.0024, 0.0024, 0.006, 16), M.dark, 0, 0.002, 0));
ldr.add(mesh('ldr_face', new THREE.SphereGeometry(0.0024, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.sensor, 0, 0.0048, 0));
layer.case.add(ldr);

/* ── 2. 전장부 ── */
const uno = new THREE.Group();
uno.name = 'arduino_uno';
uno.position.set(-0.062, 0.008, 0.022);
uno.rotation.y = 0.08;
uno.add(mesh('uno_pcb', new THREE.BoxGeometry(0.069, 0.0016, 0.053), M.uno, 0, 0.004, 0));
uno.add(mesh('uno_header_digital', new THREE.BoxGeometry(0.050, 0.008, 0.0045), M.dark, 0.004, 0.0088, -0.0235));
uno.add(mesh('uno_header_analog', new THREE.BoxGeometry(0.043, 0.008, 0.0045), M.dark, 0.008, 0.0088, 0.0235));
uno.add(mesh('uno_mcu', new THREE.BoxGeometry(0.014, 0.003, 0.033), M.dark, 0.010, 0.0063, 0));
uno.add(mesh('uno_usb_port', new THREE.BoxGeometry(0.012, 0.011, 0.016), M.dark, -0.0295, 0.0100, 0.014));
uno.add(mesh('uno_barrel_jack', new THREE.BoxGeometry(0.009, 0.011, 0.014), M.dark, -0.0300, 0.0100, -0.017));
layer.electronics.add(uno);

const perf = new THREE.Group();
perf.name = 'perfboard_36x56';
perf.position.set(0.048, 0.008, -0.030);
perf.rotation.y = -0.12;
perf.add(mesh('perfboard_pcb', new THREE.BoxGeometry(0.056, 0.0016, 0.036), M.pcb, 0, 0.004, 0));
perf.add(mesh('perfboard_socket_a', new THREE.BoxGeometry(0.020, 0.007, 0.0045), M.dark, -0.014, 0.0083, -0.010));
perf.add(mesh('perfboard_socket_b', new THREE.BoxGeometry(0.020, 0.007, 0.0045), M.dark, 0.014, 0.0083, 0.008));
perf.add(mesh('transistor_tip120', new THREE.BoxGeometry(0.010, 0.010, 0.0045), M.dark, 0.018, 0.0098, -0.012));
for (let i = 0; i < 3; i++) {
  const g = new THREE.CylinderGeometry(0.0013, 0.0013, 0.008, 10);
  g.rotateZ(Math.PI / 2);
  perf.add(mesh('resistor_' + (i + 1), g, M.sand, -0.020 + i * 0.006, 0.0063, 0.013));
}
layer.electronics.add(perf);

const bat = new THREE.Group();
bat.name = 'battery_9v';
bat.position.set(0.104, 0.008, 0.048);
bat.rotation.y = -0.35;
bat.add(mesh('battery_body', new THREE.BoxGeometry(0.048, 0.017, 0.026), M.dark, 0, 0.0085, 0));
bat.add(mesh('battery_snap', new THREE.BoxGeometry(0.008, 0.010, 0.018), M.dark, -0.027, 0.0085, 0));
layer.electronics.add(bat);

layer.electronics.add(tube([[-0.030, 0.014, 0.010], [0.000, 0.020, -0.004], [0.030, 0.016, -0.024]], 0.0018, M.wireRed, 'wire_bundle_red'));
layer.electronics.add(tube([[-0.028, 0.012, 0.030], [0.006, 0.014, 0.014], [0.036, 0.014, -0.014]], 0.0018, M.wireBlue, 'wire_bundle_blue'));
layer.electronics.add(tube([[0.070, 0.014, -0.022], [0.086, 0.016, 0.010], [0.086, 0.014, 0.040]], 0.0018, M.wireRed, 'wire_battery_lead'));
layer.electronics.add(tube([[-0.072, 0.014, 0.020], [-0.078, 0.018, 0.055], [-0.082, 0.024, 0.088]], 0.0018, M.wireBlue, 'wire_jack_lead'));

/* ── 3. 아크릴 판 ── */
layer.deck.add(mesh('acrylic_deck_plate', slab(roundedRect(W - T * 2 - 0.002, D - T * 2 - 0.002, 0.029), 0.004), M.acrylic, 0, 0.034, 0));

/* ── 4. 물 (잔물결) + 모래 바닥 ── */
const waterGeo = new THREE.PlaneGeometry(W - T * 2 - 0.012, D - T * 2 - 0.012, 56, 38);
waterGeo.rotateX(-Math.PI / 2);
const waterMesh = mesh('water_surface', waterGeo, M.water, 0, 0.049, 0);
const waterBase = Float32Array.from(waterGeo.attributes.position.array);
layer.water.add(waterMesh);
layer.water.add(mesh('sand_bed', slab(roundedRect(0.286, 0.186, 0.030), 0.002), M.sandFlat, 0, BASE + 0.0005, 0));

/* ── 5. 수중 펌프 (아치 안에 숨음) ── */
const PUMP = [0.078, -0.018];
const pump = new THREE.Group();
pump.name = 'submersible_pump';
pump.position.set(PUMP[0], BASE, PUMP[1]);
pump.rotation.y = 0.3;
pump.add(mesh('pump_body', new THREE.BoxGeometry(0.028, 0.024, 0.022), M.pumpBody, 0, 0.012, 0));
pump.add(mesh('pump_intake_cage', new THREE.CylinderGeometry(0.010, 0.010, 0.008, 20), M.dark, 0, 0.004, 0.014));
pump.add(mesh('pump_outlet', new THREE.CylinderGeometry(0.0045, 0.0045, 0.014, 16), M.dark, 0, 0.028, 0));
layer.pump.add(pump);
layer.pump.add(tube([[PUMP[0], 0.070, PUMP[1]], [PUMP[0] - 0.006, 0.076, PUMP[1] + 0.011], [PUMP[0] - 0.016, 0.072, PUMP[1] + 0.021]], 0.0035, M.film, 'pump_outlet_tube'));

/* ── 6. 조경: 이끼 육지 · 나무 · 자갈 · 돌 아치 · 수위 센서 ── */
const scape = layer.scape;

/* 이끼 육지 — 왼쪽 벽을 감싸는 L자 카펫, 찢긴 이끼 뭉치들 */
const rr = rnd(3);
const IX = 0.143, IZ = 0.093;
const CLUMPS = [];
for (let i = 0; i < 78; i++) {
  const t = rr();
  // 좌측 띠 + 앞쪽 띠
  let x, z;
  if (t < 0.62) { x = -0.132 + rr() * 0.078; z = -0.084 + rr() * 0.168; }
  else { x = -0.120 + rr() * 0.100; z = 0.030 + rr() * 0.050; }
  const r = 0.009 + rr() * 0.013;
  x = Math.max(-IX + r, Math.min(-0.036, x));
  z = Math.max(-IZ + r, Math.min(IZ - r, z));
  CLUMPS.push([x, z, r, rr()]);
}
CLUMPS.forEach(([x, z, r, s], i) => {
  const g = new THREE.SphereGeometry(r, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  g.scale(1, 0.42 + s * 0.30, 1);
  jitter(g, r * 0.22, 1 + s * 6, 2.2);
  const top = z > 0.034 ? BASE + 0.0135 : BASE + 0.0165;
  scape.add(mesh('moss_clump_' + (i + 1), g, M.moss, x, top, z));
});
scape.add(mesh('island_landform', slab(roundedRect(0.100, 0.182, 0.022), 0.017), M.mossFlat, -0.092, BASE, 0));
scape.add(mesh('island_spit_front', slab(roundedRect(0.120, 0.046, 0.018), 0.014), M.mossFlat, -0.058, BASE, 0.066));

/* 흰 자갈 패치 — 등대 발밑 */
scape.add(mesh('gravel_patch', slab(roundedRect(0.044, 0.052, 0.020), 0.004), M.sandFlat, -0.026, BASE + 0.0025, -0.046));

/* 나무 모형 — 앞쪽 이끼 위 */
const trees = [[-0.116, 0.056, 0.86], [-0.098, 0.072, 0.70], [-0.080, 0.058, 0.80], [-0.060, 0.070, 0.62], [-0.112, 0.014, 0.72], [-0.096, -0.030, 0.62], [-0.120, -0.062, 0.66], [-0.086, 0.026, 0.56]];
trees.forEach(([x, z, s], i) => {
  const g = new THREE.Group();
  g.name = 'tree_' + (i + 1);
  g.add(mesh('tree_trunk_' + (i + 1), new THREE.CylinderGeometry(0.0022, 0.003, 0.014, 8), M.trunk, 0, 0.007, 0));
  g.add(mesh('tree_foliage_' + (i + 1), jitter(new THREE.ConeGeometry(0.0115, 0.046, 14, 4), 0.0014, 3 + i, 1.6), M.tree, 0, 0.036, 0));
  g.position.set(x, (z > 0.034 ? BASE + 0.013 : BASE + 0.016), z);
  g.scale.setScalar(s);
  scape.add(g);
});

/* 돌 아치 — 우드락을 깎은 다공질 동굴, 위에 이끼 */
const arch = new THREE.Group();
arch.name = 'rock_arch';
arch.position.set(PUMP[0], BASE, PUMP[1]);
arch.rotation.y = -0.22;
const archGeo = new THREE.TorusGeometry(0.032, 0.018, 16, 44, Math.PI);
archGeo.scale(1, 1, 0.92);
jitter(archGeo, 0.0035, 2.6, 3.4);
arch.add(mesh('arch_rock_body', archGeo, M.rock));
for (const [n, r, x, y, s] of [['arch_boulder_left', 0.014, -0.034, 0.003, 3.1], ['arch_boulder_right', 0.014, 0.034, 0.003, 5.2]]) {
  const g = new THREE.SphereGeometry(r, 22, 14);
  g.scale(1, 0.8, 0.9);
  jitter(g, 0.0028, s, 3.0);
  arch.add(mesh(n, g, M.rock, x, y, 0));
}
for (let i = 0; i < 9; i++) {                 // 아치 위 이끼
  const a = 0.40 + (i / 8) * (Math.PI - 0.8);
  const r = 0.008 + (i % 3) * 0.0035;
  const g = new THREE.SphereGeometry(r, 16, 9, 0, Math.PI * 2, 0, Math.PI / 2);
  g.scale(1, 0.5, 1);
  jitter(g, r * 0.25, 4 + i, 2.4);
  arch.add(mesh('arch_moss_' + (i + 1), g, M.moss, Math.cos(a) * 0.032, Math.sin(a) * 0.032 + 0.010, (i % 2 ? 1 : -1) * 0.007));
}
scape.add(arch);

/* 수위 센서 — 뒤쪽 벽에 기대어 */
const wl = new THREE.Group();
wl.name = 'water_level_sensor';
wl.position.set(0.126, BASE, -0.072);
wl.rotation.y = 0.7;
wl.add(mesh('level_sensor_pcb', new THREE.BoxGeometry(0.014, 0.058, 0.0014), M.sensor, 0, 0.029, 0));
wl.add(mesh('level_sensor_header', new THREE.BoxGeometry(0.010, 0.006, 0.004), M.dark, 0, 0.060, 0));
scape.add(wl);
scape.add(tube([[0.126, 0.098, -0.072], [0.120, 0.084, -0.062], [0.110, 0.062, -0.052], [0.100, 0.048, -0.040]], 0.0016, M.wireBlue, 'level_sensor_wire'));

/* ── 7. 등대 — 얄쌍한 부직포 타워 ── */
const LH = [-0.058, -0.034];
const lh = new THREE.Group();
lh.name = 'lighthouse';
lh.position.set(LH[0], BASE, LH[1]);

const BODY_H = 0.158, R0 = 0.0285, R1 = 0.0205;
const towerPts = [];
for (let i = 0; i <= 14; i++) {
  const t = i / 14;
  towerPts.push(new THREE.Vector2(R0 - (R0 - R1) * Math.pow(t, 0.8), t * BODY_H));
}
lh.add(mesh('tower_felt_body', new THREE.LatheGeometry(towerPts, 56), M.felt));

/* 부직포 심지 — 몸통을 따라 내려와 물에 닿는 세로 결 */
for (let i = 0; i < 16; i++) {
  const a = (i / 16) * Math.PI * 2, w = 0.05 * Math.sin(i * 2.1);
  const rAt = (y) => (R0 - (R0 - R1) * Math.pow(y / BODY_H, 0.8)) + 0.0016;
  lh.add(tube([
    [Math.cos(a) * rAt(BODY_H) , BODY_H - 0.002, Math.sin(a) * rAt(BODY_H)],
    [Math.cos(a + w) * rAt(0.11), 0.11, Math.sin(a + w) * rAt(0.11)],
    [Math.cos(a + w * 1.6) * rAt(0.06), 0.06, Math.sin(a + w * 1.6) * rAt(0.06)],
    [Math.cos(a + w * 1.2) * rAt(0.02), 0.02, Math.sin(a + w * 1.2) * rAt(0.02)],
    [Math.cos(a + w) * (R0 + 0.004), 0.001, Math.sin(a + w) * (R0 + 0.004)],
  ], 0.0021, M.feltFlat, 'felt_wick_' + (i + 1)));
}

/* 갤러리 + 등명기실 + 돔 */
const GY = BODY_H;
lh.add(mesh('gallery_deck', new THREE.CylinderGeometry(0.0335, 0.0245, 0.0045, 44), M.felt, 0, GY + 0.002, 0));
lh.add(mesh('gallery_handrail', ring(0.0305, 0.0016), M.feltFlat, 0, GY + 0.018, 0));
for (let i = 0; i < 14; i++) {
  const a = (i / 14) * Math.PI * 2;
  lh.add(mesh('gallery_post_' + (i + 1), new THREE.CylinderGeometry(0.0011, 0.0011, 0.018, 6), M.feltFlat,
    Math.cos(a) * 0.0305, GY + 0.0135, Math.sin(a) * 0.0305));
}
lh.add(mesh('lantern_glazing', new THREE.CylinderGeometry(0.0215, 0.0215, 0.031, 32, 1, true), M.film, 0, GY + 0.021, 0));
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2;
  lh.add(mesh('lantern_mullion_' + (i + 1), new THREE.BoxGeometry(0.0028, 0.031, 0.0028), M.feltFlat,
    Math.cos(a) * 0.0215, GY + 0.021, Math.sin(a) * 0.0215));
}
lh.add(mesh('lantern_ring_top', ring(0.0222, 0.0018), M.feltFlat, 0, GY + 0.0375, 0));
lh.add(mesh('led_socket', new THREE.CylinderGeometry(0.006, 0.0072, 0.007, 16), M.dark, 0, GY + 0.010, 0));
const bulb = mesh('led_bulb', new THREE.SphereGeometry(0.0072, 24, 16), M.glow, 0, GY + 0.019, 0);
lh.add(bulb);
lh.add(mesh('dome_collar', new THREE.CylinderGeometry(0.0215, 0.0225, 0.0035, 32), M.felt, 0, GY + 0.0395, 0));
lh.add(mesh('dome_roof', new THREE.SphereGeometry(0.0248, 36, 16, 0, Math.PI * 2, 0, 1.06), M.felt, 0, GY + 0.0290, 0));
layer.tower.add(lh);

/* ═══════════ 작동 애니메이션: 물줄기 · 파문 · 미스트 ═══════════ */
const flow = new THREE.Group();
flow.name = 'water_flow';
layer.pump.add(flow);
const jetCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(PUMP[0] - 0.018, 0.0715, PUMP[1] + 0.023),
  new THREE.Vector3(PUMP[0] - 0.034, 0.066, PUMP[1] + 0.031),
  new THREE.Vector3(PUMP[0] - 0.050, 0.059, PUMP[1] + 0.038),
  new THREE.Vector3(PUMP[0] - 0.060, 0.0505, PUMP[1] + 0.042),
]);
const dropGeo = new THREE.SphereGeometry(0.0032, 12, 8);
const drops = [];
for (let i = 0; i < 12; i++) {
  const d = mesh('water_drop_' + (i + 1), dropGeo, M.water);
  d.visible = false;
  flow.add(d);
  drops.push(d);
}
const LAND = new THREE.Vector3(PUMP[0] - 0.060, 0.0495, PUMP[1] + 0.042);
const ripples = [];
for (let i = 0; i < 3; i++) {
  const r = mesh('ripple_' + (i + 1), ring(0.006, 0.0006, 32), M.water, LAND.x, LAND.y, LAND.z);
  r.visible = false;
  flow.add(r);
  ripples.push(r);
}
const mistMat = mat('mist', { color: 0xffffff, roughness: 1, metalness: 0, transparent: true, opacity: 0.0, depthWrite: false });
const mists = [];
for (let i = 0; i < 9; i++) {
  const m = mesh('mist_puff_' + (i + 1), new THREE.SphereGeometry(0.0035 + (i % 3) * 0.0018, 12, 8), mistMat);
  m.visible = false;
  layer.tower.add(m);
  mists.push(m);
}

/* ═══════════ 조명 씬 (창가 낮 / 야간 무드등) ═══════════ */
const scene = stage._scene;
let hemi = null, key = stage._key, fill = null;
scene.traverse((o) => {
  if (o.isHemisphereLight) hemi = o;
  else if (o.isDirectionalLight && o !== key) fill = o;
});
const lampLight = new THREE.PointLight(0xffb552, 0, 0.95, 1.7);
lampLight.name = 'lantern_point_light';
lh.add(lampLight);
lampLight.position.set(0, GY + 0.019, 0);
const spill = new THREE.PointLight(0xffbf70, 0, 0.5, 2);
spill.name = 'mood_spill_light';
spill.position.set(0, GY * 0.55, 0);
lh.add(spill);

const halo = new THREE.Sprite(new THREE.SpriteMaterial({
  map: (() => {
    const [c, g] = canvas(128);
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,206,128,0.95)');
    grad.addColorStop(0.35, 'rgba(255,180,80,0.35)');
    grad.addColorStop(1, 'rgba(255,170,70,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })(),
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0,
}));
halo.name = 'lantern_halo';
halo.scale.set(0.078, 0.078, 0.078);
halo.position.set(0, GY + 0.019, 0);
lh.add(halo);

const DAY = { hemi: 0.74, key: 1.55, keyPos: [0.5, 0.9, 0.62], keyColor: 0xfff4e4, fill: 0.32, lamp: 0, glow: 0.12, bg: '#f2f1ec', shadow: 0.2 };
const NIGHT = { hemi: 0.15, key: 0.22, keyPos: [-0.5, 0.6, -0.4], keyColor: 0x8fa6c8, fill: 0.06, lamp: 1.5, glow: 2.4, bg: '#12161d', shadow: 0.42 };
let lightNow = { ...DAY }, lightTo = DAY;

/* ═══════════ 모드 상태 ═══════════ */
const MODES = { finished: { explode: 0, clear: 0 }, translucent: { explode: 0, clear: 1 }, exploded: { explode: 1, clear: 1 } };
let target = MODES.finished, now = { explode: 0, clear: 0 };
let running = false, t0 = performance.now();

function applyClear(k) {
  for (const [m, clearOp, solidOp] of CLEAR) {
    const o = solidOp + (clearOp - solidOp) * k;
    m.opacity = o;
    m.transparent = o < 0.999;
    m.depthWrite = o > 0.85;
  }
}
function applyLayers() {
  for (const [k, dy] of LAYERS) layer[k].position.y = dy * now.explode;
}
function lerp(a, b, k) { return a + (b - a) * k; }

function tick(ts) {
  const t = (ts - t0) / 1000;
  let moved = false;
  for (const k of ['explode', 'clear']) {
    if (Math.abs(target[k] - now[k]) > 0.0005) { now[k] += (target[k] - now[k]) * 0.1; moved = true; }
    else if (now[k] !== target[k]) { now[k] = target[k]; moved = true; }
  }
  if (moved) { applyLayers(); applyClear(now.clear); }

  /* 조명 보간 */
  const k = 0.06;
  lightNow.hemi = lerp(lightNow.hemi, lightTo.hemi, k);
  lightNow.key = lerp(lightNow.key, lightTo.key, k);
  lightNow.fill = lerp(lightNow.fill, lightTo.fill, k);
  lightNow.lamp = lerp(lightNow.lamp, lightTo.lamp, k);
  lightNow.glow = lerp(lightNow.glow, lightTo.glow, k);
  lightNow.shadow = lerp(lightNow.shadow, lightTo.shadow, k);
  if (hemi) hemi.intensity = lightNow.hemi;
  if (fill) fill.intensity = lightNow.fill;
  if (key) {
    key.intensity = lightNow.key;
    const p = lightTo.keyPos, d = 6;
    key.position.lerp(new THREE.Vector3(p[0] * d, p[1] * d, p[2] * d), k);
    key.color.lerp(new THREE.Color(lightTo.keyColor), k);
  }
  lampLight.intensity = lightNow.lamp;
  spill.intensity = lightNow.lamp * 0.22;
  halo.material.opacity = Math.min(1, lightNow.glow / 2.4) * 0.9;
  M.glow.emissiveIntensity = lightNow.glow;
  if (stage._ground) stage._ground.material.opacity = lightNow.shadow;

  /* 물결 */
  const p = waterGeo.attributes.position;
  const amp = running ? 1 : 0.35;
  for (let i = 0; i < p.count; i++) {
    const x = waterBase[i * 3], z = waterBase[i * 3 + 2];
    const d = Math.hypot(x - LAND.x, z - LAND.z);
    const h = Math.sin(x * 95 + t * 2.1) * 0.00035 + Math.sin(z * 70 - t * 1.6) * 0.0003
      + (running ? Math.sin(d * 180 - t * 7) * 0.0009 * Math.exp(-d * 9) : 0);
    p.setY(i, waterBase[i * 3 + 1] + h * amp);
  }
  p.needsUpdate = true;
  waterGeo.computeVertexNormals();

  /* 물줄기 · 파문 · 미스트 */
  drops.forEach((d, i) => {
    d.visible = running;
    if (!running) return;
    const u = ((t * 0.85 + i / drops.length) % 1);
    jetCurve.getPointAt(u, d.position);
    const s = 1 - u * 0.35;
    d.scale.setScalar(s);
  });
  ripples.forEach((r, i) => {
    r.visible = running;
    if (!running) return;
    const u = (t * 0.6 + i / 3) % 1;
    r.scale.setScalar(0.4 + u * 1.9);
    r.material === M.water;
    r.position.y = LAND.y + 0.0005;
  });
  mists.forEach((m, i) => {
    m.visible = running;
    if (!running) return;
    const u = (t * 0.22 + i / mists.length) % 1;
    const a = (i / mists.length) * Math.PI * 2 + u * 0.8;
    const rad = 0.024 + u * 0.030;
    m.position.set(LH[0] + Math.cos(a) * rad, BASE + 0.055 + u * 0.135, LH[1] + Math.sin(a) * rad);
    m.scale.setScalar(0.5 + u * 1.7);
  });
  mistMat.opacity = running ? 0.14 : 0;

  requestAnimationFrame(tick);
}
applyClear(0);
requestAnimationFrame(tick);
stage.setObject(model);
if (stage._renderer) {
  stage._renderer.toneMapping = THREE.ACESFilmicToneMapping;
  stage._renderer.toneMappingExposure = 0.92;
}

let reframe = null;
window.lighthouse = {
  mode(name) {
    target = MODES[name] || MODES.finished;
    clearTimeout(reframe);
    reframe = setTimeout(() => {
      now = { ...target };
      applyLayers();
      applyClear(now.clear);
      stage.setObject(model);
    }, 900);
  },
  light(name) {
    lightTo = name === 'night' ? NIGHT : DAY;
    stage.style.setProperty('--stage-bg', lightTo.bg);
    document.body.style.background = lightTo.bg;
  },
  run(on) { running = on; },
};
