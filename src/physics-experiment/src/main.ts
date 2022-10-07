import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import CANNON from "cannon";
import * as dat from "lil-gui";

/**
 * State
 */

const sceneObjects: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];

/**
 * Debug
 */
const gui = new dat.GUI();
const debugObj: Record<string, any> = {};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector<HTMLCanvasElement>("canvas.webgl")!;

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
// const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.png",
  "/textures/environmentMaps/0/nx.png",
  "/textures/environmentMaps/0/py.png",
  "/textures/environmentMaps/0/ny.png",
  "/textures/environmentMaps/0/pz.png",
  "/textures/environmentMaps/0/nz.png",
]);

/**
 * Physics
 */

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true;

const concreteMaterial = new CANNON.Material("concrete");
const plasticMaterial = new CANNON.Material("plastic");
const concretePlasticContactMat = new CANNON.ContactMaterial(
  concreteMaterial,
  plasticMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);

world.addContactMaterial(concretePlasticContactMat);

const floorBody = new CANNON.Body({
  shape: new CANNON.Plane(),
  mass: 0,
  material: concreteMaterial,
});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);
world.addBody(floorBody);

/**
 * Utils
 */

// Sound

const hitSound = new Audio("/sounds/hit.mp3");

const playHitSound = (event: CANNON.ICollisionEvent) => {
  if (event.contact.getImpactVelocityAlongNormal() > 1) {
    hitSound.volume = Math.random();
    hitSound.currentTime = 0;
    hitSound.play();
  }
};

// Create Sphere
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});

const createSphere = (
  radius: number,
  { x, y, z }: { x: number; y: number; z: number }
) => {
  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  mesh.castShadow = true;
  mesh.scale.set(radius, radius, radius);
  mesh.position.copy(new THREE.Vector3(x, y, z));
  scene.add(mesh);

  const sphereShape = new CANNON.Sphere(0.5);
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(x, y, z),
    shape: sphereShape,
    material: plasticMaterial,
  });

  body.addEventListener("collide", playHitSound);
  world.addBody(body);

  sceneObjects.push({ mesh, body });
};

// Create Box

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});

const createBox = (
  width: number,
  height: number,
  depth: number,
  { x, y, z }: { x: number; y: number; z: number }
) => {
  const mesh = new THREE.Mesh(boxGeometry, boxMaterial);
  mesh.castShadow = true;
  mesh.scale.set(width, height, depth);
  mesh.position.copy(new THREE.Vector3(x, y, z));
  scene.add(mesh);

  const sphereShape = new CANNON.Box(
    new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
  );
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(x, y, z),
    shape: sphereShape,
    material: plasticMaterial,
  });

  body.addEventListener("collide", playHitSound);
  world.addBody(body);

  sceneObjects.push({ mesh, body });
};

createBox(1, 1.5, 2, { x: 0, y: 3, z: 0 });

debugObj.createBox = () =>
  createBox(Math.random(), Math.random(), Math.random(), {
    x: (Math.random() - 0.5) * 3,
    y: 3,
    z: (Math.random() - 0.5) * 3,
  });

gui.add(debugObj, "createBox");

// Reset

debugObj.reset = () => {
  sceneObjects.forEach(({ mesh, body }) => {
    body.removeEventListener("collide", playHitSound);
    world.remove(body);

    scene.remove(mesh);
  });
  sceneObjects.splice(0, sceneObjects.length);
};

gui.add(debugObj, "reset");
/**
 * Test sphere
 */

debugObj.createSphere = () =>
  createSphere(Math.random() * 0.5, {
    x: (Math.random() - 0.5) * 3,
    y: 3,
    z: (Math.random() - 0.5) * 3,
  });
gui.add(debugObj, "createSphere");
/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: "#777777",
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

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
camera.position.set(-3, 3, 3);
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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousElapsedTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousElapsedTime;
  previousElapsedTime = elapsedTime;

  // Physics
  // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)
  world.step(1 / 60, deltaTime, 3);
  sceneObjects.forEach(({ mesh, body }) => {
    mesh.position.copy(body.position as unknown as THREE.Vector3);
    mesh.quaternion.copy(body.quaternion as unknown as THREE.Quaternion);
  });

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
