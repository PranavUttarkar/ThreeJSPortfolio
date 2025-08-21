import * as THREE from "three";

const rocketGroup = new THREE.Group();
rocketGroup.name = "Rocket";
rocketGroup.visible = false;

// Body
const bodyGeo = new THREE.CylinderGeometry(0.4, 0.55, 3.2, 24, 1, false);
const bodyMat = new THREE.MeshStandardMaterial({
  color: 0xdddddd,
  metalness: 0.4,
  roughness: 0.35,
});
const body = new THREE.Mesh(bodyGeo, bodyMat);
body.position.y = 1.6;
rocketGroup.add(body);

// Nose
const noseGeo = new THREE.ConeGeometry(0.4, 0.9, 24);
const noseMat = new THREE.MeshStandardMaterial({
  color: 0xff2e63,
  metalness: 0.3,
  roughness: 0.4,
  emissive: 0x550010,
  emissiveIntensity: 0.4,
});
const nose = new THREE.Mesh(noseGeo, noseMat);
nose.position.y = 3.2 + 0.45;
rocketGroup.add(nose);

// Fins
const finGeo = new THREE.BoxGeometry(0.15, 0.6, 0.8);
const finMat = new THREE.MeshStandardMaterial({
  color: 0x222b44,
  metalness: 0.2,
  roughness: 0.6,
});
for (let i = 0; i < 3; i++) {
  const fin = new THREE.Mesh(finGeo, finMat);
  const angle = i * ((Math.PI * 2) / 3);
  fin.position.set(Math.cos(angle) * 0.5, 0.5, Math.sin(angle) * 0.5);
  fin.rotation.y = angle;
  rocketGroup.add(fin);
}

// Engine light
const engineLight = new THREE.PointLight(0xff7b2d, 2.5, 15, 2);
engineLight.position.set(0, 0.1, 0);
rocketGroup.add(engineLight);

// Exhaust placeholder (simple plane with additive material)
const exhaustGeo = new THREE.ConeGeometry(0.25, 1.2, 12, 1, true);
const exhaustMat = new THREE.MeshBasicMaterial({
  color: 0xffb347,
  transparent: true,
  opacity: 0.55,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
exhaust.rotation.x = Math.PI;
exhaust.position.y = 0.1 - 0.6;
rocketGroup.add(exhaust);

export function getRocket() {
  return rocketGroup;
}

let flickerTime = 0;
export function updateRocket(dt) {
  if (!rocketGroup.visible) return;
  flickerTime += dt * 60;
  engineLight.intensity =
    2 + Math.sin(flickerTime * 0.25) * 0.5 + Math.random() * 0.2;
  exhaust.material.opacity = 0.45 + Math.sin(flickerTime * 0.1) * 0.15;
}
