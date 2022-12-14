import { OrbitControls } from '//cdn.skypack.dev/three@0.130.1/examples/jsm/controls/OrbitControls.js';
import * as THREE from '//cdn.skypack.dev/three@0.130.1/build/three.module.js';
import { Water, WaterSimulation } from './l_system_copy_paste/js/water.js';
import { LSystem } from './l_system_copy_paste/js/lsystem.js';
import { GUI } from './l_system_copy_paste/js/dat.gui.module.js';

const canvas = document.getElementById('canvas');

const width = canvas.width;
const height = canvas.height;

const WATER_WIDTH = 8.0;
const POOL_HEIGHT = 1.0;

const black = new THREE.Color('black');
const white = new THREE.Color('white');

let ruleMap14 = {
  'R': "FFF[F&>-[F^R^F[+FR+&FC]R[-F-<FC]]<FR<F]",
  // 'R': "FFF[F&&>>--[F^^R^^F[++FR++&&FC]R[--F--<<FC]]<<FR<<F]",
  // 'F': 'F^F'
}

let system = new LSystem(ruleMap14, "R");

function loadFile(filename) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.FileLoader();

    loader.load(filename, (data) => {
      resolve(data);
    });
  });
}

let utils, camera, renderer, light, controls, scene;
const plantScene = new THREE.Group();
let raycaster, mousePos;
let targetgeometry, targetmesh;
const textureloader = new THREE.TextureLoader();
let water, waterSimulation;
let stem, leafGroup, plant;

const floorPos = -20;

async function waterInit() {
  utils = await loadFile('shaders/utils.glsl');
  // Shader chunks
  THREE.ShaderChunk['utils'] = utils;

  scene = new THREE.Scene();

  // camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100);
  // // Create Renderer
  // // camera.position.set(0.426, 0.677, -2.095);
  // // camera.rotation.set(2.828, 0.191, 3.108);
  // camera.position.set(WATER_WIDTH / 2.0, POOL_HEIGHT * 2, -WATER_WIDTH / 2.0);
  // camera.rotation.set(2.828, 0.191, 3.108);

  // renderer = new THREE.WebGLRenderer({ antialias: true });
  // //renderer.setSize( window.innerWidth, window.innerHeight );
  // renderer.setSize(800, 800);
  // document.body.appendChild(renderer.domElement);

  // camera = new THREE.PerspectiveCamera(45, 800 / 800, 1, 3000);
  camera = new THREE.PerspectiveCamera(2, 800 / 800, 1, 3000);
  //camera = new THREE.Camera();
  camera.position.z = 300;
  camera.position.y = 150;

  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.autoClear = false;

  onWindowResize();

  light = [0.7559289460184544, 0.7559289460184544, -0.3779644730092272];

  // Ray caster
  raycaster = new THREE.Raycaster();
  mousePos = new THREE.Vector2();
  targetgeometry = new THREE.CircleGeometry(WATER_WIDTH / 2, 200);
  // targetgeometry.scale(20, 20, 1);
  // targetgeometry.translate(0, -19.5, 90);

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
  targetmesh.position.y = -19.5;
  targetmesh.position.z = 90;

  // Textures
  const floor = textureloader.load('sand_floor.jpg');

  waterSimulation = new WaterSimulation(renderer);
  water = new Water(light, floor);

  scene.background = new THREE.Color(0xfaf6e6);
  const light2 = new THREE.PointLight(0xffffff, 1, 100);
  light2.position.set(0, 100, -200);
  plantScene.add(light2);
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(0, 0.5, -0.5);
  directionalLight.position.normalize();
  plantScene.add(directionalLight);
  light2.position.y = 100;
  light2.position.z = 100;

  // setRules0();
  let floorGeo = new THREE.PlaneBufferGeometry(2000, 2000, 8, 8);
  // let floorMat = new THREE.MeshBasicMaterial({ color: 0x02e80e, side: THREE.DoubleSide });
  let floorMat = new THREE.MeshBasicMaterial({ color: 0xfaf6e6, side: THREE.DoubleSide });
  let ground = new THREE.Mesh(floorGeo, floorMat);
  ground.rotateX(- Math.PI / 2);
  ground.position.set(0, floorPos, 0);

  plantScene.add(ground);

  const sunGeo = new THREE.SphereGeometry(100, 32, 16);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const sun = new THREE.Mesh(sunGeo, sunMat);

  sun.position.set(-200, 15, -7000)

  plantScene.add(sun);

  // const dummyPondGeo = new THREE.CylinderGeometry(80, 1, .05, 40);

  // // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // const dummyPondMat = new THREE.MeshBasicMaterial({ color: 0x0000ff })
  // const dummyPond = new THREE.Mesh(dummyPondGeo, dummyPondMat);
  // dummyPond.position.y = floorPos;
  // dummyPond.position.z = 90;
  // plantScene.add(dummyPond);

  // var material = new THREE.LineBasicMaterial({ color: 0x332120, linewidth: 3.0 });
  const material = new THREE.MeshPhongMaterial({ color: 0x6e1901 })
  const blossomTexture = new THREE.TextureLoader().load('./img/blossom.png');
  const flowerMaterial = new THREE.MeshBasicMaterial({
    map: blossomTexture
  });
  flowerMaterial.transparent = true;
  flowerMaterial.side = THREE.DoubleSide;
  drawDefaultTree(material, flowerMaterial, true);
  plantScene.add(stem);

  plantScene.scale.set(0.05, 0.05, 0.05);
  plantScene.position.set(0, .9, -5);

  scene.add(plantScene);

  renderer.setClearColor(0xeeeeee);
  window.addEventListener('resize', onWindowResize, false);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI / 2 - .1;
  controls.target.set(0, .9, -5);
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

  const loaded = [waterSimulation.loaded, water.loaded];// caustics.loaded, water.loaded];//, , pool.loaded, debug.loaded];

  Promise.all(loaded).then(() => {
    canvas.addEventListener('mousemove', { handleEvent: onMouseMove });

    for (var i = 0; i < 50; i++) {
      waterSimulation.addRandomDrop();
    }

    animate();
  });
}
await waterInit();

