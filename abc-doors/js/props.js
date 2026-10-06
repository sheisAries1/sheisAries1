import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mat, mesh, blob, group, capsule, makeEye, taperedTube, rng, backOut, easeOut, elasticOut, span, smooth } from './util.js';

// What waits behind each door. Each builder returns { group, room, update(rv, t) }
// where rv is seconds since the door started revealing it (negative = not yet).

const pop = (rv, delay = 0, dur = 0.55) => backOut(span(rv, delay, delay + dur));

function cuteFace(parent, o) {
  // o: { y, z, eyeR, eyeGap, iris, muzzle, nose, smileR }
  const eyes = [];
  for (const s of [-1, 1]) {
    const e = makeEye(o.eyeR, o.iris ?? '#2a160e');
    e.position.set(s * o.eyeGap, o.y, o.z);
    e.rotation.y = s * 0.3;
    parent.add(e);
    eyes.push(e);
  }
  return eyes;
}

function smileArc(parent, pos, r, color = '#3a1a12') {
  return mesh(new THREE.TorusGeometry(r, r * 0.22, 8, 20, Math.PI), mat(color, { rough: 0.3 }), { parent, pos, rot: [0.2, 0, Math.PI], cast: false });
}

function sparkleCloud(parent, rand, n, area, color = '#ffffff') {
  const items = [];
  const m = mat(color, { emissive: color, ei: 1.4 });
  for (let i = 0; i < n; i++) {
    const s = blob(m, [(rand() - 0.5) * area[0], rand() * area[1] + 0.2, -0.4 - rand() * area[2]], 0.012 + rand() * 0.02, { parent, cast: false, seg: 8 });
    items.push({ s, ph: rand() * 6 });
  }
  return (t) => items.forEach(({ s, ph }) => s.scale.setScalar((0.6 + 0.6 * Math.sin(t * 4 + ph)) * 0.025));
}

export function apple(rand) {
  const g = new THREE.Group();
  const prof = [];
  const R = 0.2;
  for (let k = 0; k <= 32; k++) {
    const a = (k / 32) * Math.PI;
    let x = Math.sin(a) * R * (1 + 0.06 * Math.cos(a));
    let y = -Math.cos(a) * R * 0.92;
    y -= 0.07 * Math.exp(-((Math.PI - a) ** 2) / 0.08);
    y += 0.04 * Math.exp(-(a ** 2) / 0.06);
    prof.push(new THREE.Vector2(Math.max(0.0001, x), y));
  }
  const appleGeo = new THREE.LatheGeometry(prof, 40);
  const reds = ['#e3232c', '#f03a2e', '#d01c33'];
  const stemMat = mat('#6b3f1f'), leafMat = mat('#3fbf4a', { gloss: true });
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0); leafShape.quadraticCurveTo(0.06, 0.05, 0.13, 0); leafShape.quadraticCurveTo(0.06, -0.05, 0, 0);
  const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.004, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 1 });
  const makeApple = (s) => {
    const a = group(g);
    mesh(appleGeo, mat(reds[Math.floor(rand() * 3)], { rough: 0.2, gloss: true, cc: 0.05 }), { parent: a });
    mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.09, 8), stemMat, { parent: a, pos: [0, 0.2, 0], rot: [0, 0, 0.2] });
    mesh(leafGeo, leafMat, { parent: a, pos: [0.01, 0.22, 0], rot: [0.3, 0.4, 0.5] });
    a.scale.setScalar(s);
    return a;
  };
  // apple tree-ish hill + basket pile + floating apples
  const room = { wall: '#c9f2c0', floor: '#8fdc7a' };
  blob(mat('#7bd36a', { rough: 0.8 }), [0, -0.1, -1.6], [1.3, 0.55, 0.8], { parent: g, cast: false });
  const basket = group(g, [0, 0, -0.75]);
  mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.32, 32, 1, true), mat('#c98a4b', { rough: 0.7, side: THREE.DoubleSide }), { parent: basket, pos: [0, 0.16, 0] });
  mesh(new THREE.TorusGeometry(0.42, 0.03, 10, 40), mat('#a86d35', { rough: 0.7 }), { parent: basket, pos: [0, 0.32, 0], rot: [Math.PI / 2, 0, 0] });
  const pile = [];
  const spots = [[0, 0.36, 0.05], [-0.2, 0.32, 0.08], [0.2, 0.32, 0.06], [-0.1, 0.5, 0], [0.12, 0.5, -0.02], [0.0, 0.33, -0.18], [0.0, 0.62, 0.02]];
  spots.forEach((p, i) => { const a = makeApple(0.85); a.position.set(p[0], p[1], p[2] - 0.75); a.rotation.y = i; pile.push({ a, p, i }); });
  const fly = [];
  for (let i = 0; i < 6; i++) {
    const a = makeApple(0.7 + rand() * 0.4);
    fly.push({ a, x: (i % 3 - 1) * 0.65 + (rand() - 0.5) * 0.2, y: 1.15 + Math.floor(i / 3) * 0.55 + rand() * 0.15, z: -1.0 - rand() * 0.8, ph: rand() * 6 });
  }
  const tw = sparkleCloud(g, rand, 16, [2, 2, 2]);
  return {
    group: g, room,
    update(rv, t) {
      pile.forEach(({ a, p, i }) => { const k = pop(rv, i * 0.06); a.scale.setScalar(0.85 * k); a.position.y = p[1] + Math.sin(t * 3 + i) * 0.01; });
      fly.forEach((f, i) => {
        const k = pop(rv, 0.25 + i * 0.07);
        f.a.scale.setScalar((0.7 + (i % 2) * 0.3) * k);
        f.a.position.set(f.x, f.y + Math.sin(t * 2 + f.ph) * 0.06, f.z);
        f.a.rotation.y = t * 0.8 + f.ph;
      });
      tw(t);
    },
  };
}

