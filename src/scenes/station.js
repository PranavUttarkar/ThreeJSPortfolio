import * as THREE from 'three';
import { scene } from '../core/renderer.js';

const stationGroup = new THREE.Group();
stationGroup.name = 'StationGroup';

// Placeholder geometry: a floor + 3 destination pylons
const floorGeo = new THREE.CircleGeometry(20, 64);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x222a33, metalness: 0.1, roughness: 0.8 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
stationGroup.add(floor);

const pylons = [];
const labels = [
  { id: 'projects', color: 0x1e90ff, angle: 0 },
  { id: 'skills', color: 0xff8c00, angle: 120 },
  { id: 'education', color: 0x32cd32, angle: 240 }
];

labels.forEach(cfg => {
  const h = 3;
  const geo = new THREE.CylinderGeometry(0.6, 0.6, h, 24, 1, false);
  const mat = new THREE.MeshStandardMaterial({ color: cfg.color, emissive: cfg.color, emissiveIntensity: 0.2 });
  const mesh = new THREE.Mesh(geo, mat);
  const radius = 8;
  const rad = THREE.MathUtils.degToRad(cfg.angle);
  mesh.position.set(Math.cos(rad) * radius, h / 2, Math.sin(rad) * radius);
  mesh.userData.interactive = true;
  mesh.userData.destination = cfg.id;
  stationGroup.add(mesh);
  pylons.push(mesh);
  // Floating label plane placeholder
  const planeGeo = new THREE.PlaneGeometry(3, 1);
  const planeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.position.set(0, h * 0.7, 0);
  plane.lookAt(0, h * 0.7, 0); // updated in animate maybe
  mesh.add(plane);
});

scene.add(stationGroup);

export function getStationGroup(){
  return stationGroup;
}

export function updateStation(dt){
  // Subtle slow rotation for ambiance
  stationGroup.rotation.y += dt * 0.05;
}