// Main rendering loop
function animate() {
  waterSimulation.stepSimulation(renderer, true);
  waterSimulation.updateNormals(renderer);

  const waterTexture = waterSimulation.texture.texture;

  // caustics.update(renderer, waterTexture);

  // const causticsTexture = caustics.texture.texture;

  renderer.setRenderTarget(null);
  renderer.setClearColor(white, 1);
  renderer.clear();

  const waterMesh = water.draw(waterTexture);
  // waterMesh.position.y = -19.5;
  // waterMesh.position.z = 90;

  scene.add(waterMesh);

  renderer.render(scene, camera);

  controls.update();
  requestAnimationFrame(animate);
}

function drawDefaultTree(material, leafMat, regenTree) {
  plantScene.remove(plant);
  plantScene.remove(stem);
  // var line_geometry = new THREE.BufferGeometry();
  if (regenTree) { system.generate(); }
  const generatedMeshes = system.generateMesh(0, floorPos, 0);
  console.log(generatedMeshes);
  const line_geometry = generatedMeshes[0];
  const leaves = generatedMeshes[1];
  stem = new THREE.Mesh(line_geometry, material);
  // stem.rotateY(90);
  // stem = new THREE.Line(line_geometry, material, THREE.LinePieces);
  // plantScene.add(stem);
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

  plantScene.add(plant);
  // let line_geometry = system.generateMesh(0, -70, 0);
  // for (const branch of line_geometry) {
  //     const branchMesh = new THREE.Mesh(branch, material);
  //     scene.add(branchMesh);
  // }
  // stem = new THREE.Line(line_geometry, material, THREE.LinePieces);
}

function onMouseMove(event) {
  const rect = canvas.getBoundingClientRect();

  mousePos.x = (event.clientX - rect.left) * 2 / window.innerWidth - 1;
  mousePos.y = - (event.clientY - rect.top) * 2 / window.innerHeight + 1;

  raycaster.setFromCamera(mousePos, camera);

  const intersects = raycaster.intersectObject(targetmesh);

  for (let intersect of intersects) {
    waterSimulation.addDrop(renderer, intersect.point.x, intersect.point.z, 0.03, 0.04);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}