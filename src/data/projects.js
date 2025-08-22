export const projects = [
  {
    id: "proj-aggie-agenda",
    title: "Aggie Agenda",
    summary: "Student scheduling & productivity web app.",
    description:
      "A full-stack productivity platform helping students manage classes, tasks, and deadlines with calendar sync and smart reminders.",
    tech: ["React", "Node", "Express", "MongoDB", "JWT", "Redis"],
    highlights: [
      "Built real-time collaboration with WebSockets",
      "Implemented role-based access and refresh token rotation",
      "Optimized heavy queries with compound indices (40% faster)",
    ],
    links: { repo: "#", demo: "#" },
  },
  {
    id: "proj-car-clinic-ai",
    title: "Car Clinic AI",
    summary: "AI assistant for automotive diagnostics.",
    description:
      "LLM-assisted triage tool: ingest vehicle telemetry + user symptoms and generate probable issue tree with confidence ranking.",
    tech: ["TypeScript", "Python", "FastAPI", "OpenAI", "VectorDB"],
    highlights: [
      "Hybrid embedding + rules engine",
      "Cost-efficient token streaming UI",
      "Scenario test harness for regression",
    ],
    links: { repo: "#", demo: "#" },
  },
  {
    id: "proj-portfolio-3d",
    title: "3D Portfolio Hub",
    summary: "Gamified WebGL / Three.js personal site.",
    description:
      "Interactive space-station museum showcasing work via immersive exploration with optimized shaders and modular scene graph.",
    tech: ["Three.js", "GLSL", "Vercel", "Modular Architecture"],
    highlights: [
      "Custom shader panels",
      "State-driven scene modules",
      "Lazy asset strategy",
    ],
    links: { repo: "#", demo: "#" },
  },
];
