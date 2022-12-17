import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { PBRMaterial } from './render/material/PBRMaterial';
import Program from './render/material/Program';
import {Environment} from './render/environment/Environment'
import { isMobile } from './Utils';
// function
/* function loadEnvMap(envMapName = 'Alexs') {
  const envMapSrc = `${'./src/render/environment/envMap/'}${envMapName}/`;
  return new Environment(renderer, isMobile).loadPackage(envMapSrc);
}
// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
document.body.appendChild(renderer.domElement);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);
//let environment = await loadEnvMap();
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

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set( 0, 20, 100 );
controls.update();

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

const spaceTexture = new THREE.TextureLoader().load('./src/render/texture/space.jpg');
scene.background = spaceTexture;

// Avatar

const jeffTexture = new THREE.TextureLoader().load('./src/render/texture/jeff.png');

const jeff = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: jeffTexture }));

scene.add(jeff);

// Moon
// Load Light
let sunLight = new THREE.DirectionalLight(0xffffff, 1);
sunLight.castShadow = true;
// Load Shader
let program = new Program();
let { pbrVS, pbrFS } = program.getPBRShader();
let shadowDepthRange = new THREE.Vector2(
  sunLight.shadow.camera.near,
  sunLight.shadow.camera.far
);

const moonTexture = new THREE.TextureLoader().load('./src/render/texture/T_Treant_Diffuse_Summer.png');
const normalTexture = new THREE.TextureLoader().load('./src/render/texture/T_Treant_Normal.png');
const emissiveTexture = new THREE.TextureLoader().load('./src/render/texture/T_Treant_Emissive.png');
const metalnessTexture = new THREE.TextureLoader().load('./src/render/texture/FlightHelmet_Materials_RubberWoodMat_OcclusionRoughMetal.png');
const envTexture = new THREE.TextureLoader().load('');
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
    emissiveMap: emissiveTexture,
    metalnessMap: metalnessTexture
  })
);

moon.material = new PBRMaterial(moon, null, {
  pbrVS,
  pbrFS,
  //shadowDepthRange
});
let envRotation = 0;
let envRotationFromPanel = new THREE.Matrix4().makeRotationY(envRotation);
let envRotationMat4 = new THREE.Matrix4().copy(envRotationFromPanel);
moon.material.uniforms.uEnvironmentTransform = { value: new THREE.Matrix3().setFromMatrix4(envRotationMat4) };
moon.material.uniforms.uEnvBrightness = { value: 1.0 };
moon.material.defines['DEBUG_BASECOLOR'] = 1;
moon.material.defines[`DEBUG_METALLIC`] = 0;
//moon.material.envMap = null;
scene.add(moon);

moon.position.z = 30;
moon.position.setX(-10);

jeff.position.z = -5;
jeff.position.x = 2;

// Shadow Plane
const planeGeometry = new THREE.PlaneGeometry( 2000, 2000 );
				planeGeometry.rotateX( - Math.PI / 2 );
				const planeMaterial = new THREE.ShadowMaterial( { color: 0x000000, opacity: 0.2 } );

				const plane = new THREE.Mesh( planeGeometry, planeMaterial );
				plane.position.z = 30;
        plane.position.setX(-10);
				plane.receiveShadow = true;
				scene.add( plane );

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

//document.body.onscroll = moveCamera;
//moveCamera();

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  moon.rotation.x += 0.005;

  controls.update();

  renderer.render(scene, camera);
}

animate(); */
let camera, controls, scene, renderer, light;

init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

function init() {

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xcccccc );
  //scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 400, 200, 0 );
  camera.lookAt(scene.position);
  // controls

  controls = new OrbitControls( camera, renderer.domElement );
  controls.listenToKeyEvents( window ); // optional

  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.screenSpacePanning = false;

  controls.minDistance = 100;
  controls.maxDistance = 500;

  controls.maxPolarAngle = Math.PI / 2;

  // world
// Moon
// Load Light
let sunLight = new THREE.DirectionalLight(0xffffff, 1);

