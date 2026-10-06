import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createToddler } from './character.js';
import { buildRoom, buildDoor, buildPortalRoom, SPACING, HANDLE, DOOR_W } from './world.js';
import { builders, hamster } from './props.js';
import { createHud } from './hud.js';
import { mat, mesh, blob, group, rng, span, smooth, easeOut, easeInOut, backOut, lerp } from './util.js';

const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.169.0/';
const params = new URLSearchParams(location.search);
const RENDER = params.has('render');

const tl = await (await fetch(new URL('./timeline.json', import.meta.url))).json();
const W = tl.width, H = tl.height;
const D = tl.sceneDuration;
const N = tl.scenes.length;
const DURATION = N * D + tl.outroDuration;

// ---------- assets ----------
const fontFace = new FontFace('Fredoka', `url(${new URL('../assets/fredoka-700.woff2', import.meta.url)})`, { weight: '700' });
document.fonts.add(await fontFace.load());
const waveImg = new Image();
waveImg.src = new URL('../assets/wave.svg', import.meta.url).href;
await waveImg.decode();
const font = await new FontLoader().loadAsync(THREE_CDN + 'examples/fonts/helvetiker_bold.typeface.json');

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: RENDER });
renderer.setPixelRatio(RENDER ? 1 : Math.min(window.devicePixelRatio, 2));
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 0.92;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.autoClear = false;
document.getElementById('stage').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#fde9f4');
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.4;

const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 80);

scene.add(new THREE.HemisphereLight('#ffffff', '#ffd6ea', 0.85));
const key = new THREE.DirectionalLight('#fff6ec', 2.0);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -3; key.shadow.camera.right = 3;
key.shadow.camera.top = 3; key.shadow.camera.bottom = -2;
key.shadow.camera.near = 0.5; key.shadow.camera.far = 20;
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
key.shadow.radius = 6;
scene.add(key, key.target);
const fill = new THREE.DirectionalLight('#e8f0ff', 0.7);
scene.add(fill, fill.target);
const glow = new THREE.PointLight('#fff2c4', 0, 4, 1.5);
scene.add(glow);

// ---------- world ----------
const room = buildRoom(scene, N, font, { w: W, h: H });
const slots = tl.scenes.map((cfg, i) => {
  const x = i * SPACING;
  const g = group(scene, [x, 0, 0]);
  const content = builders[cfg.kind](rng(100 + i));
  g.add(content.group);
  if (content.scale) content.group.scale.setScalar(content.scale);
  let door = null;
  if (cfg.door) {
    door = buildDoor(g, cfg, font);
    buildPortalRoom(g, content.room.wall, content.room.floor);
  }
  return { cfg, x, g, content, door };
});

// Sparkle burst that fires out of each door as it opens.
const burst = (() => {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.4 : 1, a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    i ? shape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false });
  geo.center();
  const cols = ['#ffd21f', '#ff5aa5', '#2f7cf6', '#22b55a', '#ffffff', '#a45bff'];
  const r = rng(9);
  const items = [];
  const g = new THREE.Group();
  for (let i = 0; i < 26; i++) {
    const c = cols[i % cols.length];
    const m = mesh(geo, mat(c, { emissive: c, ei: 0.5, rough: 0.3 }), { parent: g, cast: false });
    const a = r() * Math.PI * 2;
    items.push({ m, v: new THREE.Vector3(Math.cos(a) * (0.6 + r()), 1.0 + r() * 1.6, 0.6 + r() * 1.4), s: 0.03 + r() * 0.03, spin: (r() - 0.5) * 12, y0: 0.6 + r() * 1.2 });
  }
  scene.add(g);
  return {
    update(x, z, age) {
      g.visible = age > 0 && age < 1.6;
      if (!g.visible) return;
      items.forEach((o) => {
        o.m.position.set(x + o.v.x * age * 0.8, o.y0 + o.v.y * age - 1.6 * age * age, z + o.v.z * age * 0.7);
        o.m.rotation.set(0, age * o.spin * 0.3, age * o.spin);
        o.m.scale.setScalar(o.s * Math.min(1, age * 8) * (1 - smooth(span(age, 1.0, 1.6))));
      });
    },
  };
})();

