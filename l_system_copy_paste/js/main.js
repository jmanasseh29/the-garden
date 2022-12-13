import { LSystem } from './lsystem.js';
import * as THREE from '//cdn.skypack.dev/three@0.130.1/build/three.module.js';
import * as BufferGeometryUtils from "//cdn.skypack.dev/three@0.130.1/examples/jsm/utils/BufferGeometryUtils.js";
import { OrbitControls } from '//cdn.skypack.dev/three@0.130.1/examples/jsm/controls/OrbitControls.js';
import { GUI } from './dat.gui.module.js';

var boundsx, boundsy,
    mouse = {
        down: false, button: 1, x: 0, y: 0, px: 0, py: 0
    };
var ic = 0x1000000;
var random_color = '#0';

let ruleMap1 = {
    // "F": 'FF-[-F+F+F]+[+F-F-F]',
    "F": 'F-F[-F+F[LLLLLLLL]]++F[+F[LLLLLLLL]]--F[+F[LLLLLLLL]]',
    "X": "X",
    "b": "bb"
}

let ruleMap2 = {
    "F": "F-",
    "-": "F"
}

let ruleMap3 = {
    "F": "F-+",
    "-": "[-]FFF",
    "+": "[FF+][-F]"
}

let ruleMap4 = {
    "X": "[Fb][+Fb]FX",
    "b": "Fb"
}

let ruleMap = {
    'X': '[FX][-FX][+FX]',
    'F': 'FF'
}

let ruleMap5 = {
    //AXIOM X
    'F': 'FF',
    'X': 'F+[-F-XF-X][+FF][--XF[+X]][++F-X]'
}

let ruleMap6 = {//Axiom FX
    'F': 'FF+[+F-F-F]-[-F+F+F]'
}

let ruleMap7 = {
    'F': 'FF-F+F-F-FF'
}

let ruleMap8 = {
    'X': 'F-[[X]+X]+F[+FX]-X',
    'F': 'FF'
}

let ruleMap9 = {
    'X': 'F',
    'F': '[F]-F'
}

let ruleMap10 = {
    'F': '>F[++F]-<F[--F]+>>F'
}

let ruleMap11 = {
    'X': 'F+[[X]-X]-F[-FX]+X',
    'F': 'FF'
}

// function Params() {
//     this.iterations = 2;
//     this.theta = 18;
//     this.thetaRandomness = 0;
//     this.angle = 0;
//     this.scale = 4;
//     this.scaleRandomness = 0;
//     this.constantWidth = true;
//     this.deltarota = 30;
// }

function Colors() {
    this.background = "#000000";
    this.general = "#111faa";
    this.random = true;
    this.alpha = 0.8;
}

// function Rules() {
//     this.axiom = 'X';
//     this.mainRule = 'FF-[-F+F+F]+[+F-F-F]';
//     this.Rule2 = '';
// }

// var rules = new Rules();
// var params = new Params();
// var colors = new Colors();
// let system = new LSystem(ruleMap1, "F");
// let system = new LSystem(ruleMap7, "F-F-F-F");
// let system = new LSystem(ruleMap8, "X");
// let system = new LSystem(ruleMap9, "X");
// let system = new LSystem(ruleMap10, "F");
let system = new LSystem(ruleMap11, "X");


var clear = {
    clear: function () {
        canvas.width = canvas.width;
    }
};

