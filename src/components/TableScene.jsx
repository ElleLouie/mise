import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// A table set for the guests, in a palette. A new palette blends in; new guests rebuild the table.
// Sizes are in metres.
const TOP = 0.75;
const DEPTH = 0.95;

// the same "random" flowers every time for the same table
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// a folded place card with a guest's name on it
function nameCard(name, ink) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fffaf0';
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let size = 104;
  do {
    ctx.font = `italic 650 ${size}px 'Fraunces Variable', Georgia, serif`;
    size -= 6;
  } while (ctx.measureText(name).width > 440 && size > 40);
  ctx.fillText(name, 256, 132);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

const lathe = (points, segments = 48) => new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), segments);

const PLATE = lathe([[0, 0.002], [0.09, 0.002], [0.1, 0.005], [0.126, 0.015], [0.13, 0.014], [0.104, 0], [0, 0]]);
const GLASS = lathe([[0, 0], [0.034, 0], [0.034, 0.004], [0.006, 0.01], [0.004, 0.09], [0.02, 0.1], [0.036, 0.13], [0.039, 0.17], [0.034, 0.2]]);
const TUMBLER = lathe([[0, 0], [0.03, 0], [0.033, 0.09]]);
const STICK = lathe([[0, 0], [0.034, 0], [0.034, 0.008], [0.012, 0.02], [0.009, 0.1], [0.017, 0.11], [0.017, 0.12], [0, 0.12]]);
const VASE = lathe([[0, 0], [0.032, 0], [0.042, 0.04], [0.036, 0.1], [0.018, 0.14], [0.022, 0.15]]);

// The table's materials, shared by every build, so a new palette only changes colours
function materials(clothTexture) {
  const std = (options = {}) => new THREE.MeshStandardMaterial({ roughness: 0.6, ...options });
  return {
    cloth: new THREE.MeshPhysicalMaterial({
      color: '#ffffff', map: clothTexture, roughness: 0.92, sheen: 0.3, sheenRoughness: 0.7,
    }),
    wood: std({ roughness: 0.7 }),
    plate: std({ roughness: 0.35, side: THREE.DoubleSide }),
    vase: std({ roughness: 0.3 }),
    charger: std({ roughness: 0.5 }),
    napkin: std({ roughness: 0.95 }),
    metal: std({ metalness: 1, roughness: 0.28 }),
    leaves: std({ roughness: 0.8 }),
    candle: std({ roughness: 0.8 }),
    glass: new THREE.MeshPhysicalMaterial({
      roughness: 0.05, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1,
    }),
    f0: std({ roughness: 0.9, flatShading: true }),
    f1: std({ roughness: 0.9, flatShading: true }),
    f2: std({ roughness: 0.9, flatShading: true }),
    flame: new THREE.MeshBasicMaterial({ color: '#ffd8a0' }),
  };
}

