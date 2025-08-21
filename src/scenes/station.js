import * as THREE from "three";
import { scene } from "../core/renderer.js";

// Rocket hangar style station (static, enhanced)
const stationGroup = new THREE.Group();
stationGroup.name = "StationGroup";

// Dimensions (exported for other systems e.g., travel / camera constraints)
export const STATION_DIMENSIONS = { width: 16, depth: 24, height: 9 };
const { width, depth, height } = STATION_DIMENSIONS;

// Materials
const wallMat = new THREE.MeshStandardMaterial({
  color: 0x1a2330,
  metalness: 0.2,
  roughness: 0.85,
});
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x10161d,
  metalness: 0.05,
  roughness: 0.9,
});
const trimMat = new THREE.MeshStandardMaterial({
  color: 0x2f3d52,
  metalness: 0.4,
  roughness: 0.4,
});

// Floor with emissive grid shader
const floorGeo = new THREE.PlaneGeometry(width, depth, 1, 1);
const floorShader = {
  uniforms: { uTime: { value: 0 } },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `varying vec2 vUv; uniform float uTime; void main(){
    vec2 gv = fract(vUv*20.0)-0.5; float line = min(abs(gv.x), abs(gv.y));
    float grid = smoothstep(0.25,0.0,line);
    float pulse = 0.4 + 0.3*sin(uTime*2.0 + vUv.x*10.0);
    vec3 base = mix(vec3(0.05,0.08,0.11), vec3(0.1,0.18,0.28), pulse*grid);
    float glow = smoothstep(0.02, 0.0, line);
    vec3 col = base + vec3(0.1,0.4,0.8)*glow*0.6;
    gl_FragColor = vec4(col,1.0);
  }`,
};
const floor = new THREE.Mesh(
  floorGeo,
  new THREE.ShaderMaterial({
    uniforms: floorShader.uniforms,
    vertexShader: floorShader.vertexShader,
    fragmentShader: floorShader.fragmentShader,
  })
);
floor.rotation.x = -Math.PI / 2;
stationGroup.add(floor);

// Ceiling
const ceiling = new THREE.Mesh(
  new THREE.PlaneGeometry(width, depth),
  wallMat.clone()
);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = height;
stationGroup.add(ceiling);

// Walls (back, front (doorway opening), left, right) using PlaneGeometry
function makeWall(w, h, mat) {
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
}
const backWall = makeWall(width, height, wallMat.clone());
backWall.position.z = -depth / 2;
backWall.position.y = height / 2;
backWall.rotation.y = Math.PI;
stationGroup.add(backWall);
// Front wall split to create doorway (center opening)
const doorWidth = 6;
const sideWidth = (width - doorWidth) / 2;
function addFrontSegment(xCenter, segWidth) {
  const seg = makeWall(segWidth, height, wallMat.clone());
  seg.position.set(xCenter, height / 2, depth / 2);
  stationGroup.add(seg);
}
addFrontSegment(-(doorWidth / 2 + sideWidth / 2), sideWidth);
addFrontSegment(doorWidth / 2 + sideWidth / 2, sideWidth);

// Door frame trims
const frameMat = new THREE.MeshStandardMaterial({
  color: 0x34526b,
  metalness: 0.6,
  roughness: 0.3,
  emissive: 0x0a1c2e,
  emissiveIntensity: 0.4,
});
const frameGeo = new THREE.BoxGeometry(doorWidth, 0.6, 0.6);
const topFrame = new THREE.Mesh(frameGeo, frameMat);
topFrame.position.set(0, height - 0.3, depth / 2 + 0.1);
stationGroup.add(topFrame);
// Side frames
const sideFrameGeo = new THREE.BoxGeometry(0.6, height, 0.6);
const leftFrame = new THREE.Mesh(sideFrameGeo, frameMat);
leftFrame.position.set(-doorWidth / 2, height / 2, depth / 2 + 0.1);
const rightFrame = new THREE.Mesh(sideFrameGeo, frameMat);
rightFrame.position.set(doorWidth / 2, height / 2, depth / 2 + 0.1);
stationGroup.add(leftFrame, rightFrame);
const leftWall = makeWall(depth, height, wallMat.clone());
leftWall.position.x = -width / 2;
leftWall.position.y = height / 2;
leftWall.rotation.y = Math.PI / 2;
stationGroup.add(leftWall);
const rightWall = makeWall(depth, height, wallMat.clone());
rightWall.position.x = width / 2;
rightWall.position.y = height / 2;
rightWall.rotation.y = -Math.PI / 2;
stationGroup.add(rightWall);

// (Window & external starfield removed for a cleaner interior focus)

