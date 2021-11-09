import * as THREE from "three"
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from "./Shaders/vertexPlane.glsl"
import fragmentShader from "./Shaders/fragmentPlane.glsl"

let dataImage = []

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
    dataImage = ctx.getImageData(0, 0, canvasCtx.width, canvasCtx.height)
    createParticules()
})
img2D.src = "./image.jpg";

//-------------------------------------------------------------------------
// Mesh
//-------------------------------------------------------------------------

// Normalize rgb value (255) -> between 0 or 1
const normalize = value => {
    return ((value / 255) * 100) / 100
}

const createParticules = () => {
    // Geometry
    const geometry = new THREE.BufferGeometry()
    const count = dataImage.data.length
    let positions = new Float32Array(count * 3)
    let colors = new Float32Array(count * 4)
    let lineFinish = 0
    let newLine = 0
    
    for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const i4 = i * 4
        lineFinish++

        if (lineFinish >= 300) {
            lineFinish = 0
            newLine++
        }

        // Colors
        colors[i4] = normalize(dataImage.data[i4])
        colors[i4 + 1] = normalize(dataImage.data[i4 + 1])
        colors[i4 + 2] = normalize(dataImage.data[i4 + 2])
        colors[i4 + 3] = normalize(dataImage.data[i4 + 3])
        
        // Positions
        positions[i3] = (lineFinish * 0.04) - 6
        positions[i3 + 1] = ((- 0.04) * newLine) + 3
        positions[i3 + 2] = - 4
    } 

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 4))

    // Material
    const material = new THREE.PointsMaterial({
        size: 0.04,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    })

    // Point
    const points = new THREE.Points(geometry, material)
    scene.add(points)
}

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
camera.position.set(0, 0, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enableZoom = true


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
    // material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(update)
}

update()