export function banana(rand) {
  const g = new THREE.Group();
  const room = { wall: '#fff2a8', floor: '#ffe066' };
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.28, 0.12, 0), new THREE.Vector3(0, -0.12, 0), new THREE.Vector3(0.28, 0.12, 0));
  const geo = taperedTube(curve, 0.075, 40, 5, (t) => 0.22 + 0.78 * Math.pow(Math.sin(Math.PI * t), 0.55));
  const peel = mat('#ffd51e', { rough: 0.35, gloss: true, cc: 0.2 });
  const tip = mat('#5b3a1a', { rough: 0.6 });
  const makeBanana = () => {
    const b = new THREE.Group();
    mesh(geo, peel, { parent: b });
    mesh(new THREE.CylinderGeometry(0.014, 0.02, 0.07, 6), mat('#8bb23a'), { parent: b, pos: [0.3, 0.16, 0], rot: [0, 0, -0.7] });
    blob(tip, [-0.285, 0.125, 0], 0.016, { parent: b, seg: 8 });
    g.add(b);
    return b;
  };
  // bunch: several bananas fanned from a shared stem
  const bunch = group(g, [0, 0.95, -0.9]);
  const bunchItems = [];
  for (let i = 0; i < 6; i++) {
    const b = makeBanana(); g.remove(b); bunch.add(b);
    b.rotation.set(0.25 + (i % 2) * 0.25, (i - 2.5) * 0.28, -0.9 + (i - 2.5) * 0.06);
    b.position.set(-0.22 + (i - 2.5) * 0.03, -0.1, (i % 2) * 0.08);
    bunchItems.push(b);
  }
  // little stand
  mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.1, 40), mat('#ffffff', { gloss: true }), { parent: g, pos: [0, 0.05, -0.9] });
  mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.75, 16), mat('#ffffff', { gloss: true }), { parent: g, pos: [0, 0.45, -0.9] });
  const floaters = [];
  for (let i = 0; i < 8; i++) {
    const b = makeBanana();
    floaters.push({ b, x: (rand() - 0.5) * 1.9, y: 0.4 + rand() * 1.9, z: -0.9 - rand() * 1.2, ph: rand() * 6, s: 0.6 + rand() * 0.4 });
  }
  const tw = sparkleCloud(g, rand, 14, [2, 2, 2], '#fff8d0');
  return {
    group: g, room,
    update(rv, t) {
      bunch.scale.setScalar(pop(rv, 0, 0.6));
      bunch.rotation.y = Math.sin(t * 1.5) * 0.25;
      floaters.forEach((f, i) => {
        f.b.scale.setScalar(f.s * pop(rv, 0.2 + i * 0.06));
        f.b.position.set(f.x, f.y + Math.sin(t * 2.2 + f.ph) * 0.07, f.z);
        f.b.rotation.set(Math.sin(t + f.ph) * 0.4, t * 0.6 + f.ph, Math.sin(t * 1.3 + f.ph) * 0.5);
      });
      tw(t);
    },
  };
}

export function cat(rand) {
  const g = new THREE.Group();
  const room = { wall: '#e6dcff', floor: '#cdb8ff' };
  const fur = mat('#cfd3dd', { rough: 0.7 });
  const white = mat('#ffffff', { rough: 0.7 });
  const pink = mat('#ff9fb8', { rough: 0.5 });
  const kitty = group(g, [0, 0, -0.35]);
  const body = group(kitty);
  blob(fur, [0, 0.3, -0.05], [0.22, 0.24, 0.26], { parent: body });
  blob(white, [0, 0.29, 0.1], [0.14, 0.18, 0.13], { parent: body });
  for (const s of [-1, 1]) blob(white, [s * 0.09, 0.07, 0.13], [0.065, 0.06, 0.08], { parent: body });
  for (const s of [-1, 1]) blob(fur, [s * 0.14, 0.1, -0.12], [0.09, 0.09, 0.12], { parent: body });
  const tailCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.15, -0.28), new THREE.Vector3(0.18, 0.2, -0.36), new THREE.Vector3(0.24, 0.45, -0.3), new THREE.Vector3(0.16, 0.62, -0.25)]);
  const tail = group(body);
  mesh(taperedTube(tailCurve, 0.04, 30, 10, (t) => 1 - t * 0.35), fur, { parent: tail });
  const head = group(kitty, [0, 0.66, 0.02]);
  blob(fur, [0, 0, 0], [0.24, 0.205, 0.2], { parent: head, seg: 40 });
  for (const s of [-1, 1]) {
    const ear = group(head, [s * 0.14, 0.15, -0.02], [0, 0, s * -0.35]);
    mesh(new THREE.ConeGeometry(0.075, 0.14, 24), fur, { parent: ear });
    mesh(new THREE.ConeGeometry(0.045, 0.09, 24), pink, { parent: ear, pos: [0, -0.01, 0.03], cast: false });
    blob(white, [s * 0.05, -0.08, 0.15], [0.065, 0.05, 0.05], { parent: head, cast: false });
    for (const k of [-1, 1]) {
      mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.17, 4), mat('#7d808a'), { parent: head, pos: [s * 0.16, -0.07 + k * 0.018, 0.14], rot: [0, 0, Math.PI / 2 + s * k * 0.12], cast: false });
    }
  }
  cuteFace(head, { y: 0.02, z: 0.155, eyeR: 0.05, eyeGap: 0.085, iris: '#3b8f4d' });
  blob(pink, [0, -0.045, 0.195], [0.022, 0.016, 0.014], { parent: head, cast: false });
  smileArc(head, [-0.022, -0.085, 0.185], 0.02);
  smileArc(head, [0.022, -0.085, 0.185], 0.02);
  // ball of yarn
  const yarn = blob(mat('#ff6aa8', { rough: 0.8 }), [-0.55, 0.13, -0.6], 0.13, { parent: g });
  const tw = sparkleCloud(g, rand, 12, [2, 2, 2], '#fff0ff');
  return {
    group: g, room,
    update(rv, t) {
      const k = backOut(span(rv, 0.05, 0.7));
      kitty.scale.setScalar(Math.max(0.001, k));
      kitty.position.z = -0.6 + 0.35 * easeOut(span(rv, 0.0, 0.9));
      head.rotation.z = Math.sin(t * 2.2) * 0.14 * smooth(span(rv, 0.8, 1.2));
      head.rotation.y = -0.25 + Math.sin(t * 1.1) * 0.1;
      tail.rotation.z = Math.sin(t * 3) * 0.18;
      yarn.rotation.z = t * 2;
      tw(t);
    },
  };
}

