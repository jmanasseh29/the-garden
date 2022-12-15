import { LSystem } from './lsystem.js';
import * as THREE from '//cdn.skypack.dev/three@0.130.1/build/three.module.js';
import { OrbitControls } from '//cdn.skypack.dev/three@0.130.1/examples/jsm/controls/OrbitControls.js';
import { GUI } from './dat.gui.module.js';
import { Water, WaterSimulation } from './water.js';
// import { OutlineEffect } from '//cdn.skypack.dev/three@0.130.1/addons/effects/OutlineEffect.js';

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

let ruleMap12 = {
    'X': '^<XF^<XFX-F^>>XFX&F+>>XFX-F>X->'
}

let ruleMap13 = {
    'R': "F[-^R][+R]FR",
    'F': "FF"
}

let ruleMap14 = {
    'R': "FFF[F&>-[F^R^F[+FR+&FC]R[-F-<FC]]<FR<F]",
    // 'R': "FFF[F&&>>--[F^^R^^F[++FR++&&FC]R[--F--<<FC]]<<FR<<F]",
    // 'F': 'F^F'
}

let ruleMap15 = {
    'R': ">>TF[^FR]C[&FRFR]"
}

let ruleMap16 = {
    'X': '[-FX]+FX'
}

function Colors() {
    this.background = "#000000";
    this.general = "#111faa";
    this.random = true;
    this.alpha = 0.8;
}

// var rules = new Rules();
// var params = new Params();
// var colors = new Colors();
// let system = new LSystem(ruleMap1, "F");
// let system = new LSystem(ruleMap6, "F");
// let system = new LSystem(ruleMap7, "F-F-F-F");
// let system = new LSystem(ruleMap8, "X");
// let system = new LSystem(ruleMap9, "X");
// let system = new LSystem(ruleMap10, "F");
// let system = new LSystem(ruleMap11, "X");
// let system = new LSystem(ruleMap12, "X");
// let system = new LSystem(ruleMap13, "R");
let system = new LSystem(ruleMap14, "R");
// let system = new LSystem(ruleMap15, "R");
// let system = new LSystem(ruleMap16, "FX");

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

const WATER_WIDTH = 8.0;
const POOL_HEIGHT = 1.0;

const black = new THREE.Color('black');
const white = new THREE.Color('white');

function loadFile(filename) {
    return new Promise((resolve, reject) => {
        const loader = new THREE.FileLoader();

        loader.load(filename, (data) => {
            resolve(data);
        });
    });
}

let utils, light;
let raycaster, mousePos;
let targetgeometry, targetmesh;
const textureloader = new THREE.TextureLoader();
let water, waterSimulation;

var camera, scene, renderer, controls;
let stem, leafGroup, plant;

// mesh, currentTreeInScene;
const floorPos = -20;

init();

async function init() {

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
    let floorGeo = new THREE.PlaneBufferGeometry(2000, 2000, 8, 8);
    let floorMat = new THREE.MeshBasicMaterial({ color: 0x02e80e, side: THREE.DoubleSide });
    let floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotateX(- Math.PI / 2);
    floor.position.set(0, floorPos, 0);

    scene.add(floor);

    const dummyPondGeo = new THREE.CylinderGeometry(80, 1, .05, 40);

    // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const dummyPondMat = new THREE.MeshBasicMaterial({ color: 0x0000ff })
    const dummyPond = new THREE.Mesh(dummyPondGeo, dummyPondMat);
    dummyPond.position.y = floorPos;
    dummyPond.position.z = 90;
    scene.add(dummyPond);

    // var material = new THREE.LineBasicMaterial({ color: 0x332120, linewidth: 3.0 });
    const material = new THREE.MeshPhongMaterial({ color: 0x6e1901 })
    const blossomTexture = new THREE.TextureLoader().load('./img/blossom.png');
    const flowerMaterial = new THREE.MeshBasicMaterial({
        map: blossomTexture
    });
    flowerMaterial.transparent = true;
    flowerMaterial.side = THREE.DoubleSide;
    drawDefaultTree(material, flowerMaterial, true);
    scene.add(stem);

    renderer.setClearColor(0xeeeeee);
    window.addEventListener('resize', onWindowResize, false);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI / 2;
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.01;

    const gui = new GUI()
    const treeFolder = gui.addFolder("Tree Settings");
    treeFolder.add(system, 'theta', 0, 360)
        .onChange(() => { drawDefaultTree(material, flowerMaterial, false); })
        .name('Angle');
    treeFolder.add(system, 'scale', 0, 10)
        .onChange(() => { drawDefaultTree(material, flowerMaterial, false); })
        .name('Length');
    treeFolder.add(system, 'lenDecay', 0.1, 1)
        .onChange(() => { drawDefaultTree(material, flowerMaterial, false); })
        .step(0.01)
        .name('Length Decay');
    treeFolder.add(system, 'thickness', 0, 5)
        .onChange(() => { drawDefaultTree(material, flowerMaterial, false); })
        .name('Thickness');
    treeFolder.add(system, 'thicknessDecay', 0.1, 1)
        .onChange(() => { drawDefaultTree(material, flowerMaterial, false); })
        .name('Thickness Decay');
    treeFolder.add(system, 'iterations', 0, 10)
        .step(1)
        .onChange(() => { drawDefaultTree(material, flowerMaterial, true); })
        .name('Age');
    treeFolder.open();

    const randomFolder = gui.addFolder("Stochasticity Settings");
    randomFolder.add(system, 'wiggleRandomness', 0, 1)
        .step(0.01)
        .onFinishChange(() => { drawDefaultTree(material, flowerMaterial, false); })
        .name('Wiggle');
    randomFolder.add(system, 'scaleRandomness', 0, 10)
        .onFinishChange(() => { drawDefaultTree(material, flowerMaterial, false); })
        .name('Length');

    animate();
}