// Vertical edge pillars (flush with left/right walls near doorway & mid)
const pillarMat = new THREE.MeshStandardMaterial({
  color: 0x0f2735,
  metalness: 0.7,
  roughness: 0.25,
  emissive: 0x1e90ff,
  emissiveIntensity: 0.25,
});
function addEdgePillar(x, z) {
  const g = new THREE.BoxGeometry(0.55, height - 0.5, 0.55);
  const m = pillarMat.clone();
  const mesh = new THREE.Mesh(g, m);
  mesh.position.set(x, (height - 0.5) / 2, z);
  stationGroup.add(mesh);
}
// Near doorway
addEdgePillar(-width / 2 + 0.6, depth / 2 - 2.2);
addEdgePillar(width / 2 - 0.6, depth / 2 - 2.2);
// Mid depth
addEdgePillar(-width / 2 + 0.6, 0);
addEdgePillar(width / 2 - 0.6, 0);
// Back area
addEdgePillar(-width / 2 + 0.6, -depth / 2 + 2.5);
addEdgePillar(width / 2 - 0.6, -depth / 2 + 2.5);

// Floor edge emissive strips
const edgeMat = new THREE.MeshBasicMaterial({ color: 0x1e90ff });
const edgeGeomLong = new THREE.PlaneGeometry(depth, 0.15);
const edgeGeomShort = new THREE.PlaneGeometry(width, 0.15);
const edge1 = new THREE.Mesh(edgeGeomLong, edgeMat);
edge1.rotation.x = -Math.PI / 2;
edge1.position.set(-width / 2 + 0.01, 0.01, 0);
const edge2 = new THREE.Mesh(edgeGeomLong, edgeMat);
edge2.rotation.x = -Math.PI / 2;
edge2.position.set(width / 2 - 0.01, 0.01, 0);
edge2.rotation.y = Math.PI;
const edge3 = new THREE.Mesh(edgeGeomShort, edgeMat);
edge3.rotation.x = -Math.PI / 2;
edge3.position.set(0, 0.01, -depth / 2 + 0.01);
const edge4 = new THREE.Mesh(edgeGeomShort, edgeMat);
edge4.rotation.x = -Math.PI / 2;
edge4.position.set(0, 0.01, depth / 2 - 0.01);
stationGroup.add(edge1, edge2, edge3, edge4);

// Mid-wall trim bands
const bandMat = new THREE.MeshBasicMaterial({ color: 0x264b66 });
const bandHeight = 0.25;
function addBand(z, y, len) {
  const g = new THREE.PlaneGeometry(len, bandHeight);
  const m = bandMat.clone();
  const mesh = new THREE.Mesh(g, m);
  mesh.position.set(0, y, z);
  mesh.rotation.y = Math.PI; // face inward
  stationGroup.add(mesh);
}
addBand(-depth / 2 + 0.05, height * 0.35, width * 0.9);
addBand(-depth / 2 + 0.05, height * 0.65, width * 0.9);

// Light strips (simple emissive planes) on ceiling
const lightMat = new THREE.MeshBasicMaterial({ color: 0x5ab8ff });
for (let i = 0; i < 5; i++) {
  const strip = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.15, 0.6),
    lightMat
  );
  strip.position.set(0, height - 0.05, -depth / 2 + (i + 1) * (depth / 6));
  strip.rotation.x = Math.PI / 2;
  stationGroup.add(strip);
}

// Destination Consoles near doorway (like boarding gates) with shader-based holo screens
const destinations = [
  { id: "projects", label: "PROJECTS", color: 0x1e90ff },
  { id: "skills", label: "SKILLS", color: 0xff8c00 },
  { id: "education", label: "EDUCATION", color: 0x32cd32 },
];
const interactivePanels = [];
const consoleBaseGeo = new THREE.BoxGeometry(1.6, 0.8, 1.6);
const consoleBaseMat = new THREE.MeshStandardMaterial({
  color: 0x121c26,
  metalness: 0.35,
  roughness: 0.75,
});
const screenGeo = new THREE.PlaneGeometry(2.0, 1.15, 1, 1);

// Simple holographic shader (scanlines + glow)
const screenVertex = /* glsl */ `
  varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;
const screenFragment = /* glsl */ `
  uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
  float hash(float n){ return fract(sin(n)*43758.5453123); }
  void main(){
    float scan = sin((vUv.y + uTime*0.15)*60.0)*0.5+0.5;
    float glow = smoothstep(0.0,0.15,vUv.y) * smoothstep(1.0,0.85,vUv.y);
    float grid = step(0.97, fract(vUv.x*12.0)) + step(0.97, fract(vUv.y*6.0));
    float flicker = hash(floor(uTime*20.0)+floor(vUv.y*10.0))*0.15;
    vec3 base = uColor * (0.35 + 0.45*scan + 0.25*glow) + uColor * grid * 0.15 + uColor * flicker;
    float alpha = 0.85;
    gl_FragColor = vec4(base, alpha);
  }
