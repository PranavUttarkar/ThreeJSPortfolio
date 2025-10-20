export function injectNav(active = "home") {
  const links = [
    { href: "/", key: "home", label: "Home" },
    { href: "/projects", key: "projects", label: "Projects" },
    { href: "/experiences", key: "experiences", label: "Experiences" },
    {
      href: "/Resume.pdf",
      key: "resume",
      label: "Resume",
      ext: true,
    },
  ];
  const nav = document.createElement("nav");
  nav.className = "site-nav glass";
  nav.innerHTML = `<div class="nav-inner"><div class="brand">PRANAV<span>_UTTARKAR</span></div><ul>${links
    .map(
      (l) =>
        `<li><a ${l.ext ? "target=_blank" : ""} href="${l.href}" class="${
          active === l.key ? "active" : ""
        }">${l.label}</a></li>`
    )
    .join("")}</ul></div>`;
  document.body.prepend(nav);
}
