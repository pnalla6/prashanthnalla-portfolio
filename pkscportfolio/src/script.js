import './style.css';
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let camera;
let particles;
let sphere;
let pointLight;
let dolly = true;
let interactiveMode = false;

const textureLoader = new THREE.TextureLoader;
const star = textureLoader.load('./star.png');
// const star = textureLoader.load('./paricle003.png')

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();


//generate simple StarField
function StarField() {
    const particlesGeometry = new THREE.BufferGeometry;
    const num_of_particles = 5000;
    const particle_position = new Float32Array(num_of_particles * 3);
    for (let i = 0; i < num_of_particles * 3; i++) {
        particle_position[i] = (Math.random() - 0.5) * 5
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particle_position, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        map: star,
        transparent: true,
        // color: '',
        // blending:THREE.AdditiveBlending
    })

    return particles = new THREE.Points(particlesGeometry, particlesMaterial)
}

//generate rgb StarField
function RGBStarField() {
    let colors = [];
    const color = new THREE.Color();
    const particlesGeometry = new THREE.BufferGeometry;
    const num_of_particles = 5000;
    const particle_position = new Float32Array(num_of_particles * 3);
    for (let i = 0; i < num_of_particles * 3; i++) {
        particle_position[i] = (Math.random() - 0.5) * 5
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particle_position, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.025,
        map: star,
        transparent: true,
        // color: '',
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    const n2 = num_of_particles / 6;
    for (var i = 0; i < num_of_particles; i++) {

        const x = Math.random() * num_of_particles - n2;
        const y = Math.random() * num_of_particles - n2;
        const z = Math.random() * num_of_particles - n2;

        // colors
        const vx = (x / num_of_particles) + 0.5;
        const vy = (y / num_of_particles) + 0.5;
        const vz = (z / num_of_particles) + 0.5;

        color.setRGB(vx, vy, vz);
        colors.push(color.r, color.g, color.b);
    }
    particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    return particles = new THREE.Points(particlesGeometry, particlesMaterial)
}


function Torus() {
    const geometry = new THREE.TorusGeometry(.7, .2, 16, 100);
    const sphereMaterial = new THREE.PointsMaterial({
        size: 0.005,
        transparent: true,
    })

    // material.color = new THREE.Color(0xff0000)

    return sphere = new THREE.Points(geometry, sphereMaterial);
}

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

function cameraControls() {
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 0
    camera.position.y = 0
    camera.position.z = 2
    return camera;
}


function SceneLighting() {
    pointLight = new THREE.PointLight(0xffffff, 0.1)
    pointLight.position.x = 2
    pointLight.position.y = 3
    pointLight.position.z = 4

    return pointLight;
}

const containerDiv = document.getElementsByClassName('container');
const mainDiv = document.getElementsByClassName('main');
const invisibleDivLeft = document.getElementsByClassName('invisible_left');
const invisibleDivRight = document.getElementsByClassName('invisible_right');
invisibleDivLeft[0].onclick = InteractiveFullScreen;
invisibleDivRight[0].onclick = InteractiveFullScreenRGB;
let cl = 0, cr = 0;

// turn on interactive mode (simple particles)
function InteractiveFullScreen() {
    cl += 1;
    if (cl % 3 == 0) {
        interactiveMode = !interactiveMode;
        cl = 0;
    }
}

// turn on interactive mode (rgb particles)
function InteractiveFullScreenRGB() {
    cr += 1;
    if (cr % 3 == 0) {
        scene.remove(particles);
        particles.geometry.dispose();
        particles.material.dispose();
        scene.add(RGBStarField());
        interactiveMode = !interactiveMode;
        cr = 0;
    }
}



// original Scene
scene.add(StarField(),
    cameraControls(),
    SceneLighting()
)



window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(new THREE.Color('#21282a'), 0.3)

window.addEventListener('mousemove', animateParticlesWeb)
window.addEventListener('touchmove', animateParticlesMobile)
let mouseX;
let mouseY;

// animation for web
function animateParticlesWeb(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

// animation for mobile
function animateParticlesMobile(e) {
    mouseX = e.touches[0].clientX / 0.09;
    mouseY = e.touches[0].clientY / 0.09;
}


// rerender every frame
const clock = new THREE.Clock()
const draw = () => {
    const elapsedTime = clock.getElapsedTime();

    // turn on fullscreen interaction
    if (interactiveMode) {
        document.body.style.touchAction = 'none'
        containerDiv[0].style.visibility = 'hidden'
        mainDiv[0].style.visibility = 'hidden'
    } else {
        document.body.style.touchAction = 'auto'
        containerDiv[0].style.visibility = 'visible'
        mainDiv[0].style.visibility = 'visible'
    }
    // sphere.rotation.y = 0.5 * elapsedTime;
    particles.rotation.y = -0.1 * elapsedTime
    if (mouseX > 0) {
        particles.rotation.x = -mouseY * (elapsedTime * 0.00005);
        particles.rotation.y = -mouseX * (elapsedTime * 0.00005);
    }
    // dolly the camera
    if (dolly) camera.position.z = Math.sin(elapsedTime * 0.5);
    renderer.render(scene, camera)

    window.requestAnimationFrame(draw)
}
draw();
console.log('hehe ¯\_(ツ)_/¯');