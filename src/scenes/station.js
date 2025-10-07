import * as THREE from "three";
import { scene, camera } from "../core/renderer.js";

// Rocket hangar style station (static, enhanced)
const stationGroup = new THREE.Group();
stationGroup.name = "StationGroup";

// Base hangar dimensions plus lateral side rooms (left/right)
const BASE_DIMENSIONS = { width: 16, depth: 24, height: 9 };
const SIDE_ROOM_WIDTH = 10; // each side room width (x direction span)
const SIDE_ROOM_DEPTH = 14; // depth along z same as or slightly larger than hangar
// Overall bounding box (center hangar + side rooms)
export const STATION_DIMENSIONS = {
  width: BASE_DIMENSIONS.width + SIDE_ROOM_WIDTH * 2 + 4, // hangar + rooms + margin
  depth: Math.max(BASE_DIMENSIONS.depth, SIDE_ROOM_DEPTH),
  height: BASE_DIMENSIONS.height,
};
const { width: totalW, depth: totalDepth, height } = STATION_DIMENSIONS;
const { width, depth } = BASE_DIMENSIONS;

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
// Replace side walls with shared walls that include a doorway opening into hallways
function addSharedSideWall(xSign) {
  const doorW = 3.5;
  const segLen = (depth - doorW) / 2; // each segment length along Z
  const segA = makeWall(segLen, height, wallMat.clone());
  const segB = makeWall(segLen, height, wallMat.clone());
  const x = xSign * (width / 2);
  // orient planes to face inward
  segA.rotation.y = xSign > 0 ? -Math.PI / 2 : Math.PI / 2;
  segB.rotation.y = xSign > 0 ? -Math.PI / 2 : Math.PI / 2;
  // place above ground
  segA.position.y = height / 2;
  segB.position.y = height / 2;
  // center gap at z=0; place segments to top and bottom
  segA.position.set(x, height / 2, -doorW / 2 - segLen / 2);
  segB.position.set(x, height / 2, doorW / 2 + segLen / 2);
  stationGroup.add(segA, segB);
}
addSharedSideWall(-1);
addSharedSideWall(1);

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
// Mid depth (removed to clear inner hallway doorways)
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
  { id: "experience", label: "EXPERIENCE", color: 0x32cd32 },
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

// Museum style exhibits (simple pedestals with floating plaques)
import { projects } from "../data/projects.js";
import { skills } from "../data/skills.js";
import { experience } from "../data/experience.js";

const exhibitGroup = new THREE.Group();
stationGroup.add(exhibitGroup);

function makePedestal(fullTitle, color, subtitle = "") {
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.75, 0.55, 28),
    new THREE.MeshStandardMaterial({
      color: 0x0f161d,
      metalness: 0.45,
      roughness: 0.55,
    })
  );
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.6, 0.18, 28),
    new THREE.MeshStandardMaterial({
      color: 0x122431,
      metalness: 0.55,
      roughness: 0.35,
      emissive: color,
      emissiveIntensity: 0.35,
    })
  );
  top.position.y = 0.34;
  base.add(top);
  const plaqueW = 3.8;
  const plaqueH = 3.95;
  const plaqueGeo = new THREE.PlaneGeometry(plaqueW, plaqueH);
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 984;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, 1024, 384);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Title
  ctx.font = "bold 120px sans-serif";
  const title = fullTitle.toUpperCase();
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#1e90ff";
  ctx.shadowBlur = 22;
  wrapText(ctx, title, 512, 140, 880, 150);
  // Subtitle
  if (subtitle) {
    ctx.font = "bold 90px sans-serif";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#aad8ff";
    const short = subtitle.length > 68 ? subtitle.slice(0, 65) + "…" : subtitle;
    wrapText(ctx, short, 512, 280, 920, 110);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const plaque = new THREE.Mesh(plaqueGeo, mat);
  plaque.position.set(0, 1.05, 0);
  base.add(plaque);
  return base;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + " ";
    const metrics = ctx.measureText(test);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, yy);
      line = words[n] + " ";
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, yy);
}

