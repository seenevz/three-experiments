import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";
import {
  BoxBufferGeometry,
  ConeBufferGeometry,
  Float32BufferAttribute,
  Fog,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  PointLight,
  RepeatWrapping,
  SphereBufferGeometry,
} from "three";
import doorColorSrc from "./assets/door/color.jpg";
import doorAlphaSrc from "./assets/door/alpha.jpg";
import doorHeightSrc from "./assets/door/height.jpg";
import doorMetalnessSrc from "./assets/door/metalness.jpg";
import doorNormalSrc from "./assets/door/normal.jpg";
import doorRoughnessSrc from "./assets/door/roughness.jpg";
import doorAmbientOcclusionSrc from "./assets/door/ambientOcclusion.jpg";

import bricksAmbientOcclusion from "./assets/bricks/ambientOcclusion.jpg";
import bricksColor from "./assets/bricks/color.jpg";
import bricksNormal from "./assets/bricks/normal.jpg";
import bricksRoughness from "./assets/bricks/roughness.jpg";

import grassAmbientOcclusion from "./assets/grass/ambientOcclusion.jpg";
import grassColor from "./assets/grass/color.jpg";
import grassNormal from "./assets/grass/normal.jpg";
import grassRoughness from "./assets/grass/roughness.jpg";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector<HTMLCanvasElement>("#app")!;

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const doorColorTexture = textureLoader.load(doorColorSrc);
const doorAlphaTexture = textureLoader.load(doorAlphaSrc);
const doorAmbientOcclusionTexture = textureLoader.load(doorAmbientOcclusionSrc);
const doorHeightTexture = textureLoader.load(doorHeightSrc);
const doorNormalTexture = textureLoader.load(doorNormalSrc);
const doorMetalnessTexture = textureLoader.load(doorMetalnessSrc);
const doorRoughnessTexture = textureLoader.load(doorRoughnessSrc);

const bricksColorTexture = textureLoader.load(bricksColor);
const bricksAmbientOcclusionTexture = textureLoader.load(
  bricksAmbientOcclusion
);
const bricksNormalTexture = textureLoader.load(bricksNormal);
const bricksRoughnessTexture = textureLoader.load(bricksRoughness);

const grassColorTexture = textureLoader.load(grassColor);
const grassAmbientOcclusionTexture = textureLoader.load(grassAmbientOcclusion);
const grassNormalTexture = textureLoader.load(grassNormal);
const grassRoughnessTexture = textureLoader.load(grassRoughness);

[
  grassAmbientOcclusionTexture,
  grassColorTexture,
  grassNormalTexture,
  grassRoughnessTexture,
].forEach(t => {
  t.repeat.set(8, 8);
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
});
/**
 * House
 */
// Temporary sphere
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshStandardMaterial({ roughness: 0.7 })
);
sphere.position.y = 1;
// scene.add(sphere)

const house = new Group();
scene.add(house);

const walls = new Mesh(
  new BoxBufferGeometry(4, 2.5, 4),
  new MeshStandardMaterial({
    map: bricksColorTexture,
    aoMap: bricksAmbientOcclusionTexture,
    normalMap: bricksNormalTexture,
    roughnessMap: bricksRoughnessTexture,
  })
);
walls.geometry.setAttribute(
  "uv2",
  new Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
);
walls.position.y = 1.25;
walls.castShadow = true;

const roof = new Mesh(
  new ConeBufferGeometry(3.5, 1, 4),
  new MeshStandardMaterial({ color: "#b35f45" })
);

roof.rotation.y = Math.PI * 0.25;
roof.position.y = 2.5 + 0.5;

const door = new Mesh(
  new PlaneGeometry(2.2, 2.2, 100, 100),
  new MeshStandardMaterial({
    map: doorColorTexture,
    transparent: true,
    alphaMap: doorAlphaTexture,
    aoMap: doorAmbientOcclusionTexture,
    displacementMap: doorHeightTexture,
    displacementScale: 0.1,
    normalMap: doorNormalTexture,
    metalnessMap: doorMetalnessTexture,
    roughnessMap: doorRoughnessTexture,
  })
);
door.geometry.setAttribute(
  "uv2",
  new Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
);
door.position.y = 1;
door.position.z = 2 + 0.001;

