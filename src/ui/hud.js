import { setMode } from "../core/state.js";

let root;
export function initHUD() {
  root = document.createElement("div");
  root.id = "hud";
  root.innerHTML = `
    <div class="hud-panel">
      <h2 class="hud-title">Space Station</h2>
      <p class="hud-help">Select a destination pylon or use buttons below.</p>
      <div class="hud-buttons">
        <button data-dest="projects">Projects</button>
        <button data-dest="skills">Skills</button>
        <button data-dest="education">Education</button>
      </div>
    </div>`;
  document.body.appendChild(root);
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-dest]");
    if (!btn) return;
    const dest = btn.getAttribute("data-dest");
    setMode("traveling", { target: dest });
  });
}