// The table for this many guests, in the shared materials. Rebuilt only when the guests change.
function build(M, guests, names) {
  const table = new THREE.Group();
  const rand = seeded(guests * 97 + 13);
  const add = (geometry, material, x, y, z, parent = table) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const perSide = Math.max(2, Math.ceil(guests / 2));
  const length = perSide * 0.62 + 0.3;

  // the table, with a cloth that hangs over the edges
  add(new RoundedBoxGeometry(length + 0.14, 0.26, DEPTH + 0.14, 2, 0.02), M.cloth, 0, TOP - 0.12, 0);
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
    add(new THREE.BoxGeometry(0.06, TOP - 0.25, 0.06), M.wood, sx * (length / 2 - 0.08), (TOP - 0.25) / 2, sz * (DEPTH / 2 - 0.08));
  }));

  // places: half on each side, facing the middle
  const seats = [];
  for (let i = 0; i < guests; i += 1) {
    const side = i % 2 === 0 ? 1 : -1;
    const index = Math.floor(i / 2);
    const count = side === 1 ? Math.ceil(guests / 2) : Math.floor(guests / 2);
    const x = (index - (count - 1) / 2) * ((length - 0.3) / perSide);
    seats.push({ x, side });
  }

  seats.forEach(({ x, side }, seat) => {
    const place = new THREE.Group();
    place.position.set(x, TOP + 0.01, side * (DEPTH / 2 - 0.2));
    place.rotation.y = side === 1 ? 0 : Math.PI;
    table.add(place);
    if (names[seat]) {
      // a tent card behind the plate, with the name on both sides
      const label = new THREE.MeshStandardMaterial({ map: nameCard(names[seat], '#33261d'), roughness: 0.9 });
      const tent = new THREE.Group();
      tent.position.set(-0.06, 0, -0.215);
      [0, Math.PI].forEach((turn) => {
        const face = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.07), label);
        face.rotation.set(0, turn, 0);
        face.rotateX(-0.32);
        face.translateY(0.034);
        face.translateZ(0.011);
        face.castShadow = true;
        tent.add(face);
      });
      place.add(tent);
    }
    add(new THREE.CylinderGeometry(0.155, 0.155, 0.008, 48), M.charger, 0, 0.004, 0, place);
    add(PLATE, M.plate, 0, 0.008, 0, place);
    // a napkin folded into a long band across the plate
    const fold = add(new RoundedBoxGeometry(0.075, 0.012, 0.22, 2, 0.005), M.napkin, 0, 0.026, 0, place);
    fold.rotation.y = 0.5 + (rand() - 0.5) * 0.15;
    add(new THREE.BoxGeometry(0.012, 0.004, 0.19), M.metal, -0.19, 0.003, 0.01, place);
    add(new THREE.BoxGeometry(0.012, 0.004, 0.2), M.metal, 0.19, 0.003, 0.01, place);
    add(new THREE.BoxGeometry(0.012, 0.004, 0.19), M.metal, 0.215, 0.003, 0.01, place);
    add(GLASS, M.glass, 0.17, 0, -0.17, place).castShadow = false;
    add(TUMBLER, M.glass, 0.08, 0, -0.2, place).castShadow = false;

    // a chair pulled up to each place
    const chair = new THREE.Group();
    chair.position.set(x, 0, side * (DEPTH / 2 + 0.32));
    chair.rotation.y = side === 1 ? 0 : Math.PI;
    table.add(chair);
    add(new RoundedBoxGeometry(0.42, 0.03, 0.4, 2, 0.01), M.wood, 0, 0.45, 0, chair);
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => add(new THREE.CylinderGeometry(0.012, 0.01, 0.45, 12), M.wood, sx * 0.18, 0.225, sz * 0.17, chair)));
    [-1, 1].forEach((sx) => add(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 12), M.wood, sx * 0.18, 0.64, 0.18, chair));
    add(new RoundedBoxGeometry(0.4, 0.07, 0.022, 2, 0.01), M.wood, 0, 0.8, 0.18, chair);
  });

  // down the middle: candles between low bunches of flowers
  const lights = [];
  const blooms = [];
  const middle = Math.max(3, perSide * 2 - 1);
  for (let i = 0; i < middle; i += 1) {
    const x = (i - (middle - 1) / 2) * ((length - 0.4) / Math.max(1, middle - 1));
    if (i % 2 === 1) {
      add(STICK, M.metal, x, TOP + 0.01, 0);
      add(new THREE.CylinderGeometry(0.011, 0.011, 0.2, 20), M.candle, x, TOP + 0.23, 0);
      add(new THREE.ConeGeometry(0.008, 0.03, 12), M.flame, x, TOP + 0.35, 0).castShadow = false;
      if (lights.length < 3) {
        const light = new THREE.PointLight('#ffb870', 0.2, 1.6, 2);
        light.position.set(x, TOP + 0.38, 0);
        table.add(light);
        lights.push(light);
      }
    } else {
      add(VASE, M.vase, x, TOP + 0.01, 0);
      // a loose, low arrangement: small blooms on stems, with leaves tucked around them;
      // grouped so the bunch can pop when the palette changes
      const bunch = new THREE.Group();
      bunch.position.set(x, TOP + 0.1, 0);
      table.add(bunch);
      blooms.push(bunch);
      for (let f = 0; f < 16; f += 1) {
        const angle = rand() * Math.PI * 2;
        const reach = rand() * 0.07;
        const height = 0.05 + rand() * 0.09;
        const bx = Math.cos(angle) * reach;
        const bz = Math.sin(angle) * reach;
        const bloom = add(new THREE.IcosahedronGeometry(0.012 + rand() * 0.012, 1), M[`f${f % 3}`], bx, height, bz, bunch);
        bloom.scale.y = 0.7;
        bloom.rotation.set(rand(), rand(), rand());
        const twig = add(new THREE.CylinderGeometry(0.0025, 0.0025, height, 5), M.leaves, bx * 0.5, height / 2, bz * 0.5, bunch);
        // lookAt takes world coordinates; the table sits at the origin
        twig.lookAt(bunch.position.clone().add(new THREE.Vector3(bx, height, bz)));
        twig.rotateX(Math.PI / 2);
      }
      for (let l = 0; l < 9; l += 1) {
        const angle = (l / 9) * Math.PI * 2 + rand();
        const leaf = add(new THREE.SphereGeometry(0.02, 10, 6), M.leaves, Math.cos(angle) * 0.075, 0.04 + rand() * 0.05, Math.sin(angle) * 0.075, bunch);
        leaf.scale.set(2, 0.2, 0.7);
        leaf.rotation.set(0, -angle, 0.5);
      }
    }
  }

  return {
    table, length, lights, blooms,
  };
}

