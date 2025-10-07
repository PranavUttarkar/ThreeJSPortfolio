import * as THREE from "three";
import { camera, scene } from "../core/renderer.js";
import { AppState, setMode } from "../core/state.js";
import { getRocket } from "../entities/rocket.js";
import { ROOM_ANCHORS } from "../scenes/station.js";
import { enableFP, teleportTo } from "../core/fpControls.js";

// Predefined target anchor positions for approach
const TARGET_POINTS = {
  projects: ROOM_ANCHORS.projects.clone(),
  skills: ROOM_ANCHORS.skills.clone(),
  experience: ROOM_ANCHORS.experience.clone(),
};

let curve = null;
let t = 0;
let active = false;
let duration = 6; // seconds (could vary per destination)
let phase = "idle"; // ignite, ascend, cruise, arrive

const up = new THREE.Vector3(0, 1, 0);

const tmpPos = new THREE.Vector3();
const tmpLook = new THREE.Vector3();

export function startTravel() {
  if (!AppState.target) return;
  const start = camera.position.clone();
  const end = TARGET_POINTS[AppState.target] || new THREE.Vector3(0, 10, 60);
  const mid1 = start.clone().add(new THREE.Vector3(0, 20, -10));
  const mid2 = end.clone().add(new THREE.Vector3(0, 25, 15));
  curve = new THREE.CatmullRomCurve3([start, mid1, mid2, end]);
  t = 0;
  active = true;
  phase = "ignite";

  const rocket = getRocket();
  rocket.visible = true;
  rocket.position.copy(start);
}

export function updateTravel(dt) {
  if (!active || !curve) return;
  t += dt / duration;
  if (t >= 1) {
    t = 1;
    active = false;
    // Arrival: teleport to the destination anchor and re-enter FP walk mode
    const dest = AppState.target;
    const anchor = TARGET_POINTS[dest] || ROOM_ANCHORS.home;
    if (anchor) teleportTo(anchor, 0);
    setMode("homeStation", { target: null });
    enableFP();
    getRocket().visible = false;
    return;
  }

  const easedT = easeInOutCubic(t);
  curve.getPointAt(easedT, tmpPos);
  curve.getPointAt(Math.min(easedT + 0.002, 1), tmpLook);
  camera.position.lerp(tmpPos, 0.9);
  camera.lookAt(tmpLook);

  // Move rocket with camera, slightly offset
  const rocket = getRocket();
  rocket.position.copy(camera.position).add(new THREE.Vector3(0, -1, 0));
  rocket.lookAt(tmpLook);
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
