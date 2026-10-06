import * as THREE from 'three';

// Shared geometry/material helpers so every model reads as the same glossy toy world.

const geoCache = new Map();
export function sphereGeo(seg = 32) {
  const key = 's' + seg;
  if (!geoCache.has(key)) geoCache.set(key, new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75)));
  return geoCache.get(key);
}

export function mat(color, o = {}) {
  const base = {
    color,
    roughness: o.rough ?? 0.42,
    metalness: o.metal ?? 0,
  };
  if (o.emissive) { base.emissive = new THREE.Color(o.emissive); base.emissiveIntensity = o.ei ?? 1; }
  if (o.opacity !== undefined) { base.transparent = true; base.opacity = o.opacity; }
  if (o.side) base.side = o.side;
  if (o.gloss) {
    return new THREE.MeshPhysicalMaterial({ ...base, clearcoat: 1, clearcoatRoughness: o.cc ?? 0.12 });
  }
  return new THREE.MeshStandardMaterial(base);
}

export function mesh(geo, material, o = {}) {
  const m = new THREE.Mesh(geo, material);
  if (o.pos) m.position.set(...o.pos);
  if (o.rot) m.rotation.set(...o.rot);
  if (o.scale !== undefined) {
    if (Array.isArray(o.scale)) m.scale.set(...o.scale); else m.scale.setScalar(o.scale);
  }
  m.castShadow = o.cast ?? true;
  m.receiveShadow = o.receive ?? false;
  if (o.parent) o.parent.add(m);
  return m;
}

// Ellipsoid: unit sphere scaled per axis.
export function blob(material, pos, scale, o = {}) {
  const s = Array.isArray(scale) ? scale : [scale, scale, scale];
  return mesh(sphereGeo(o.seg ?? 32), material, { ...o, pos, scale: s });
}

export function group(parent, pos, rot) {
  const g = new THREE.Group();
  if (pos) g.position.set(...pos);
  if (rot) g.rotation.set(...rot);
  if (parent) parent.add(g);
  return g;
}

export function capsule(r, len, material, o = {}) {
  return mesh(new THREE.CapsuleGeometry(r, len, 8, 20), material, o);
}

// Deterministic randomness: the render must produce identical frames every run.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const easeOut = (x) => { x = clamp01(x); return 1 - Math.pow(1 - x, 3); };
export const easeInOut = (x) => { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const backOut = (x) => { x = clamp01(x); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const elasticOut = (x) => {
  x = clamp01(x);
  if (x === 0 || x === 1) return x;
  return Math.pow(2, -9 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3) + 1;
};
// 0 → 1 over [a, b]
export const span = (t, a, b) => clamp01((t - a) / (b - a));

// Cartoon eye: sclera, iris, pupil and two catch-lights. Faces +z.
export function makeEye(r, irisColor = '#3a2016', o = {}) {
  const g = new THREE.Group();
  blob(mat('#ffffff', { rough: 0.15, gloss: true }), [0, 0, 0], [r, r * (o.tall ?? 1.12), r * 0.6], { parent: g, cast: false });
  const iris = group(g, [0, -r * 0.05, r * 0.45]);
  blob(mat(irisColor, { rough: 0.2 }), [0, 0, 0], [r * 0.72, r * 0.8 * (o.tall ?? 1.12), r * 0.25], { parent: iris, cast: false });
  blob(mat('#0c0605', { rough: 0.15 }), [0, 0, r * 0.1], [r * 0.42, r * 0.48 * (o.tall ?? 1.12), r * 0.2], { parent: iris, cast: false });
  const hl = mat('#ffffff', { emissive: '#ffffff', ei: 1.2 });
  blob(hl, [r * 0.25, r * 0.3, r * 0.25], r * 0.2, { parent: iris, cast: false, seg: 12 });
  blob(hl, [-r * 0.22, -r * 0.25, r * 0.25], r * 0.1, { parent: iris, cast: false, seg: 12 });
  g.userData.iris = iris;
  return g;
}

// Banana-style tapered tube along a curve.
export function taperedTube(curve, radius, tubular, radial, taper) {
  const geo = new THREE.TubeGeometry(curve, tubular, radius, radial, false);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    const c = curve.getPointAt(t);
    const k = taper(t);
    for (let j = 0; j <= radial; j++) {
      const idx = i * (radial + 1) + j;
      v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(k).add(c);
      pos.setXYZ(idx, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  return geo;
}
