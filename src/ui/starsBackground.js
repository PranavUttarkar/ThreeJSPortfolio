// Starry space animated background (2D canvas)
// Usage: import { initStarsBackground } from "/src/ui/starsBackground.js";
//        initStarsBackground({ selector: ".animated-bg" });

export function initStarsBackground(options = {}) {
  const {
    selector = ".animated-bg",
    density = 0.12, // stars per 1000 px^2
    drift = { x: -0.015, y: 0 },
    twinkle = true,
    shootingStars = true,
    maxStarSize = 1.8,
    clickEffects = true,
  } = options;

  const host = document.querySelector(selector);
  if (!host) return;

  host.classList.add("starry");
  host.style.position = host.style.position || "fixed";
  host.style.inset = host.style.inset || "0";
  host.style.zIndex = host.style.zIndex || "-2";
  host.style.overflow = "hidden";

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  host.appendChild(canvas);

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0,
    height = 0;

  const stars = [];
  const meteors = [];
  const waves = []; // expanding shockwave rings
  const blooms = []; // radial glow blooms
  const particles = []; // star dust burst

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = host.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    // Keep CSS size in CSS pixels
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Re-seed stars based on area
    const targetCount = Math.floor((width * height * density) / 1000);
    stars.length = 0;
    for (let i = 0; i < targetCount; i++) {
      // depth 0..1 for parallax and size modulation
      const depth = Math.random();
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        d: depth,
        r: rand(0.5, maxStarSize) * (0.4 + depth * 0.9),
        hue: rand(200, 220) + rand(-6, 6), // cool blue-ish white
        tw: rand(0.6, 2.0), // twinkle speed
        t0: rand(0, Math.PI * 2),
      });
    }
  }

  function drawBackground() {
    // Deep space gradient with subtle blue tint
    const g = ctx.createLinearGradient(0, 0, width, height);
    g.addColorStop(0, "#04070d");
    g.addColorStop(1, "#0a1522");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // Parallax offsets for background glows to create a slow drifting feel
    const time = performance.now() * 0.001;
    const px1 = Math.sin(time * 0.02) * 20;
    const py1 = Math.cos(time * 0.018) * 16;
    const px2 = Math.cos(time * 0.017) * 18;
    const py2 = Math.sin(time * 0.019) * 14;

    // Faint nebulas (layered radial gradients)
    const nebula = ctx.createRadialGradient(
      width * 0.2 + px1,
      height * 0.3 + py1,
      0,
      width * 0.2 + px1,
      height * 0.3 + py1,
      Math.max(width, height) * 0.5
    );
    nebula.addColorStop(0, "rgba(21, 58, 85, 0.22)");
    nebula.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, width, height);

    const nebula2 = ctx.createRadialGradient(
      width * 0.8 + px2,
      height * 0.7 + py2,
      0,
      width * 0.8 + px2,
      height * 0.7 + py2,
      Math.max(width, height) * 0.45
    );
    nebula2.addColorStop(0, "rgba(30, 59, 114, 0.18)");
    nebula2.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = nebula2;
    ctx.fillRect(0, 0, width, height);

    // Subtle vignette for depth
    const vign = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.max(width, height) * 0.4,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    );
    vign.addColorStop(0, "rgba(0,0,0,0)");
    vign.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = vign;
    ctx.fillRect(0, 0, width, height);
  }

  function drawStars(time) {
    const t = time * 0.001;
    const vx = drift.x;
    const vy = drift.y;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      // Parallax drift scaled by depth
      s.x += vx * (0.2 + s.d * 1.2);
      s.y += vy * (0.2 + s.d * 1.2);
      // Wrap around
      if (s.x < -2) s.x = width + 2;
      if (s.x > width + 2) s.x = -2;
      if (s.y < -2) s.y = height + 2;
      if (s.y > height + 2) s.y = -2;

      let alpha = 0.85;
      if (twinkle) {
        alpha = 0.65 + Math.sin(s.t0 + t * s.tw) * 0.35;
      }
      ctx.globalAlpha = Math.max(0.18, Math.min(1, alpha));
      ctx.fillStyle = `hsl(${s.hue}, 80%, ${72 + s.d * 26}%)`;
      // Draw as small blurred circle for glow without heavy shadow
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function spawnMeteor() {
    if (!shootingStars) return;
    // Randomly spawn with low probability
    if (Math.random() < 0.012) {
      const fromTop = Math.random() < 0.5;
      const startX = fromTop ? rand(width * 0.1, width * 0.7) : -30;
      const startY = fromTop ? -20 : rand(height * 0.1, height * 0.5);
      const angle = rand(Math.PI * 0.15, Math.PI * 0.35); // down-right
      const speed = rand(4.0, 7.0); // px per frame
      meteors.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: rand(28, 52),
        age: 0,
      });
    }
  }

  function drawMeteors() {
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx;
      m.y += m.vy;
      m.age++;
      const p = m.age / m.life;
      if (p >= 1 || m.x > width + 50 || m.y > height + 50) {
        meteors.splice(i, 1);
        continue;
      }
      const tx = m.x - m.vx * 7;
      const ty = m.y - m.vy * 7;
      const grd = ctx.createLinearGradient(m.x, m.y, tx, ty);
      grd.addColorStop(0, "rgba(255,255,255,0.95)");
      grd.addColorStop(1, "rgba(30,144,255,0)");
      ctx.strokeStyle = grd;
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = 1 - p * 0.8;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // Click-triggered effects: create a spacey burst at a given point
  function spawnClickEffects(x, y) {
    // Shockwave ring
    waves.push({
      x,
      y,
      r: 0,
      max: Math.max(width, height) * 0.5,
      speed: 360, // px/s
      alpha: 0.85,
      lw: 2.2,
      hue: 200 + Math.random() * 20,
    });

    // Bloom glow
    blooms.push({ x, y, r: 140, alpha: 0.35, decay: 0.85 });

    // Particles
    const count = 36;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.2;
      const spd = 110 + Math.random() * 180;
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 0.9 + Math.random() * 0.8, // seconds
        age: 0,
        size: 1 + Math.random(),
        hue: 200 + Math.random() * 30,
      });
    }

    // Occasionally launch a shooting star from the click
    if (Math.random() < 0.4) {
      const ang = Math.PI * (0.15 + Math.random() * 0.2);
      const speed = 5 + Math.random() * 6;
      meteors.push({
        x,
        y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        life: 28 + Math.random() * 24,
        age: 0,
      });
    }
  }

  function drawEffects(dt) {
    // Blooms (additive glow)
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = blooms.length - 1; i >= 0; i--) {
      const b = blooms[i];
      b.r += 60 * dt;
      b.alpha *= Math.pow(b.decay, dt * 60);
      if (b.alpha < 0.02) {
        blooms.splice(i, 1);
        continue;
      }
      const rg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      rg.addColorStop(0, `rgba(122,167,255,${b.alpha})`);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Waves (shock rings)
    for (let i = waves.length - 1; i >= 0; i--) {
      const wv = waves[i];
      wv.r += wv.speed * dt;
      const p = wv.r / wv.max;
      wv.alpha = Math.max(0, 0.85 * (1 - p));
      wv.lw = Math.max(0.8, 2.6 * (1 - p));
      if (wv.r > wv.max) {
        waves.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `hsla(${wv.hue}, 80%, 65%, ${wv.alpha})`;
      ctx.lineWidth = wv.lw;
      ctx.beginPath();
      ctx.arc(wv.x, wv.y, wv.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Particles (star dust)
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life) {
        particles.splice(i, 1);
        continue;
      }
      // motion with slight drag
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const a = 1 - p.age / p.life;
      ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${Math.max(0, a)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.8 + 0.4 * a), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  let raf = 0;
  let lastTime = performance.now();
  function loop(time) {
    const dt = Math.max(0.001, (time - lastTime) / 1000);
    lastTime = time;
    drawBackground();
    drawStars(time);
    spawnMeteor();
    drawMeteors();
    drawEffects(dt);
    raf = requestAnimationFrame(loop);
  }

  const onResize = () => resize();
  window.addEventListener("resize", onResize, { passive: true });

  resize();
  raf = requestAnimationFrame(loop);

  // Handle clicks anywhere in the window; map to host coords
  function onPointerDown(e) {
    if (!clickEffects) return;
    if (e.pointerType && e.pointerType !== "mouse") return;
    const rect = host.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spawnClickEffects(x, y);
  }
  window.addEventListener("pointerdown", onPointerDown, { passive: true });

  // Return a disposer in case caller wants to tear down
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("pointerdown", onPointerDown);
    try {
      host.removeChild(canvas);
    } catch {}
  };
}
