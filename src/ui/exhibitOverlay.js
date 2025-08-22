import { projects } from "../data/projects.js";
import { skills } from "../data/skills.js";
import { experience } from "../data/experience.js";

const catalogs = {
  project: projects,
  skill: skills,
  experience: experience,
};

let overlayEl = null;

export function showExhibit(type, id) {
  if (!overlayEl) createOverlay();
  const root = overlayEl.querySelector(".exhibit-body");
  root.innerHTML = renderContent(type, id);
  overlayEl.classList.add("visible");
}

export function hideExhibit() {
  overlayEl?.classList.remove("visible");
}

function renderContent(type, id) {
  if (type === "project") {
    const p = catalogs.project.find((p) => p.id === id);
    if (!p) return "<p>Not found.</p>";
    return `<h2>${p.title}</h2>
      <p>${p.description}</p>
      <div class="meta"><strong>Tech:</strong> ${p.tech.join(", ")}</div>
      <ul>${p.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>`;
  }
  if (type === "experience") {
    const e = catalogs.experience.find((e) => e.id === id);
    if (!e) return "<p>Not found.</p>";
    return `<h2>${e.role} – ${e.org}</h2>
      <div class="period">${e.period}</div>
      <p>${e.summary}</p>
      <ul>${e.details.map((d) => `<li>${d}</li>`).join("")}</ul>
      <div class="meta"><strong>Tech:</strong> ${e.tech.join(", ")}</div>`;
  }
  if (type === "skill") {
    const group = catalogs.skill.find((s) => s.category === id);
    if (!group) return "<p>Not found.</p>";
    return `<h2>${group.category}</h2>
      <p>${group.items.join(", ")}</p>`;
  }
  return "<p>Unsupported exhibit.</p>";
}

function createOverlay() {
  overlayEl = document.createElement("div");
  overlayEl.id = "exhibitOverlay";
  overlayEl.innerHTML = `
  <div class="exhibit-panel">
    <button class="close-btn" aria-label="Close">×</button>
    <div class="exhibit-body"></div>
  </div>`;
  document.body.appendChild(overlayEl);
  overlayEl.querySelector(".close-btn").addEventListener("click", hideExhibit);
  overlayEl.addEventListener("click", (e) => {
    if (e.target === overlayEl) hideExhibit();
  });
}