// Museum-style hallways replacing side rooms
const LEFT_ROOM_CENTER_X = -(width / 2 + SIDE_ROOM_WIDTH / 2 + 1);
const RIGHT_ROOM_CENTER_X = width / 2 + SIDE_ROOM_WIDTH / 2 + 1;
const ROOM_CENTER_Z = 0;

function addHallwayFloor(centerX, length = 60, hallWidth = SIDE_ROOM_WIDTH) {
  const g = new THREE.PlaneGeometry(hallWidth, length, 1, 1);
  const m = new THREE.MeshStandardMaterial({
    color: 0x0f151b,
    metalness: 0.1,
    roughness: 0.9,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(centerX, 0, ROOM_CENTER_Z);
  exhibitGroup.add(mesh);
  // Low side rails for visual guidance
  const railGeo = new THREE.BoxGeometry(0.25, 0.6, length);
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x1a2a36,
    metalness: 0.4,
    roughness: 0.5,
    emissive: 0x0a2e46,
    emissiveIntensity: 0.2,
  });
  const leftRail = new THREE.Mesh(railGeo, railMat);
  leftRail.position.set(centerX - hallWidth / 2 + 0.2, 0.3, ROOM_CENTER_Z);
  const rightRail = new THREE.Mesh(railGeo, railMat);
  rightRail.position.set(centerX + hallWidth / 2 - 0.2, 0.3, ROOM_CENTER_Z);
  exhibitGroup.add(leftRail, rightRail);
  return { floor: mesh, hallWidth, length };
}

const texLoader = new THREE.TextureLoader();

function makeProjectExhibit(project) {
  const group = new THREE.Group();
  group.name = `Exhibit_${project.id}`;

  // Taller pedestal (no glass)
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.85, 1.05, 1.6, 32),
    new THREE.MeshStandardMaterial({
      color: 0x0f161d,
      metalness: 0.45,
      roughness: 0.55,
    })
  );
  column.position.y = 0.8;
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, 0.15, 32),
    new THREE.MeshStandardMaterial({
      color: 0x1a2a36,
      metalness: 0.5,
      roughness: 0.4,
      emissive: 0x1e90ff,
      emissiveIntensity: 0.12,
    })
  );
  cap.position.y = 1.525;
  group.add(column);
  group.add(cap);

  const imgTex = texLoader.load(project.image);
  imgTex.colorSpace = THREE.SRGBColorSpace;
  const imgMat = new THREE.MeshBasicMaterial({
    map: imgTex,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const imgPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), imgMat);
  imgPlane.position.set(0, 2.15, 0);
  imgPlane.userData.billboard = true;
  imgPlane.renderOrder = 2;
  group.add(imgPlane);

  // Plaque with title + description
  const plaqueW = 2.2;
  const plaqueH = 1.0;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 120px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "#1e90ff";
  ctx.shadowBlur = 18;
  const title = project.title.toUpperCase();
  wrapText(ctx, title, 512, 160, 920, 140);
  ctx.font = "bold 64px sans-serif";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#aad8ff";
  const desc =
    project.description.length > 140
      ? project.description.slice(0, 137) + "…"
      : project.description;
  wrapText(ctx, desc, 512, 360, 900, 90);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(plaqueW, plaqueH),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
    })
  );
  plaque.position.set(0, 1.25, 0);
  plaque.renderOrder = 1;
  group.add(plaque);

  // Interactivity: clicking opens demo then repo fallback
  const openUrl =
    (project.links && (project.links.demo || project.links.repo)) || null;
  if (openUrl) {
    group.userData.interactive = true;
    group.userData.openUrl = openUrl;
    // propagate to common children for easier hit detection
    column.userData.openUrl = openUrl;
    cap.userData.openUrl = openUrl;
    imgPlane.userData.openUrl = openUrl;
    plaque.userData.openUrl = openUrl;
  }
  return group;
}

