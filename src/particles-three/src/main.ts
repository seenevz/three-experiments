import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { BufferAttribute, BufferGeometry, Points, PointsMaterial, SphereBufferGeometry } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl')!

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/2.png')
/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(1, 1, 1),
//   new THREE.MeshBasicMaterial()
// )
// scene.add(cube)


/**
* Particles
*/

// const particlesGeometry = new SphereBufferGeometry(1, 32, 32)
const count = 20000;
const positions = new Float32Array(count * 3)
const colours = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) { positions[i] = (Math.random() - 0.5) * 10; colours[i] = Math.random() }

const particlesGeometry = new BufferGeometry()
particlesGeometry.setAttribute('position', new BufferAttribute(positions, 3))
particlesGeometry.setAttribute('color', new BufferAttribute(colours, 3))

const particlesMaterial = new PointsMaterial({ size: 0.1, sizeAttenuation: true, vertexColors: true, transparent: true, alphaMap: particleTexture })

// particlesMaterial.alphaTest = 0.01
// particlesMaterial.depthTest = false
particlesMaterial.depthWrite = false
particlesMaterial.blending = THREE.AdditiveBlending

const particles = new Points(particlesGeometry, particlesMaterial)

scene.add(particles)
/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const wobbleUpdate = (elapsedTime: number) => {
  for (let i = 0; i < count * 3; i++) {
    const i3 = i * 3

    const x = particlesGeometry.attributes.position.array[i3]
    //@ts-ignore
    particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
  }

  particlesGeometry.attributes.position.needsUpdate = true
}

const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update particles
  // particles.rotation.y = elapsedTime * 0.2
  wobbleUpdate(elapsedTime)

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()