`;

const labelPlaneGeo = new THREE.PlaneGeometry(1.7, 0.5);

function makeLabelTexture(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, 1024, 256);
  ctx.font = "bold 140px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#0af";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#fff";
  ctx.fillText(text, 512, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  return tex;
}

const timeUniforms = [];

destinations.forEach((d, idx) => {
  const base = new THREE.Mesh(consoleBaseGeo, consoleBaseMat.clone());
  // Arrange in slight arc
  const spread = idx - (destinations.length - 1) / 2;
  // Move consoles further forward (closer to player start)
  base.position.set(
    spread * 2.4,
    0.42,
    depth / 2 - 8.5 + Math.abs(spread) * 0.4
  );
  base.rotation.y = spread * 0.1;
  stationGroup.add(base);

  const uniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(d.color) },
  };
  timeUniforms.push(uniforms);
  const screenMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: screenVertex,
    fragmentShader: screenFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  // 3D frame for screen
  const frameGeo = new THREE.BoxGeometry(2.1, 1.3, 0.15);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0d141a,
    metalness: 0.55,
    roughness: 0.35,
    emissive: d.color,
    emissiveIntensity: 0.15,
  });
  const frame = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(0, 1.02, 1.05);
  frame.rotation.x = -0.42;

  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, 0, 0.085); // sit slightly in front of frame
  screen.userData.interactive = true;
  screen.userData.destination = d.id;

  // Label (overlay plane)
  const labelTex = makeLabelTexture(d.label);
  const labelMat = new THREE.MeshBasicMaterial({
    map: labelTex,
    transparent: true,
    color: 0xffffff,
  });
  const label = new THREE.Mesh(labelPlaneGeo, labelMat);
  label.position.set(0, 0, 0.02);
  screen.add(label);

  frame.add(screen);
  base.add(frame);
  interactivePanels.push(screen); // keep plane as interactive target
});

// Boarding tunnel / rocket entrance placeholder (cylindrical corridor) at back wall
const tunnelLength = 7;
const tunnelGeo = new THREE.CylinderGeometry(3, 3, tunnelLength, 24, 1, true);
const tunnelMat = new THREE.MeshStandardMaterial({
  color: 0x0f1a24,
  metalness: 0.2,
  roughness: 0.8,
  side: THREE.DoubleSide,
  emissive: 0x0a1c2e,
  emissiveIntensity: 0.2,
});
const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
tunnel.rotation.z = Math.PI / 2;
tunnel.position.set(0, 4, -depth / 2 - tunnelLength / 2 + 1);
stationGroup.add(tunnel);

// Tunnel sliding doors (closed at start)
const doorGeo = new THREE.PlaneGeometry(3, 5.5);
const doorMat = new THREE.MeshStandardMaterial({
  color: 0x15222d,
  metalness: 0.45,
  roughness: 0.5,
  emissive: 0x0b2d42,
  emissiveIntensity: 0.25,
});
const doorLeft = new THREE.Mesh(doorGeo, doorMat.clone());
const doorRight = new THREE.Mesh(doorGeo, doorMat.clone());
doorLeft.position.set(-1.5, 3.5, -depth / 2 + 0.01);
doorRight.position.set(1.5, 3.5, -depth / 2 + 0.01);
stationGroup.add(doorLeft, doorRight);
let doorProgress = 0; // 0 closed, 1 open
let doorTarget = 0; // animate toward
export function openTunnelDoors() {
  doorTarget = 1;
}
export function closeTunnelDoors() {
  doorTarget = 0;
}

// Glow ring framing tunnel entrance
const ringGeo = new THREE.TorusGeometry(3, 0.1, 16, 48);
const ringMat = new THREE.MeshBasicMaterial({ color: 0x1e90ff });
const ring = new THREE.Mesh(ringGeo, ringMat);
ring.rotation.x = Math.PI / 2;
ring.position.set(0, 3.5, -depth / 2 + 0.05);
stationGroup.add(ring);

// Subtle volumetric style fake (transparent plane)
const glowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(7.5, 7.5),
  new THREE.MeshBasicMaterial({
    color: 0x1e90ff,
    transparent: true,
    opacity: 0.06,
  })
);
glowPlane.position.set(0, 3.5, -depth / 2 + 0.2);
stationGroup.add(glowPlane);

scene.add(stationGroup);

export function getStationGroup() {
  return stationGroup;
}
export function getInteractivePanels() {
  return interactivePanels;
}

export function updateStation(dt) {
  // Animate shader time
  const t = performance.now() * 0.001;
  // Update shader uniforms
  stationGroup.traverse((obj) => {
    if (obj.material && obj.material.uniforms && obj.material.uniforms.uTime) {
      obj.material.uniforms.uTime.value = t;
    }
  });

  // Doors smooth animation
  const speed = 1.2; // seconds open/close
  if (Math.abs(doorProgress - doorTarget) > 0.001) {
    doorProgress += (Math.sign(doorTarget - doorProgress) * dt) / speed;
    doorProgress = THREE.MathUtils.clamp(doorProgress, 0, 1);
    const offset = 2.2 * doorProgress;
    doorLeft.position.x = -1.5 - offset;
    doorRight.position.x = 1.5 + offset;
  }
  ring.rotation.z += dt * 0.25;
  // (Star drift removed – no external starfield now)
}