sunLight.castShadow = false;
// Load Shader
let program = new Program();
let { pbrVS, pbrFS } = program.getPBRShader();
let shadowDepthRange = new THREE.Vector2(
  sunLight.shadow.camera.near,
  sunLight.shadow.camera.far
); 

const moonTexture = new THREE.TextureLoader().load('./src/render/texture/T_Treant_Diffuse_Summer.png');
const normalTexture = new THREE.TextureLoader().load('./src/render/texture/T_Treant_Normal.png');
const emissiveTexture = new THREE.TextureLoader().load('./src/render/texture/T_Treant_Emissive.png');
const metalnessTexture = new THREE.TextureLoader().load('./src/render/texture/FlightHelmet_Materials_RubberWoodMat_OcclusionRoughMetal.png');
const envTexture = new THREE.TextureLoader().load('./src/render/environment/hdrs/studio_garden_1k.hdr');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(30, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
    emissiveMap: emissiveTexture,
    metalnessMap: metalnessTexture,
    envMap: envTexture,
  })
);

moon.material = new PBRMaterial(moon, null, {
  pbrVS,
  pbrFS,
  shadowDepthRange
});
moon.castShadow = true;
let envRotation = 0;
let envRotationFromPanel = new THREE.Matrix4().makeRotationY(envRotation);
let envRotationMat4 = new THREE.Matrix4().copy(envRotationFromPanel);
moon.material.uniforms.uEnvironmentTransform = { value: new THREE.Matrix3().setFromMatrix4(envRotationMat4) };
moon.material.uniforms.uEnvBrightness = { value: 1.0 };
moon.material.defines['ENABLE_LIGHT'] = 1;
//moon.material.envMap = null;
scene.add(moon);


  // lights
  // DirectionalLight
  light = new THREE.DirectionalLight( 0xffff00, 1);
  light.target.position.set(0, -30, 30);
  light.castShadow = true;
  light.position.set( 100, 100, 0);
  light.shadow.normalBias = 0;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024; 
  scene.add( light );
  scene.add(light.target);
  const dirHelper = new THREE.DirectionalLightHelper( light, 5 );
  scene.add( dirHelper ); 

  // Shadow
  let frustumSize = 200;

  let shadowCamera = light.shadow.camera = new THREE.OrthographicCamera(
            -frustumSize / 2,
            frustumSize / 2,
            frustumSize / 2,
            -frustumSize / 2,
            1,
            500
        );
  shadowCamera.position.copy(light.position);
  shadowCamera.lookAt(scene.position); 
  var pars = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat };
  light.shadow.map = new THREE.WebGLRenderTarget( light.shadow.mapSize.x, light.shadow.mapSize.y, pars );
  const shadowCameraHelper = new THREE.CameraHelper( shadowCamera );
  scene.add( shadowCameraHelper );

  const spotLight1 = new THREE.SpotLight( 0xff00ff, 1);
  spotLight1.target.position.set(0, 0, 0);
  spotLight1.angle = Math.PI * 0.1;
  spotLight1.castShadow = true;
  spotLight1.position.set( -100, 100, 0);
  spotLight1.shadow.camera.near = 2;
  spotLight1.shadow.camera.far = 2000;
  spotLight1.shadow.bias = - 0.000222;
  spotLight1.shadow.mapSize.width = 1024;
  spotLight1.shadow.mapSize.height = 1024;
  scene.add( spotLight1 );
  scene.add(spotLight1.target);
  const spotHelper = new THREE.SpotLightHelper( spotLight1, 5 );
  scene.add( spotHelper );

// Shadow Plane
const planeGeometry = new THREE.PlaneGeometry( 2000, 2000 );
				planeGeometry.rotateX( - Math.PI / 2 );
				const planeMaterial = new THREE.ShadowMaterial( { color: 0x000000, opacity: 0.2 } );

				const plane = new THREE.Mesh( planeGeometry, planeMaterial);
				plane.position.z = 30;
        plane.position.setX(0);
        plane.position.y = -30;
				plane.receiveShadow = true;
				scene.add( plane );

  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate );

  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  render();

}

function render() {

  renderer.render( scene, camera );

}