import * as THREE from "three"
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShaderPoint from "./Shaders/vertexPoint.glsl"
import fragmentShaderPoint from "./Shaders/fragmentPoint.glsl"

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
// Textures
//-------------------------------------------------------------------------

let ctx = canvasCtx.getContext("2d");
let img2D = new Image();

img2D.addEventListener("load", () => {
    console.log("load")
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

// Random position
const randomPosition = (max) => {
    return Math.random() * max
}

let material
let canUpdate = false

// Create particules
const createParticules = () => {
    // Geometry
    const geometry = new THREE.BufferGeometry()
    const count = dataImage.data.length * 0.2
    let positions = new Float32Array(count * 3)
    let colors = new Float32Array(count * 4)
    let typeColor = new Float32Array(count) // for blue group, brown group and yellow group
    let positionZ = new Float32Array(count)
    let lineFinish = 0
    let newLine = 0

    let i3, i4, red, green, blue, alpha
    
    for (let i = 0; i < count; i++) {
        i3 = i * 3
        i4 = i * 4
        red = normalize(dataImage.data[i4])
        green = normalize(dataImage.data[i4 + 1])
        blue = normalize(dataImage.data[i4 + 2])
        alpha = normalize(dataImage.data[i4 + 3])

        lineFinish++

        if (lineFinish >= canvasCtx.width) {
            lineFinish = 0
            newLine++
        }

        // Colors
        colors[i4] = red
        colors[i4 + 1] = green
        colors[i4 + 2] = blue
        colors[i4 + 3] = alpha

        // Positions
        if (colors[i4] < 0.5 && colors[i4 + 2] > 0.3) { // Blue
            positions[i3 + 2] = randomPosition(0.2) - 0.5
            colors[i4 + 2] += 0.2 // up Blue just for style
            typeColor[i] = 1.5
        } else if (colors[i4] > 0.6) { // Yellow
            positions[i3 + 2] = (randomPosition(0.2) + 0.2) - 0.5
            typeColor[i] = 1.2
        } else if (!(colors[i4 + 1] < 0.019)) { // Brown
            positions[i3 + 2] = (randomPosition(0.2) + 0.4) - 0.5
            typeColor[i] = 1.0
        } 
        
        positionZ[i] = positions[i3 + 2] - 0.5

        // positions[i3 + 2] = randomPosition(0.2) - 0.5
        positions[i3] = (lineFinish * 0.005) - (4.8 / 2) // 4.8 / 2 is the middle with calculte 960 * 0.005 -> 960 is max lineFinish value
        positions[i3 + 1] =  ((- 0.005) * newLine) + (2.16 / 2) // 2.16 / 2 is the middle with calculte 432 * 0.005 -> 432 is max newLine value

    } 

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 4))
    geometry.setAttribute("aPuissanceMove", new THREE.BufferAttribute(typeColor, 1))
    geometry.setAttribute("aPositionZ", new THREE.BufferAttribute(positionZ, 1))

    material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: vertexShaderPoint,
        fragmentShader: fragmentShaderPoint,
        uniforms: {
            uSize: { value: 1.0 }, // 1.25
            uTime: { value: 0.0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uMove: { value: 0.0 }
        }
    })

    // Point
    const points = new THREE.Points(geometry, material)

    scene.add(points)
    canUpdate = true
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
let isClick = true
let timeout
let moveI = 0

//! Essayes de réguler les vitesse pour que d'abord l'arbre soit devant, puis le jaune puis le bleu et qu'un moment tout s'aligne parfaitement
//! donc logiquement, ceux derière devront avancer plus vite
//! Adapter la vitesse -> faire un ease début vite puis lent
//! Pour la vitesse pour qu'ils s'alignent enregistrer en attribute sa position z selon 0

const animationMove = (front) => {
    timeout = setTimeout(() => {
        moveI = front ? moveI + 0.01 : moveI - 0.01
        material.uniforms.uMove.value = moveI

        if (!front && moveI <= 0) return
        if (front && moveI <= 1.2) animationMove(true)
        if (!front && moveI >= 0) animationMove(false)

        console.log(moveI)
    }, 20)
}

// Click start
window.addEventListener("mousedown", e => {
    if (isClick && canUpdate) {
        clearTimeout(timeout)
        if (moveI <= 1.2 && moveI >= 0) animationMove(true)
    }
    isClick = false
})

// Click end
window.addEventListener("mouseup", e => {
    clearTimeout(timeout)
    if (moveI >= 0) animationMove(false)
    isClick = true
})

const update = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material
    if (canUpdate) {
        material.uniforms.uTime.value = elapsedTime
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(update)
}

update()
