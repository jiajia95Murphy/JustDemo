import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PBRMaterial } from './render/material/PBRMaterial';
import Program from './render/material/Program';
import {Environment} from './render/environment/Environment'
import { isMobile } from './Utils';
// function
function loadEnvMap(envMapName = 'Alexs') {
  const envMapSrc = `${'./src/render/environment/envMap/'}${envMapName}/`;
  return new Environment(renderer, isMobile).loadPackage(envMapSrc);
}
// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);
let environment = await loadEnvMap();
// Torus

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

// Lights

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)

// const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

// Background

const spaceTexture = new THREE.TextureLoader().load('./src/space.jpg');
scene.background = spaceTexture;

// Avatar

const jeffTexture = new THREE.TextureLoader().load('./src/jeff.png');

const jeff = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: jeffTexture }));

scene.add(jeff);

// Moon
// Load Light
let sunLight = new THREE.DirectionalLight(0xffffff, 1);
// Load Shader
let program = new Program();
let { pbrVS, pbrFS } = program.getPBRShader();
let shadowDepthRange = new THREE.Vector2(
  sunLight.shadow.camera.near,
  sunLight.shadow.camera.far
);

const moonTexture = new THREE.TextureLoader().load('./src/T_Treant_Diffuse_Summer.png');
const normalTexture = new THREE.TextureLoader().load('./src/T_Treant_Normal.png');
const emissiveTexture = new THREE.TextureLoader().load('./src/T_Treant_Emissive.png');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
    emissiveMap: emissiveTexture,
  })
);

moon.material = new PBRMaterial(moon, environment, {
  pbrVS,
  pbrFS,
  shadowDepthRange
});
let envRotation = 0;
let envRotationFromPanel = new THREE.Matrix4().makeRotationY(envRotation);
let envRotationMat4 = new THREE.Matrix4().copy(envRotationFromPanel);
moon.material.uniforms.uEnvironmentTransform = { value: new THREE.Matrix3().setFromMatrix4(envRotationMat4) };
moon.material.uniforms.uEnvBrightness = { value: 1.0 };
//moon.material.envMap = null;
scene.add(moon);

moon.position.z = 30;
moon.position.setX(-10);

jeff.position.z = -5;
jeff.position.x = 2;

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

  jeff.rotation.y += 0.01;
  jeff.rotation.z += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  moon.rotation.x += 0.005;

  // controls.update();

  renderer.render(scene, camera);
}

animate();