// the colours a palette sets, by name
const KEYS = ['cloth', 'check', 'plate', 'charger', 'napkin', 'metal', 'leaves', 'candle', 'glass', 'wood', 'backdrop', 'f0', 'f1', 'f2'];
const targetOf = (p) => ({
  cloth: p.cloth, check: p.check ?? p.cloth, plate: p.plate, charger: p.charger, napkin: p.napkin, metal: p.metal, leaves: p.leaves,
  candle: p.candle, glass: p.glass, wood: p.wood, backdrop: p.backdrop, f0: p.flowers[0], f1: p.flowers[1], f2: p.flowers[2],
});
const BLEND_MS = 700;
const ease = (t) => 1 - (1 - t) ** 3;
// overshoots a little, so the flowers pop
const back = (t) => 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;

function TableScene({ palette, guests, names = [] }) {
  const container = useRef(null);
  const view = useRef(null);

  // the renderer, camera, lights and materials, made once
  useEffect(() => {
    const element = container.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    element.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;
    scene.environmentIntensity = 0.45;
    scene.background = new THREE.Color();
    scene.fog = new THREE.Fog('#ffffff', 6, 12);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.25;
    controls.target.set(0, TOP, 0);
    controls.autoRotate = !reduce;
    controls.autoRotateSpeed = 0.5;

    const sky = new THREE.HemisphereLight('#fff2e0', '#3a2a24', 0.75);
    const sun = new THREE.DirectionalLight('#ffe6c8', 2);
    sun.position.set(2.5, 4, 1.8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.radius = 6;
    sun.shadow.bias = -0.0004;
    Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 });
    scene.add(sky, sun);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(12, 64), new THREE.MeshStandardMaterial({ roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // the cloth: one small canvas, repainted while the colours blend so a check can fade in and out
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const clothTexture = new THREE.CanvasTexture(canvas);
    clothTexture.wrapS = THREE.RepeatWrapping;
    clothTexture.wrapT = THREE.RepeatWrapping;
    clothTexture.repeat.set(12, 12);
    clothTexture.colorSpace = THREE.SRGBColorSpace;
    clothTexture.magFilter = THREE.NearestFilter;
    clothTexture.anisotropy = 8;
    const M = materials(clothTexture);

    // the colours now, and the blend toward the next palette
    const current = Object.fromEntries(KEYS.map((key) => [key, new THREE.Color()]));
    current.checkA = 0;
    current.dark = 0;
    const state = { tween: null, painted: false, lights: [], blooms: [] };

    const apply = () => {
      ctx.fillStyle = `#${current.cloth.getHexString()}`;
      ctx.fillRect(0, 0, 64, 64);
      if (current.checkA > 0.01) {
        ctx.globalAlpha = current.checkA;
        ctx.fillStyle = `#${current.check.getHexString()}`;
        ctx.fillRect(0, 0, 32, 64);
        ctx.fillRect(0, 0, 64, 32);
        ctx.globalAlpha = 1;
      }
      clothTexture.needsUpdate = true;
      ['plate', 'charger', 'napkin', 'metal', 'leaves', 'candle', 'glass', 'wood', 'f0', 'f1', 'f2'].forEach((key) => M[key].color.copy(current[key]));
      M.vase.color.copy(current.plate);
      M.cloth.sheenColor.copy(current.cloth).offsetHSL(0, 0, 0.12);
      scene.background.copy(current.backdrop);
      scene.fog.color.copy(current.backdrop);
      floor.material.color.copy(current.backdrop);
      sky.groundColor.copy(current.backdrop);
      // dark palettes dim the room and let the candles glow
      const d = current.dark;
      sun.intensity = 2 - 1.3 * d;
      sky.intensity = 0.75 - 0.4 * d;
      scene.environmentIntensity = 0.45 - 0.25 * d;
      state.lights.forEach((light) => { light.intensity = 0.2 + 0.9 * d; });
    };

    const setPalette = (p, animate) => {
      const target = targetOf(p);
      const to = Object.fromEntries(KEYS.map((key) => [key, new THREE.Color(target[key])]));
      to.checkA = p.check ? 0.45 : 0;
      to.dark = p.dark ? 1 : 0;
      // the first palette, or reduced motion: no blend
      if (!animate || reduce || !state.painted) {
        KEYS.forEach((key) => current[key].copy(to[key]));
        current.checkA = to.checkA;
        current.dark = to.dark;
        state.painted = true;
        state.tween = null;
        apply();
        return;
      }
      const from = Object.fromEntries(KEYS.map((key) => [key, current[key].clone()]));
      from.checkA = current.checkA;
      from.dark = current.dark;
      state.tween = { from, to, start: performance.now() };
    };

    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      // pull back on tall, narrow screens so the whole table still fits
      camera.zoom = Math.min(1, camera.aspect / 1.4 + 0.2);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();

    renderer.setAnimationLoop((now) => {
      const { tween } = state;
      if (tween) {
        const t = Math.min(1, (now - tween.start) / BLEND_MS);
        const e = ease(t);
        KEYS.forEach((key) => current[key].lerpColors(tween.from[key], tween.to[key], e));
        current.checkA = tween.from.checkA + (tween.to.checkA - tween.from.checkA) * e;
        current.dark = tween.from.dark + (tween.to.dark - tween.from.dark) * e;
        state.blooms.forEach((bunch, i) => bunch.scale.setScalar(0.55 + 0.45 * back(Math.min(1, Math.max(0, t * 1.4 - i * 0.12)))));
        apply();
        if (t === 1) {
          state.tween = null;
          state.blooms.forEach((bunch) => bunch.scale.setScalar(1));
        }
      }
      controls.update();
      renderer.render(scene, camera);
    });

    view.current = {
      scene, camera, controls, M, state, apply, setPalette,
    };
    return () => {
      observer.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      environment.dispose();
      clothTexture.dispose();
      Object.values(M).forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      view.current = null;
    };
  }, []);

  // the table itself, rebuilt only when the guests change
  useEffect(() => {
    const {
      scene, camera, controls, M, state, apply,
    } = view.current;
    const {
      table, length, lights, blooms,
    } = build(M, guests, names);
    state.lights = lights;
    state.blooms = blooms;
    scene.add(table);
    if (state.painted) apply();

    // frame the whole table from a three-quarter view
    const distance = Math.max(3, length * 1.6);
    camera.position.set(distance * 0.42, TOP + distance * 0.78, distance * 0.5);
    controls.minDistance = distance * 0.55;
    controls.maxDistance = distance * 1.4;
    controls.update();

    return () => {
      scene.remove(table);
      const shared = new Set(Object.values(M));
      table.traverse((object) => {
        if (!object.isMesh) return;
        if (![PLATE, GLASS, TUMBLER, STICK, VASE].includes(object.geometry)) object.geometry.dispose();
        // only the name cards have materials of their own
        if (!shared.has(object.material)) {
          object.material.map?.dispose();
          object.material.dispose();
        }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guests, names.join('|')]);

  // a new palette blends in over BLEND_MS (or snaps with reduced motion)
  useEffect(() => {
    view.current.setPalette(palette, true);
  }, [palette]);

  return <div ref={container} className="table_scene" role="img" aria-label={`A table for ${guests}, set in ${palette.name.toLowerCase()} colours`} />;
}

export default TableScene;
