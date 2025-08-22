// Simple first-person controls with pointer lock
import { camera } from "./renderer.js";

const state = {
  enabled: false,
  yaw: 0,
  pitch: 0,
  speed: 7.2,
  accel: 14,
  decel: 12,
  currentSpeed: 0,
  keys: new Set(),
  width: 16,
  depth: 24,
  height: 9,
  eyeHeight: 2.6,
  bobTime: 0,
  bobAmount: 0,
};

// Head bob tuning
const BOB_FREQ = 16; // base oscillations per second at full speed (was effectively 10)
const BOB_AMP_Y = 0.07; // vertical amplitude (was 0.06)
const BOB_AMP_X = 0.025; // lateral sway amplitude (was 0.02)

export function configureBounds({ width, depth, height }) {
  state.width = width;
  state.depth = depth;
  state.height = height;
}

export function enableFP() {
  if (!state.enabled) {
    document.body.requestPointerLock?.();
  }
}

document.addEventListener("pointerlockchange", () => {
  state.enabled = document.pointerLockElement === document.body;
});

document.addEventListener("keydown", (e) =>
  state.keys.add(e.key.toLowerCase())
);
document.addEventListener("keyup", (e) =>
  state.keys.delete(e.key.toLowerCase())
);

document.addEventListener("mousemove", (e) => {
  if (!state.enabled) return;
  const sensitivity = 0.0025;
  state.yaw -= e.movementX * sensitivity;
  state.pitch -= e.movementY * sensitivity;
  const maxPitch = Math.PI / 2 - 0.05;
  state.pitch = Math.max(-maxPitch, Math.min(maxPitch, state.pitch));
});

export function updateFP(dt) {
  if (!state.enabled) return;
  const forward = new THREE.Vector3(
    Math.sin(state.yaw),
    0,
    Math.cos(state.yaw)
  );
  // Right vector (player perspective). Using forward x up ensures correct handedness for strafing.
  const right = new THREE.Vector3()
    .crossVectors(forward, new THREE.Vector3(0, 1, 0))
    .normalize();

  let move = new THREE.Vector3();
  if (state.keys.has("w")) move.add(forward);
  if (state.keys.has("s")) move.sub(forward);
  if (state.keys.has("a")) move.sub(right);
  if (state.keys.has("d")) move.add(right);
  let moving = move.lengthSq() > 0;
  if (moving) move.normalize();

  // Smooth accelerate / decelerate
  const targetSpeed = moving ? state.speed : 0;
  const rate = targetSpeed > state.currentSpeed ? state.accel : state.decel;
  state.currentSpeed +=
    (targetSpeed - state.currentSpeed) * Math.min(1, rate * dt * 0.1);
  camera.position.addScaledVector(move, state.currentSpeed * dt);

  // Head bob (only when moving forward or strafing)
  const speedRatio = state.currentSpeed / state.speed;
  const targetBob = moving ? speedRatio : 0;
  state.bobAmount += (targetBob - state.bobAmount) * Math.min(1, 10 * dt);
  if (state.bobAmount < 0.001) state.bobTime = 0;
  else state.bobTime += dt * BOB_FREQ * speedRatio;

  // Clamp inside hangar rectangle (with small margin)
  const halfW = state.width / 2 - 1;
  const halfD = state.depth / 2 - 1;
  camera.position.x = Math.max(-halfW, Math.min(halfW, camera.position.x));
  camera.position.z = Math.max(-halfD, Math.min(halfD, camera.position.z));
  const bobOffsetY = Math.sin(state.bobTime) * BOB_AMP_Y * state.bobAmount;
  const bobOffsetX =
    Math.sin(state.bobTime * 0.5) * BOB_AMP_X * state.bobAmount;
  camera.position.y = state.eyeHeight + bobOffsetY; // eye height + bob
  camera.position.x += bobOffsetX; // subtle lateral sway

  // Apply orientation
  const lookDir = new THREE.Vector3(
    Math.sin(state.yaw) * Math.cos(state.pitch),
    Math.sin(state.pitch),
    Math.cos(state.yaw) * Math.cos(state.pitch)
  );
  const targetLook = camera.position.clone().add(lookDir);
  camera.lookAt(targetLook);
}

export function setFPStart(x, y, z, yaw = 0) {
  camera.position.set(x, y, z);
  state.yaw = yaw;
  state.pitch = 0;
}

export function teleportTo(vec3, yaw = null) {
  camera.position.copy(vec3);
  if (yaw !== null) state.yaw = yaw;
  state.pitch = 0;
}

// Lazy assure THREE available (import after definition)
import * as THREE from "three";
