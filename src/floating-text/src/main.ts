import "./style.css";
import {
  LoadingManager,
  Mesh,
  MeshMatcapMaterial,
  PerspectiveCamera,
  Scene,
  TextureLoader,
  TorusBufferGeometry,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import typefaceFont from "three/examples/fonts/helvetiker_regular.typeface.json";
import matCap from "./assets/matcaps/8.png";

/**
 * Textures
 */
const loadingManager = new LoadingManager();
loadingManager.onStart = () => console.log("Loading Started");
loadingManager.onLoad = () => console.log("Loading finished");
loadingManager.onProgress = item => console.log("Loading:", item);
loadingManager.onError = item => console.warn("Error Loading:", item);

const textureLoader = new TextureLoader(loadingManager);
const fontLoader = new FontLoader(loadingManager);

const font = fontLoader.parse(typefaceFont);

const { random, PI } = Math;

const canvas = document.querySelector<HTMLCanvasElement>("#webgl")!;

const sizes = {
  width: () => window.innerWidth,
  height: () => window.innerHeight,
  ratio: () => window.innerWidth / window.innerHeight,
};

const scene = new Scene();

// const helper = new AxesHelper(2)
const camera = new PerspectiveCamera(75, sizes.ratio(), 0.1, 100);
camera.position.set(2, 2, 2);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

scene.add(camera);

/**
 * Objects
 */

const matcapTexture = textureLoader.load(matCap);

const textGeometry = new TextGeometry("Hello Three.js", {
  font,
  size: 0.5,
  height: 0.2,
  curveSegments: 6,
  bevelEnabled: true,
  bevelThickness: 0.03,
  bevelSize: 0.02,
  bevelOffset: 0,
  bevelSegments: 2,
});
// textGeometry.computeBoundingBox()
// textGeometry.translate(-textGeometry.boundingBox!.max.x * 0.5, -textGeometry.boundingBox!.max.y * 0.5, -textGeometry.boundingBox!.max.z * 0.5)
textGeometry.center();

const textMaterial = new MeshMatcapMaterial({ matcap: matcapTexture });
const text = new Mesh(textGeometry, textMaterial);
scene.add(text);

const donutGeometry = new TorusBufferGeometry(0.3, 0.2, 20, 45);
const createDonut = () => {
  const donut = new Mesh(donutGeometry, textMaterial);
  scene.add(donut);

  donut.position.set(
    (random() - 0.5) * 20,
    (random() - 0.5) * 20,
    (random() - 0.5) * 20
  );

  donut.rotation.set(random() * PI, random() * PI, 0);

  const scale = random();
  donut.scale.set(scale, scale, scale);
};

for (let index = 0; index < 100; index++) {
  createDonut();
}

const renderer = new WebGLRenderer({ canvas });

renderer.setSize(sizes.width(), sizes.height());

/**
 * Animate
 */
// const clock = new Clock()

const tick = () => {
  // const elapsed = clock.getElapsedTime()

  controls.update();

  renderer.render(scene, camera);

  requestAnimationFrame(tick);
};

const handleResize = () => {
  camera.aspect = sizes.ratio();
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width(), sizes.height());
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

const handleFullScreen = () => {
  if (!document.fullscreenElement)
    "webkitRequestFullscreen" in canvas
      ? // @ts-ignore
        canvas.webkitRequestFullscreen()
      : canvas.requestFullscreen();
  else
    "webkitExitFullscreen" in document
      ? //@ts-ignore
        document.webkitExitFullscreen()
      : document.exitFullscreen();
};

window.addEventListener("resize", handleResize);
window.addEventListener("dblclick", handleFullScreen);

tick();
