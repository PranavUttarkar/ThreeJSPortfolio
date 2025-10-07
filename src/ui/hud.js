import { setMode, onStateChange, AppState } from "../core/state.js";

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
  <button data-dest="experience">Experience</button>
        <button id="btnHome" style="display:none;">Home</button>
      </div>
      <div class="hud-status" style="margin-top:.5rem;font-size:.7rem;opacity:.7;"></div>
    </div>`;
  document.body.appendChild(root);
  root.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-dest]");
    if (!btn) return;
    const dest = btn.getAttribute("data-dest");
    setMode("traveling", { target: dest });
  });
  const statusEl = root.querySelector(".hud-status");
  const homeBtn = root.querySelector("#btnHome");
  homeBtn.addEventListener("click", () =>
    setMode("homeStation", { target: null })
  );
  onStateChange(({ current }) => {
    if (current.mode === "traveling") {
      statusEl.textContent = `Traveling to ${current.target}...`;
      homeBtn.style.display = "block";
    } else if (current.mode === "homeStation") {
      statusEl.textContent = "Docked at station";
      homeBtn.style.display = "none";
    } else {
      statusEl.textContent = current.mode;
    }
  });
}
