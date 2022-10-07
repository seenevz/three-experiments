import "./style.css";
import * as THREE from "three";
import * as dat from "lil-gui";
import gsap from "gsap";
import {
  BufferAttribute,
  BufferGeometry,
  ConeBufferGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshToonMaterial,
  Points,
  PointsMaterial,
  TextureLoader,
  TorusBufferGeometry,
  TorusKnotBufferGeometry,
} from "three";
import threeGradientSrc from "./assets/textures/3.jpg";
// import fiveGradientSrc from './assets/textures/5.jpg'
/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "#ffeded",
};

/**
 * Base
 */
const textureLoader = new TextureLoader();
const threeGradientTexture = textureLoader.load(threeGradientSrc);
threeGradientTexture.magFilter = THREE.NearestFilter;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
// Canvas
const canvas = document.querySelector<HTMLCanvasElement>("canvas.webgl")!;

// Scene
const scene = new THREE.Scene();

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({ color: '#ff0000' })
// )
// scene.add(cube)

/**
 * Objects
 */
const objectDistance = 4;

const toonMaterial = new MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: threeGradientTexture,
});

const objects = [
  new TorusBufferGeometry(1, 0.4, 16, 60),
  new ConeBufferGeometry(1, 2, 32),
  new TorusKnotBufferGeometry(0.8, 0.35, 100, 16),
];
const sectionMeshes: Mesh[] = [];

objects.forEach((geometry, i) => {
  const obj = new Mesh(geometry, toonMaterial);
  obj.position.y = -objectDistance * i;
  obj.position.x = i % 2 === 0 ? 2 : -2;
  sectionMeshes.push(obj);
  scene.add(obj);
});

/**
 * Particles
 */

const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);
const particlesGeometry = new BufferGeometry();

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectDistance * 0.5 -
    Math.random() * objectDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

particlesGeometry.setAttribute("position", new BufferAttribute(positions, 3));

const particlesMaterial = new PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

scene.add(new Points(particlesGeometry, particlesMaterial));

gui.addColor(parameters, "materialColor").onChange(() => {
  toonMaterial.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});
/**
 * Mouse Cursor
 */

const cursor = { x: 0, y: 0 };

window.addEventListener("mousemove", ({ clientX, clientY }) => {
  cursor.x = clientX / sizes.width - 0.5;
  cursor.y = clientY / sizes.height - 0.5;
});

/**
 * Scroll
 */

let scrollY = window.scrollY;
let currentSection = Math.round(scrollY / sizes.height);

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);
  if (newSection !== currentSection) {
    currentSection = newSection;

    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
      z: "+=1.5",
    });
  }
});

/**
 * Lights
 */

const dirLight = new DirectionalLight("#ffffff", 1);
dirLight.position.set(1, 1, 0);

scene.add(dirLight);

/**
 * Sizes
 */

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
const cameraGroup = new Group();
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);
scene.add(cameraGroup);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  sectionMeshes.forEach(({ rotation }) => {
    rotation.x += deltaTime * 0.1;
    rotation.y += deltaTime * 0.12;
  });

  camera.position.y = (-scrollY / sizes.height) * objectDistance;

  //parallax
  cameraGroup.position.x +=
    (cursor.x * 0.5 - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (-cursor.y * 0.5 - cameraGroup.position.y) * 5 * deltaTime;
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
