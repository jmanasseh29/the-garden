import { OrbitControls } from '//cdn.skypack.dev/three@0.130.1/examples/jsm/controls/OrbitControls.js';
import * as THREE from '//cdn.skypack.dev/three@0.130.1/build/three.module.js';
import { Water, WaterSimulation, Caustics } from './l_system_copy_paste/js/water.js';
import { Coin } from './l_system_copy_paste/js/coin.js';
import { LSystem } from './l_system_copy_paste/js/lsystem.js';
import { GUI } from './l_system_copy_paste/js/dat.gui.module.js';
import { OutlineEffect } from '//cdn.skypack.dev/three@0.130.1/examples/jsm/effects/OutlineEffect.js';
import { OBJLoader } from '//cdn.skypack.dev/three@0.130.1/examples/jsm/loaders/OBJLoader.js';
import { FBXLoader } from '//cdn.skypack.dev/three@0.130.1/examples/jsm/loaders/FBXLoader.js';

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

let ruleMap13 = {
  'R': "F[-^R][+R]FR",
  'F': "FF"
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

let utils, camera, renderer, light, controls, scene, outlineEffect;
let trunkMat;
const plantScene = new THREE.Scene();
let raycaster, mousePos;
let targetgeometry, targetmesh;
const textureloader = new THREE.TextureLoader();
let water, waterSimulation, caustics;
let coin;
let stem, leafGroup, plant;
let sound;

let trunkColor = 0xffffff;

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

  const listener = new THREE.AudioListener();
  camera.add( listener );

  sound = new THREE.Audio( listener );

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load( 'droplet_sound.mp3', function( buffer ) {
	  sound.setBuffer( buffer );
	  sound.setLoop( false );
	  sound.setVolume( 0.5 );
  });


//   let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
// gl.getExtension('OES_standard_derivatives');

// let gl = renderer.domElement.getContext('webgl') ||
//             renderer.domElement.getContext('experimental-webgl');
// gl.getExtension('OES_standard_derivatives');

  


  outlineEffect = new OutlineEffect(renderer, {
    defaultThickness: 0.005,
    defaultColor: [0, 0, 0],
    defaultAlpha: 0.2,
    defaultKeepAlive: true // keeps outline material in cache even if material is removed from scene
  });

  onWindowResize();

  light = [0, 0.5, -0.5];//[0.7559289460184544, 0.7559289460184544, -0.3779644730092272];

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
  // caustics = new Caustics(water.geometry, light);

  scene.background = new THREE.Color(0xfaf6e6);
  const light2 = new THREE.PointLight(0xffffff, 1, 100);
  light2.position.set(0, 100, -200);
  plantScene.add(light2);
  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(light);
  directionalLight.position.normalize();
  plantScene.add(directionalLight);
  light2.position.y = 100;
  light2.position.z = 100;

  //Geometry setup

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

  // sun.position.set(-200, -400, -5000);
  sun.position.set(-200, 0, -5000);

  plantScene.add(sun);

  const fbxLoader = new FBXLoader();

  fbxLoader.load(
    // resource URL
    'models/rockring.fbx',
    function (object) {
      object.traverse(function (child) {

        if (child.isMesh) {
          child.material = new THREE.MeshToonMaterial({ color: 0x969c8c })
        }

      });
      object.scale.set(0.01, 0.01, 0.01);
      object.position.y = 0.01;
      scene.add(object);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      console.log('An error happened when loading rock: ' + error);
    }
  );

  coin = new Coin();
  scene.add(coin.mesh);

  // const dummyPondGeo = new THREE.CylinderGeometry(80, 1, .05, 40);

  // // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // const dummyPondMat = new THREE.MeshBasicMaterial({ color: 0x0000ff })
  // const dummyPond = new THREE.Mesh(dummyPondGeo, dummyPondMat);
  // dummyPond.position.y = floorPos;
  // dummyPond.position.z = 90;
  // plantScene.add(dummyPond);

  // var material = new THREE.LineBasicMaterial({ color: 0x332120, linewidth: 3.0 });
  // const material = new THREE.MeshPhongMaterial({ color: 0x6e1901 })
  trunkMat = new THREE.MeshToonMaterial({ color: 0x6e1901 });
  const blossomTexture = new THREE.TextureLoader().load('./img/blossom.png');
  const flowerMaterial = new THREE.MeshBasicMaterial({
    map: blossomTexture
  });
  flowerMaterial.transparent = true;
  flowerMaterial.side = THREE.DoubleSide;
  drawDefaultTree(trunkMat, flowerMaterial, true);
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
  treeFolder.add(system, 'theta', -50, 50)
    .onChange(() => { drawDefaultTree(trunkMat, flowerMaterial, false); })
    .name('Angle');
  treeFolder.add(system, 'scale', 0, 20)
    .onChange(() => { drawDefaultTree(trunkMat, flowerMaterial, false); })
    .name('Length');
  treeFolder.add(system, 'lenDecay', 0.1, 1)
    .onChange(() => { drawDefaultTree(trunkMat, flowerMaterial, false); })
    .step(0.01)
    .name('Length Decay');
  treeFolder.add(system, 'thickness', 0, 10)
    .onChange(() => { drawDefaultTree(trunkMat, flowerMaterial, false); })
    .name('Thickness');
  treeFolder.add(system, 'thicknessDecay', 0.1, 1)
    .onChange(() => { drawDefaultTree(trunkMat, flowerMaterial, false); })
    .name('Thickness Decay');
  treeFolder.add(system, 'iterations', 0, 10)
    .step(1)
    .onChange(() => { drawDefaultTree(trunkMat, flowerMaterial, true); })
    .name('Age');
  treeFolder.add(system, 'pivot', 0, 360)
    .step(0.01)
    .onChange(() => { rotateTree(); })
    .name('pivot');
  // treeFolder.add(system, 'trunkColor', system.trunkColor)
  //   .onChange(() => {
  //     stem.material.color.setHex(dec2hex(system.trunkColor));
  //     drawDefaultTree(trunkMat, flowerMaterial, true);
  //   })
  //   .name('Trunk Color');
  treeFolder.open();

  const leafFolder = gui.addFolder("Leaf Settings");
  leafFolder.add(system, 'leafSize', 0, 6)
    .onChange(() => { drawDefaultTree(trunkMat, flowerMaterial, false); })
    .name('Size');
  leafFolder.add(system, 'leafDecay')
    .onChange(() => { drawDefaultTree(trunkMat, flowerMaterial, false); })
    .name('Get Smaller');

  const randomFolder = gui.addFolder("Stochasticity Settings");
  randomFolder.add(system, 'wiggleRandomness', 0, 1)
    .step(0.01)
    .onFinishChange(() => { drawDefaultTree(trunkMat, flowerMaterial, false); })
    .name('Wiggle');
  randomFolder.add(system, 'scaleRandomness', 0, 10)
    .onFinishChange(() => { drawDefaultTree(trunkMat, flowerMaterial, false); })
    .name('Length');

  const loaded = [waterSimulation.loaded, water.loaded];//, caustics.loaded];

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
  // let gl = renderer.getContext();
  // gl.getExtension('OES_standard_derivatives');

  const coinPos = coin.update();
  if (coinPos) {
    waterSimulation.addDrop(renderer, coinPos.x, coinPos.z, 0.05, 0.5);
    sound.play();
  }


  waterSimulation.stepSimulation(renderer, true);
  waterSimulation.updateNormals(renderer);

  const waterTexture = waterSimulation.texture.texture;

  // const causticsMesh = caustics.update(renderer, waterTexture);

  // const causticsTexture = caustics.texture.texture;

  renderer.setRenderTarget(null);
  renderer.setClearColor(white, 1);
  renderer.clear();

  const waterMesh = water.draw(waterTexture);//, causticsTexture);
  // waterMesh.position.y = -19.5;
  // waterMesh.position.z = 90;

  // scene.add(causticsMesh);
  scene.add(waterMesh);
  

  outlineEffect.render(scene, camera);
  // renderer.render(scene);

  controls.update();
  requestAnimationFrame(animate);
}

function rotateTree() {
  stem.rotation.y = system.pivot * Math.PI / 180;
  leafGroup.rotation.y = system.pivot * Math.PI / 180;
  // stem.rotateY(system.pivot);
  // leafGroup.rotateY(system.pivot);
}

function drawDefaultTree(material, leafMat, regenTree) {
  plantScene.remove(plant);
  plantScene.remove(stem);
  // var line_geometry = new THREE.BufferGeometry();
  if (regenTree) { system.generate(); }
  const generatedMeshes = system.generateMesh(0, floorPos, 0);
  const line_geometry = generatedMeshes[0];
  const leaves = generatedMeshes[1];
  stem = new THREE.Mesh(line_geometry, material);
  stem.castShadow = true;
  // stem.rotateY(90);
  // stem = new THREE.Line(line_geometry, material, THREE.LinePieces);
  // plantScene.add(stem);
  leafGroup = new THREE.Group();
  leaves.forEach(leafGeometry => {
    const newLeafMesh = new THREE.Mesh(leafGeometry, leafMat);
    leafGroup.add(newLeafMesh);
  });

  rotateTree();

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

document.addEventListener('keydown', (e) => {
  if (e.code === "Space") {
    if (coin.canToss())
      coin.toss();
  }
});

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