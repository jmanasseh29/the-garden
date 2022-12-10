import * as THREE from './three.js';
import { OrbitControls } from './OrbitControls';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfffbdb);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// const geometry = new THREE.BufferGeometry();
// const vertices = new Float32Array([
//     -1.0, -1.0, 1.0,
//     1.0, -1.0, 1.0,
//     1.0, 1.0, 1.0,

//     1.0, 1.0, 1.0,
//     -1.0, 1.0, 1.0,
//     -1.0, -1.0, 1.0
// ]);
// geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

controls = new OrbitControls(camera, renderer.domElement);
// controls.movementSpeed = 150;
// controls.lookSpeed = 0.1;

function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    controls.update();

    renderer.render(scene, camera);
};

animate();