async function waterInit() {
    utils = await loadFile('shaders/utils.glsl');
    // Shader chunks
    THREE.ShaderChunk['utils'] = utils;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100);
    // Create Renderer
    // camera.position.set(0.426, 0.677, -2.095);
    // camera.rotation.set(2.828, 0.191, 3.108);
    camera.position.set(WATER_WIDTH / 2.0, POOL_HEIGHT * 2, -WATER_WIDTH / 2.0);
    camera.rotation.set(2.828, 0.191, 3.108);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.autoClear = false;

    light = [0.7559289460184544, 0.7559289460184544, -0.3779644730092272];

    // Create mouse Controls
    controls = new TrackballControls(
        camera,
        canvas
    );

    controls.screen.width = width;
    controls.screen.height = height;

    controls.rotateSpeed = 2.5;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.9;
    controls.dynamicDampingFactor = 0.9;

    // Ray caster
    raycaster = new THREE.Raycaster();
    mousePos = new THREE.Vector2();
    targetgeometry = new THREE.CircleGeometry(WATER_WIDTH / 2, 200);

    // const targetgeometry = new THREE.PlaneBufferGeometry(WATER_WIDTH, WATER_WIDTH, 200, 200);
    // console.log(targetgeometry.vertices);
    // console.log(targetgeometry.attributes.position);
    // console.log(targetgeometry.index);
    const positions = targetgeometry.attributes.position;
    const vertex = new THREE.Vector3();
    let vertices = [];

    for (let i = 0, l = positions.count; i < l; i++) {
        vertex.fromBufferAttribute(positions, i);
        vertex.z = - vertex.y;
        vertex.y = 0.;
        vertices.push(vertex.clone());
    }
    // for (let vertex of targetgeometry.vertices) {
    //   // for (let vertex of targetgeometry.attributes.position.array) {
    //   vertex.z = - vertex.y;
    //   vertex.y = 0.;
    // }
    targetgeometry.setFromPoints(vertices);

    targetmesh = new THREE.Mesh(targetgeometry);

    // Textures
    const floor = textureloader.load('sand_floor.jpg');

    waterSimulation = new WaterSimulation(renderer);
    water = new Water(light, floor);

    const loaded = [waterSimulation.loaded, water.loaded];// caustics.loaded, water.loaded];//, , pool.loaded, debug.loaded];

    Promise.all(loaded).then(() => {
        canvas.addEventListener('mousemove', { handleEvent: onMouseMove });

        for (var i = 0; i < 50; i++) {
            waterSimulation.addRandomDrop();
        }

        animate();
    });
}

function drawDefaultTree(material, leafMat, regenTree) {
    scene.remove(plant);
    scene.remove(stem);
    // var line_geometry = new THREE.BufferGeometry();
    if (regenTree) { system.generate(); }
    const generatedMeshes = system.generateMesh(0, floorPos, 0);
    console.log(generatedMeshes);
    const line_geometry = generatedMeshes[0];
    const leaves = generatedMeshes[1];
    stem = new THREE.Mesh(line_geometry, material);
    // stem.rotateY(90);
    // stem = new THREE.Line(line_geometry, material, THREE.LinePieces);
    // scene.add(stem);
    leafGroup = new THREE.Group();
    leaves.forEach(leafGeometry => {
        const newLeafMesh = new THREE.Mesh(leafGeometry, leafMat);
        leafGroup.add(newLeafMesh);
    });

    stem.rotateY(90);
    leafGroup.rotateY(90);

    plant = new THREE.Group();
    plant.add(stem);
    plant.add(leafGroup);

    scene.add(plant);
    // let line_geometry = system.generateMesh(0, -70, 0);
    // for (const branch of line_geometry) {
    //     const branchMesh = new THREE.Mesh(branch, material);
    //     scene.add(branchMesh);
    // }
    // stem = new THREE.Line(line_geometry, material, THREE.LinePieces);
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
    // stem.rotation.y += 0.01;
    // camera.lookAt(stem.position);
    renderer.render(scene, camera);
    // controls.update();
}

window.onkeypress = function (e) {
    e = e || window.event;
    if (e.keyCode == 87) system.deltarota += 1;
}
