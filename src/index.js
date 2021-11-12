import * as THREE from "three"
import { gsap, Power1 } from "gsap"
import vertexShaderPoint from "./Shaders/vertexPoint.glsl"
import fragmentShaderPoint from "./Shaders/fragmentPoint.glsl"

const footer = document.querySelector("footer")
const modal = document.querySelector(".modal")
const modalClose = document.querySelector(".modal-close")
const cursor = document.querySelector(".cursor")
const titleContent = document.querySelector(".title-content")
const overlayShadow = document.querySelector(".overlay-shadow")
const loader = document.querySelector(".loader")
const loaderImg = document.querySelector(".loader-img").src = "image.jpg"
const loaderBg = document.querySelector(".loader-bg")
const loaderMessage = document.querySelector(".loader-message")
const loaderMessageHide = document.querySelector(".loader-message-hide")
let tactileDetected = window.innerWidth < 768
let isLoaded = false
let dataImage = []

//-------------------------------------------------------------------------
// Base
//-------------------------------------------------------------------------

// Canvas
const canvas = document.querySelector(".webgl1")
const canvasCtx = document.querySelector(".ctx")

// Scene
const scene = new THREE.Scene()

// Message if phone
const messageForPhone = () => {
    if (tactileDetected) {
        modal.style.visibility = "visible"
    }
    modalClose.addEventListener("click", () => modal.style.visibility = "hidden")
}
messageForPhone()

//-------------------------------------------------------------------------
// Textures
//-------------------------------------------------------------------------

let ctx = canvasCtx.getContext("2d");
let img2D = new Image();
img2D.src = "image.jpg";

img2D.addEventListener("load", () => {
    console.log("load")
    ctx.drawImage(img2D, 0, 0);
    dataImage = ctx.getImageData(0, 0, canvasCtx.width, canvasCtx.height)
    createParticules()
})

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

let materialParticules