// Goodbye set, far off to the side of the hall.
const OUT_X = N * SPACING + 40;
const outro = (() => {
  const g = group(scene, [OUT_X, 0, 0]);
  const c = document.createElement('canvas'); c.width = 64; c.height = 512;
  const cx = c.getContext('2d');
  const grad = cx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#ffd6ec'); grad.addColorStop(0.55, '#e4d8ff'); grad.addColorStop(1, '#c9f5e6');
  cx.fillStyle = grad; cx.fillRect(0, 0, 64, 512);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ map: tex }), { parent: g, pos: [0, 3, -3], cast: false });
  mesh(new THREE.CircleGeometry(6, 64), mat('#fff3fa', { rough: 0.35 }), { parent: g, rot: [-Math.PI / 2, 0, 0], cast: false, receive: true });
  const ham = hamster();
  g.add(ham.group);
  const r = rng(77);
  const deco = [];
  const heart = new THREE.Shape();
  heart.moveTo(0, -0.11); heart.bezierCurveTo(-0.2, 0.0, -0.12, 0.18, 0, 0.07); heart.bezierCurveTo(0.12, 0.18, 0.2, 0.0, 0, -0.11);
  const hg = new THREE.ExtrudeGeometry(heart, { depth: 0.04, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 3 });
  const cols = ['#ff5aa5', '#ffc61f', '#2f7cf6', '#22b55a', '#a45bff', '#ff8a2a'];
  for (let i = 0; i < 16; i++) {
    const side = i % 2 ? 1 : -1;
    const m = i % 3 === 0
      ? mesh(hg, mat(cols[i % 6], { gloss: true }), { parent: g, cast: false })
      : blob(mat(cols[i % 6], { gloss: true, rough: 0.2 }), [0, 0, 0], 0.06 + r() * 0.05, { parent: g, cast: false });
    deco.push({ m, x: side * (0.7 + r() * 0.6), y: 0.2 + r() * 2.4, z: -1 + r() * 0.8, ph: r() * 6 });
  }
  return {
    update(t) {
      ham.group.scale.setScalar(Math.max(0.001, backOut(span(t, 0.0, 0.6))));
      ham.update(t);
      deco.forEach((d) => {
        d.m.position.set(d.x + Math.sin(t + d.ph) * 0.05, d.y + Math.sin(t * 1.6 + d.ph) * 0.08, d.z);
        d.m.rotation.set(0, Math.sin(t + d.ph) * 0.6, Math.sin(t * 0.7 + d.ph) * 0.3);
      });
    },
  };
})();

const kid = createToddler();
scene.add(kid.root);
kid.root.traverse((o) => { if (o.isMesh) o.castShadow = true; });

// ---------- HUD ----------
const hud = createHud(W, H, waveImg);
const hudTex = new THREE.CanvasTexture(hud.canvas);
hudTex.colorSpace = THREE.SRGBColorSpace;
const hudScene = new THREE.Scene();
const hudCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
hudScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: hudTex, transparent: true, toneMapped: false, depthTest: false })));

// ---------- choreography ----------
const tmpV = new THREE.Vector3();
const handleWorld = (slot) => slot.door.hinge.localToWorld(tmpV.set(HANDLE.x + DOOR_W / 2 - 0.01, HANDLE.y, 0.11)).clone();

function lighten(hex, k) { return '#' + new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), k).getHexString(); }

