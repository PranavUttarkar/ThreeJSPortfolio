import * as THREE from "three";
import { scene } from "../core/renderer.js";

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
  const plaqueW = 2.8;
  const plaqueH = 0.95;
  const plaqueGeo = new THREE.PlaneGeometry(plaqueW, plaqueH);
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 384;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0,0,0,0)";
  ctx.fillRect(0, 0, 1024, 384);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Title
  ctx.font = "bold 160px sans-serif";
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

// Side room floors (left/right) attached via short doorway passages
const LEFT_ROOM_CENTER_X = -(width / 2 + SIDE_ROOM_WIDTH / 2 + 1);
const RIGHT_ROOM_CENTER_X = width / 2 + SIDE_ROOM_WIDTH / 2 + 1;
const ROOM_CENTER_Z = 0; // align with hangar center

function addSideRoomFloor(centerX, color = 0x111a22) {
  const g = new THREE.PlaneGeometry(SIDE_ROOM_WIDTH, SIDE_ROOM_DEPTH, 1, 1);
  const m = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.14,
    roughness: 0.85,
  });
  const mesh = new THREE.Mesh(g, m);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(centerX, 0, ROOM_CENTER_Z);
  exhibitGroup.add(mesh);
  return mesh;
}
addSideRoomFloor(LEFT_ROOM_CENTER_X);
addSideRoomFloor(RIGHT_ROOM_CENTER_X);

// Doorway frames connecting to side rooms
function addDoorFrame(xSign) {
  const frameGroup = new THREE.Group();
  const doorH = 5;
  const doorW = 3.5;
  const beamMat = new THREE.MeshStandardMaterial({
    color: 0x234559,
    metalness: 0.55,
    roughness: 0.35,
    emissive: 0x0a2e46,
    emissiveIntensity: 0.35,
  });
  const beamTop = new THREE.Mesh(
    new THREE.BoxGeometry(doorW, 0.4, 0.6),
    beamMat
  );
  beamTop.position.set(xSign * (width / 2 + 0.05), doorH - 0.2, 0);
  beamTop.rotation.y = Math.PI / 2;
  frameGroup.add(beamTop);
  const sideA = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, doorH, 0.6),
    beamMat.clone()
  );
  const sideB = sideA.clone();
  sideA.position.set(xSign * (width / 2 + 0.05), doorH / 2, -doorW / 2 + 0.3);
  sideB.position.set(xSign * (width / 2 + 0.05), doorH / 2, doorW / 2 - 0.3);
  frameGroup.add(sideA, sideB);
  exhibitGroup.add(frameGroup);
}
addDoorFrame(-1);
addDoorFrame(1);

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

// Projects (left room)
gridPositions(2, Math.ceil(projects.length / 2), 2.6, 2.6)
  .slice(0, projects.length)
  .forEach(([gx, gz], i) => {
    const p = projects[i];
    const ped = makePedestal(p.title, 0x1e90ff, p.summary);
    ped.position.set(LEFT_ROOM_CENTER_X + gx, 0.25, ROOM_CENTER_Z + gz);
    ped.userData.interactive = true;
    ped.userData.exhibit = { type: "project", id: p.id };
    exhibitGroup.add(ped);
    interactivePanels.push(ped);
  });
// Experience (right room)
gridPositions(2, Math.ceil(experience.length / 2), 2.6, 2.6)
  .slice(0, experience.length)
  .forEach(([gx, gz], i) => {
    const e = experience[i];
    const ped = makePedestal(e.role, 0x32cd32, e.summary);
    ped.position.set(RIGHT_ROOM_CENTER_X + gx, 0.25, ROOM_CENTER_Z + gz);
    ped.userData.interactive = true;
    ped.userData.exhibit = { type: "experience", id: e.id };
    exhibitGroup.add(ped);
    interactivePanels.push(ped);
  });
// Skills (central hangar) – grid near center
gridPositions(2, 2, 2.6, 2.6)
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
}
