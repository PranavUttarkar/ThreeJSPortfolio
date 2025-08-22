export function injectNav(active = "home") {
  const links = [
    { href: "/", key: "home", label: "Home" },
    { href: "/about.html", key: "about", label: "About" },
    { href: "/explore.html", key: "explore", label: "3D Museum" },
    { href: "/contact.html", key: "contact", label: "Contact" },
    {
      href: "/Resume Pranav Uttarkar.pdf",
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
    .join(
      ""
    )}</ul><button id="navSearchBtn" aria-label="Open search">⌕</button></div>`;
  document.body.prepend(nav);
}