function poseKid(slot, lt, gt) {
  const { cfg, x } = slot;
  const isTank = !cfg.door;
  const standX = isTank ? x + 0.74 : x + 0.7;
  const standZ = isTank ? 1.0 : 0.36;
  const p = { smile: 0.55 };
  // walk in from the right
  const w = span(lt, 0.15, 1.4);
  const walking = lt > 0.1 && lt < 1.45;
  const px = lerp(standX + 1.55, standX, easeInOut(w) * 0.15 + w * 0.85);
  let pz = lerp(standZ + 0.25, standZ, w);
  p.walk = walking ? smooth(span(lt, 0.1, 0.3)) * (1 - smooth(span(lt, 1.25, 1.45))) : 0;
  p.phase = lt * 11;
  const faceYaw = isTank ? -0.95 : -0.72;
  p.yaw = lerp(-1.2, faceYaw, smooth(span(lt, 1.3, 1.65)));
  p.headYaw = 0.35 * (1 - smooth(span(lt, 1.3, 1.6)));
  p.blink = (gt % 3.1) < 0.12 ? 1 : 0;
  let stepBack = 0;

  // Faraway gaze target: the revealed thing.
  const target = new THREE.Vector3(x, 1.0, isTank ? 0.5 : -0.5);
  const revealAt = isTank ? 0.0 : 2.15;
  const rv = lt - revealAt;

  if (!isTank) {
    // reach → grab → push the door open
    const handle = handleWorld(slot);
    const reach = smooth(span(lt, 1.5, 1.95)) * (1 - smooth(span(lt, 2.4, 2.65)));
    if (reach > 0) {
      kid.root.position.set(px, 0, pz); kid.pose({ ...p, yaw: p.yaw });
      const d = kid.dirTo('R', handle);
      const rest = new THREE.Vector3(-0.22, -1, 0.05).normalize();
      p.armR = rest.lerp(d, reach);
      const dist = kid.reachDist('R', handle);
      p.stretchR = lerp(1, Math.min(1.35, Math.max(0.9, dist / 0.27)), reach);
      p.sway = -0.08 * reach;
      p.headYaw = -0.25 * reach;
      p.lookX = -1 * reach;
    }
    // surprise
    const sur = smooth(span(lt, 2.3, 2.55)) * (1 - 0.7 * smooth(span(lt, 2.9, 3.4)));
    p.surprise = sur;
    stepBack = 0.12 * easeOut(span(lt, 2.3, 2.7));
    const cheeks = smooth(span(lt, 2.45, 2.75));
    if (cheeks > 0) {
      p.armR = (p.armR ?? new THREE.Vector3(-0.22, -1, 0.05)).clone().lerp(new THREE.Vector3(-0.3, 0.75, 0.6), cheeks);
      p.armL = new THREE.Vector3(0.22, -1, 0.05).lerp(new THREE.Vector3(0.3, 0.75, 0.6), cheeks);
      p.stretchR = lerp(p.stretchR ?? 1, 0.92, cheeks);
      p.stretchL = 0.92;
    }
    const look = smooth(span(lt, 2.3, 2.6));
    p.headYaw = lerp(p.headYaw, -0.55, look);
    p.headPitch = -0.08 * look;
    p.lookX = lerp(p.lookX ?? 0, -1, look);
  } else {
    const sur = smooth(span(lt, 1.5, 1.75)) * (1 - 0.7 * smooth(span(lt, 2.2, 2.6)));
    p.surprise = sur;
    const look = smooth(span(lt, 1.4, 1.7));
    p.headYaw = lerp(p.headYaw, -0.35, look);
    p.lookX = -look;
    const cheeks = smooth(span(lt, 1.6, 1.9));
    if (cheeks > 0) {
      p.armR = new THREE.Vector3(-0.22, -1, 0.05).lerp(new THREE.Vector3(-0.3, 0.75, 0.6), cheeks);
      p.armL = new THREE.Vector3(0.22, -1, 0.05).lerp(new THREE.Vector3(0.3, 0.75, 0.6), cheeks);
      p.stretchR = p.stretchL = lerp(1, 0.92, cheeks);
    }
  }

  // Happy reaction
  const reactStart = isTank ? 2.5 : 3.1;
  const r = smooth(span(lt, reactStart, reactStart + 0.35));
  const rt = lt - reactStart;
  if (r > 0) {
    p.smile = lerp(p.smile, 1, r);
    const toCam = smooth(span(lt, reactStart + 0.9, reactStart + 1.3));
    p.headYaw = lerp(p.headYaw, 0.45, toCam * 0.8);
    p.lookX = lerp(p.lookX ?? 0, 0.4, toCam);
    p.headTilt = Math.sin(rt * 3) * 0.1 * r;
    const restR = new THREE.Vector3(-0.22, -1, 0.05), restL = new THREE.Vector3(0.22, -1, 0.05);
    let aR = restR, aL = restL;
    switch (cfg.react) {
      case 'cheeks': {
        aR = new THREE.Vector3(-0.3, 0.75, 0.6); aL = new THREE.Vector3(0.3, 0.75, 0.6);
        p.sway = Math.sin(rt * 4) * 0.07 * r;
        p.stretchR = p.stretchL = 0.92;
        break;
      }
      case 'clap': {
        const c = (Math.sin(rt * 14) + 1) / 2;
        aR = new THREE.Vector3(-0.05 - 0.35 * c, -0.05, 1); aL = new THREE.Vector3(0.05 + 0.35 * c, -0.05, 1);
        p.bounce = Math.abs(Math.sin(rt * 7)) * 0.025 * r;
        break;
      }
      case 'bounce': {
        aR = new THREE.Vector3(-0.6, 1, 0.2); aL = new THREE.Vector3(0.6, 1, 0.2);
        p.bounce = Math.abs(Math.sin(rt * 6)) * 0.09 * r;
        p.legR = p.legL = -Math.abs(Math.sin(rt * 6)) * 0.2 * r;
        break;
      }
      case 'point': {
        kid.root.position.set(px + stepBack, 0, pz); kid.pose(p);
        aR = kid.dirTo('R', target).add(new THREE.Vector3(0, 0.15, 0));
        aL = new THREE.Vector3(0.25, -0.2, 0.9);
        p.bounce = Math.abs(Math.sin(rt * 5)) * 0.02 * r;
        break;
      }
      case 'wave': {
        kid.root.position.set(px + stepBack, 0, pz); kid.pose(p);
        aR = kid.dirTo('R', new THREE.Vector3(x, 2.2, -1));
        aL = new THREE.Vector3(0.75 + Math.sin(rt * 10) * 0.35, 0.9, 0.3);
        p.bounce = Math.abs(Math.sin(rt * 5)) * 0.02 * r;
        break;
      }
    }
    p.armR = (p.armR ?? restR).clone().lerp(aR, r);
    p.armL = (p.armL ?? restL).clone().lerp(aL, r);
    if (cfg.react !== 'cheeks') { p.stretchR = lerp(p.stretchR ?? 1, 1, r); p.stretchL = lerp(p.stretchL ?? 1, 1, r); }
  }

  kid.root.position.set(px + stepBack, 0, pz);
  kid.pose(p);
  return rv;
}

