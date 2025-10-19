export const experience = [
  {
    id: "exp-daikin-ai",
    role: "AI Development Intern",
    org: "Daikin North America",
    logo: "/DaikinLogo.png",
    period: "May 2025 – Aug 2025",
    summary: "Designed & Deployed internal enterprise AI Agent Platform.",
    details: [
      "Developed 12+ custom AI tools integrating internal SOAP & REST APIs to automate HVAC configuration generation, system comparisons, and RAG knowledge retrieval based on natural language queries.",
      "Significantly reduced LLM request latency and increased throughput while preserving workflow fidelity.",
      "Collaborated with Product Managers and VPs to align platform capabilities with business needs, gathering feedback through live demos, iterating in Agile/Scrum methodologies to address key employee pain points.",
      "Deployed on Azure cloud services using DevOps and Docker, and integrated with the company's GenAI web platform (TypeScript, React, Redux, CosmosDB) for chat history and context management.",
    ],
    tech: [
      "Python",
      "LangChain",
      "LangGraph",
      "Azure DevOps",
      "React",
      "Redux",
      "CosmosDB",
    ],
  },
  {
    id: "exp-mindweb-founder",
    role: "Founder & Full-Stack Developer",
    org: "MindWeb.systems",
    logo: "/MindWebLogo.png",
    period: "May 2025 – Present",
    summary:
      "Created Gamified productivity consumer app with social & streak mechanics.",
    details: [
      "Developed MindWeb, a gamified productivity web-app built with React + TypeScript, backed by Supabase (PostgreSQL, Edge Functions, OAuth, Storage) with features like friend streaks, notifications, large data tracking, and caching.",
      "Led early beta launch and iterative marketing campaigns across productivity communities, onboarding ~100 early testing users, to find product-market fit, and enhance user experience through iterative feedback.",
      "Designed and built an enterprise-scale AI Agent Platform using Python, MCP, and LangGraph, automating repetitive workflows and boosting efficiency for 10,000+ employees.",
    ],
    tech: ["TypeScript", "React", "Supabase", "PostgreSQL", "Edge Functions"],
  },
  {
    id: "exp-research-sound",
    role: "Machine Learning Researcher",
    org: "Texas A&M – Sketch Recognition Lab",
    logo: "/TAMUlogo.png",
    period: "Jan 2025 – Present",
    summary: "Adapting vision transformer for efficient music classification.",
    details: [
      "Engineered a masked contrastive deep learning transformer model for segment-level musical version matching, improving efficiency/robustness of song recognition with Scikit-learn, TensorFlow & PyTorch.",
      "Built a large-scale audio embedding processing pipeline in a Linux based High Performance Computing cluster that ran 150% faster, enabling more efficient dataset experimentation.",
      "Achieved a 15% improvement in segment-level retrieval accuracy over state-of-the-art CLEWS benchmarks with faster training times, with findings targeted for publication at ICASSP 2026.",
    ],
    tech: ["TensorFlow", "PyTorch", "Python", "Scikit-learn"],
  },
];
