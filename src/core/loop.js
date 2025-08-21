import { renderer, scene, camera } from "./renderer.js";

const subscribers = new Set();
let lastTime = performance.now();

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function frame(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  subscribers.forEach((fn) => fn(dt, now));
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