function renderAt(t) {
  t = Math.max(0, Math.min(DURATION - 1e-4, t));
  const si = Math.floor(t / D);
  const hudState = { t };
  room.update(t);

  if (si < N) {
    const slot = slots[si];
    const lt = t - si * D;
    const { x, cfg } = slot;
    slots.forEach((s, i) => { s.g.visible = Math.abs(i - si) <= 1; });
    outro.update(0);
    kid.root.visible = true;

    let rv;
    if (slot.door) {
      const open = lt < 2.05 ? 0 : 1.72 * backOut(span(lt, 2.05, 2.95)) ;
      slot.door.setOpen(open);
      rv = lt - 2.15;
    } else {
      rv = lt;
    }
    slots.forEach((s, i) => { if (i < si && s.door) s.door.setOpen(1.72); if (i > si && s.door) s.door.setOpen(0); });
    poseKid(slot, lt, t);
    slot.content.update(rv, t);
    // neighbouring rooms stay in their finished state
    if (si > 0) slots[si - 1].content.update(5, t);
    if (si < N - 1) slots[si + 1].content.update(-1, t);

    burst.update(x + 0.1, 0.1, slot.door ? lt - 2.15 : lt - 1.4);
    glow.position.set(x, 1.3, slot.door ? -0.2 : 1.2);
    glow.intensity = (slot.door ? smooth(span(lt, 2.1, 2.6)) : 1) * 3.5;

    // camera: medium full-body, gentle push-in after the reveal
    const push = easeInOut(span(lt, slot.door ? 2.0 : 1.2, D));
    const tank = !slot.door;
    const cx = x + (tank ? 0.2 : 0.27);
    camera.position.set(
      lerp(cx + 0.25, cx + 0.05, push) + Math.sin(t * 0.6) * 0.04,
      lerp(1.3, 1.18, push),
      lerp(tank ? 5.9 : 4.9, tank ? 5.1 : 4.05, push),
    );
    camera.lookAt(lerp(cx + 0.1, cx, push), lerp(1.1, 1.0, push), -0.3);

    key.position.set(x + 2.5, 5.5, 5); key.target.position.set(x + 0.3, 0, 0);
    fill.position.set(x - 4, 3, 4); fill.target.position.set(x, 1, 0);

    const labelK = backOut(span(lt, slot.door ? 2.35 : 1.0, (slot.door ? 2.35 : 1.0) + 0.5));
    hudState.label = { letter: cfg.letter, word: cfg.word, color: cfg.door ?? '#19a7e6', k: labelK };

    // bubble wipe between scenes
    const nextCol = si + 1 < N ? (tl.scenes[si + 1].door ?? '#19a7e6') : '#ff8cc6';
    if (lt > D - 0.32) hudState.wipe = { cover: easeInOut(span(lt, D - 0.32, D)), color: lighten(nextCol, 0.35) };
    else if (lt < 0.38) hudState.wipe = { cover: 1 - easeInOut(span(lt, 0, 0.38)), color: lighten(cfg.door ?? '#19a7e6', 0.35) };
  } else {
    const lt = t - N * D;
    slots.forEach((s) => { s.g.visible = false; });
    kid.root.visible = false;
    burst.update(0, 0, -1);
    glow.intensity = 0;
    outro.update(lt);
    camera.position.set(OUT_X + Math.sin(lt * 0.5) * 0.08, 0.95, lerp(4.4, 3.9, easeInOut(span(lt, 0, tl.outroDuration))));
    camera.lookAt(OUT_X, 0.92, 0);
    key.position.set(OUT_X + 2.5, 5.5, 5); key.target.position.set(OUT_X, 0, 0);
    fill.position.set(OUT_X - 4, 3, 4); fill.target.position.set(OUT_X, 1, 0);
    hudState.bye = backOut(span(lt, 0.45, 1.0));
    hudState.logo = backOut(span(lt, 0.9, 1.5));
    if (lt < 0.38) hudState.wipe = { cover: 1 - easeInOut(span(lt, 0, 0.38)), color: lighten('#ff8cc6', 0.35) };
  }

  hud.draw(hudState);
  hudTex.needsUpdate = true;
  renderer.clear();
  renderer.render(scene, camera);
  renderer.clearDepth();
  renderer.render(hudScene, hudCam);
}

