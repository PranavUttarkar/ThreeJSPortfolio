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
  teleportTo,
} from "./src/core/fpControls.js";
import { ROOM_ANCHORS } from "./src/scenes/station.js";
import { showExhibit } from "./src/ui/exhibitOverlay.js";

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
  if (focus && focus.userData?.exhibit) {
    const { type, id } = focus.userData.exhibit;
    showExhibit(type, id);
    return;
  }
  // New: hallway exhibit groups have userData.openUrl
  if (focus && focus.userData?.openUrl) {
    const url = focus.userData.openUrl;
    try {
      window.open(url, "_blank", "noopener");
    } catch {
      window.location.href = url;
    }
    return;
  }
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

// Resume pointer lock overlay when ESC released pointer lock
function ensureResumeOverlay() {
  let resume = document.getElementById("resumePL");
  if (document.pointerLockElement) {
    if (resume) resume.remove();
    return;
  }
  if (!resume) {
    resume = document.createElement("div");
    resume.id = "resumePL";
    resume.textContent = "CLICK TO RE-ENTER WALK MODE";
    Object.assign(resume.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      background: "rgba(10,25,40,0.8)",
      padding: "1rem 1.5rem",
      border: "1px solid #1e90ff",
      fontFamily: "elevon, sans-serif",
      letterSpacing: "1px",
      fontSize: "0.9rem",
      cursor: "pointer",
      color: "#d9f2ff",
      borderRadius: "0.75rem",
      zIndex: 1400,
      textAlign: "center",
      boxShadow: "0 0 18px #1e90ff55",
      userSelect: "none",
    });
    resume.addEventListener("click", () => enableFP());
    document.body.appendChild(resume);
  }
}
document.addEventListener("pointerlockchange", ensureResumeOverlay);
document.addEventListener("keyup", (e) => {
  if (e.key === "Escape") setTimeout(ensureResumeOverlay, 60);
});

// Simple teleport toolbar
const tpBar = document.createElement("div");
tpBar.id = "tpBar";
Object.assign(tpBar.style, {
  position: "fixed",
  right: "1rem",
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  flexDirection: "column",
  gap: ".5rem",
  zIndex: 1300,
});
function makeTPBtn(label, anchorKey) {
  const b = document.createElement("button");
  b.textContent = label;
  Object.assign(b.style, {
    background: "rgba(15,30,45,0.65)",
    color: "#eef8ff",
    border: "1px solid #1e90ff",
    font: "600 11px elevon, sans-serif",
    padding: ".5rem .75rem",
    letterSpacing: "1px",
    borderRadius: ".5rem",
    cursor: "pointer",
    backdropFilter: "blur(4px)",
    transition: "background .25s, transform .25s",
  });
  b.addEventListener("mouseenter", () => (b.style.background = "#1e425f"));
  b.addEventListener(
    "mouseleave",
    () => (b.style.background = "rgba(15,30,45,0.65)")
  );
  b.addEventListener("click", () => {
    const anchor = ROOM_ANCHORS[anchorKey];
    if (anchor) {
      teleportTo(anchor, 0);
      enableFP();
    }
  });
  return b;
}
tpBar.appendChild(makeTPBtn("HOME", "home"));
tpBar.appendChild(makeTPBtn("PROJECTS", "projects"));
tpBar.appendChild(makeTPBtn("SKILLS", "skills"));
tpBar.appendChild(makeTPBtn("EXPERIENCE", "experience"));
document.body.appendChild(tpBar);

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
    rocketRef.visible = true;
    // Release FP controls so travel path controls the camera smoothly
    if (document.exitPointerLock) {
      try {
        document.exitPointerLock();
      } catch {}
    }
    setTimeout(() => startTravel(), 900); // allow doors to open first
  } else if (current.mode === "homeStation") {
    closeTunnelDoors();
    // rocket visibility handled on arrival; ensure hidden when docked
    rocketRef.visible = false;
  }
});

// Add rocket to scene root
scene.add(getRocket());
const rocketRef = getRocket();
rocketRef.visible = false; // hidden at start
rocketRef.position.set(0, 0, 0);

// Configure FP bounds large enough to include the hallway square loop
// width: base (16) + two hallways (2*10) + margin
// depth: hallway length (60) + hallway width (10) + small margin
configureBounds({ width: 16 + 10 * 2 + 4, depth: 60 + 10 + 4, height: 9 });
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