export function dog(rand) {
  const g = new THREE.Group();
  const room = { wall: '#d4f7ff', floor: '#9ee6a8' };
  const white = mat('#fbf7f2', { rough: 0.65 });
  const brown = mat('#9a5a2b', { rough: 0.6 });
  const pup = group(g, [0, 0, -0.4]);
  const body = group(pup);
  blob(white, [0, 0.3, -0.12], [0.2, 0.2, 0.3], { parent: body });
  blob(brown, [0.08, 0.4, -0.2], [0.12, 0.08, 0.14], { parent: body, cast: false });
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    capsule(0.055, 0.12, white, { parent: body, pos: [sx * 0.11, 0.12, sz * 0.13 - 0.12] });
    blob(white, [sx * 0.11, 0.035, sz * 0.13 - 0.08], [0.06, 0.04, 0.075], { parent: body });
  }
  const tail = group(body, [0, 0.4, -0.38], [-0.7, 0, 0]);
  capsule(0.03, 0.14, brown, { parent: tail, pos: [0, 0.08, 0] });
  const head = group(pup, [0, 0.63, 0.06]);
  blob(white, [0, 0, 0], [0.21, 0.19, 0.19], { parent: head, seg: 40 });
  blob(brown, [0.09, 0.07, 0.07], [0.11, 0.1, 0.13], { parent: head, cast: false }); // eye patch
  blob(white, [0, -0.07, 0.15], [0.1, 0.075, 0.08], { parent: head });
  blob(mat('#1a1210', { rough: 0.15, gloss: true }), [0, -0.035, 0.235], [0.035, 0.026, 0.024], { parent: head, cast: false });
  const tongue = blob(mat('#ff7a90', { rough: 0.4 }), [0, -0.135, 0.19], [0.032, 0.012, 0.045], { parent: head, rot: [0.6, 0, 0], cast: false });
  smileArc(head, [0, -0.1, 0.215], 0.035);
  const ears = [];
  for (const s of [-1, 1]) {
    const ear = group(head, [s * 0.17, 0.08, 0], [0, 0, s * 0.3]);
    blob(brown, [0, -0.1, 0], [0.06, 0.12, 0.035], { parent: ear });
    ears.push(ear);
  }
  cuteFace(head, { y: 0.04, z: 0.155, eyeR: 0.045, eyeGap: 0.08 });
  // ball + bone
  const ball = blob(mat('#ff5a5f', { gloss: true, rough: 0.2 }), [0.55, 0.11, -0.5], 0.11, { parent: g });
  const tw = sparkleCloud(g, rand, 12, [2, 2, 2]);
  return {
    group: g, room,
    update(rv, t) {
      const k = backOut(span(rv, 0.05, 0.7));
      pup.scale.setScalar(Math.max(0.001, k));
      pup.position.z = -0.75 + 0.4 * easeOut(span(rv, 0.0, 0.9));
      pup.position.y = Math.abs(Math.sin(t * 6)) * 0.03 * smooth(span(rv, 0.6, 1));
      tail.rotation.z = Math.sin(t * 18) * 0.6;
      ears.forEach((e, i) => { e.rotation.x = Math.sin(t * 6 + i) * 0.15; });
      head.rotation.z = Math.sin(t * 2) * 0.12;
      head.rotation.y = -0.3;
      tongue.scale.y = 0.012 * (1 + Math.sin(t * 10) * 0.2);
      ball.rotation.x = t;
      tw(t);
    },
  };
}

export function elephant(rand) {
  const g = new THREE.Group();
  const room = { wall: '#ffe2c4', floor: '#ffc98f' };
  const skin = mat('#9eb4cf', { rough: 0.55 });
  const pink = mat('#ffb3c7', { rough: 0.6 });
  const ele = group(g, [0, 0, -0.75]);
  blob(skin, [0, 0.42, -0.15], [0.32, 0.3, 0.36], { parent: ele });
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.3, 20), skin, { parent: ele, pos: [sx * 0.17, 0.15, sz * 0.17 - 0.15] });
    for (let n = -1; n <= 1; n++) blob(mat('#ffffff'), [sx * 0.17 + n * 0.04, 0.025, sz * 0.17 - 0.15 + 0.095], 0.02, { parent: ele, cast: false, seg: 10 });
  }
  const head = group(ele, [0, 0.75, 0.15]);
  blob(skin, [0, 0, 0], [0.27, 0.25, 0.24], { parent: head, seg: 40 });
  const ears = [];
  for (const s of [-1, 1]) {
    const ear = group(head, [s * 0.22, 0.02, -0.04], [0, s * -0.4, 0]);
    blob(skin, [s * 0.14, 0, 0], [0.2, 0.22, 0.035], { parent: ear });
    blob(pink, [s * 0.14, 0, 0.02], [0.15, 0.17, 0.02], { parent: ear, cast: false });
    ears.push(ear);
  }
  cuteFace(head, { y: 0.06, z: 0.19, eyeR: 0.045, eyeGap: 0.11 });
  for (const s of [-1, 1]) blob(mat('#ff9fb3'), [s * 0.16, -0.05, 0.17], [0.045, 0.03, 0.02], { parent: head, cast: false });
  // trunk: chain of segments that curls up when raised
  const segs = [];
  let parent = group(head, [0, -0.04, 0.2]);
  for (let i = 0; i < 9; i++) {
    const r = 0.075 - i * 0.0055;
    blob(skin, [0, -0.04, 0], [r, 0.05, r], { parent });
    segs.push(parent);
    parent = group(parent, [0, -0.06, 0]);
  }
  blob(pink, [0, -0.02, 0], [0.03, 0.012, 0.03], { parent, cast: false });
  const tw = sparkleCloud(g, rand, 14, [2, 2, 2]);
  const sun = blob(mat('#ffd34d', { emissive: '#ffb81f', ei: 0.6 }), [0.7, 2.1, -2.8], 0.35, { parent: g, cast: false });
  return {
    group: g, room,
    update(rv, t) {
      ele.scale.setScalar(Math.max(0.001, backOut(span(rv, 0.05, 0.75))));
      ele.position.z = -0.95 + 0.25 * easeOut(span(rv, 0, 0.9));
      const raise = smooth(span(rv, 0.7, 1.4)) * (0.75 + 0.25 * Math.sin(t * 3));
      segs.forEach((s, i) => { s.rotation.x = -raise * (0.12 + i * 0.05) + Math.sin(t * 2 + i * 0.5) * 0.04; });
      ears.forEach((e, i) => { e.rotation.y = (i ? 1 : -1) * (0.4 + Math.sin(t * 4) * 0.25); });
      head.rotation.z = Math.sin(t * 1.5) * 0.08;
      sun.rotation.z = t;
      tw(t);
    },
  };
}