function addMuseumHallway(centerX, projectsList, length = 60) {
  addHallwayFloor(centerX, length);
  // Add opaque outer wall along the hallway
  const wallH = 4.5;
  const wallMatHall = new THREE.MeshStandardMaterial({
    color: 0x16212b,
    metalness: 0.15,
    roughness: 0.85,
  });
  const isLeft = centerX < 0;
  const wallX = isLeft
    ? centerX - SIDE_ROOM_WIDTH / 2
    : centerX + SIDE_ROOM_WIDTH / 2;
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(length, wallH),
    wallMatHall
  );
  wall.rotation.y = Math.PI / 2;
  wall.position.set(wallX, wallH / 2, 0);
  exhibitGroup.add(wall);
  const spacing = 8; // distance between exhibits along z
  const sideOffset = 2.4; // distance from hallway center to each side row
  const startZ = -Math.floor(projectsList.length * 0.5) * spacing + spacing / 2;
  projectsList.forEach((p, i) => {
    const z = startZ + i * spacing;
    // Alternate sides for visual rhythm: left and right rows
    const side = i % 2 === 0 ? -1 : 1;
    const exhibit = makeProjectExhibit(p);
    exhibit.position.set(centerX + side * sideOffset, 0, z);
    exhibit.rotation.y = side === -1 ? Math.PI / 12 : -Math.PI / 12;
    exhibitGroup.add(exhibit);
    interactivePanels.push(exhibit);
  });
}

// Connect left and right hallways to form a square loop
function addHallwayConnectors(length = 60, hallWidth = SIDE_ROOM_WIDTH) {
  const leftCenter = LEFT_ROOM_CENTER_X;
  const rightCenter = RIGHT_ROOM_CENTER_X;
  const widthX = rightCenter - leftCenter + hallWidth; // covers full span including both hallway widths
  const m = new THREE.MeshStandardMaterial({
    color: 0x0f151b,
    metalness: 0.1,
    roughness: 0.9,
  });
  // Front connector
  const front = new THREE.Mesh(
    new THREE.PlaneGeometry(widthX, hallWidth, 1, 1),
    m
  );
  front.rotation.x = -Math.PI / 2;
  front.position.set(0, 0, -length / 2);
  // Back connector
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(widthX, hallWidth, 1, 1),
    m
  );
  back.rotation.x = -Math.PI / 2;
  back.position.set(0, 0, length / 2);
  exhibitGroup.add(front, back);

  // Add side rails along connectors
  const railGeoX = new THREE.BoxGeometry(widthX, 0.6, 0.25);
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x1a2a36,
    metalness: 0.4,
    roughness: 0.5,
    emissive: 0x0a2e46,
    emissiveIntensity: 0.2,
  });
  const frontLeftRail = new THREE.Mesh(railGeoX, railMat);
  frontLeftRail.position.set(0, 0.3, -length / 2 - hallWidth / 2 + 0.12);
  const frontRightRail = new THREE.Mesh(railGeoX, railMat);
  frontRightRail.position.set(0, 0.3, -length / 2 + hallWidth / 2 - 0.12);
  const backLeftRail = new THREE.Mesh(railGeoX, railMat);
  backLeftRail.position.set(0, 0.3, length / 2 - hallWidth / 2 + 0.12);
  const backRightRail = new THREE.Mesh(railGeoX, railMat);
  backRightRail.position.set(0, 0.3, length / 2 + hallWidth / 2 - 0.12);
  exhibitGroup.add(frontLeftRail, frontRightRail, backLeftRail, backRightRail);

  // Opaque outer walls for connectors (front/back outer edges)
  const wallH = 4.5;
  const wallMatHall = new THREE.MeshStandardMaterial({
    color: 0x16212b,
    metalness: 0.15,
    roughness: 0.85,
  });
  const frontWall = new THREE.Mesh(
    new THREE.PlaneGeometry(widthX, wallH),
    wallMatHall
  );
  frontWall.position.set(0, wallH / 2, -length / 2 - hallWidth / 2);
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(widthX, wallH),
    wallMatHall
  );
  backWall.position.set(0, wallH / 2, length / 2 + hallWidth / 2);
  exhibitGroup.add(frontWall, backWall);
}