house.add(walls, roof, door);

const bushGeometry = new SphereBufferGeometry(1, 16, 16);
const bushMaterial = new MeshStandardMaterial({ color: "#89c854" });

const bushesProps: {
  scale: [number, number, number];
  position: [number, number, number];
}[] = [
  {
    scale: [0.5, 0.5, 0.5],
    position: [0.8, 0.2, 2.2],
  },
  {
    scale: [0.25, 0.25, 0.25],
    position: [1.4, 0.1, 2.1],
  },
  {
    scale: [0.4, 0.4, 0.4],
    position: [-0.8, 0.1, 2.2],
  },
  {
    scale: [0.15, 0.15, 0.15],
    position: [-1, 0.05, 2.6],
  },
];

bushesProps.forEach(({ scale, position }) => {
  const bush = new Mesh(bushGeometry, bushMaterial);
  bush.scale.set(...scale);
  bush.position.set(...position);
  bush.castShadow = true;
  house.add(bush);
});

// Graves

const graves = new Group();
scene.add(graves);

const graveGeometry = new BoxBufferGeometry(0.6, 0.8, 0.2);
const graveMaterial = new MeshStandardMaterial({ color: "#b2b6b1" });

const generateSingleGrave = () => {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 6;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const grave = new Mesh(graveGeometry, graveMaterial);
  grave.position.set(x, 0.3, z);

  grave.rotation.z = (Math.random() - 0.5) * 0.4;
  grave.rotation.y = (Math.random() - 0.5) * 0.4;
  grave.castShadow = true;

  graves.add(grave);
};

for (let i = 0; i < 50; i++) generateSingleGrave();

// Floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({
    map: grassColorTexture,
    aoMap: grassAmbientOcclusionTexture,
    normalMap: grassNormalTexture,
    roughnessMap: grassRoughnessTexture,
  })
);
floor.geometry.setAttribute(
  "uv2",
  new Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.12);
gui.add(ambientLight, "intensity").min(0).max(1).step(0.001);
scene.add(ambientLight);

// Directional light
const moonLight = new THREE.DirectionalLight("#b9d5ff", 0.12);
moonLight.position.set(4, 5, -2);
moonLight.castShadow = true;
gui.add(moonLight, "intensity").min(0).max(1).step(0.001);
gui.add(moonLight.position, "x").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "y").min(-5).max(5).step(0.001);
gui.add(moonLight.position, "z").min(-5).max(5).step(0.001);
scene.add(moonLight);

//Door Light
const doorLight = new PointLight("#ff7d46", 1, 7);
doorLight.position.set(0, 2.2, 2.7);
doorLight.castShadow = true;
house.add(doorLight);

/**
 * Ghosts
 */
const ghosts = ["#ff00ff", "#00ffff", "#00ffff"].map(color => {
  const ghost = new PointLight(color, 2, 3);
  ghost.castShadow = true;
  scene.add(ghost);
  return ghost;
});

/**
 * Fog
 */

const fog = new Fog("#262837", 1, 15);
scene.fog = fog;

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("#262837");
renderer.shadowMap.enabled = true;
/**
 * Animate
 */
const clock = new THREE.Clock();

const ghostValues = [
  (ghost1: PointLight, elapsedTime: number) => {
    const ghost1Angle = elapsedTime * 0.5;
    ghost1.position.x = Math.cos(ghost1Angle) * 4;
    ghost1.position.z = Math.sin(ghost1Angle) * 4;
    ghost1.position.y = Math.sin(elapsedTime * 3);
  },
  (ghost2: PointLight, elapsedTime: number) => {
    const ghost2Angle = -elapsedTime * 0.32;
    ghost2.position.x = Math.cos(ghost2Angle) * 5;
    ghost2.position.z = Math.sin(ghost2Angle) * 5;
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);
  },
  (ghost3: PointLight, elapsedTime: number) => {
    const ghost3Angle = -elapsedTime * 0.18;
    ghost3.position.x =
      Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32));
    ghost3.position.z =
      Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5));
    ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5);
  },
];

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  ghosts.forEach((ghost, i) => ghostValues[i](ghost, elapsedTime));
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