export function fishTank(rand) {
  // Not behind a door: a big aquarium standing against a sea-painted wall.
  const g = new THREE.Group();
  const W = 1.7, H = 1.15, D = 0.7, base = 0.62;
  // painted wall panel + bubbles
  mesh(new RoundedBoxGeometry(2.6, 3.2, 0.04, 4, 0.1), mat('#9fe6ff', { rough: 0.7, emissive: '#4fc8ff', ei: 0.25 }), { parent: g, pos: [0, 1.65, 0.03], cast: false });
  const wallBubbles = new THREE.Group(); g.add(wallBubbles);
  for (let i = 0; i < 18; i++) {
    const r = 0.04 + rand() * 0.09;
    mesh(new THREE.TorusGeometry(r, 0.012, 8, 24), mat('#ffffff', { opacity: 0.8 }), { parent: wallBubbles, pos: [(rand() - 0.5) * 2.3, 0.3 + rand() * 2.8, 0.06], cast: false });
  }
  // cabinet
  mesh(new RoundedBoxGeometry(W + 0.1, base, D + 0.1, 4, 0.04), mat('#ffffff', { gloss: true, rough: 0.3 }), { parent: g, pos: [0, base / 2, 0.45] });
  for (const s of [-1, 1]) blob(mat('#ffcf4a', { metal: 0.6, rough: 0.2 }), [s * 0.12, base * 0.55, 0.45 + (D + 0.1) / 2 + 0.01], 0.025, { parent: g, seg: 12 });
  const tankY = base + H / 2;
  const tank = group(g, [0, tankY, 0.45]);
  // water + glass
  mesh(new THREE.BoxGeometry(W - 0.04, H - 0.1, D - 0.04), mat('#4fc3ff', { opacity: 0.12, rough: 0.05 }), { parent: tank, pos: [0, -0.04, 0], cast: false });
  mesh(new THREE.BoxGeometry(W, H, D), new THREE.MeshPhysicalMaterial({ color: '#e8fbff', transparent: true, opacity: 0.08, roughness: 0.02, clearcoat: 1, depthWrite: false }), { parent: tank, cast: false });
  mesh(new RoundedBoxGeometry(W + 0.06, 0.06, D + 0.06, 2, 0.02), mat('#2f7cf6', { gloss: true }), { parent: tank, pos: [0, H / 2, 0] });
  // sand, pebbles, seaweed, shell
  mesh(new THREE.BoxGeometry(W - 0.05, 0.12, D - 0.05), mat('#ffe2a6', { rough: 0.9 }), { parent: tank, pos: [0, -H / 2 + 0.06, 0], cast: false });
  for (let i = 0; i < 14; i++) blob(mat(['#ff8fb1', '#8fd3ff', '#ffd36b', '#b59cff'][i % 4], { gloss: true }), [(rand() - 0.5) * (W - 0.2), -H / 2 + 0.13, (rand() - 0.5) * (D - 0.2)], [0.035, 0.022, 0.03], { parent: tank, cast: false, seg: 12 });
  const weeds = [];
  for (let i = 0; i < 6; i++) {
    const x = (i - 2.5) * 0.28 + (rand() - 0.5) * 0.08;
    const pts = [];
    for (let k = 0; k <= 5; k++) pts.push(new THREE.Vector3(Math.sin(k * 1.3) * 0.04, k * 0.1, 0));
    const wd = group(tank, [x, -H / 2 + 0.11, -0.2 + rand() * 0.15]);
    mesh(taperedTube(new THREE.CatmullRomCurve3(pts), 0.03, 20, 6, (t) => 1 - t * 0.8), mat(i % 2 ? '#2fcf6e' : '#1fae5a', { rough: 0.5 }), { parent: wd, cast: false });
    wd.scale.y = 0.8 + rand() * 0.6;
    weeds.push({ wd, ph: rand() * 6 });
  }
  // fish
  const fishes = [];
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(-0.09, 0.07); fin.quadraticCurveTo(-0.07, 0, -0.09, -0.07); fin.lineTo(0, 0);
  const finGeo = new THREE.ExtrudeGeometry(fin, { depth: 0.01, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2 });
  const oranges = ['#ff5a00', '#ff6a10', '#f04a00', '#ff7a1a'];
  for (let i = 0; i < 6; i++) {
    const f = new THREE.Group();
    const s = 1.05 + rand() * 0.5;
    const om = mat(oranges[i % 4], { gloss: true, rough: 0.25, emissive: oranges[i % 4], ei: 0.3 });
    blob(om, [0, 0, 0], [0.11, 0.075, 0.05], { parent: f });
    blob(mat('#ffffff', { gloss: true }), [0.02, 0, 0], [0.025, 0.07, 0.052], { parent: f, cast: false });
    const tail = mesh(finGeo, om, { parent: f, pos: [-0.09, 0, -0.005] });
    mesh(finGeo, om, { parent: f, pos: [0.01, 0.06, -0.005], rot: [0, 0, -1.6], scale: 0.6 });
    for (const zz of [-1, 1]) {
      const e = makeEye(0.022, '#111');
      e.position.set(0.06, 0.018, zz * 0.04);
      e.rotation.y = zz > 0 ? 0.6 : Math.PI - 0.6;
      f.add(e);
    }
    f.scale.setScalar(s);
    tank.add(f);
    fishes.push({ f, tail, r: 0.3 + rand() * 0.25, y: -0.3 + rand() * 0.55, sp: (0.5 + rand() * 0.5) * (i % 2 ? 1 : -1), ph: rand() * 6, zr: 0.12 + rand() * 0.1 });
  }
  const bubbles = [];
  for (let i = 0; i < 14; i++) {
    bubbles.push({ b: blob(mat('#ffffff', { opacity: 0.7, rough: 0.05 }), [0, 0, 0], 0.012 + rand() * 0.018, { parent: tank, cast: false, seg: 10 }), x: (rand() - 0.5) * (W - 0.3), z: (rand() - 0.5) * 0.4, ph: rand(), sp: 0.15 + rand() * 0.2 });
  }
  return {
    group: g, room: null, tank, tankTop: tankY + H / 2, scale: 0.72,
    update(rv, t) {
      fishes.forEach((o) => {
        const a = t * o.sp + o.ph;
        o.f.position.set(Math.cos(a) * o.r * 1.2, o.y + Math.sin(a * 2) * 0.06, Math.sin(a) * o.zr);
        o.f.rotation.y = Math.atan2(-Math.cos(a) * o.zr * o.sp, -Math.sin(a) * o.r * 1.2 * o.sp);
        o.tail.rotation.y = Math.sin(t * 12 + o.ph) * 0.5;
      });
      weeds.forEach(({ wd, ph }) => { wd.rotation.z = Math.sin(t * 1.4 + ph) * 0.15; });
      bubbles.forEach((o) => {
        const p = (t * o.sp + o.ph) % 1;
        o.b.position.set(o.x + Math.sin(p * 12) * 0.02, -H / 2 + 0.15 + p * (H - 0.25), o.z);
      });
      wallBubbles.position.y = Math.sin(t) * 0.03;
    },
  };
}

