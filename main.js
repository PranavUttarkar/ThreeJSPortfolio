import "./style.css";
import * as THREE from "three";
import { renderer, camera, scene } from "./src/core/renderer.js";
import { subscribe } from "./src/core/loop.js";
import {
  getStationGroup,
  getInteractivePanels,
  updateStation,
  openTunnelDoors,
  closeTunnelDoors,
} from "./src/scenes/station.js";
import { AppState, setMode, onStateChange } from "./src/core/state.js";
import { initHUD } from "./src/ui/hud.js";
import { createHelpOverlay } from "./src/ui/helpOverlay.js";
import { getRocket, updateRocket } from "./src/entities/rocket.js";
import { startTravel, updateTravel } from "./src/systems/travel.js";
import {
  enableFP,
  updateFP,
  setFPStart,
  configureBounds,
} from "./src/core/fpControls.js";

// Phase 1 & 2: Station + basic interaction (raycast clickable pylons)

initHUD();
createHelpOverlay();
const ret = document.createElement("div");
ret.id = "reticle";
document.body.appendChild(ret);

// Click feedback overlay
const clickFx = document.createElement("div");
clickFx.style.position = "fixed";
clickFx.style.inset = "0";
clickFx.style.pointerEvents = "none";
clickFx.style.background =
  "radial-gradient(circle at center, rgba(90,180,255,0.25), rgba(0,0,0,0) 55%)";
clickFx.style.opacity = "0";
clickFx.style.transition = "opacity 180ms ease-out";
clickFx.style.mixBlendMode = "screen";
document.body.appendChild(clickFx);

// Center raycast (reticle) setup
const raycaster = new THREE.Raycaster();
const center = new THREE.Vector2(0, 0);
let focus = null;

// Click selects focused panel
window.addEventListener("click", () => {
  // Pulse feedback
  clickFx.style.transition = "none";
  clickFx.style.opacity = "0.85";
  requestAnimationFrame(() => {
    clickFx.style.transition = "opacity 260ms ease-out";
    clickFx.style.opacity = "0";
  });
  if (focus && focus.userData?.destination) {
    // brief emissive flash on panel frame (parent)
    const panel = focus;
    const frame = panel.parent; // frame mesh
    if (frame && frame.material && frame.material.emissive) {
      const original = frame.material.emissiveIntensity;
      frame.material.emissiveIntensity = original + 0.6;
      setTimeout(() => {
        frame.material.emissiveIntensity = original;
      }, 280);
    }
    setMode("traveling", { target: focus.userData.destination });
  }
});

// Fallback pointer lock prompt after few seconds if user skipped
setTimeout(() => {
  if (!document.pointerLockElement) {
    const btn = document.createElement("div");
    btn.textContent = "CLICK TO ACTIVATE CONTROLS";
    btn.style.position = "fixed";
    btn.style.bottom = "14px";
    btn.style.left = "50%";
    btn.style.transform = "translateX(-50%)";
    btn.style.padding = "8px 14px";
    btn.style.background = "rgba(0,0,0,0.55)";
    btn.style.border = "1px solid #3aa0ff";
    btn.style.font = "12px sans-serif";
    btn.style.letterSpacing = "1px";
    btn.style.cursor = "pointer";
    btn.style.color = "#cfe9ff";
    btn.style.zIndex = 1200;
    btn.addEventListener("click", () => {
      enableFP();
      btn.remove();
    });
    document.body.appendChild(btn);
    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement) btn.remove();
    });
  }
}, 3000);

// Temporary traveling feedback
onStateChange(({ current }) => {
  if (current.mode === "traveling") {
    openTunnelDoors();
    setTimeout(() => startTravel(), 900); // allow doors to open first
  } else if (current.mode === "homeStation") {
    closeTunnelDoors();
    rocketRef.visible = false; // hide rocket until launch sequence implementation
  }
});

// Add rocket to scene root
scene.add(getRocket());
const rocketRef = getRocket();
rocketRef.visible = false; // hidden at start
rocketRef.position.set(0, 0, 0);

// Configure FP bounds from station dims (after station import sets constants)
configureBounds({ width: 16, depth: 24, height: 9 });
// Initial camera placement: move inside and face toward consoles (panels ~z 3.5-4)
setFPStart(0, 2.6, 13.5, Math.PI); // yaw PI looks toward -Z
camera.lookAt(0, 2.6, 3.6);

subscribe((dt) => {
  // No longer forcibly resetting camera each frame; FP controls manage movement
  updateStation(dt);
  updateTravel(dt);
  updateRocket(dt);
  updateFP(dt);

  // Center screen focus raycast
  raycaster.setFromCamera(center, camera);
  const hits = raycaster.intersectObjects(getInteractivePanels(), true);
  const hit = hits.find((h) => h.object.userData?.interactive);
  if (hit) {
    if (focus !== hit.object) {
      if (focus && focus.material) focus.material.emissiveIntensity = 0.3;
      focus = hit.object;
      if (focus.material) focus.material.emissiveIntensity = 0.55;
    }
    renderer.domElement.style.cursor = "crosshair";
  } else if (focus) {
    if (focus.material) focus.material.emissiveIntensity = 0.3;
    focus = null;
    renderer.domElement.style.cursor = "default";
  }
});

console.log("Phase 1 & 2 initialization complete.");
