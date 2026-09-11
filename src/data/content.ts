export const profile = {
  name: 'Akshay Kurdekar',
  initials: 'AK',
  role: 'BCA Student — Product & Business',
  tagline: 'Curious about how good products get built and sold.',
  location: 'Bengaluru, India',
  email: 'akshay.kurdekar@bcah.christuniversity.in',
  linkedin: 'https://linkedin.com/in/akshay-a-kurdekar-ab95202a8',
  github: 'https://github.com/Akshay-2441505',
  resumeUrl: '/Akshay-Kurdekar-Resume.pdf',
}

export const about = {
  paragraph:
    "BCA student at CHRIST (Deemed to be University), Bengaluru, currently exploring product and customer discovery through Dekho, an early-stage fintech idea. I've run JTBD interviews, dug into India's PFM and regulatory landscape (RBI Account Aggregator framework, DPDP), and used that to shape a staged pilot rollout — work that's made me more interested in the customer-facing, evidence-driven side of building things than in the code itself. I can hold my own technically when I need to, but I'm actively looking at product, growth, and other non-technical roles where that curiosity is the main asset.",
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
    name: 'Product & Discovery',
    detail:
      'Go-to-Market Strategy, JTBD Customer Discovery, Market & Competitor Research, Fintech Regulatory Awareness (RBI Account Aggregator framework, DPDP)',
  },
  {
    number: '02',
    name: 'Core Languages',
    detail: 'C, C++, Python, Java, HTML, CSS, JavaScript',
  },
  {
    number: '03',
    name: 'Data & Tools',
    detail: 'MySQL',
  },
  {
    number: '04',
    name: 'Working Style',
    detail: 'Ownership & Initiative, Cross-functional Collaboration, Problem Solving',
  },
]

export const marqueeItems = [
  'JTBD',
  'Go-to-Market',
  'Customer Discovery',
  'Fintech Regulation',
  'Product Strategy',
  'Market Research',
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
   * projects with no live/in-build state to show. */
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
      'An AI-native personal finance app, built from real customer discovery instead of a feature list. Ran JTBD interviews to find the actual pain point behind expense-tracking behavior, designed a weighted 7-question screening framework, and used it to run a staged 10→50→100 pilot rollout — currently at 10–15 active users. Also led the Wealth section redesign and shipped Monthly Wrap and app-lock security.',
    tech: ['React', 'Vite', 'FastAPI', 'RAG chatbot'],
  },
  {
    index: '02',
    category: 'Product — In Build',
    status: 'in-build',
    name: 'Frontage',
    description:
      'Building for the Razorpay AI Buildathon: merchants have no way to know if their catalog is even readable by AI shopping agents. Frontage audits a merchant\'s "AI-readability," auto-generates an agent-readable product catalog, then lets an AI buyer agent complete a real, bounded test-mode transaction end-to-end — a "Diagnose → Fix → Transact" flow.',
    tech: ['FastAPI', 'React', 'Vite', 'Razorpay API'],
  },
  {
    index: '03',
    category: 'Product / Systems',
    name: 'Digital MSME Loan Simulation',
    description:
      'An end-to-end loan workflow simulation with borrower and approver roles — designing who approves what, and why, across application, validation, and approval/rejection logic.',
    tech: ['Python', 'PL/SQL', 'MySQL', 'Supabase'],
    github: 'https://github.com/Akshay-2441505/PSD_Final_Project',
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
    name: '3D Interactive Website',
    description:
      'A Philips-inspired prototype exploring 3D interaction and immersive UX — scroll-triggered animation, cinematic transitions, and user-driven navigation.',
    tech: ['Next.js', 'TypeScript', 'CSS'],
    github: 'https://github.com/Akshay-2441505/Philips_Immersive_Website',
  },
  {
    name: 'Generative Art System',
    description:
      'A WeaveSilk-inspired canvas piece that renders glowing light trails on a moving starfield in real time, driven by symmetry and user input.',
    tech: ['JavaScript', 'Canvas', 'CSS'],
    github: 'https://github.com/Akshay-2441505/generative-art',
  },
]

export const heroCopy = {
  headline: 'Akshay Kurdekar',
  subLine: 'Learning how products get built, tested, and sold.',
  positionTag: 'Product & Business',
  metaLine: 'BCA Student · Building Dekho',
}

export const fullTime = {
  heading: 'Open to product & growth.',
  body: 'Always up for a conversation about product, growth, or startups.',
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