export function grapes(rand) {
  const g = new THREE.Group();
  const room = { wall: '#f2ddff', floor: '#d9b3ff' };
  const bunch = group(g, [0, 1.25, -0.9]);
  const purples = ['#7b2fbf', '#8a3bd1', '#6a22a8', '#9446d8'];
  const pts = [];
  for (let row = 0; row < 7; row++) {
    const ring = Math.max(1, 6 - row);
    const rr = ring * 0.055;
    for (let k = 0; k < ring * 2 + 1; k++) {
      const a = (k / (ring * 2 + 1)) * Math.PI * 2 + row * 0.4;
      pts.push([Math.cos(a) * rr * (0.6 + rand() * 0.4), -row * 0.1, Math.sin(a) * rr * (0.6 + rand() * 0.4)]);
    }
  }
  const grapeObjs = pts.map((p, i) => ({ m: blob(mat(purples[i % 4], { gloss: true, rough: 0.15, cc: 0.05 }), p, 0.075, { parent: bunch, seg: 24 }), p, i }));
  mesh(new THREE.CylinderGeometry(0.015, 0.025, 0.25, 8), mat('#6b8a2a'), { parent: bunch, pos: [0, 0.15, 0], rot: [0, 0, 0.2] });
  const leaf = new THREE.Shape();
  leaf.moveTo(0, 0);
  for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; leaf.lineTo(Math.cos(a) * 0.22 * (i % 2 ? 0.8 : 1), Math.sin(a) * 0.2 * (i % 2 ? 0.8 : 1) + 0.0); }
  mesh(new THREE.ExtrudeGeometry(leaf, { depth: 0.01, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 }), mat('#3fbf4a', { gloss: true }), { parent: bunch, pos: [0.06, 0.18, -0.05], rot: [-0.4, 0, -0.5] });
  const small = [];
  for (let i = 0; i < 9; i++) { const y = 0.4 + rand() * 1.8; small.push({ m: blob(mat(purples[i % 4], { gloss: true, rough: 0.15 }), [(rand() - 0.5) * 2, y, -0.8 - rand()], 0.06, { parent: g, seg: 20 }), y, ph: rand() * 6 }); }
  const tw = sparkleCloud(g, rand, 16, [2, 2, 2]);
  return {
    group: g, room,
    update(rv, t) {
      bunch.scale.setScalar(Math.max(0.001, elasticOut(span(rv, 0, 1.0)) * 1.1));
      bunch.rotation.y = Math.sin(t * 0.9) * 0.4;
      bunch.rotation.z = Math.sin(t * 1.4) * 0.05;
      small.forEach((s, i) => { s.m.scale.setScalar(0.06 * pop(rv, 0.3 + i * 0.05)); s.m.position.y = s.y + Math.sin(t * 2 + s.ph) * 0.05; });
      tw(t);
    },
  };
}

