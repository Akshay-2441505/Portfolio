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
    role: 'Founding Team Member',
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
  /** Real screenshots for the card's visual slot (paths under public/) —
   * takes over from `visual` when set, via ImageStrip. */
  images?: string[]
  /** Which device frame ImageStrip draws around `images` — set explicitly
   * rather than measured from the images themselves (auto-detecting from
   * natural aspect ratio was the root cause of two earlier sizing bugs).
   * Applies to every image unless `imageDevices` overrides individual ones. */
  deviceFrame?: 'phone' | 'browser'
  /** Per-image device override, same length/order as `images` — for a
   * project that mixes a mobile app with a desktop admin panel (borrower
   * app vs approver dashboard, say) and needs each screenshot framed as
   * what it actually is instead of forcing one frame on all of them. */
  imageDevices?: ('phone' | 'browser')[]
}

export const projects: Project[] = [
  {
    index: '01',
    category: 'Product',
    name: 'Dekho',
    description:
      'An AI-native personal finance app, built from real customer discovery instead of a feature list. Ran JTBD interviews to find the actual pain point behind expense-tracking behavior, designed a weighted 7-question screening framework, and used it to run a staged 10→50→100 pilot rollout — currently at 10–15 active users. Also led the Wealth section redesign and shipped Monthly Wrap and app-lock security.',
    tech: ['React', 'Vite', 'FastAPI', 'RAG chatbot'],
    live: 'https://dekhofin.vercel.app/',
    images: [
      '/projects/dekho/1.jpg',
      '/projects/dekho/2.jpg',
      '/projects/dekho/3.jpg',
      '/projects/dekho/4.jpg',
    ],
    deviceFrame: 'phone',
  },
  {
    index: '02',
    category: 'Product',
    name: 'Frontage',
    description:
      'Merchants have no way to know if their catalog is even readable by AI shopping agents. Frontage audits a merchant\'s "AI-readability," auto-generates an agent-readable product catalog, then lets an AI buyer agent complete a real, bounded test-mode transaction end-to-end — a "Diagnose → Fix → Transact" flow.',
    tech: ['FastAPI', 'React', 'Vite', 'Razorpay API'],
    live: 'https://frontage-frontend.vercel.app/',
    images: ['/projects/frontage/1.png', '/projects/frontage/2.png', '/projects/frontage/3.png'],
    deviceFrame: 'browser',
  },
  {
    index: '03',
    category: 'Product / Systems',
    name: 'Wattshift',
    description:
      "A GPU job scheduler that times flexible compute jobs to run during cheaper electricity hours, using India's time-of-day tariffs and the IEX day-ahead market. Works as a standalone scheduler picking the cheapest valid window or as an agent beside a Slurm queue with shadow-mode and emergency-release safeguards. Savings independently measured via actual GPU power draw (nvidia-smi) on a live Kaggle T4.",
    tech: ['FastAPI', 'PostgreSQL', 'React', 'TypeScript', 'Tailwind', 'Slurm'],
    live: 'https://watt-shift.vercel.app/',
    github: 'https://github.com/Akshay-2441505/WattShift',
    images: [
      '/projects/wattshift/1.png',
      '/projects/wattshift/2.png',
      '/projects/wattshift/3.png',
      '/projects/wattshift/4.png',
    ],
    deviceFrame: 'browser',
  },
  {
    index: '04',
    category: 'Product / Civic-Tech',
    name: 'Sahi Ghar',
    description:
      "Surfaces a real-estate builder's RERA regulatory track record — project delays, complaints, and delivery timelines — before a buyer books a home, addressing a gap where public filings are hard to browse. Sourced from MahaRERA filings via a bounded, polite crawler with CAPTCHA detection, backed by FastAPI and PostgreSQL.",
    tech: ['Python', 'FastAPI', 'PostgreSQL', 'React', 'TypeScript'],
    live: 'https://sahi-ghar.vercel.app/',
    github: 'https://github.com/Akshay-2441505/Sahi-Ghar',
    images: [
      '/projects/sahighar/1.png',
      '/projects/sahighar/2.png',
      '/projects/sahighar/3.png',
      '/projects/sahighar/4.png',
    ],
    deviceFrame: 'browser',
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
    name: 'Digital MSME Loan Simulation',
    description:
      'An end-to-end loan workflow simulation with borrower and approver roles — designing who approves what, and why, across application, validation, and approval/rejection logic.',
    tech: ['Python', 'PL/SQL', 'MySQL', 'Supabase'],
    github: 'https://github.com/Akshay-2441505/PSD_Final_Project',
  },
  {
    name: 'DiaFit',
    description:
      'A health and lifestyle management app built with a friend — daily diet and medication tracking, an AI-assisted food scanner, and encrypted medical records.',
    tech: ['Flutter', 'ASP.NET Core', 'SQL Server'],
    github: 'https://github.com/JosephAlex-dev/DIA-FIT-',
  },
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
