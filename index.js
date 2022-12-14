import { TrackballControls } from '//cdn.skypack.dev/three@0.130.1/examples/jsm/controls/TrackballControls.js';
import * as THREE from '//cdn.skypack.dev/three@0.130.1/build/three.module.js';

const canvas = document.getElementById('canvas');

const width = canvas.width;
const height = canvas.height;

const WATER_WIDTH = 8.0;
const POOL_HEIGHT = 1.0;

// Colors
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

// Shader chunks
loadFile('shaders/utils.glsl').then((utils) => {
  THREE.ShaderChunk['utils'] = utils;

  // Create Renderer
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.01, 100);
  // camera.position.set(0.426, 0.677, -2.095);
  // camera.rotation.set(2.828, 0.191, 3.108);
  camera.position.set(WATER_WIDTH / 2.0, POOL_HEIGHT * 2, -WATER_WIDTH / 2.0);
  camera.rotation.set(2.828, 0.191, 3.108);


  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.autoClear = false;

  // Light direction
  const light = [0.7559289460184544, 0.7559289460184544, -0.3779644730092272];

  // Create mouse Controls
  const controls = new TrackballControls(
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
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const targetgeometry = new THREE.CircleGeometry(WATER_WIDTH / 2, 200);
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

  targetgeometry.setFromPoints(vertices);

  // for (let vertex of targetgeometry.vertices) {
  //   // for (let vertex of targetgeometry.attributes.position.array) {
  //   vertex.z = - vertex.y;
  //   vertex.y = 0.;
  // }
  const targetmesh = new THREE.Mesh(targetgeometry);

  // Textures
  const textureloader = new THREE.TextureLoader();

  const floor = textureloader.load('sand_floor.jpg');

  class WaterSimulation {

    constructor() {
      const DETAIL_BITS = 128 * WATER_WIDTH;
      const WATER_SPEED = .002;   // could be changed

      this.ambientDropFreq = 40;    // could be changed
      this.step = 0;

      this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);

      this._geometry = new THREE.PlaneBufferGeometry(WATER_WIDTH, WATER_WIDTH);

      this._textureA = new THREE.WebGLRenderTarget(DETAIL_BITS, DETAIL_BITS, { type: THREE.FloatType });
      this._textureB = new THREE.WebGLRenderTarget(DETAIL_BITS, DETAIL_BITS, { type: THREE.FloatType });
      this.texture = this._textureA;

      const shadersPromises = [
        loadFile('shaders/simulation/vertex.glsl'),
        loadFile('shaders/simulation/drop_fragment.glsl'),
        loadFile('shaders/simulation/normal_fragment.glsl'),
        loadFile('shaders/simulation/update_fragment.glsl'),
      ];

      this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, dropFragmentShader, normalFragmentShader, updateFragmentShader]) => {
          const dropMaterial = new THREE.RawShaderMaterial({
            uniforms: {
              center: { value: [0, 0] },
              radius: { value: 0 },
              strength: { value: 0 },
              texture: { value: null },
            },
            vertexShader: vertexShader,
            fragmentShader: dropFragmentShader,
          });

          const normalMaterial = new THREE.RawShaderMaterial({
            uniforms: {
              delta: { value: [WATER_SPEED, WATER_SPEED] },  // TODO: Remove this useless uniform and hardcode it in shaders?
              texture: { value: null },
            },
            vertexShader: vertexShader,
            fragmentShader: normalFragmentShader,
          });

          const updateMaterial = new THREE.RawShaderMaterial({
            uniforms: {
              delta: { value: [WATER_SPEED, WATER_SPEED] },  // TODO: Remove this useless uniform and hardcode it in shaders?
              texture: { value: null },
            },
            vertexShader: vertexShader,
            fragmentShader: updateFragmentShader,
          });

          this._dropMesh = new THREE.Mesh(this._geometry, dropMaterial);
          this._normalMesh = new THREE.Mesh(this._geometry, normalMaterial);
          this._updateMesh = new THREE.Mesh(this._geometry, updateMaterial);
        });
    }

    // Set frame frequency of random drops
    setAmbientDropFreq(ambientDropFreq) {
      this.ambientDropFreq = ambientDropFreq;
    }

    // Add a drop of water at the (x, y) coordinate
    addDrop(renderer, x, y, radius, strength) {
      this._dropMesh.material.uniforms['center'].value = [x, y];
      this._dropMesh.material.uniforms['radius'].value = radius;
      this._dropMesh.material.uniforms['strength'].value = strength;

      this._render(renderer, this._dropMesh);
    }

    addRandomDrop() {
      this.addDrop(
        renderer,
        Math.random() * WATER_WIDTH - WATER_WIDTH / 2.0, Math.random() * WATER_WIDTH - WATER_WIDTH / 2.0,
        0.03, 0.02
      );
    }

    stepSimulation(renderer, ambientDrops = false) {
      this.step++;
      if (ambientDrops && this.step > this.ambientDropFreq) {
        this.addRandomDrop();
        this.step = 0;
      }
      this._render(renderer, this._updateMesh);
    }

    updateNormals(renderer) {
      this._render(renderer, this._normalMesh);
    }

    _render(renderer, mesh) {
      // Swap textures
      const oldTexture = this.texture;
      const newTexture = this.texture === this._textureA ? this._textureB : this._textureA;

      mesh.material.uniforms['texture'].value = oldTexture.texture;
      renderer.setRenderTarget(newTexture);

      renderer.render(mesh, this._camera);

      this.texture = newTexture;
    }

  }


  class Caustics {

    constructor(lightFrontGeometry) {
      this._camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 2000);

      this._geometry = lightFrontGeometry;

      this.texture = new THREE.WebGLRenderTarget(1024, 1024, { type: THREE.UNSIGNED_BYTE });

      const shadersPromises = [
        loadFile('shaders/caustics/vertex.glsl'),
        loadFile('shaders/caustics/fragment.glsl')
      ];

      this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, fragmentShader]) => {
          const material = new THREE.RawShaderMaterial({
            uniforms: {
              light: { value: light },
              water: { value: null },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
          });

          this._causticMesh = new THREE.Mesh(this._geometry, material);
        });
    }

    update(renderer, waterTexture) {
      this._causticMesh.material.uniforms['water'].value = waterTexture;

      renderer.setRenderTarget(this.texture);
      renderer.setClearColor(black, 0);
      renderer.clear();

      // TODO Camera is useless here, what should be done?
      renderer.render(this._causticMesh, this._camera);
    }

  }


  class Water {

    constructor() {
      this.geometry = new THREE.CircleGeometry(WATER_WIDTH / 2, 200);

      const shadersPromises = [
        loadFile('shaders/water/vertex.glsl'),
        loadFile('shaders/water/fragment.glsl')
      ];

      this.loaded = Promise.all(shadersPromises)
        .then(([vertexShader, fragmentShader]) => {
          this.material = new THREE.RawShaderMaterial({
            uniforms: {
              light: { value: light },
              floor: { value: floor },
              water: { value: null },
              causticTex: { value: null },
              underwater: { value: false }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
          });

          this.mesh = new THREE.Mesh(this.geometry, this.material);
          this.material.uniforms['floor'].value.wrapS = this.material.uniforms['floor'].value.wrapT = THREE.RepeatWrapping;
        });
    }

    draw(renderer, waterTexture, causticsTexture) {

      this.material.uniforms['water'].value = waterTexture;
      this.material.uniforms['causticTex'].value = causticsTexture;

      this.material.side = THREE.FrontSide;
      this.material.uniforms['underwater'].value = true;
      renderer.render(this.mesh, camera);

      this.material.side = THREE.BackSide;
      this.material.uniforms['underwater'].value = false;
      renderer.render(this.mesh, camera);
    }

  }

  const waterSimulation = new WaterSimulation();
  const water = new Water();
  const caustics = new Caustics(water.geometry);


  // Main rendering loop
  function animate() {
    waterSimulation.stepSimulation(renderer, true);
    waterSimulation.updateNormals(renderer);

    const waterTexture = waterSimulation.texture.texture;

    caustics.update(renderer, waterTexture);

    const causticsTexture = caustics.texture.texture;

    renderer.setRenderTarget(null);
    renderer.setClearColor(white, 1);
    renderer.clear();

    water.draw(renderer, waterTexture, causticsTexture);

    controls.update();

    window.requestAnimationFrame(animate);
  }

  function onMouseMove(event) {
    const rect = canvas.getBoundingClientRect();

    mouse.x = (event.clientX - rect.left) * 2 / width - 1;
    mouse.y = - (event.clientY - rect.top) * 2 / height + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(targetmesh);

    for (let intersect of intersects) {
      waterSimulation.addDrop(renderer, intersect.point.x, intersect.point.z, 0.03, 0.04);
    }
  }

  const loaded = [waterSimulation.loaded, caustics.loaded, water.loaded];//, , pool.loaded, debug.loaded];

  Promise.all(loaded).then(() => {
    canvas.addEventListener('mousemove', { handleEvent: onMouseMove });

    for (var i = 0; i < 50; i++) {
      waterSimulation.addRandomDrop();
    }

    animate();
  });

});
