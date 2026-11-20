import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// A table set for the party, in the chosen mood. Sizes are in metres.
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

// a blue and white check, drawn once per colour and repeated across the cloth
function gingham(base, check) {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = check;
  ctx.fillRect(0, 0, size / 2, size);
  ctx.fillRect(0, 0, size, size / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.anisotropy = 8;
  return texture;
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

function build(mood, guests, names) {
  const table = new THREE.Group();
  const rand = seeded(guests * 97 + mood.id.length * 13);
  const mat = (color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...options });
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

  const wood = mat(mood.wood, { roughness: 0.7 });
  const pattern = mood.check ? gingham(mood.cloth, mood.check) : null;
  if (pattern) pattern.repeat.set(12, 12);
  const cloth = new THREE.MeshPhysicalMaterial({
    color: pattern ? '#ffffff' : mood.cloth,
    map: pattern,
    roughness: 0.92,
    sheen: 0.3,
    sheenColor: new THREE.Color(mood.cloth).offsetHSL(0, 0, 0.12),
    sheenRoughness: 0.7,
  });
  const metal = mat(mood.metal, { metalness: 1, roughness: 0.28 });
  const plate = mat(mood.plate, { roughness: 0.35, side: THREE.DoubleSide });
  const charger = mat(mood.charger, { roughness: 0.5, metalness: mood.id === 'candlelight' ? 0.6 : 0 });
  const napkin = mat(mood.napkin, { roughness: 0.95 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: mood.glass, roughness: 0.05, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false, clearcoat: 1,
  });

  // the table, with a cloth that hangs over the edges
  add(new RoundedBoxGeometry(length + 0.14, 0.26, DEPTH + 0.14, 2, 0.02), cloth, 0, TOP - 0.12, 0);
  [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => {
    add(new THREE.BoxGeometry(0.06, TOP - 0.25, 0.06), wood, sx * (length / 2 - 0.08), (TOP - 0.25) / 2, sz * (DEPTH / 2 - 0.08));
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
    add(new THREE.CylinderGeometry(0.155, 0.155, 0.008, 48), charger, 0, 0.004, 0, place);
    add(PLATE, plate, 0, 0.008, 0, place);
    // a napkin folded into a long band across the plate
    const fold = add(new RoundedBoxGeometry(0.075, 0.012, 0.22, 2, 0.005), napkin, 0, 0.026, 0, place);
    fold.rotation.y = 0.5 + (rand() - 0.5) * 0.15;
    add(new THREE.BoxGeometry(0.012, 0.004, 0.19), metal, -0.19, 0.003, 0.01, place);
    add(new THREE.BoxGeometry(0.012, 0.004, 0.2), metal, 0.19, 0.003, 0.01, place);
    add(new THREE.BoxGeometry(0.012, 0.004, 0.19), metal, 0.215, 0.003, 0.01, place);
    add(GLASS, glass, 0.17, 0, -0.17, place).castShadow = false;
    add(TUMBLER, glass, 0.08, 0, -0.2, place).castShadow = false;

    // a chair pulled up to each place
    const chair = new THREE.Group();
    chair.position.set(x, 0, side * (DEPTH / 2 + 0.32));
    chair.rotation.y = side === 1 ? 0 : Math.PI;
    table.add(chair);
    add(new RoundedBoxGeometry(0.42, 0.03, 0.4, 2, 0.01), wood, 0, 0.45, 0, chair);
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => add(new THREE.CylinderGeometry(0.012, 0.01, 0.45, 12), wood, sx * 0.18, 0.225, sz * 0.17, chair)));
    [-1, 1].forEach((sx) => add(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 12), wood, sx * 0.18, 0.64, 0.18, chair));
    add(new RoundedBoxGeometry(0.4, 0.07, 0.022, 2, 0.01), wood, 0, 0.8, 0.18, chair);
  });

  // down the middle: candles between low bunches of flowers
  const lights = [];
  const middle = Math.max(3, perSide * 2 - 1);
  const flame = new THREE.MeshBasicMaterial({ color: '#ffd8a0' });
  const candle = mat(mood.candle, { roughness: 0.8 });
  const vase = mat(mood.plate, { roughness: 0.3 });
  const leaves = mat(mood.leaves, { roughness: 0.8 });
  for (let i = 0; i < middle; i += 1) {
    const x = (i - (middle - 1) / 2) * ((length - 0.4) / Math.max(1, middle - 1));
    if (i % 2 === 1) {
      add(STICK, metal, x, TOP + 0.01, 0);
      add(new THREE.CylinderGeometry(0.011, 0.011, 0.2, 20), candle, x, TOP + 0.23, 0);
      add(new THREE.ConeGeometry(0.008, 0.03, 12), flame, x, TOP + 0.35, 0).castShadow = false;
      lights.push(x);
    } else {
      add(VASE, vase, x, TOP + 0.01, 0);
      // a loose, low arrangement: small blooms on stems, with leaves tucked around them
      const stem = mat(mood.leaves, { roughness: 0.8 });
      for (let f = 0; f < 16; f += 1) {
        const angle = rand() * Math.PI * 2;
        const reach = rand() * 0.07;
        const height = TOP + 0.15 + rand() * 0.09;
        const bx = x + Math.cos(angle) * reach;
        const bz = Math.sin(angle) * reach;
        const bloom = add(
          new THREE.IcosahedronGeometry(0.012 + rand() * 0.012, 1),
          mat(mood.flowers[f % mood.flowers.length], { roughness: 0.9, flatShading: true }),
          bx, height, bz,
        );
        bloom.scale.y = 0.7;
        bloom.rotation.set(rand(), rand(), rand());
        const twig = add(new THREE.CylinderGeometry(0.0025, 0.0025, height - TOP - 0.1, 5), stem, x + (bx - x) * 0.5, (height + TOP + 0.1) / 2, bz * 0.5);
        twig.lookAt(bx, height, bz);
        twig.rotateX(Math.PI / 2);
      }
      for (let l = 0; l < 9; l += 1) {
        const angle = (l / 9) * Math.PI * 2 + rand();
        const leaf = add(new THREE.SphereGeometry(0.02, 10, 6), leaves, x + Math.cos(angle) * 0.075, TOP + 0.14 + rand() * 0.05, Math.sin(angle) * 0.075);
        leaf.scale.set(2, 0.2, 0.7);
        leaf.rotation.set(0, -angle, 0.5);
      }
    }
  }

  return { table, length, lights };
}