// Create particules
const createParticules = () => {
    // Geometry
    const geometryParticules = new THREE.BufferGeometry()
    const count = dataImage.data.length * 0.2
    let positions = new Float32Array(count * 3)
    let colors = new Float32Array(count * 4)
    let puissanceByColor = new Float32Array(count) // for blue group, brown group and yellow group
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

        // Next Line
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
        if (colors[i4] < 0.8 && colors[i4 + 2] > 0.2) { // Blue
            positions[i3 + 2] = randomPosition(0.1) - 0.2
            puissanceByColor[i] = 2.15
            colors[i4 + 1] -= 0.05
            colors[i4 + 2] += 0.4
        } else if (colors[i4] > 0.6) { // Yellow
            positions[i3 + 2] = randomPosition(0.1) - 0.3
            puissanceByColor[i] = 2.25
        } else { // Brown
            positions[i3 + 2] = randomPosition(0.1) 
            puissanceByColor[i] = 1.8
        } 
        
        positionZ[i] = positions[i3 + 2] - 0.2
        positions[i3] = (lineFinish * 0.005) - (4.8 / 2) // 4.8 / 2 is the middle with calculte 960 * 0.005 -> 960 is max lineFinish value
        positions[i3 + 1] =  ((- 0.005) * newLine) + (2.16 / 2) // 2.16 / 2 is the middle with calculte 432 * 0.005 -> 432 is max newLine value

    } 

    // Attribute
    geometryParticules.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometryParticules.setAttribute("aColor", new THREE.BufferAttribute(colors, 4))
    geometryParticules.setAttribute("aPuissance", new THREE.BufferAttribute(puissanceByColor, 1))
    geometryParticules.setAttribute("aPositionZ", new THREE.BufferAttribute(positionZ, 1))

    // Material
    materialParticules = new THREE.ShaderMaterial({
        vertexShader: vertexShaderPoint,
        fragmentShader: fragmentShaderPoint,
        uniforms: {
            uSize: { value: 1.25 },
            uTime: { value: 0.0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uMove: { value: 0.0 },
        }
    })

    // Point
    const points = new THREE.Points(geometryParticules, materialParticules)

    scene.add(points)
    loaded()
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

    // Update materialParticules
    if (isLoaded) materialParticules.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

//-------------------------------------------------------------------------
// Camera
//-------------------------------------------------------------------------

const camera = new THREE.PerspectiveCamera(65, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 2)
scene.add(camera)

//-------------------------------------------------------------------------
// Renderer
//-------------------------------------------------------------------------

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//-------------------------------------------------------------------------
// Redirect
//-------------------------------------------------------------------------

titleContent.addEventListener("click", () => {
    window.open("https://github.com/KevinMons1/THREE.js-Gallery-Particules", "_blank").focus()
})

//-------------------------------------------------------------------------
// Cursor
//-------------------------------------------------------------------------

// Show cursor
canvas.addEventListener("mousemove", e => {
    if (!tactileDetected) {
        const x = e.clientX - (25 / 2)
        const y = e.clientY - (25 / 2)
        
        canvas.style.cursor = "none"
        cursor.style.transform = `translate(${x}px, ${y}px)`
        
        if (cursor.style.visibility === "" || cursor.style.visibility === "hidden") {
            cursor.style.visibility = "visible"
        }
    }
})

// Hide cursor 
const hideCursor = () => {
    if (!tactileDetected) cursor.style.visibility = "hidden"
}

footer.addEventListener("mousemove", () => hideCursor())
titleContent.addEventListener("mousemove", () => hideCursor())

//-------------------------------------------------------------------------
// Animate
//-------------------------------------------------------------------------

const clock = new THREE.Clock()
let isClick = true
let timeout
let moveI = 0
let puissanceI = 0.01

const animationMove = (front) => {
    if (front) puissanceI = 0.0
    timeout = setTimeout(() => {

        if (front) { // Move to front

            if (moveI <= 0.5) moveI += 0.009
            else moveI += 0.003

        } else moveI -= (0.003 * puissanceI) // Move to back

        materialParticules.uniforms.uMove.value = moveI

        if (!front && moveI <= 0) {
            moveI = 0
            return
        }
        if (front && moveI <= 0.6) animationMove(true)
        if (!front && moveI >= 0) animationMove(false)

        if (!front && puissanceI <= 2.0) puissanceI += 0.02

    }, 20)
}

// Click start event
canvas.addEventListener("mousedown", () => {
    if (isClick && isLoaded) moveFront()
    isClick = false
})

// Click end event
canvas.addEventListener("mouseup", () => {
    moveBack()
})

// Touch start event
canvas.addEventListener("touchstart", () => {
    if (isClick && isLoaded && tactileDetected) moveFront()
    isClick = false
})

// Touch end event
canvas.addEventListener("touchend", () => {
    if (tactileDetected) moveBack()
})

// Move to front
const moveFront = () => {
    clearTimeout(timeout)
    if (moveI <= 0.6 && moveI >= 0) animationMove(true)
    else if (moveI > 0.6) moveI = 0.6
}

// Move to back
const moveBack = () => {
    clearTimeout(timeout)
    if (moveI >= 0) animationMove(false)
    isClick = true
}

// Light effect with cursor
window.addEventListener("mousemove", e => {
    if (isLoaded && !tactileDetected) {
        const x = - 50 + (e.clientX * 0.008)
        const y = - 50 + (e.clientY * 0.008)

        overlayShadow.style.transform = `translate(${x}%, ${y}%)`
    }
})

// Loaded
const loaded = () => {
    isLoaded = true
    setTimeout(() => {
        // Hide message
        gsap.to(loaderMessage, {
            duration: 0.5,
            y: 100,
            ease: Power1.easeIn
        })

        // Stop rotate loader
        gsap.to(loader, {
            duration: 0.3,
            opacity: 0
        })

        // Hidden message and block
        setTimeout(() => {
            loaderMessage.style.visibility = "hidden"
            loaderMessageHide.style.visibility = "hidden"
            loader.style.visibility = "hidden"

            gsap.to(loaderBg, {
                duration: 0.3,
                opacity: 0
            })
        }, 500)
        
    
    }, 250);
}

const update = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update materialParticules
    if (isLoaded) {
        materialParticules.uniforms.uTime.value = elapsedTime
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(update)
}

update()
