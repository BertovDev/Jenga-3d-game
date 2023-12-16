/////////////////////////////////////////////////////////////////////////
///// IMPORT
import "./main.css";
import * as THREE from "three";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";

/////////////////////////////////////////////////////////////////////////
//// DRACO LOADER TO LOAD DRACO COMPRESSED MODELS FROM BLENDER
const dracoLoader = new DRACOLoader();
const loader = new GLTFLoader();
let jengaObject = null;
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
dracoLoader.setDecoderConfig({ type: "js" });
loader.setDRACOLoader(dracoLoader);

/////////////////////////////////////////////////////////////////////////
///// DIV CONTAINER CREATION TO HOLD THREEJS EXPERIENCE
const container = document.createElement("div");
document.body.appendChild(container);

/////////////////////////////////////////////////////////////////////////
///// SCENE CREATION
const scene = new THREE.Scene();
scene.background = new THREE.Color("#c8f0f9");

/////////////////////////////////////////////////////////////////////////
///// RENDERER CONFIG
const renderer = new THREE.WebGLRenderer({ antialias: true }); // turn on antialias
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); //set pixel ratio
renderer.setSize(window.innerWidth, window.innerHeight); // make it full screen
renderer.outputEncoding = THREE.sRGBEncoding; // set color encoding
container.appendChild(renderer.domElement); // add the renderer to html div

/////////////////////////////////////////////////////////////////////////
///// CAMERAS CONFIG
const camera = new THREE.PerspectiveCamera(
  0.6,
  window.innerWidth / window.innerHeight,
  1,
  100
);
camera.position.set(-14.25, 3.86, 43.05);
scene.add(camera);

/////////////////////////////////////////////////////////////////////////
///// MAKE EXPERIENCE FULL SCREEN
window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(2);
});

/////////////////////////////////////////////////////////////////////////
///// CREATE ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
/////////////////////////////////////////////////////////////////////////
///// SCENE LIGHTS
const ambient = new THREE.AmbientLight(0xa0a0fc, 0.82);
scene.add(ambient);

const sunLight = new THREE.DirectionalLight(0xe8c37b, 1.96);
sunLight.position.set(-69, 44, 14);
scene.add(sunLight);

// RAYCAST SETUP
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const clcikedMAterial = new THREE.MeshPhysicalMaterial();
let jengaBlockMaterial = null;
clcikedMAterial.color.set(Math.random() * 0xffffff);
/////////////////////////////////////////////////////////////////////////
///// LOADING GLB/GLTF MODEL FROM BLENDER
loader.load("models/gltf/Jenga/scene.gltf", function (gltf) {
  jengaObject = gltf.scene;
  scene.add(jengaObject);
  camera.lookAt(jengaObject.position);
  jengaBlockMaterial = findObjectWithMaterial(jengaObject);

  // GUI CONTORLS FOR the jenga
  gui.add(jengaObject.scale, "x").min(1).max(30).step(0.1);
  gui.add(jengaObject.scale, "y").min(1).max(30).step(0.1);
  gui.add(jengaObject.scale, "z").min(1).max(30).step(0.1);

  gui.add(jengaObject.position, "x").min(-10).max(100).step(0.01);
  gui.add(jengaObject.position, "y").min(-10).max(100).step(0.01);
  gui.add(jengaObject.position, "z").min(-10).max(100).step(0.01);

  gui.add(jengaObject.rotation, "x").min(-10).max(100).step(0.01);
  gui.add(jengaObject.rotation, "y").min(-10).max(100).step(0.01);
  gui.add(jengaObject.rotation, "z").min(-10).max(100).step(0.01);

  // SETTINGS

  jengaObject.rotation.y = 0.24;
  jengaObject.scale.set(3, 3, 3);
  jengaObject.position.set(0, -0.15, 0);
});

function findObjectWithMaterial(object) {
  if (object.material !== undefined) {
    return object.material;
  } else {
    return findObjectWithMaterial(object.children[0]);
  }
}

function onClick() {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObject(scene, true);
  if (intersects.length > 0) {
    intersects[0].object.material =
      intersects[0].object.material === jengaBlockMaterial
        ? clcikedMAterial
        : jengaBlockMaterial;
  }
}

/////////////////////////////////////////////////////////////////////////
//// INTRO CAMERA ANIMATION USING TWEEN
function introAnimation() {
  controls.enabled = false; //disable orbit controls to animate the camera

  new TWEEN.Tween(camera.position.set(26, 4, -35))
    .to(
      {
        // from camera position
        x: 16, //desired x position to go
        y: 50, //desired y position to go
        z: -0.1, //desired z position to go
      },
      6500
    ) // time take to animate
    .delay(1000)
    .easing(TWEEN.Easing.Quartic.InOut)
    .start() // define delay, easing
    .onComplete(function () {
      //on finish animation
      controls.enabled = true; //enable orbit controls
      setOrbitControlsLimits(); //enable controls limits
      TWEEN.remove(this); // remove the animation from memory
    });
}

// introAnimation(); // call intro animation on start

/////////////////////////////////////////////////////////////////////////
//// DEFINE ORBIT CONTROLS LIMITS
function setOrbitControlsLimits() {
  controls.enableDamping = true;
  controls.dampingFactor = 0.04;
  controls.minDistance = 35;
  controls.maxDistance = 60;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.maxPolarAngle = Math.PI / 2.5;
}

//GUI
const gui = new GUI();
gui.add(camera.position, "x").min(-100).max(100).step(0.01);
gui.add(camera.position, "y").min(-100).max(100).step(0.01);
gui.add(camera.position, "z").min(-100).max(100).step(0.01);

/////////////////////////////////////////////////////////////////////////
//// RENDER LOOP FUNCTION

function rendeLoop() {
  TWEEN.update(); // update animations

  controls.update(); // update orbit controls

  renderer.render(scene, camera); // render the scene using the camera
  renderer.domElement.addEventListener("click", onClick, false);

  requestAnimationFrame(rendeLoop); //loop the render function
}

rendeLoop(); //start rendering
