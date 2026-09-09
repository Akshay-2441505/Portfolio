export const profile = {
  name: 'Akshay Kurdekar',
  initials: 'AK',
  role: 'BCA Student — Interactive & Web Development',
  tagline: 'I build things that move on scroll.',
  location: 'Bengaluru, India',
  email: 'akshay.kurdekar@bcah.christuniversity.in',
  linkedin: 'https://linkedin.com/in/akshay-a-kurdekar-ab95202a8',
  github: 'https://github.com/Akshay-2441505',
  resumeUrl: '/Akshay-Kurdekar-Resume.pdf',
}

export const about = {
  paragraph:
    "BCA student at CHRIST (Deemed to be University), Bengaluru, building web apps, 3D interfaces, and generative art. I like taking a scroll effect or a rendering trick apart until I understand it, then building something of my own with it. Alongside that I'm co-founding Dekho, an early-stage fintech idea, which keeps me equally curious about the people using what I build, not just the code behind it.",
}

export const education = [
  {
    school: 'CHRIST (Deemed to be University), Bengaluru',
    degree: 'Bachelor of Computer Applications (BCA)',
    period: '2024 — 2027 (Expected)',
    detail: 'CGPA 7.0/10.0 · Database Management Systems, Data Structures, Full Stack Development',
  },
  {
    school: 'Christ Academy Junior College, Bengaluru',
    degree: 'Class XII (PUC)',
    period: '2024',
    detail: '92.17%',
  },
]

export const experience = [
  {
    org: 'Dekho — AI-Native Personal Finance Startup',
    role: 'Co-founder',
    period: 'Apr 2026 — Present',
    points: [
      'Ran JTBD customer-discovery interviews to uncover real pain points behind expense-tracking behavior.',
      'Designed a 7-question screening framework for a staged 10 → 50 → 100 pilot rollout.',
      "Researched India's PFM landscape and regulation (RBI Account Aggregator framework, DPDP) to inform product strategy.",
    ],
  },
  {
    org: 'Brown Agri Waste Innovations Pvt. Ltd.',
    role: 'Web Development Intern',
    period: 'Apr 2025 — May 2025',
    points: [
      'Built a complete client website from scratch with HTML, CSS, and JavaScript.',
      'Implemented responsive layouts and interactive UI components; handled frontend debugging end to end.',
    ],
  },
]

export const skills = [
  {
    number: '01',
    name: 'Frontend & Interactive Web',
    detail: 'HTML, CSS, JavaScript, TypeScript, React, Next.js, Framer Motion',
  },
  {
    number: '02',
    name: '3D & Creative Coding',
    detail: 'Three.js / WebGL experiments, canvas-based generative art, scroll-driven animation',
  },
  {
    number: '03',
    name: 'Core Languages',
    detail: 'C, C++, Python, Java, Kotlin, PL/SQL',
  },
  {
    number: '04',
    name: 'Data & Backend',
    detail: 'MySQL, MongoDB, Supabase',
  },
  {
    number: '05',
    name: 'Product & Discovery',
    detail: 'Go-to-market thinking, JTBD customer discovery, competitor research',
  },
]

export const marqueeItems = [
  'React',
  'FastAPI',
  'TypeScript',
  'GSAP',
  'Python',
  'PostgreSQL',
  'Claude Agent SDK',
]

export type Project = {
  index: string
  category: string
  name: string
  description: string
  tech: string[]
  github?: string
  live?: string
  /** Status pill on the Highlights card (TECH_SPEC.md §4) — omitted for
   * the 3D site, which is a prototype rather than a live/in-build product. */
  status?: 'live' | 'in-build'
  /** Renders a live visual inside the card instead of a static panel —
   * each one is a small recreation/visualization tied to what that
   * specific project actually does. */
  visual?: 'generative-art' | 'wireframe' | 'loan-flow'
}

export const projects: Project[] = [
  {
    index: '01',
    category: 'Product',
    status: 'live',
    name: 'Dekho',
    description:
      'An AI-native personal finance app, built from real customer discovery instead of a feature list. Ran JTBD interviews to find the actual pain point behind expense-tracking behavior, then designed a staged 10→50→100 pilot rollout — currently running with 10–15 active users. Led the Wealth section redesign, migrated the chatbot API routes, and built Monthly Wrap and app-lock security.',
    tech: ['React', 'Vite', 'FastAPI', 'RAG chatbot'],
  },
  {
    index: '02',
    category: 'Product — In Build',
    status: 'in-build',
    name: 'Frontage',
    description:
      'Currently building for the Razorpay AI Buildathon: an agent that audits a merchant\'s "AI-readability," auto-generates an agent-readable product catalog, then lets an AI buyer agent complete a real, bounded test-mode transaction end-to-end. Built around a "Diagnose → Fix → Transact" flow.',
    tech: ['FastAPI', 'React', 'Vite', 'Razorpay API'],
  },
  {
    index: '03',
    category: 'Interactive / 3D',
    name: '3D Interactive Website',
    description:
      'A Philips-inspired prototype exploring 3D interaction and immersive UX — scroll-triggered animation, cinematic transitions, and user-driven navigation.',
    tech: ['Next.js', 'TypeScript', 'CSS'],
    github: 'https://github.com/Akshay-2441505/Philips_Immersive_Website',
    visual: 'wireframe',
  },
]

export type MoreWorkItem = {
  name: string
  description: string
  tech: string[]
  github?: string
  live?: string
}

export const moreWork: MoreWorkItem[] = [
  {
    name: 'Generative Art System',
    description:
      'A WeaveSilk-inspired canvas piece that renders glowing light trails on a moving starfield in real time, driven by symmetry and user input.',
    tech: ['JavaScript', 'Canvas', 'CSS'],
    github: 'https://github.com/Akshay-2441505/generative-art',
  },
  {
    name: 'Digital MSME Loan Simulation',
    description:
      'An end-to-end loan workflow simulation with borrower and approver roles — application, validation, and approval/rejection logic, backed by Supabase.',
    tech: ['Python', 'PL/SQL', 'MySQL', 'Supabase'],
    github: 'https://github.com/Akshay-2441505/PSD_Final_Project',
  },
]

export const heroCopy = {
  headline: 'Akshay Kurdekar',
  subLine: 'Building AI-native products from the problem up.',
  positionTag: 'Product & Build',
  metaLine: 'Co-founding Dekho · BCA, Christ University',
}

export const fullTime = {
  heading: 'Full-time.',
  body: 'Always open to talking product, growth, or a good technical problem.',
}

export const stats = [
  { value: 3, suffix: '', label: 'Projects shipped' },
  { value: 2, suffix: '+', label: 'Years coding' },
  { value: 1, suffix: '', label: 'Startup co-founded' },
]

export const certifications = [
  { name: 'AWS Academy Graduate — Cloud Foundations', org: 'AWS Academy', period: 'Aug 2026' },
  { name: 'Practical GenAI: Basics, Tools, Use Cases, Ethics, Future', org: 'Udemy', period: 'Aug 2026' },
]
