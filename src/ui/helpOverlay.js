import { enableFP } from "../core/fpControls.js";

export function createHelpOverlay() {
  const div = document.createElement("div");
  div.id = "helpOverlay";
  div.innerHTML = `
    <div class="help-inner">
      <h1>Welcome Pilot</h1>
      <p>This is my interactive portfolio hangar.</p>
      <p>You can explore it like a mini game OR switch to a classic website view.</p>
      <p>W / A / S / D &nbsp; Move &nbsp; | &nbsp; Mouse &nbsp; Look</p>
      <p>Center reticle on a console & click to open that section.</p>
      <p><span class="hint">Pointer lock activates when you enter (Esc to release)</span></p>
      <div style="margin:10px 0 14px; display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">
        <button id="classicView" style="background:#1b2b38; border:1px solid #2f5d80; padding:6px 12px; cursor:pointer; color:#cfe9ff; letter-spacing:1px;">CLASSIC SITE</button>
      </div>
      <button id="closeHelp">ENTER STATION</button>
    </div>`;
  document.body.appendChild(div);
  div.querySelector("#closeHelp").addEventListener("click", () => {
    div.classList.add("fade");
    enableFP();
    setTimeout(() => div.remove(), 300);
  });
  const classicBtn = div.querySelector("#classicView");
  if (classicBtn) {
    classicBtn.addEventListener("click", () => {
      // Simple fallback: navigate to non-interactive page (e.g., /public/projects.html) or root scroll site
      // Adjust target as needed; for now route to projects page.
      window.location.href = "public/projects.html";
    });
  }
}
