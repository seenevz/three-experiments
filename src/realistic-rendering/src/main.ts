import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();
const debugObj: Record<string, any> = {};

// Canvas
const canvas = document.querySelector<HTMLCanvasElement>("canvas.webgl")!;

// Scene
const scene = new THREE.Scene();

/**
 * Loaders
 */

const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

/**
 * Light
 */

const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.position.set(0.25, 3, -2.25);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;

scene.add(directionalLight);

gui
  .add(directionalLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("lightIntensity");
gui
  .add(directionalLight.position, "x")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightX");
gui
  .add(directionalLight.position, "y")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightY");
gui
  .add(directionalLight.position, "z")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightZ");

/**
 * EnvironmentMap
 */
const getEnvMapSrcArr = (path: string) =>
  ["px", "nx", "py", "ny", "pz", "nz"].map(
    face => `./public/${path}/${face}.jpg`
  );

const envMap = cubeTextureLoader.load(
  getEnvMapSrcArr("textures/environmentMaps/0")
);
envMap.encoding = THREE.sRGBEncoding;

debugObj.envMapIntensity = 1;

gui
  .add(debugObj, "envMapIntensity")
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(() => updateAllMaterials());

scene.background = envMap;
scene.environment = envMap;

/**
 * Models
 */
// const testSphere = new THREE.Mesh(
//   new THREE.SphereGeometry(1, 32, 32),
//   new THREE.MeshStandardMaterial()
// )
// scene.add(testSphere)

gltfLoader.load("./public/models/hamburger.glb", gltf => {
  gltf.scene.scale.set(0.3, 0.3, 0.3);
  gltf.scene.position.set(0, -1, 0);
  // gltf.scene.rotation.y = Math.PI / 2;
  scene.add(gltf.scene);
  updateAllMaterials();
  gui
    .add(gltf.scene.rotation, "y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.001)
    .name("model rotation");
});

const isUpdatable = (
  obj: THREE.Object3D
): obj is THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> =>
  obj instanceof THREE.Mesh &&
  obj.material instanceof THREE.MeshStandardMaterial;

const updateAllMaterials = () => {
  scene.traverse(child => {
    if (isUpdatable(child)) {
      child.material.envMapIntensity = debugObj.envMapIntensity;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
};
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
camera.position.set(4, 1, -4);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Camera Helper

const dirLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dirLightHelper);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 3;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

gui.add(renderer, "toneMapping", {
  No: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
});

gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001);

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
