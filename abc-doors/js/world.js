import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { mat, mesh, blob, group, rng } from './util.js';

// The learning room: glossy floor, a long wall of colourful doors, toys and shapes.

export const SPACING = 3.0;
export const DOOR_W = 1.0;
export const DOOR_H = 2.05;
export const HANDLE = new THREE.Vector3(0.42, 0.86, 0.075); // relative to door slot centre

const WALL = '#ffe4ef';
const SHAPE_COLORS = ['#ff5a5f', '#2f7cf6', '#ffc61f', '#22b55a', '#a66bff', '#ff8a2a', '#19c3d6'];

export function buildRoom(scene, slots, font, size) {
  const rand = rng(42);
  const minX = -SPACING, maxX = (slots - 1) * SPACING + SPACING;
  const width = maxX - minX;
  const midX = (minX + maxX) / 2;

  // Glossy floor = real mirror under a slightly translucent white surface.
  const mirror = new Reflector(new THREE.PlaneGeometry(width + 10, 14), {
    textureWidth: size.w * 0.5, textureHeight: size.h * 0.5, color: 0xd8d8d8,
  });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.set(midX, -0.002, 5);
  scene.add(mirror);
  const floor = mesh(new THREE.PlaneGeometry(width + 10, 14), mat('#ffffff', { rough: 0.25, opacity: 0.8 }),
    { pos: [midX, 0, 5], rot: [-Math.PI / 2, 0, 0], cast: false, receive: true });
  scene.add(floor);

  // Wall pieces between doorways.
  const wallMat = mat(WALL, { rough: 0.8 });
  const wallH = 4.4;
  const addWall = (x0, x1, y0, y1) => {
    if (x1 - x0 < 0.001) return;
    mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, 0.2), wallMat, { parent: scene, pos: [(x0 + x1) / 2, (y0 + y1) / 2, -0.1], cast: false, receive: true });
  };
  let x = minX;
  for (let i = 0; i < slots; i++) {
    const cx = i * SPACING;
    addWall(x, cx - DOOR_W / 2 - 0.0, 0, wallH);
    addWall(cx - DOOR_W / 2, cx + DOOR_W / 2, DOOR_H, wallH);
    x = cx + DOOR_W / 2;
  }
  addWall(x, maxX, 0, wallH);
  // baseboard and a mint stripe, broken at each doorway
  const trimMat = mat('#ffffff', { rough: 0.4 }), stripeMat = mat('#9fe8cf', { rough: 0.6 });
  const gap = DOOR_W / 2 + 0.1;
  for (let i = -1; i < slots; i++) {
    const x0 = i < 0 ? minX : i * SPACING + gap, x1 = i + 1 >= slots ? maxX : (i + 1) * SPACING - gap;
    mesh(new THREE.BoxGeometry(x1 - x0, 0.12, 0.04), trimMat, { parent: scene, pos: [(x0 + x1) / 2, 0.06, 0.02], cast: false });
    mesh(new THREE.BoxGeometry(x1 - x0, 0.1, 0.03), stripeMat, { parent: scene, pos: [(x0 + x1) / 2, 1.35, 0.015], cast: false });
  }

  // Bunting along the top
  const flagGeo = new THREE.BufferGeometry();
  flagGeo.setAttribute('position', new THREE.Float32BufferAttribute([-0.13, 0, 0, 0.13, 0, 0, 0, -0.3, 0], 3));
  flagGeo.computeVertexNormals();
  for (let fx = minX + 0.2, k = 0; fx < maxX; fx += 0.36, k++) {
    const sag = 0.12 * Math.sin(((fx - minX) / 1.44) * Math.PI) ** 2;
    mesh(flagGeo, mat(SHAPE_COLORS[k % SHAPE_COLORS.length], { rough: 0.5, side: THREE.DoubleSide }),
      { parent: scene, pos: [fx, 3.25 - sag, 0.04], rot: [0.12, 0, 0], cast: false });
  }

  // Wall shapes: circles, stars, triangles, hearts.
  const floaters = [];
  const shapeGeos = makeShapeGeos();
  for (let i = -1; i < slots; i++) {
    const cx = i * SPACING + SPACING / 2;
    for (let k = 0; k < 4; k++) {
      const g = shapeGeos[Math.floor(rand() * shapeGeos.length)];
      const m = mesh(g, mat(SHAPE_COLORS[Math.floor(rand() * SHAPE_COLORS.length)], { rough: 0.3, gloss: true }), {
        parent: scene, pos: [cx + (rand() - 0.5) * 0.9, 1.65 + rand() * 1.35, 0.03], rot: [0, 0, rand() * 6], scale: 0.7 + rand() * 0.6, cast: false,
      });
      floaters.push({ m, base: m.position.y, ph: rand() * 6, rot: m.rotation.z });
    }
  }

  // Floor toys: blocks, balls, pyramids, ring stackers.
  for (let i = -1; i < slots; i++) {
    const cx = i * SPACING + SPACING / 2;
    const n = 2 + Math.floor(rand() * 2);
    for (let k = 0; k < n; k++) {
      const c = SHAPE_COLORS[Math.floor(rand() * SHAPE_COLORS.length)];
      const px = cx + (rand() - 0.5) * 1.2, pz = 0.25 + rand() * 0.5;
      const kind = Math.floor(rand() * 4);
      if (kind === 0) {
        const s = 0.18 + rand() * 0.08;
        mesh(new RoundedBoxGeometry(s, s, s, 3, 0.03), mat(c, { gloss: true, rough: 0.3 }), { parent: scene, pos: [px, s / 2, pz], rot: [0, rand(), 0] });
      } else if (kind === 1) {
        const r = 0.1 + rand() * 0.06;
        blob(mat(c, { gloss: true, rough: 0.2 }), [px, r, pz], r, { parent: scene });
      } else if (kind === 2) {
        mesh(new THREE.ConeGeometry(0.13, 0.24, 4), mat(c, { gloss: true, rough: 0.3 }), { parent: scene, pos: [px, 0.12, pz], rot: [0, rand(), 0] });
      } else {
        for (let r = 0; r < 4; r++) {
          mesh(new THREE.TorusGeometry(0.1 - r * 0.018, 0.035, 12, 24), mat(SHAPE_COLORS[(r + k) % SHAPE_COLORS.length], { gloss: true, rough: 0.25 }),
            { parent: scene, pos: [px, 0.035 + r * 0.06, pz], rot: [Math.PI / 2, 0, 0] });
        }
        mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.28, 8), mat('#ffe9a8'), { parent: scene, pos: [px, 0.14, pz] });
      }
    }
  }

  return {
    update(t) {
      for (const f of floaters) {
        f.m.position.y = f.base + Math.sin(t * 1.3 + f.ph) * 0.03;
        f.m.rotation.z = f.rot + Math.sin(t * 0.8 + f.ph) * 0.08;
      }
    },
  };
}

