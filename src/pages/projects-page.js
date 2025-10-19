import { projects } from "../data/projects.js";

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const list = document.getElementById("list");
if (list) {
  projects.forEach((p) => {
    const row = document.createElement("article");
    row.className = "proj";
    row.innerHTML = `
      <div class="img"><img src='${p.image || "/favicon.png"}' alt='${
      p.title
    }' loading='lazy' onerror="this.onerror=null;this.src='/favicon.png'" /></div>
      <div class="meta">
        <h3>${p.title}</h3>
        <p>${p.description || p.summary || ""}</p>
        <ul class="highlights">${(p.highlights || [])
          .map((h) => `<li>${h}</li>`)
          .join("")}</ul>
        <div class="tags">${(p.tech || [])
          .map((t) => `<span>${t}</span>`)
          .join("")}</div>
      </div>
    `;
    row.addEventListener("click", () => {
      window.location.href = "/project/" + p.id + ".html";
    });
    list.appendChild(row);
  });
}
