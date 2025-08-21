import * as THREE from "three";

// Core scene & renderer setup (Phase 1 foundation)
export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera(
  78,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 2, 8);

export const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

export function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

window.addEventListener("resize", resize, { passive: true });

// Basic lighting for initial station placeholder
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(5, 10, 7);
scene.add(dir);
