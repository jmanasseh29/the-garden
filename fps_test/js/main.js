import * as THREE from '//cdn.skypack.dev/three@0.130.1/build/three.module.js';
import { FlyControls } from '//cdn.skypack.dev/three@0.130.1/examples/jsm/controls/FlyControls.js';
import { OrbitControls } from '//cdn.skypack.dev/three@0.130.1/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from '//cdn.skypack.dev/three@0.130.1/examples/jsm/loaders/OBJLoader.js';

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

// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const material = new THREE.MeshPhongMaterial({ color: 0x00ffff })
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const skyColor = 0xB1E1FF;  // light blue
const groundColor = 0xB97A20;  // brownish orange
const intensity = 1;
const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
scene.add(light);

// instantiate a loader
const loader = new OBJLoader();

let tree;

function setTree(obj) {
    tree = obj;
}
// load a resource
loader.load(
    // resource URL
    'models/bonsai.obj',
    // called when resource is loaded
    function (object) {
        setTree(object);
        tree.scale.set(.5, .5, .5);
        scene.add(tree);
    },
    // called when loading is in progresses
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // called when loading has errors
    function (error) {
        console.log('An error happened');
    }
);

// tree.scale.set(0.5, 0.5, 0.5)

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
// controls.movementSpeed = 150;
// controls.lookSpeed = 0.1;

function animate() {
    requestAnimationFrame(animate);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    controls.update();

    renderer.render(scene, camera);
};

animate();