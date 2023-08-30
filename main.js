import "./style.css";
import * as THREE from "three";
import { gsap } from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Colors
const COLORS = {
  background: "white",
  light: "#ffffff",
  sky: "#aaaaff",
  ground: "#88ff88",
};

const PI = Math.PI;

// SCENE

let size = { width: 0, height: 0 };

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.background);
scene.fog = new THREE.Fog(COLORS.background, 15, 20);

// RENDERER

const renderer = new THREE.WebGL1Renderer({
  antialias: true,
});

renderer.physicallyCorrectLights = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const container = document.querySelector(".canvas-container");
container.appendChild(renderer.domElement);

// CAMERA

const camera = new THREE.PerspectiveCamera(
  40,
  size.width / size.height,
  0.1,
  100
);
camera.position.set(0, 1, 5);
let cameraTarget = new THREE.Vector3(0, 1, 0);

scene.add(camera);

// LIGHTS

const directionalLight = new THREE.DirectionalLight(COLORS.light, 2);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 10;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(2, 5, 3);

scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(
  COLORS.sky,
  COLORS.ground,
  0.5
);
scene.add(hemisphereLight);

// FLOOR

// const plane = new THREE.PlaneGeometry(100, 100);
// const floorMaterial = new THREE.MeshStandardMaterial({ color: COLORS.ground });
// const floor = new THREE.Mesh(plane, floorMaterial);
// floor.receiveShadow = true;
// floor.rotateX(-Math.PI * 0.5);

// scene.add(floor);

// ON RESIZE

const onResize = () => {
  size.width = container.clientWidth;
  size.height = container.clientHeight;

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();

  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

window.addEventListener("resize", onResize);
onResize();

// TICK

const tick = () => {
  camera.lookAt(cameraTarget);
  renderer.render(scene, camera);
  window.requestAnimationFrame(() => tick());
};

tick();

const toLoad = [
  { name: "phone", file: "scene.gltf", group: new THREE.Group() },
];

const models = {};

const setupAnimation = () => {
  ScrollTrigger.matchMedia({
    "(prefers-reduced-motion: no-preference)": desktopAnimation,
  });
};

const desktopAnimation = () => {
  let section = 0;
  const firstScroll = gsap.timeline({
    scrollTrigger: {
      trigger: ".page1",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.1,
    },
  });

  firstScroll.to(models.phone.position, { x: -4, y: -0.5 }, section);
  firstScroll.to(models.phone.rotation, { y: 0.9 }, section);
  firstScroll.to(models.phone.scale, { x: 2, y: 2, z: 2 }, section);

  section += 1;
  firstScroll.to(models.phone.rotation, { y: 3.4 }, section);
  firstScroll.to(models.phone.position, { x: 3.8, y: -1.8 }, section);

  section += 1;
  firstScroll.to(models.phone.rotation, { x: -2.4, y: 3.18, z: 1.6 }, section);
  firstScroll.to(models.phone.position, { x: -1.2, y: 4, z: 1 }, section);
};

const LoadingManager = new THREE.LoadingManager(() => {
  setupAnimation();
});
const gltfLoader = new GLTFLoader(LoadingManager);

toLoad.forEach((item) => {
  gltfLoader.load(item.file, (model) => {
    model.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.receiveShadow = true;
        child.castShadow = true;
      }
    });
    model.scene.position.y = 0.7;
    model.scene.rotation.y = 2.3;
    model.scene.position.x = 1.5;
    model.scene.scale.set(16, 16, 16);
    item.group.add(model.scene);
    scene.add(item.group);
    models[item.name] = item.group;
  });
});

const backToTopButton = document.getElementById("backToTopBtn");

backToTopButton.addEventListener("click", () => {
  // Scroll to the top of the page
  window.scrollTo({
    top: 0,
    behavior: "smooth", // Use smooth scrolling
  });
});