export function ice(rand) {
  const g = new THREE.Group();
  const room = { wall: '#dff6ff', floor: '#f4fcff' };
  const iceMat = new THREE.MeshPhysicalMaterial({ color: '#bfeaff', roughness: 0.05, transparent: true, opacity: 0.72, clearcoat: 1, clearcoatRoughness: 0.05, emissive: new THREE.Color('#7fd6ff'), emissiveIntensity: 0.18 });
  const cubes = [];
  const place = [[0, 0.3, -0.8, 0.6], [-0.55, 0.18, -1.0, 0.36], [0.55, 0.2, -0.95, 0.4], [0.3, 0.13, -0.45, 0.26], [-0.35, 0.12, -0.45, 0.24]];
  place.forEach(([x, y, z, s], i) => {
    const c = group(g, [x, y, z]);
    mesh(new RoundedBoxGeometry(s, s, s, 4, s * 0.12), iceMat, { parent: c });
    if (i === 0) { // the friendly ice cube
      cuteFace(c, { y: 0.05, z: s / 2 + 0.005, eyeR: 0.05, eyeGap: 0.11, iris: '#1d4f8a' });
      smileArc(c, [0, -0.08, s / 2 + 0.01], 0.045, '#2a5a9a');
      for (const k of [-1, 1]) blob(mat('#ff9fc0'), [k * 0.17, -0.05, s / 2 + 0.005], [0.04, 0.025, 0.01], { parent: c, cast: false });
    }
    cubes.push({ c, y, i });
  });
  // icicles and snow mounds
  for (let i = 0; i < 11; i++) {
    const h = 0.15 + rand() * 0.3;
    mesh(new THREE.ConeGeometry(0.04 + rand() * 0.03, h, 10), iceMat, { parent: g, pos: [-1.2 + i * 0.24, 2.75 - h / 2, -0.4 - rand() * 0.3], rot: [Math.PI, 0, 0], cast: false });
  }
  for (let i = 0; i < 6; i++) blob(mat('#ffffff', { rough: 0.9 }), [(rand() - 0.5) * 2.2, 0, -0.6 - rand() * 1.8], [0.3 + rand() * 0.3, 0.14 + rand() * 0.1, 0.25], { parent: g, cast: false });
  const flakes = [];
  const fm = mat('#ffffff', { emissive: '#ffffff', ei: 0.6 });
  for (let i = 0; i < 40; i++) flakes.push({ f: blob(fm, [0, 0, 0], 0.012 + rand() * 0.015, { parent: g, cast: false, seg: 8 }), x: (rand() - 0.5) * 2.4, z: -0.3 - rand() * 2.2, ph: rand(), sp: 0.12 + rand() * 0.12 });
  return {
    group: g, room,
    update(rv, t) {
      cubes.forEach(({ c, y, i }) => {
        const k = pop(rv, i * 0.08, 0.6);
        c.scale.setScalar(Math.max(0.001, k));
        c.position.y = y + (i === 0 ? Math.abs(Math.sin(t * 3)) * 0.06 * smooth(span(rv, 0.8, 1.1)) : 0);
        c.rotation.y = i === 0 ? Math.sin(t * 2) * 0.15 : i;
      });
      flakes.forEach((o) => { const p = (t * o.sp + o.ph) % 1; o.f.position.set(o.x + Math.sin(p * 9 + o.ph * 6) * 0.08, 2.7 - p * 2.7, o.z); });
    },
  };
}

export function jelly(rand) {
  const g = new THREE.Group();
  const room = { wall: '#ffe0ef', floor: '#ffc2dc' };
  const prof = [[0, 0], [0.22, 0], [0.225, 0.04], [0.2, 0.09], [0.205, 0.13], [0.17, 0.18], [0.175, 0.22], [0.13, 0.27], [0.135, 0.3], [0.09, 0.34], [0.0, 0.35]].map(([r, y]) => new THREE.Vector2(r, y));
  const jgeo = new THREE.LatheGeometry(prof, 48);
  const cols = ['#ff3b5c', '#32d46a', '#ff9a1f', '#a45bff', '#ffd21f'];
  const jellies = [];
  const spots = [[0, 0.62, -0.85, 1.35], [-0.6, 0.0, -0.6, 0.85], [0.6, 0.0, -0.65, 0.85], [-0.35, 0.0, -1.5, 0.8], [0.4, 0.0, -1.55, 0.8]];
  // table under the big jelly
  mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 40), mat('#ffffff', { gloss: true }), { parent: g, pos: [0, 0.6, -0.85] });
  mesh(new THREE.CylinderGeometry(0.05, 0.12, 0.6, 20), mat('#ffffff', { gloss: true }), { parent: g, pos: [0, 0.3, -0.85] });
  spots.forEach(([x, y, z, s], i) => {
    const plate = group(g, [x, y, z]);
    mesh(new THREE.CylinderGeometry(0.3 * s, 0.26 * s, 0.03, 40), mat('#ffffff', { gloss: true }), { parent: plate, pos: [0, 0.015, 0] });
    const j = group(plate, [0, 0.03, 0]);
    const c = cols[i % cols.length];
    mesh(jgeo, new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.08, transparent: true, opacity: 0.86, clearcoat: 1, clearcoatRoughness: 0.03, emissive: new THREE.Color(c), emissiveIntensity: 0.22 }), { parent: j, scale: s });
    blob(mat('#ffffff', { rough: 0.6 }), [0, 0.36 * s, 0], [0.07 * s, 0.035 * s, 0.07 * s], { parent: j });
    blob(mat('#e8132f', { gloss: true }), [0, 0.4 * s, 0], 0.035 * s, { parent: j });
    jellies.push({ j, i });
  });
  const tw = sparkleCloud(g, rand, 14, [2, 2, 2]);
  return {
    group: g, room,
    update(rv, t) {
      jellies.forEach(({ j, i }) => {
        const k = pop(rv, i * 0.08, 0.6);
        const wob = Math.sin(t * 9 + i) * 0.07 * (0.4 + 0.6 * Math.exp(-Math.max(0, rv - 0.3) * 0.7));
        j.scale.set(k * (1 + wob), Math.max(0.001, k * (1 - wob)), k * (1 + wob));
      });
      tw(t);
    },
  };
}

