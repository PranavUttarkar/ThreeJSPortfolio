export const projects = [
  // Order specified by request: profsort, mindweb, aggie agenda, portfolio, then rest

  {
    id: "proj-wildfire-ai",
    title: "🏆 Google Gemini - TidalHack 2025 Winner: Wildfire Agent Orchestra",
    summary:
      "AI agent network for rapid wildfire detection, enrichment, and response planning.",
    description:
      "Built during TidalHack 2025, this system automates the wildfire response pipeline by orchestrating multiple AI agents — from anomaly detection to action plan delivery. Within ~120 seconds of detecting an anomaly, it gathers data on weather, resources, evacuation zones, and population impact, compares it to historical cases, and notifies responders with an optimized plan of action.",
    tech: [
      "Google Gemini",
      "CrewAI",
      "AWS Bedrock",
      "AWS Lambda",
      "S3",
      "SNS",
      "Python",
      "AI Agents",
    ],
    image: "/wildfire-ai.png",
    highlights: [
      "🏆 Won Google Gemini Track at TidalHack 2025",
      "Multi-agent orchestration: detection → enrichment → learning → action",
      "End-to-end automation from anomaly detection to notification in ~120s",
      "Historical learning agent improves plans with each new wildfire event",
      "AWS + Gemini integration for real-time, data-driven decision making",
    ],
    links: {
      repo: "#",
      demo: "https://devpost.com/software/wildfire-protection-agent-watchdog-network",
    },
  },
  {
    id: "proj-tamu-profsort",
    title: "Tamu-ProfSort",
    summary: "Desktop app ranking professor grade distributions.",
    description:
      "Electron-based desktop tool actively used by 400+ students to visualize and compare grading styles and averages across professors.",
    tech: ["JavaScript", "Puppeteer", "Electron", "Charting"],
    image: "/tamuprofsort.png",
    highlights: [
      "Automated scraping & caching of public grade data",
      "Interactive comparison and sort by distribution metrics",
      "Update pipeline with delta detection to minimize requests",
    ],
    links: { repo: "#", demo: "https://profsort.vercel.app/" },
  },

  {
    id: "proj-mindweb",
    title: "MindWeb",
    summary: "Gamified productivity & habit / streak web app.",
    description:
      "Full-stack productivity platform with streak mechanics, social graph (friends), custom notifications, and large-scale user data tracking.",
    tech: ["React", "TypeScript", "Supabase", "PostgreSQL", "Edge Functions"],
    image: "/mindweb1.png",
    highlights: [
      "Supabase edge functions for low-latency streak rollovers",
      "Row level security & policies for multi-tenant data",
      "Early beta iteration with ~100 testers for feedback loop",
    ],
    links: { repo: "#", demo: "https://mindweb.systems" },
  },
  {
    id: "proj-picky",
    title: "Picky — Group Decision & Event Discovery Platform",
    summary:
      "AI-powered platform helping students and groups make faster, smarter decisions together.",
    description:
      "Built with React Native and Chroma, Picky transforms how communities at Texas A&M discover events, food, and activities. By combining social preferences with AI-driven recommendations, it enables users to explore hundreds of on-campus happenings personalized to their interests — and make group decisions effortlessly through an intelligent voting engine. Selenium web scraping continuously enriches event data from campus sources, ensuring freshness and accuracy.",
    tech: [
      "React Native",
      "Chroma Vector DB",
      "Selenium Web Scraping",
      "Node.js",
      "REST APIs",
      "Python",
      "AI Recommendations",
    ],
    image: "/picky-app.png",
    highlights: [
      "🎯 Unified discovery of on-campus food, events, and activities",
      "Smart AI engine learns preferences to personalize recommendations",
      "Real-time web scraping for up-to-date TAMU event data",
      "Seamless React Native interface for iOS & Android",
      "Launched first at Texas A&M University with viral on-campus campaign",
    ],
    links: {
      repo: "#",
      demo: "https://usepicky.app",
    },
  },

  {
    id: "proj-am-studys",
    title: "A&M Studys",
    summary: "Peer Q&A learning web app for TAMU courses.",
    description:
      "Collaborative platform enabling students to ask/answer course questions, share resources, and reinforce learning objectives.",
    tech: ["React", "Firebase", "Auth", "Firestore"],
    image: "/Studys.jpg",
    highlights: [
      "Team leadership across 7 contributors & sprint cadence",
      "Real-time Firestore listeners for live Q&A updates",
      "Structured tagging for discoverability of course topics",
    ],
    links: { repo: "#", demo: "#" },
  },
  {
    id: "proj-impossible-parkour",
    title: "Impossible Parkour Filter",
    summary: "Viral TikTok AR game filter (35.5M views).",
    description:
      "Interactive TikTok game effect encouraging user-generated challenge content, resulting in 70K+ created videos.",
    tech: ["AR", "Scripting", "TikTok Effect", "Game Logic"],
    image: "/impossible-parkour.png",
    highlights: [
      "Node-based logic optimized for effect performance",
      "Progressive difficulty pacing for retention",
      "Organic virality via share-friendly challenge design",
    ],
    links: { repo: "#", demo: "https://www.tiktok.com/t/ZP8BDKEKh/" },
  },
  // New ToyotAI project
  {
    id: "proj-toyotai",
    title: "ToyotAI",
    summary: "AI-powered Toyota car recommendation platform.",
    description:
      "ToyotAI streamlines car discovery via a playful personality quiz, an AI virtual salesman, and classic advanced filtering for specs like MPG, price, and features.",
    tech: ["Python", "LangChain", "Pandas", "React", "CSS"],
    image: "/toyotaAI.png",
    highlights: [
      "Personality quiz → model mapping engine",
      "Conversational agent for tailored vehicle insights",
      "Hybrid search: semantic + structured filters",
    ],
    links: { repo: "#", demo: "#" },
  },
  {
    id: "proj-aggie-agenda",
    title: "Aggie Agenda",
    summary: "Student scheduling & productivity web app.",
    description:
      "A full-stack productivity platform helping students manage classes, tasks, and deadlines with calendar sync and smart reminders.",
    tech: ["React", "Node", "Express", "MongoDB", "JWT", "Redis"],
    image: "/AggieAgenda.jpg",
    highlights: [
      "Built real-time collaboration with WebSockets",
      "Implemented role-based access and refresh token rotation",
      "Optimized heavy queries with compound indices (40% faster)",
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
    image: "/Portfolio.jpg",
    highlights: [
      "Custom shader panels",
      "State-driven scene modules",
      "Lazy asset strategy",
    ],
    links: { repo: "#", demo: "#" },
  },
  // Remaining existing projects (keeping logical grouping)
  {
    id: "proj-car-clinic-ai",
    title: "Car Clinic AI",
    summary: "AI assistant for automotive diagnostics.",
    description:
      "LLM-assisted triage tool: ingest vehicle telemetry + user symptoms and generate probable issue tree with confidence ranking.",
    tech: ["TypeScript", "Python", "FastAPI", "OpenAI", "VectorDB"],
    image: "/CarClinicAI.jpg",
    highlights: [
      "Hybrid embedding + rules engine",
      "Cost-efficient token streaming UI",
      "Scenario test harness for regression",
    ],
    links: { repo: "#", demo: "#" },
  },
];