// Distribute pedestals in grids inside side rooms (projects left, experience right, skills remain central in hangar)
function gridPositions(cols, rows, spacingX, spacingZ) {
  const arr = [];
  const originX = -((cols - 1) * spacingX) / 2;
  const originZ = -((rows - 1) * spacingZ) / 2;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      arr.push([originX + c * spacingX, originZ + r * spacingZ]);
  return arr;
}

// Create two project hallways (left and right) and distribute projects across them
const HALL_LENGTH = 60;
const half = Math.ceil(projects.length / 2);
addMuseumHallway(LEFT_ROOM_CENTER_X, projects.slice(0, half), HALL_LENGTH);
addMuseumHallway(RIGHT_ROOM_CENTER_X, projects.slice(half), HALL_LENGTH);
addHallwayConnectors(HALL_LENGTH, SIDE_ROOM_WIDTH);

// Doorways from loop into main station (inner sides)
function addInnerDoorway(xSign, z = 0) {
  const doorH = 5;
  const doorW = 3.5;
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x234559,
    metalness: 0.55,
    roughness: 0.35,
    emissive: 0x0a2e46,
    emissiveIntensity: 0.35,
  });
  const top = new THREE.Mesh(new THREE.BoxGeometry(doorW, 0.4, 0.6), frameMat);
  top.position.set(xSign * (width / 2 + 0.05), doorH - 0.2, z);
  top.rotation.y = Math.PI / 2;
  const sideA = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, doorH, 0.6),
    frameMat.clone()
  );
  const sideB = sideA.clone();
  sideA.position.set(
    xSign * (width / 2 + 0.05),
    doorH / 2,
    z - doorW / 2 + 0.3
  );
  sideB.position.set(
    xSign * (width / 2 + 0.05),
    doorH / 2,
    z + doorW / 2 - 0.3
  );
  exhibitGroup.add(top, sideA, sideB);
}
addInnerDoorway(-1, 0);
addInnerDoorway(1, 0);
// Skills (central hangar) – grid near center
gridPositions(2, 2, 4.6, 3.6)
  .slice(0, skills.length)
  .forEach(([gx, gz], i) => {
    const s = skills[i];
    const subtitle = s.items.slice(0, 4).join(", ");
    const ped = makePedestal(s.category, 0xff8c00, subtitle);
    ped.position.set(gx, 0.25, gz + 3); // forward a bit
    ped.userData.interactive = true;
    ped.userData.exhibit = { type: "skill", id: s.category };
    exhibitGroup.add(ped);
    interactivePanels.push(ped);
  });

// Sign boards replacing old travel panels
function makeSign(text, pos, rotY = 0) {
  const group = new THREE.Group();
  const boardGeo = new THREE.BoxGeometry(3.2, 1.1, 0.15);
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0d141a,
    metalness: 0.5,
    roughness: 0.4,
    emissive: 0x1e90ff,
    emissiveIntensity: 0.25,
  });
  const frame = new THREE.Mesh(boardGeo, frameMat);
  group.add(frame);
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, 1024, 256);
  ctx.font = "bold 120px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(text, 512, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 2;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.75), mat);
  plane.position.z = 0.09;
  group.add(plane);
  group.position.copy(pos);
  group.rotation.y = rotY;
  stationGroup.add(group);
  return group;
}
makeSign("← PROJECTS", new THREE.Vector3(-2, 2.2, 2.5), Math.PI / 12);
makeSign("SKILLS", new THREE.Vector3(0, 2.2, 2), 0);
makeSign("EXPERIENCE →", new THREE.Vector3(2, 2.2, 2.5), -Math.PI / 12);

// Export anchors for teleport feature
export const ROOM_ANCHORS = {
  home: new THREE.Vector3(0, 2.6, -4),
  projects: new THREE.Vector3(LEFT_ROOM_CENTER_X, 2.6, 0),
  skills: new THREE.Vector3(0, 2.6, 4),
  experience: new THREE.Vector3(RIGHT_ROOM_CENTER_X, 2.6, 0),
};

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

  // Billboard any project images to face the camera
  stationGroup.traverse((obj) => {
    if (obj.userData && obj.userData.billboard) {
      obj.lookAt(camera.position);
    }
  });
}