export function kite(rand) {
  const g = new THREE.Group();
  const room = { wall: '#9fdcff', floor: '#8de08a' };
  const kites = [];
  const tri = (a, b, c) => { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c], 3)); geo.computeVertexNormals(); return geo; };
  const T = [0, 0.32, 0], B = [0, -0.42, 0], L = [-0.26, 0.05, 0], R = [0.26, 0.05, 0], C = [0, 0.05, 0.02];
  const palettes = [['#ff3b5c', '#ffd21f', '#2f7cf6', '#22b55a'], ['#a45bff', '#ff8a2a', '#19c3d6', '#ff5aa5'], ['#ffd21f', '#ff3b5c', '#22b55a', '#2f7cf6']];
  const make = (pal, s) => {
    const k = new THREE.Group();
    [[T, L, C], [T, C, R], [L, B, C], [C, B, R]].forEach((f, i) => mesh(tri(...f), mat(pal[i], { rough: 0.4, side: THREE.DoubleSide }), { parent: k, cast: false }));
    mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.74, 6), mat('#8a5a2b'), { parent: k, pos: [0, -0.05, 0.025] });
    mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.52, 6), mat('#8a5a2b'), { parent: k, pos: [0, 0.05, 0.025], rot: [0, 0, Math.PI / 2] });
    const tail = [];
    for (let i = 0; i < 5; i++) {
      const bow = group(k, [0, -0.5 - i * 0.12, 0]);
      blob(mat(pal[i % 4], { gloss: true }), [-0.03, 0, 0], [0.035, 0.02, 0.01], { parent: bow, cast: false, seg: 10 });
      blob(mat(pal[i % 4], { gloss: true }), [0.03, 0, 0], [0.035, 0.02, 0.01], { parent: bow, cast: false, seg: 10 });
      tail.push(bow);
    }
    k.scale.setScalar(s);
    g.add(k);
    return { k, tail };
  };
  const pos = [[0, 1.55, -1.0, 1.25], [-0.75, 2.05, -1.9, 0.8], [0.75, 1.95, -1.7, 0.85]];
  pos.forEach(([x, y, z, s], i) => { const o = make(palettes[i], s); kites.push({ ...o, x, y, z, s, ph: i * 1.7 }); });
  // string from main kite down to the floor
  const stringGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 1.1, -1.0), new THREE.Vector3(0.2, 0, -0.5)]);
  const string = new THREE.Line(stringGeo, new THREE.LineBasicMaterial({ color: '#ffffff' }));
  g.add(string);
  // clouds + sun
  const cloudMat = mat('#ffffff', { rough: 0.9, emissive: '#ffffff', ei: 0.25 });
  const clouds = [];
  for (let i = 0; i < 4; i++) {
    const c = group(g, [(rand() - 0.5) * 2.2, 0.9 + rand() * 1.6, -2.5]);
    for (let k = 0; k < 4; k++) blob(cloudMat, [(k - 1.5) * 0.14, Math.sin(k) * 0.04, 0], 0.12 + (k % 2) * 0.05, { parent: c, cast: false });
    clouds.push({ c, x: c.position.x, sp: 0.05 + rand() * 0.05 });
  }
  return {
    group: g, room,
    update(rv, t) {
      kites.forEach((o, i) => {
        const k = pop(rv, i * 0.15, 0.7);
        o.k.scale.setScalar(Math.max(0.001, o.s * k));
        o.k.position.set(o.x + Math.sin(t * 0.9 + o.ph) * 0.1, o.y + Math.sin(t * 1.6 + o.ph) * 0.08 - (1 - k) * 0.5, o.z);
        o.k.rotation.z = Math.sin(t * 1.3 + o.ph) * 0.2;
        o.tail.forEach((b, j) => { b.position.x = Math.sin(t * 3 + j * 0.8 + o.ph) * 0.05 * (j + 1) * 0.5; });
      });
      const p = string.geometry.attributes.position;
      p.setXYZ(0, kites[0].k.position.x, kites[0].k.position.y - 0.45 * kites[0].s, kites[0].k.position.z);
      p.needsUpdate = true;
      string.visible = rv > 0.4;
      clouds.forEach((c) => { c.c.position.x = c.x + Math.sin(t * c.sp * 4) * 0.15; });
    },
  };
}