function makeShapeGeos() {
  const ext = (shape) => new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.015, bevelSegments: 3 });
  const star = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.07 : 0.16, a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    i ? star.lineTo(Math.cos(a) * r, Math.sin(a) * r) : star.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const tri = new THREE.Shape(); tri.moveTo(0, 0.14); tri.lineTo(0.13, -0.09); tri.lineTo(-0.13, -0.09);
  const circ = new THREE.Shape(); circ.absarc(0, 0, 0.11, 0, Math.PI * 2);
  const heart = new THREE.Shape();
  heart.moveTo(0, -0.11); heart.bezierCurveTo(-0.2, 0.0, -0.12, 0.18, 0, 0.07); heart.bezierCurveTo(0.12, 0.18, 0.2, 0.0, 0, -0.11);
  const sq = new THREE.Shape(); sq.moveTo(-0.09, -0.09); sq.lineTo(0.09, -0.09); sq.lineTo(0.09, 0.09); sq.lineTo(-0.09, 0.09);
  return [star, tri, circ, heart, sq].map(ext);
}

// A door in its frame. Hinge on the left (camera view); opens inward (-z).
export function buildDoor(parent, cfg, font) {
  const g = group(parent);
  const frameMat = mat('#ffffff', { rough: 0.3, gloss: true });
  const fw = 0.09;
  mesh(new RoundedBoxGeometry(fw, DOOR_H + fw, 0.26, 3, 0.03), frameMat, { parent: g, pos: [-DOOR_W / 2 - fw / 2, (DOOR_H + fw) / 2, 0.0], cast: false });
  mesh(new RoundedBoxGeometry(fw, DOOR_H + fw, 0.26, 3, 0.03), frameMat, { parent: g, pos: [DOOR_W / 2 + fw / 2, (DOOR_H + fw) / 2, 0.0], cast: false });
  mesh(new RoundedBoxGeometry(DOOR_W + fw * 2, fw, 0.26, 3, 0.03), frameMat, { parent: g, pos: [0, DOOR_H + fw / 2, 0.0], cast: false });

  const hinge = group(g, [-DOOR_W / 2 + 0.01, 0, -0.02]);
  const panelMat = mat(cfg.door, { rough: 0.28, gloss: true, cc: 0.08 });
  const W = DOOR_W - 0.02;
  mesh(new RoundedBoxGeometry(W, DOOR_H - 0.01, 0.07, 4, 0.03), panelMat, { parent: hinge, pos: [W / 2, DOOR_H / 2, 0] });
  // raised lower panel detail
  mesh(new RoundedBoxGeometry(W * 0.72, 0.42, 0.03, 3, 0.012), panelMat, { parent: hinge, pos: [W / 2, 0.36, 0.045] });

  // Big bold 3D letter
  const tg = new TextGeometry(cfg.letter, { font, size: 0.62, depth: 0.07, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 4 });
  tg.computeBoundingBox();
  const bb = tg.boundingBox;
  tg.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, 0);
  mesh(tg, mat(cfg.glyph, { rough: 0.22, gloss: true, cc: 0.05 }), { parent: hinge, pos: [W / 2, 1.38, 0.035] });

  // Handle: rosette + golden knob
  const hx = HANDLE.x + DOOR_W / 2 - 0.01;
  const gold = mat('#ffcf4a', { rough: 0.18, metal: 0.65 });
  mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 24), gold, { parent: hinge, pos: [hx, HANDLE.y, 0.045], rot: [Math.PI / 2, 0, 0] });
  mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.06, 12), gold, { parent: hinge, pos: [hx, HANDLE.y, 0.07], rot: [Math.PI / 2, 0, 0] });
  blob(gold, [hx, HANDLE.y, 0.11], [0.042, 0.042, 0.032], { parent: hinge });

  return { group: g, hinge, setOpen(a) { hinge.rotation.y = a; } };
}

// Box room behind a doorway, seen only through the opening.
export function buildPortalRoom(parent, wallColor, floorColor) {
  const g = group(parent, [0, 0, 0]);
  const W = 2.6, H = 2.8, D = 2.8;
  const m = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9, side: THREE.BackSide, emissive: new THREE.Color(wallColor), emissiveIntensity: 0.35 });
  mesh(new THREE.BoxGeometry(W, H, D), m, { parent: g, pos: [0, H / 2 - 0.001, -D / 2 - 0.2], cast: false });
  mesh(new THREE.PlaneGeometry(W, D), mat(floorColor, { rough: 0.6 }), { parent: g, pos: [0, 0.003, -D / 2 - 0.2], rot: [-Math.PI / 2, 0, 0], cast: false, receive: true });
  return g;
}