function TableScene({ mood, guests, names = [] }) {
  const container = useRef(null);
  const view = useRef(null);

  // the renderer, camera and lights, made once
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

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.25;
    controls.target.set(0, TOP, 0);
    controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    view.current = { renderer, scene, camera, controls, floor, sky };
    return () => {
      observer.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      view.current = null;
    };
  }, []);

  // the table itself, rebuilt when the mood or guest count changes
  useEffect(() => {
    const { scene, camera, controls, floor, sky } = view.current;
    const { table, length, lights } = build(mood, guests, names);
    const glow = lights.slice(0, 3).map((x) => {
      const light = new THREE.PointLight('#ffb870', mood.id === 'candlelight' || mood.id === 'plum' ? 0.5 : 0.2, 1.6, 2);
      light.position.set(x, TOP + 0.38, 0);
      return light;
    });
    scene.add(table, ...glow);
    scene.background = new THREE.Color(mood.backdrop);
    scene.fog = new THREE.Fog(mood.backdrop, 6, 12);
    floor.material.color.set(mood.backdrop);
    sky.groundColor.set(mood.backdrop);

    // frame the whole table from a three-quarter view
    const distance = Math.max(3, length * 1.6);
    camera.position.set(distance * 0.42, TOP + distance * 0.78, distance * 0.5);
    controls.minDistance = distance * 0.55;
    controls.maxDistance = distance * 1.4;
    controls.update();

    return () => {
      scene.remove(table, ...glow);
      table.traverse((object) => {
        if (!object.isMesh) return;
        if (![PLATE, GLASS, TUMBLER, STICK, VASE].includes(object.geometry)) object.geometry.dispose();
        object.material.map?.dispose();
        object.material.dispose();
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, guests, names.join('|')]);

  return <div ref={container} className="table_scene" role="img" aria-label={`A table for ${guests}, set in ${mood.name.toLowerCase()} colours`} />;
}

export default TableScene;
