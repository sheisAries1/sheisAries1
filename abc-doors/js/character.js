import * as THREE from 'three';
import { mat, mesh, blob, group, capsule, makeEye, sphereGeo, rng } from './util.js';

// The toddler: ~1 unit tall, faces +z. Built from soft primitives so she stays
// identical in every shot. pose() is called once per frame with a full state.

const SKIN = '#7b4a2e';
const SKIN_BLUSH = '#97523a';
const HAIR = '#1b100b';
const DRESS = '#ffb3d1';
const BOW = '#ff4f9e';
const DOWN = new THREE.Vector3(0, -1, 0);

export function createToddler() {
  const skin = mat(SKIN, { rough: 0.5 });
  const dressMat = mat(DRESS, { rough: 0.55 });
  const white = mat('#ffffff', { rough: 0.5 });

  const root = new THREE.Group();
  const body = group(root);            // bounce / lean layer
  const hips = group(body, [0, 0.34, 0]);

  // Legs + Mary-Jane shoes
  const legs = [];
  for (const side of [-1, 1]) {
    const leg = group(hips, [side * 0.06, -0.02, 0]);
    capsule(0.05, 0.17, skin, { parent: leg, pos: [0, -0.13, 0] });
    mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.05, 20), white, { parent: leg, pos: [0, -0.255, 0] });
    blob(mat('#ff7eb6', { rough: 0.25, gloss: true }), [0, -0.3, 0.03], [0.062, 0.042, 0.092], { parent: leg });
    blob(white, [0, -0.272, 0.05], [0.04, 0.008, 0.02], { parent: leg, seg: 12 });
    legs.push(leg);
  }

  // Dress: a bell-shaped lathe with a lace hem
  const prof = [[0, -0.075], [0.205, -0.075], [0.218, -0.055], [0.2, 0.0], [0.16, 0.1], [0.12, 0.19], [0.105, 0.245], [0.06, 0.275], [0, 0.28]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  mesh(new THREE.LatheGeometry(prof, 48), dressMat, { parent: hips });
  mesh(new THREE.TorusGeometry(0.212, 0.014, 10, 64), white, { parent: hips, pos: [0, -0.066, 0], rot: [Math.PI / 2, 0, 0] });
  // little heart applique
  const heart = new THREE.Shape();
  heart.moveTo(0, -0.02); heart.bezierCurveTo(-0.04, 0.0, -0.025, 0.035, 0, 0.018); heart.bezierCurveTo(0.025, 0.035, 0.04, 0.0, 0, -0.02);
  mesh(new THREE.ExtrudeGeometry(heart, { depth: 0.006, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 2 }),
    mat('#ff4f9e', { gloss: true }), { parent: hips, pos: [0, 0.13, 0.14], rot: [-0.35, 0, 0], cast: false });

  const chest = group(hips, [0, 0.2, 0]);
  // puff sleeves + Peter Pan collar
  for (const side of [-1, 1]) {
    blob(dressMat, [side * 0.115, 0.0, 0], [0.068, 0.06, 0.066], { parent: chest });
    blob(white, [side * 0.045, 0.06, 0.07], [0.055, 0.016, 0.04], { parent: chest, rot: [0.3, 0, side * -0.35] });
  }
  capsule(0.045, 0.04, skin, { parent: chest, pos: [0, 0.08, 0] });

  const arms = {};
  for (const [name, side] of [['R', -1], ['L', 1]]) {
    const arm = group(chest, [side * 0.128, -0.005, 0]);
    capsule(0.037, 0.13, skin, { parent: arm, pos: [0, -0.1, 0] });
    blob(skin, [0, -0.215, 0.005], [0.045, 0.048, 0.042], { parent: arm });
    arms[name] = arm;
  }

  // Head
  const neck = group(chest, [0, 0.1, 0]);
  const head = group(neck, [0, 0.14, 0]);
  blob(skin, [0, 0, 0], [0.2, 0.19, 0.188], { parent: head, seg: 48 });
  for (const side of [-1, 1]) {
    blob(skin, [side * 0.193, -0.01, -0.005], [0.03, 0.045, 0.028], { parent: head });
    blob(mat(SKIN_BLUSH, { rough: 0.55 }), [side * 0.105, -0.068, 0.128], [0.06, 0.05, 0.05], { parent: head, cast: false });
  }
  const eyes = [];
  for (const side of [-1, 1]) {
    const e = makeEye(0.046, '#3a1d12');
    e.position.set(side * 0.072, -0.004, 0.158);
    e.rotation.y = side * 0.28;
    head.add(e);
    // lashes
    const lash = mesh(new THREE.TorusGeometry(0.046, 0.0045, 6, 20, Math.PI * 0.55), mat('#120806'), { parent: e, pos: [0, 0.006, 0.006], rot: [0, 0, Math.PI * 0.22], cast: false });
    lash.scale.set(1.02, 1.15, 1);
    eyes.push(e);
  }
  const brows = [];
  for (const side of [-1, 1]) {
    const b = capsule(0.007, 0.03, mat(HAIR), { parent: head, pos: [side * 0.075, 0.075, 0.172], rot: [0, 0, Math.PI / 2 + side * 0.15], cast: false });
    brows.push(b);
  }
  blob(skin, [0, -0.035, 0.188], [0.024, 0.019, 0.018], { parent: head, cast: false });

  const mouth = group(head, [0, -0.098, 0.17]);
  const smile = mesh(new THREE.TorusGeometry(0.032, 0.0085, 8, 24, Math.PI), mat('#4a1f17', { rough: 0.3 }), { parent: mouth, rot: [0.15, 0, Math.PI], cast: false });
  const open = group(mouth, [0, -0.008, 0]);
  blob(mat('#3a120d', { rough: 0.3 }), [0, 0, 0], [0.03, 0.03, 0.014], { parent: open, cast: false });
  blob(mat('#ff7f8f'), [0, -0.012, 0.004], [0.018, 0.01, 0.01], { parent: open, cast: false });

  // Short afro: instanced puffs on a shell around the skull, leaving the face clear.
  const rand = rng(7);
  const puffs = [];
  const N = 420;
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * 2.399963;
    const d = new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
    if (d.y < -0.05) continue;
    if (d.z > 0.3 && d.y < 0.58) continue;          // face
    if (Math.abs(d.x) > 0.75 && d.y < 0.3 && d.z > -0.3) continue; // around ears
    if (d.z < -0.2 && d.y < 0.1 && d.y > -0.05) { /* nape: keep */ }
    puffs.push(d);
  }
  const hairMat = mat(HAIR, { rough: 0.88 });
  const hair = new THREE.InstancedMesh(sphereGeo(14), hairMat, puffs.length);
  const m4 = new THREE.Matrix4();
  puffs.forEach((d, i) => {
    const s = 0.05 + rand() * 0.022;
    const lift = 0.205 + rand() * 0.02 + Math.max(0, d.y) * 0.02;
    m4.compose(new THREE.Vector3(d.x * lift * 1.02, d.y * lift * 0.97 + 0.012, d.z * lift),
      new THREE.Quaternion(), new THREE.Vector3(s, s, s));
    hair.setMatrixAt(i, m4);
  });
  hair.castShadow = true;
  head.add(hair);

  // Ribbon on her left side
  const bow = group(head, [0.15, 0.15, 0.05], [0.2, 0.5, -0.55]);
  const bowMat = mat(BOW, { rough: 0.25, gloss: true });
  blob(bowMat, [-0.045, 0, 0], [0.05, 0.034, 0.022], { parent: bow, rot: [0, 0, 0.25] });
  blob(bowMat, [0.045, 0, 0], [0.05, 0.034, 0.022], { parent: bow, rot: [0, 0, -0.25] });
  blob(bowMat, [0, 0, 0.006], [0.02, 0.022, 0.02], { parent: bow });
  blob(bowMat, [-0.018, -0.04, 0], [0.012, 0.03, 0.01], { parent: bow, rot: [0, 0, -0.35] });
  blob(bowMat, [0.018, -0.04, 0], [0.012, 0.03, 0.01], { parent: bow, rot: [0, 0, 0.35] });

  root.traverse((o) => { if (o.isMesh) o.receiveShadow = false; });

  const q = new THREE.Quaternion();
  const tmp = new THREE.Vector3();

  function setArm(arm, dir) {
    tmp.copy(dir).normalize();
    arm.quaternion.setFromUnitVectors(DOWN, tmp);
  }

  const api = {
    root, chest, head, arms,
    // Convert a world-space point into a direction from the given shoulder, in chest space.
    dirTo(armName, worldPoint, out = new THREE.Vector3()) {
      root.updateMatrixWorld(true);
      const arm = arms[armName];
      const sh = arm.getWorldPosition(new THREE.Vector3());
      out.copy(worldPoint).sub(sh);
      chest.getWorldQuaternion(q).invert();
      return out.applyQuaternion(q).normalize();
    },
    reachDist(armName, worldPoint) {
      root.updateMatrixWorld(true);
      return arms[armName].getWorldPosition(new THREE.Vector3()).distanceTo(worldPoint);
    },
    pose(p) {
      const ph = p.phase ?? 0;
      const w = p.walk ?? 0;
      root.rotation.y = p.yaw ?? 0;
      body.position.y = (p.bounce ?? 0) + w * Math.abs(Math.sin(ph)) * 0.025;
      body.rotation.x = (p.lean ?? 0) + w * 0.05;
      body.rotation.z = w * Math.sin(ph) * 0.04 + (p.sway ?? 0);
      legs[0].rotation.x = w * Math.sin(ph) * 0.55 + (p.legR ?? 0);
      legs[1].rotation.x = -w * Math.sin(ph) * 0.55 + (p.legL ?? 0);
      hips.rotation.y = w * Math.sin(ph) * 0.08;

      const restR = new THREE.Vector3(-0.22 - w * 0.05, -1, Math.sin(ph) * -0.45 * w + 0.05);
      const restL = new THREE.Vector3(0.22 + w * 0.05, -1, Math.sin(ph) * 0.45 * w + 0.05);
      setArm(arms.R, p.armR ?? restR);
      setArm(arms.L, p.armL ?? restL);
      arms.R.scale.y = p.stretchR ?? 1;
      arms.L.scale.y = p.stretchL ?? 1;

      head.rotation.set(p.headPitch ?? 0, p.headYaw ?? 0, p.headTilt ?? 0);
      neck.rotation.z = w * Math.sin(ph) * -0.03;

      const sur = p.surprise ?? 0;
      const blink = p.blink ?? 0;
      const smileAmt = p.smile ?? 0.6;
      for (const e of eyes) {
        const s = 1 + sur * 0.16 + smileAmt * 0.02;
        e.scale.set(s, s * (1 - blink * 0.92) * (1 - Math.max(0, smileAmt - 0.85) * 0.5), s);
        e.userData.iris.position.x = (p.lookX ?? 0) * 0.012;
        e.userData.iris.position.y = -0.046 * 0.05 + (p.lookY ?? 0) * 0.01;
      }
      brows.forEach((b, i) => { b.position.y = 0.075 + sur * 0.022 + smileAmt * 0.004; });
      const openAmt = Math.max(sur, p.open ?? 0);
      open.scale.set(0.9 + openAmt * 0.3 + smileAmt * 0.25, openAmt * (1 + smileAmt * 0.2), 1);
      open.visible = openAmt > 0.02;
      smile.scale.set(1 + smileAmt * 0.35 - openAmt * 0.5, 0.6 + smileAmt * 0.7, 1);
      smile.visible = openAmt < 0.75;
    },
  };
  return api;
}
