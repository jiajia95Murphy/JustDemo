import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { PBRMaterial } from './render/material/PBRMaterial';
import { GLTFMeshStandardSGMaterial, CustomMeshStandardMaterial } from './render/material/GLTFExtendMaterials';
import Program from './render/material/Program';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { isMobile } from './Utils';
import { MeshStandardMaterial } from 'three';
let camera, controls, scene, renderer, light;
var params = {
  envMap: 'HDR',
  roughness: 0.0,
  metalness: 0.0,
  exposure: 1.0,
  debug: false
};
init();
//render(); // remove when using next line for animation loop (requestAnimationFrame)
animate();

async function init() {
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xcccccc );
  //scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild( renderer.domElement );

  const pmremGenerator = new THREE.PMREMGenerator(renderer); // 使用hdr作为背景色
  pmremGenerator.compileEquirectangularShader();

  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 400, 200, 0 );
  camera.lookAt(scene.position);
  // controls

  controls = new OrbitControls( camera, renderer.domElement );
  controls.listenToKeyEvents( window ); // optional

  //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.enableZoom = true;

  // Load Light
  let sunLight = new THREE.DirectionalLight(0xffffff, 0.5);
  
  sunLight.castShadow = false;
  // Load Shader
  let program = new Program();
  let { pbrVS, pbrFS } = program.getPBRShader();
  let shadowDepthRange = new THREE.Vector2(
    sunLight.shadow.camera.near,
    sunLight.shadow.camera.far
  ); 
  
  const moonTexture = new THREE.TextureLoader().load('./src/render/texture/moon.jpg');
  const normalTexture = new THREE.TextureLoader().load('./src/render/texture/T_Treant_Normal.png');
  const emissiveTexture = new THREE.TextureLoader().load('./src/render/texture/T_Treant_Emissive.png');
  const metalnessTexture = new THREE.TextureLoader().load('./src/render/texture/FlightHelmet_Materials_RubberWoodMat_OcclusionRoughMetal.png');
  //const envTexture = new THREE.TextureLoader().load('./src/render/environment/hdrs/studio_garden_1k.hdr');
  
  let envTexture;
  const loader = new RGBELoader();
  const texture = await loader.loadAsync('./src/render/environment/hdrs/belfast_farmhouse_1k.hdr');
  envTexture = pmremGenerator.fromEquirectangular(texture).texture;
  pmremGenerator.dispose();
  scene.background = envTexture;
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(30, 32, 32),
    new CustomMeshStandardMaterial({
      map: moonTexture,
      normalMap: normalTexture,
      //emissiveMap: emissiveTexture,
      metalnessMap: metalnessTexture,
      envMap: envTexture,
    })
  );
  moon.material.map.encoding = THREE.sRGBEncoding;

  moon.castShadow = true;

  const moon2 = new THREE.Mesh(
    new THREE.SphereGeometry(30, 32, 32),
    new THREE.MeshStandardMaterial({
      map: moonTexture,
      normalMap: normalTexture,
      //emissiveMap: emissiveTexture,
      metalnessMap: metalnessTexture,
      envMap: envTexture,
    })
  );
  moon2.material.map.encoding = THREE.sRGBEncoding;
  moon2.material.envMap.rotation = new THREE.Euler(0, Math.PI, 0);
  moon2.castShadow = true;
  moon2.position.set(moon.position.x, moon.position.y + 130, moon.position.z);
  scene.add(moon2);

  let envRotation = 0;
  let envRotationFromPanel = new THREE.Matrix4().makeRotationY(envRotation);
  let envRotationMat4 = new THREE.Matrix4().copy(envRotationFromPanel);
  //moon.material.uniforms.uEnvironmentTransform = { value: new THREE.Matrix3().setFromMatrix4(envRotationMat4) };
  //moon.material.uniforms.uEnvBrightness = { value: 1.0 };
  //moon.material.defines['ENABLE_LIGHT'] = 1;
  //moon.material.defines['CUBEUV_MAX_MIP'] = 0;
  scene.add(moon);
  
    // lights
    // DirectionalLight
  light = new THREE.DirectionalLight( 0xFFF4D6, 4);
  light.target.position.set(0, 0, 0);
  light.castShadow = true;
  light.position.set( 1, 1, 0);
  light.shadow.normalBias = 0;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024; 
  //scene.add( light );
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
  //scene.add( shadowCameraHelper );

  const spotLight1 = new THREE.SpotLight( 0xffffff, 0.5);
  spotLight1.target.position.set(0, 0, 0);
  spotLight1.angle = Math.PI * 0.1;
  spotLight1.castShadow = true;
  spotLight1.position.set( -100, 100, 0);
  spotLight1.shadow.camera.near = 2;
  spotLight1.shadow.camera.far = 2000;
  spotLight1.shadow.bias = - 0.000222;
  spotLight1.shadow.mapSize.width = 1024;
  spotLight1.shadow.mapSize.height = 1024;
  //scene.add( spotLight1 );
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

  var gui = new GUI();

		gui.add( params, 'envMap', [ 'LDR', 'HDR', 'RGBM16' ] );
		gui.add( params, 'roughness', 0, 1, 0.01 );
		gui.add( params, 'metalness', 0, 1, 0.01 );
		gui.add( params, 'exposure', 0, 2, 0.01 );
		gui.add( params, 'debug', false );
		gui.open();
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  requestAnimationFrame( animate);

  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

  render();

}

function render() {
  renderer.toneMappingExposure = params.exposure;
  renderer.render( scene, camera );
}