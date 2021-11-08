import * as THREE from "three"
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from "./Shaders/vertexPlane.glsl"
import fragmentShader from "./Shaders/fragmentPlane.glsl"

//-------------------------------------------------------------------------
// Base
//-------------------------------------------------------------------------

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector(".webgl1")
const canvasCtx = document.querySelector(".ctx")

// Scene
const scene = new THREE.Scene()

//-------------------------------------------------------------------------
// Mesh
//-------------------------------------------------------------------------

const textureLoader = new THREE.TextureLoader()
const img = textureLoader.load("image.jpg")

let ctx = canvasCtx.getContext("2d");
let img2D = new Image();

img2D.addEventListener("load", () => {
    ctx.drawImage(img2D, 0, 0);
    console.log(ctx.getImageData(0, 0, canvasCtx.width, canvasCtx.height))
})
img2D.src = "./image.jpg";


//-------------------------------------------------------------------------
// Mesh
//-------------------------------------------------------------------------

// Geometry
const geometry = new THREE.SphereBufferGeometry(1, 32, 32)

// Material
const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0 }
    }
})

const points = new THREE.Points(geometry, material)
scene.add(points)

//-------------------------------------------------------------------------
// Sizes
//-------------------------------------------------------------------------

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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

//-------------------------------------------------------------------------
// Camera
//-------------------------------------------------------------------------

// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0.25, - 0.25, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

//-------------------------------------------------------------------------
// Renderer
//-------------------------------------------------------------------------

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//-------------------------------------------------------------------------
// Animate
//-------------------------------------------------------------------------

const clock = new THREE.Clock()

const update = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material
    material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(update)
}

update()
