import "./style.css";
import {
  BufferGeometry,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BufferAttribute,
  PointsMaterial,
  AdditiveBlending,
  Points,
  Color,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * Base
 */
const galaxyParams = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPow: 3,
  insideColour: "#ff6030",
  outsideColour: "#1b3984",
};
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector<HTMLCanvasElement>("canvas.webgl")!;

// Scene
const scene = new Scene();

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(1, 1, 1),
//   new THREE.MeshBasicMaterial()
// );
// scene.add(cube);

/**
 * Galaxy
 */
let geometry: BufferGeometry | null = null;
let material: PointsMaterial | null = null;
let points: Points | null = null;

const destroyGalaxy = () => {
  if (points) {
    geometry?.dispose();
    material?.dispose();
    scene.remove(points);
  }
};

const generateGalaxy = () => {
  destroyGalaxy();

  geometry = new BufferGeometry();
  material = new PointsMaterial({
    size: galaxyParams.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexColors: true,
  });

  const positions = new Float32Array(galaxyParams.count * 3);
  const colours = new Float32Array(galaxyParams.count * 3);
  const insideColour = new Color(galaxyParams.insideColour);
  const outsideColour = new Color(galaxyParams.outsideColour);

  for (let i = 0; i < galaxyParams.count; i++) {
    const i3 = i * 3;

    const radius = Math.random() * galaxyParams.radius;
    const spinAngle = radius * galaxyParams.spin;
    const branchAngle =
      ((i % galaxyParams.branches) / galaxyParams.branches) * Math.PI * 2;

    const randomX =
      Math.pow(Math.random(), galaxyParams.randomnessPow) *
      (Math.random() < 0.5 ? 1 : -1) *
      galaxyParams.randomness *
      radius;
    const randomY =
      Math.pow(Math.random(), galaxyParams.randomnessPow) *
      (Math.random() < 0.5 ? 1 : -1) *
      galaxyParams.randomness *
      radius;
    const randomZ =
      Math.pow(Math.random(), galaxyParams.randomnessPow) *
      (Math.random() < 0.5 ? 1 : -1) *
      galaxyParams.randomness *
      radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const mixedColour = insideColour.clone();
    mixedColour.lerp(outsideColour, radius / galaxyParams.radius);
    colours[i3] = mixedColour.r;
    colours[i3 + 1] = mixedColour.g;
    colours[i3 + 2] = mixedColour.b;
  }

  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colours, 3));

  points = new Points(geometry, material);
  scene.add(points);
};

generateGalaxy();

gui
  .add(galaxyParams, "count")
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy);
gui
  .add(galaxyParams, "size")
  .min(0.001)
  .max(0.1)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(galaxyParams, "radius")
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy);
gui
  .add(galaxyParams, "branches")
  .min(2)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy);
gui
  .add(galaxyParams, "spin")
  .min(-5)
  .max(5)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(galaxyParams, "randomness")
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui
  .add(galaxyParams, "randomnessPow")
  .min(1)
  .max(10)
  .step(0.001)
  .onFinishChange(generateGalaxy);
gui.addColor(galaxyParams, "insideColour").onFinishChange(generateGalaxy);
gui.addColor(galaxyParams, "outsideColour").onFinishChange(generateGalaxy);

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
const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
// const clock = new Clock();

const tick = () => {
  // const elapsedTime = clock.getElapsedTime();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
