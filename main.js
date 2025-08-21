import "./style.css";
import * as THREE from "three";
import { renderer, camera, scene } from "./src/core/renderer.js";
import { subscribe } from "./src/core/loop.js";
import { getStationGroup, updateStation } from "./src/scenes/station.js";
import { AppState, setMode, onStateChange } from "./src/core/state.js";
import { initHUD } from "./src/ui/hud.js";

// Phase 1 & 2: Station + basic interaction (raycast clickable pylons)

initHUD();

// Raycaster setup
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null;

function handlePointerMove(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}
window.addEventListener("pointermove", handlePointerMove, { passive: true });
window.addEventListener("click", () => {
  if (hovered && hovered.userData?.destination) {
    setMode("traveling", { target: hovered.userData.destination });
  }
});

// Temporary traveling feedback
onStateChange(({ current }) => {
  if (current.mode === "traveling") {
    console.log("Traveling to", current.target);
    // Placeholder: after delay simulate arrival (Phase 2 placeholder only)
    setTimeout(() => {
      setMode("homeStation"); // keep looping back for now
    }, 2000);
  }
});

// Camera idle orbit for ambience when home
let theta = 0;

subscribe((dt) => {
  if (AppState.mode === "homeStation") {
    theta += dt * 0.25;
    camera.position.x = Math.sin(theta) * 10;
    camera.position.z = Math.cos(theta) * 10;
    camera.lookAt(0, 1, 0);
  }
  updateStation(dt);

  // Raycast interaction each frame (cheap with few objects)
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(
    getStationGroup().children,
    true
  );
  const interactiveHit = intersects.find((i) => i.object.userData?.interactive);
  if (interactiveHit) {
    if (hovered !== interactiveHit.object) {
      if (hovered && hovered.material) hovered.material.emissiveIntensity = 0.2;
      hovered = interactiveHit.object;
      if (hovered.material) hovered.material.emissiveIntensity = 0.8;
      renderer.domElement.style.cursor = "pointer";
    }
  } else if (hovered) {
    if (hovered.material) hovered.material.emissiveIntensity = 0.2;
    hovered = null;
    renderer.domElement.style.cursor = "default";
  }
});

console.log("Phase 1 & 2 initialization complete.");
