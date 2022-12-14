import { TrackballControls } from '//cdn.skypack.dev/three@0.130.1/examples/jsm/controls/TrackballControls.js';
import * as THREE from '//cdn.skypack.dev/three@0.130.1/build/three.module.js';
import { Water, WaterSimulation } from './l_system_copy_paste/js/water.js';

const canvas = document.getElementById('canvas');

const width = canvas.width;
const height = canvas.height;

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

let utils, camera, renderer, light, controls;
let raycaster, mousePos;
let targetgeometry, targetmesh;
const textureloader = new THREE.TextureLoader();
let water, waterSimulation;

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

  water.draw(renderer, waterTexture, camera);//, causticsTexture);

  controls.update();

  window.requestAnimationFrame(animate);
}

function onMouseMove(event) {
  const rect = canvas.getBoundingClientRect();

  mousePos.x = (event.clientX - rect.left) * 2 / width - 1;
  mousePos.y = - (event.clientY - rect.top) * 2 / height + 1;

  raycaster.setFromCamera(mousePos, camera);

  const intersects = raycaster.intersectObject(targetmesh);

  for (let intersect of intersects) {
    waterSimulation.addDrop(renderer, intersect.point.x, intersect.point.z, 0.03, 0.04);
  }
}