export function lion(rand) {
  const g = new THREE.Group();
  const room = { wall: '#fff0c2', floor: '#ffd98a' };
  const gold = mat('#f5b942', { rough: 0.6 });
  const cream = mat('#fff1cf', { rough: 0.6 });
  const maneMat = mat('#e0752a', { rough: 0.75 });
  const leo = group(g, [0, 0, -0.5]);
  blob(gold, [0, 0.32, -0.15], [0.23, 0.24, 0.3], { parent: leo });
  blob(cream, [0, 0.3, 0.05], [0.14, 0.17, 0.12], { parent: leo });
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    capsule(0.06, 0.12, gold, { parent: leo, pos: [sx * 0.12, 0.12, sz * 0.14 - 0.12] });
    blob(cream, [sx * 0.12, 0.035, sz * 0.14 - 0.08], [0.065, 0.04, 0.08], { parent: leo });
  }
  const tail = group(leo, [0, 0.35, -0.42], [-0.5, 0, 0]);
  capsule(0.025, 0.25, gold, { parent: tail, pos: [0, 0.14, 0] });
  blob(maneMat, [0, 0.3, 0], 0.055, { parent: tail });
  const head = group(leo, [0, 0.68, 0.08]);
  // mane: two rings of puffs
  for (let ring = 0; ring < 2; ring++) {
    const n = ring ? 14 : 18, R = ring ? 0.2 : 0.27;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      blob(ring ? mat('#f08a2e', { rough: 0.75 }) : maneMat, [Math.cos(a) * R, Math.sin(a) * R, -0.06 - ring * -0.03], ring ? 0.085 : 0.1, { parent: head, seg: 20 });
    }
  }
  blob(gold, [0, 0, 0.04], [0.2, 0.185, 0.17], { parent: head, seg: 40 });
  for (const s of [-1, 1]) {
    blob(gold, [s * 0.15, 0.15, 0.02], [0.055, 0.055, 0.03], { parent: head });
    blob(mat('#ffb3a0'), [s * 0.15, 0.15, 0.04], [0.03, 0.03, 0.015], { parent: head, cast: false });
    blob(cream, [s * 0.045, -0.07, 0.17], [0.06, 0.045, 0.045], { parent: head, cast: false });
    blob(mat('#ff9f8f'), [s * 0.12, -0.04, 0.16], [0.035, 0.02, 0.01], { parent: head, cast: false });
  }
  cuteFace(head, { y: 0.035, z: 0.185, eyeR: 0.042, eyeGap: 0.075, iris: '#5a3410' });
  blob(mat('#5a2e1a', { gloss: true }), [0, -0.035, 0.215], [0.035, 0.024, 0.02], { parent: head, cast: false });
  smileArc(head, [-0.022, -0.09, 0.205], 0.022);
  smileArc(head, [0.022, -0.09, 0.205], 0.022);
  // grass tufts
  for (let i = 0; i < 10; i++) mesh(new THREE.ConeGeometry(0.04, 0.2 + rand() * 0.15, 6), mat('#6fcf5a'), { parent: g, pos: [(rand() - 0.5) * 2.2, 0.1, -0.5 - rand() * 2], cast: false });
  const tw = sparkleCloud(g, rand, 14, [2, 2, 2]);
  return {
    group: g, room,
    update(rv, t) {
      leo.scale.setScalar(Math.max(0.001, backOut(span(rv, 0.05, 0.75))));
      leo.position.z = -0.8 + 0.35 * easeOut(span(rv, 0, 0.9));
      head.rotation.z = Math.sin(t * 1.8) * 0.12;
      head.rotation.y = -0.2;
      head.position.y = 0.68 + Math.sin(t * 3) * 0.01;
      tail.rotation.z = Math.sin(t * 2.5) * 0.4;
      tw(t);
    },
  };
}

export function hamster() {
  const g = new THREE.Group();
  const fur = mat('#f2a65a', { rough: 0.75 });
  const white = mat('#fff6ea', { rough: 0.75 });
  const pink = mat('#ffa3b5', { rough: 0.5 });
  const ham = group(g);
  blob(fur, [0, 0.42, 0], [0.42, 0.42, 0.36], { parent: ham, seg: 48 });
  blob(white, [0, 0.33, 0.14], [0.3, 0.31, 0.25], { parent: ham, seg: 40 });
  // fluffy tufts
  const r = rng(5);
  for (let i = 0; i < 26; i++) {
    const a = r() * Math.PI * 2, y = 0.1 + r() * 0.7;
    blob(fur, [Math.cos(a) * 0.38 * Math.sin((y / 0.84) * Math.PI), y, Math.sin(a) * 0.3 - 0.05], 0.06 + r() * 0.04, { parent: ham, seg: 16 });
  }
  const head = group(ham, [0, 0.78, 0.05]);
  blob(fur, [0, 0, 0], [0.3, 0.26, 0.26], { parent: head, seg: 48 });
  for (const s of [-1, 1]) {
    blob(white, [s * 0.14, -0.08, 0.15], [0.13, 0.11, 0.11], { parent: head });
    blob(fur, [s * 0.2, 0.2, -0.02], [0.08, 0.08, 0.04], { parent: head });
    blob(pink, [s * 0.2, 0.2, 0.01], [0.05, 0.05, 0.02], { parent: head, cast: false });
    blob(pink, [s * 0.17, -0.05, 0.23], [0.05, 0.03, 0.01], { parent: head, cast: false });
  }
  blob(white, [0, 0.12, 0.2], [0.06, 0.12, 0.05], { parent: head, cast: false });
  cuteFace(head, { y: 0.04, z: 0.22, eyeR: 0.055, eyeGap: 0.105, iris: '#1a0f0a' });
  blob(pink, [0, -0.04, 0.27], [0.03, 0.022, 0.02], { parent: head, cast: false });
  smileArc(head, [-0.025, -0.08, 0.255], 0.025);
  smileArc(head, [0.025, -0.08, 0.255], 0.025);
  const pawL = group(ham, [0.17, 0.48, 0.3]);
  blob(pink, [0, 0, 0], [0.05, 0.06, 0.05], { parent: pawL });
  const armR = group(ham, [-0.3, 0.55, 0.15]);
  capsule(0.06, 0.16, fur, { parent: armR, pos: [0, 0.12, 0] });
  blob(pink, [0, 0.26, 0], [0.06, 0.065, 0.05], { parent: armR });
  for (const s of [-1, 1]) blob(pink, [s * 0.16, 0.05, 0.25], [0.08, 0.04, 0.1], { parent: ham });
  // cushion
  mesh(new THREE.CylinderGeometry(0.6, 0.65, 0.12, 48), mat('#b9a4ff', { rough: 0.5, gloss: true }), { parent: g, pos: [0, -0.02, 0] });
  return {
    group: g,
    update(t) {
      armR.rotation.z = 0.55 + Math.sin(t * 7) * 0.4;
      armR.rotation.x = -0.3;
      head.rotation.z = Math.sin(t * 3.5) * 0.1;
      ham.position.y = Math.abs(Math.sin(t * 3.5)) * 0.04;
      ham.scale.set(1 + Math.sin(t * 7) * 0.012, 1 - Math.sin(t * 7) * 0.012, 1);
    },
  };
}

export const builders = { apple, banana, cat, dog, elephant, fish: fishTank, grapes, ice, jelly, kite, lion };
