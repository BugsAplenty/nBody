import CelestialBody from './CelestialBody.js'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/17/Stats.js'
let clock = new THREE.Clock();
let scene, camera, renderer;
let celestialBodies = []; // Array to hold all celestial bodies
let controls;
const physicsWorker = new Worker('physicsWorker.js');

physicsWorker.addEventListener('message', function (e) {
    const updatedBodies = e.data.results;
    // Update your celestial bodies with the data received from the worker
    updatedBodies.forEach((updated, index) => {
        celestialBodies[index].mesh.position.set(updated.position.x, updated.position.y, updated.position.z);
        celestialBodies[index].velocity = new THREE.Vector3(updated.velocity.x, updated.velocity.y, updated.velocity.z);
    });
});

function initStats() {
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '0px';
    stats.dom.style.left = '0px';

    // Style the FPS display
    stats.dom.style.color = 'green';
    stats.dom.style.background = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black background

    document.body.appendChild(stats.dom);
    return stats;
}

function init() {
    // Create the coordinate axes
    // Create the scene
    scene = new THREE.Scene();
    createCoordinateAxes(new THREE.Vector3(0, 0, 0));

    scene.background = new THREE.Color(0x000000);

    // Create and position the camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 10;

    // Create the renderer and append it to the DOM
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Setup controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Optional, but can provide a smoother control feel

    document.body.appendChild(renderer.domElement);

    // Handle window resizing
    window.addEventListener('resize', onWindowResize, false);

    // Constants
    const AU = 100; // Scaled astronomical unit
    const SUN_MASS = 33300000000000; // Scaled mass (not realistic, but for visualization)
    const EARTH_MASS = 1; // Scaled mass
    const MOON_MASS = 0.1;
    const EARTH_ORBITAL_VELOCITY = 5; // Scaled velocity (not realistic, but for visualization)
    const MOON_ORBITAL_VELOCITY = 2; // Scaled velocity (not realistic, but for visualization)

    // Sun
    let sun = new CelestialBody("Sun", 5, 0xffff00, SUN_MASS, new THREE.Vector3(0, 0, 0));
    sun.addToScene(scene);

    // Earth
    let earthInitialVelocity = new THREE.Vector3(0, EARTH_ORBITAL_VELOCITY, 0);
    let earth = new CelestialBody("Earth", 1, 0x0000ff, EARTH_MASS, earthInitialVelocity);
    earth.mesh.position.set(AU, 0, 0);

    // Moon
    let moonInitialVelocity = new THREE.Vector3(0, EARTH_ORBITAL_VELOCITY, 0);
    let moon = new CelestialBody("Moon", 0.2, 0xffffff, MOON_MASS, moonInitialVelocity);
    moon.mesh.position.set(AU+10, 0, 0);


    // Add them to the scene
    sun.addToScene(scene);
    earth.addToScene(scene);
    moon.addToScene(scene);

    celestialBodies.push(sun, earth, moon);

    // Start the animation loop
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateCameraFocus(targetBody) {
    if (targetBody.mesh) {
        camera.position.x = targetBody.mesh.position.x + 10; // Offset by 10 units
        camera.position.y = targetBody.mesh.position.y;
        camera.lookAt(targetBody.mesh.position);
    }
}

function animate() {
    stats.begin();
    requestAnimationFrame(animate);

    // Prepare data to send to the worker
    const bodiesData = celestialBodies.map(body => ({
        position: body.mesh.position,
        velocity: body.velocity,
        mass: body.mass
    }));

    physicsWorker.postMessage({ bodies: bodiesData, deltaTime: clock.getDelta() });
    controls.update();
    renderer.render(scene, camera);
    stats.end();
}

function createCoordinateAxes(origin) {
    const length = 25;
    const headLength = 3;
    const headWidth = 2;
    const axes = {};

    // Red for X-axis
    axes.xAxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, length, 0xff0000, headLength, headWidth);
    scene.add(axes.xAxis);

    // Green for Y-axis
    axes.yAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, length, 0x00ff00, headLength, headWidth);
    scene.add(axes.yAxis);

    // Blue for Z-axis
    axes.zAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, length, 0x0000ff, headLength, headWidth);
    scene.add(axes.zAxis);

    return axes;
}

const stats = initStats();
init();
