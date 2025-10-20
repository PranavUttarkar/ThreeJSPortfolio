// Futuristic animated custom cursor injected globally
// - Renders neon circular reticle + trailing ring
// - Highlights on interactive targets and pulses on click
// - Works on devices that have any fine pointer (even if touch exists)

const hasFinePointer = matchMedia("(any-pointer: fine)").matches;

if (hasFinePointer) {
  const root = document.createElement("div");
  root.className = "fx-cursor";
  root.setAttribute("aria-hidden", "true");

  // Core reticle SVG (neon circular glyph)
  const core = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  core.setAttribute("class", "fx-cursor__core");
  core.setAttribute("viewBox", "0 0 40 40");
  core.innerHTML = `
    <defs>
      <linearGradient id="fx-neon" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e90ff" />
        <stop offset="100%" stop-color="#7aa7ff" />
      </linearGradient>
      <filter id="fx-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.6" result="blur" />
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g opacity="0.96" filter="url(#fx-glow)">
      <!-- outer clean circle -->
      <circle cx="20" cy="20" r="10.5" fill="none" stroke="url(#fx-neon)" stroke-width="1.7" />
      <!-- inner dot -->
      <circle cx="20" cy="20" r="1.8" fill="#a8c7ff" fill-opacity="0.9" />
      <!-- small ticks (minimal) -->
      <path d="M20 6.5 L20 8.5 M20 31.5 L20 33.5 M6.5 20 L8.5 20 M31.5 20 L33.5 20"
            stroke="#a8c7ff" stroke-opacity="0.7" stroke-width="1" stroke-linecap="round" />
    </g>
  `;

  const ring = document.createElement("div");
  ring.className = "fx-cursor__ring";

  root.appendChild(ring);
  root.appendChild(core);
  const attach = () => {
    if (!document.body.contains(root)) {
      document.body.appendChild(root);
      // show immediately so there's always a visible cursor replacement
      root.classList.add("fx-cursor--visible");
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attach);
  } else {
    attach();
  }

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let ringX = targetX;
  let ringY = targetY;
  let visible = false;
  let rafId = 0;

  const lerp = (a, b, t) => a + (b - a) * t;

  function show() {
    if (!visible) {
      visible = true;
      root.classList.add("fx-cursor--visible");
    }
  }

  function hide() {
    visible = false;
    root.classList.remove("fx-cursor--visible");
  }

  function loop() {
    ringX = lerp(ringX, targetX, 0.8);
    ringY = lerp(ringY, targetY, 0.8);

    // Place elements (root anchors at 0,0; translate elements)
    core.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    rafId = requestAnimationFrame(loop);
  }

  function onMove(e) {
    if (e.target && shouldHighlight(e.target))
      root.classList.add("fx-cursor--link");
    else root.classList.remove("fx-cursor--link");

    targetX = e.clientX;
    targetY = e.clientY;
    show();
  }

  function shouldHighlight(el) {
    if (!el) return false;
    const sel =
      'a,button,.btn,[role="button"],input[type="submit"],input[type="button"],label,.card,.clickable,.live-row';
    return el.closest(sel) != null;
  }

  // Prefer pointer events so we only track real mouse movement
  function onPointerMove(e) {
    if (e.pointerType && e.pointerType !== "mouse") return; // ignore touch/pen movement
    onMove(e);
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("mousemove", onMove, { passive: true }); // fallback
  window.addEventListener("pointerdown", (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    root.classList.add("fx-cursor--down");
  });
  window.addEventListener("pointerup", (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    root.classList.remove("fx-cursor--down");
  });
  window.addEventListener("mouseleave", hide);
  window.addEventListener("mouseenter", show);

  // Accessibility: hide when tabbing for keyboard users
  window.addEventListener("keydown", (e) => {
    if (e.key === "Tab") root.classList.add("fx-cursor--kbd");
  });
  window.addEventListener("mousedown", () =>
    root.classList.remove("fx-cursor--kbd")
  );

  // Start RAF
  rafId = requestAnimationFrame(loop);

  // Cleanup on page hide (SPA navigation safety)
  window.addEventListener("pagehide", () => cancelAnimationFrame(rafId));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) hide();
  });
}