window.addEventListener('mousemove', function (event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

window.onmousemove = function (e) {
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x = e.clientX - window.innerWidth / 2;
    mouse.y = -(e.clientY - window.innerHeight / 2);
    if (mouse.down) {
    }
    e.preventDefault();
};

window.onmousedown = function (e) {
    mouse.down = true;
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x = e.clientX - window.innerWidth / 2;
    mouse.y = -(e.clientY - window.innerHeight / 2);
    // const public_color = getRandomColor();
}
window.onmouseup = function (e) {
    mouse.down = false;
}

window.onload = function () {
}

function drawLine(x, y, x0, y0, color, width) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x0, y0);
    ctx.strokeStyle = color;
    if (system.constantWidth) ctx.lineWidth = 1; else
        ctx.lineWidth = width;
    ctx.stroke();
}
function getRandomColor() {
    var r = ~~(255 * Math.random());
    var g = ~~(255 * Math.random());
    var b = ~~(255 * Math.random());
    var a = system.alpha;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

// function setRules0() {
//     // system.axiom = "X";
//     // system.mainRule = "F-F[-F+F[LLLLLLLL]]++F[+F[LLLLLLLL]]--F[+F[LLLLLLLL]]";
//     // system.iterations = 5;
//     // system.angle = 0;
//     // system.theta = 30;
//     // system.scale = 6;
// }

var camera, scene, renderer, controls;
var plant, mesh, currentTreeInScene;
var material;
var tmp = new THREE.Vector3();

init();
animate();

function init() {

    renderer = new THREE.WebGLRenderer({ antialias: true });
    //renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setSize(800, 800);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, 800 / 800, 1, 3000);
    //camera = new THREE.Camera();
    camera.position.z = 300;
    camera.position.y = 150;

    scene = new THREE.Scene();
    //camera.lookAt(scene.position)

    scene.background = new THREE.Color(0xfffbdb);
    const light2 = new THREE.PointLight(0xffffff, 1, 100);
    light2.position.set(0, 100, -200);
    scene.add(light2);
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 0.5, -0.5);
    directionalLight.position.normalize();
    scene.add(directionalLight);
    light2.position.y = 100;
    light2.position.z = 100;

    // setRules0();

    // var material = new THREE.LineBasicMaterial({ color: 0x332120, linewidth: 3.0 });
    const material = new THREE.MeshPhongMaterial({ color: 0x00ffff })
    drawDefaultTree(material);
    scene.add(plant);

    renderer.setClearColor(0xeeeeee);
    window.addEventListener('resize', onWindowResize, false);

    controls = new OrbitControls(camera, renderer.domElement);

    const gui = new GUI()
    const treeFolder = gui.addFolder("Tree Settings");
    treeFolder.add(system, 'theta', 0, 360)
        .onChange(() => { drawDefaultTree(material); })
        .name('Angle');
    treeFolder.add(system, 'scale', 0, 10)
        .onChange(() => { drawDefaultTree(material); })
        .name('Length');
    treeFolder.add(system, 'iterations', 0, 5)
        .step(1)
        .onChange(() => { drawDefaultTree(material); })
        .name('Age');
    treeFolder.add(system, 'deltarota', 0, 5)
        .step(1)
        .onChange(() => { drawDefaultTree(material); })
        .name('other');
    treeFolder.open();

    const randomFolder = gui.addFolder("Stochasticity Settings");
    randomFolder.add(system, 'thetaRandomness', 0, 10)
        .onFinishChange(() => { drawDefaultTree(material); })
        .name('Angle');
    randomFolder.add(system, 'scaleRandomness', 0, 10)
        .onFinishChange(() => { drawDefaultTree(material); })
        .name('Length');
}

function drawDefaultTree(material) {
    scene.remove(plant);
    // var line_geometry = new THREE.BufferGeometry();
    let line_geometry = system.generateMesh(0, -70, 0);
    plant = new THREE.Mesh(line_geometry, material);
    // plant = new THREE.Line(line_geometry, material, THREE.LinePieces);
    scene.add(plant);
    // let line_geometry = system.generateMesh(0, -70, 0);
    // for (const branch of line_geometry) {
    //     const branchMesh = new THREE.Mesh(branch, material);
    //     scene.add(branchMesh);
    // }
    // plant = new THREE.Line(line_geometry, material, THREE.LinePieces);
}

function addTree(x, y) {
    var material = new THREE.LineBasicMaterial({ color: 0xaaa });
    var line_geometry = new THREE.Geometry();
    line_geometry = system.generateMesh(x, y, 0);
}

function onWindowResize() {

}

function animate() {
    requestAnimationFrame(animate);
    const t0 = Date.now() / 60;
    //scene.rotation.y = t0;
    // plant.rotation.y += 0.01;
    // camera.lookAt(plant.position);
    renderer.render(scene, camera);
    // controls.update();
}

window.onkeypress = function (e) {
    e = e || window.event;
    if (e.keyCode == 87) system.deltarota += 1;
}