// ---------- drivers ----------
window.ABC = {
  duration: DURATION, fps: tl.fps, width: W, height: H,
  renderAt,
  frame(t, quality = 0.93) { renderAt(t); return renderer.domElement.toDataURL('image/jpeg', quality); },
};

if (!RENDER) {
  const audio = document.getElementById('music');
  const btn = document.getElementById('play');
  let playing = false, startedAt = 0, offset = params.has('t') ? parseFloat(params.get('t')) : 0;
  const clock = () => (playing ? (audio && !audio.paused ? audio.currentTime : offset + (performance.now() - startedAt) / 1000) : offset);
  btn?.addEventListener('click', () => {
    if (playing) { offset = clock(); playing = false; audio?.pause(); btn.classList.remove('hide'); return; }
    if (offset >= DURATION - 0.05) offset = 0;
    playing = true; startedAt = performance.now();
    btn.classList.add('hide');
    if (audio) { audio.currentTime = offset; audio.play().catch(() => {}); }
  });
  renderer.domElement.addEventListener('click', () => btn?.click());
  const loop = () => {
    let t = clock();
    if (t >= DURATION) { playing = false; offset = DURATION - 0.01; t = offset; btn?.classList.remove('hide'); }
    renderAt(t);
    requestAnimationFrame(loop);
  };
  loop();
}
document.body.classList.add('ready');
