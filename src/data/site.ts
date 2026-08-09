/* ─── Societies / Chapters ─── */

export const societies = [
  {
    slug: "cs",
    name: "IEEE Computer Society",
    shortName: "CS",
    tagline: "Software, AI & systems",
    description:
      "Hackathons, open-source sprints and hands-on workshops on AI, cloud and modern web engineering.",
    color: "#0072C6",
  },
  {
    slug: "pes",
    name: "IEEE Power & Energy Society",
    shortName: "PES",
    tagline: "Grids & clean energy",
    description:
      "Industry talks, plant visits and PES Day activities focused on renewable energy and smart grids.",
    color: "#00843D",
  },
  {
    slug: "wie",
    name: "IEEE Women in Engineering",
    shortName: "WIE",
    tagline: "Affinity group",
    description:
      "Mentorship circles, leadership sessions and outreach that support women pursuing engineering careers.",
    color: "#702F8A",
  },
  {
    slug: "sight",
    name: "IEEE SIGHT",
    shortName: "SIGHT",
    tagline: "Humanitarian technology",
    description:
      "Community projects that apply engineering to local problems in education, health and sustainability.",
    color: "#E87722",
  },
  {
    slug: "sps",
    name: "IEEE Signal Processing Society",
    shortName: "SPS",
    tagline: "Signals, data & intelligence",
    description:
      "Workshops and study groups on DSP, machine learning, image processing and communications systems.",
    color: "#0077B6",
  },
  {
    slug: "pels",
    name: "IEEE Power Electronics Society",
    shortName: "PELS",
    tagline: "Power conversion & drives",
    description:
      "Technical talks, lab sessions and industry visits on power electronics, converters and motor drives.",
    color: "#C8102E",
  },
  {
    slug: "emb",
    name: "IEEE Engineering in Medicine & Biology Society",
    shortName: "EMB",
    tagline: "Biomedical engineering",
    description:
      "Explorations at the intersection of engineering and healthcare — biomedical devices, biosignal processing and health-tech innovation.",
    color: "#005A9C",
  },
];

// Backward-compatible alias used by existing pages
export const chapters = societies;

/* ─── Stats ─── */
export const stats = [
  { value: "300+", label: "Active members" },
  { value: "60+", label: "Events hosted" },
  { value: "7", label: "Societies & groups" },
  { value: "2016", label: "Established" },
];

/* ─── Faculty & Leadership ─── */
export const faculty = [
  {
    name: "Mrs. Alka Das",
    role: "Hon'ble Chairperson",
    affiliation: "BBD Educational Group",
    category: "leadership",
  },
  {
    name: "Shri. Viraj Sagar Das",
    role: "Hon'ble President",
    affiliation: "BBD Educational Group",
    category: "leadership",
  },
  {
    name: "Dr. Pratul Arvind",
    role: "Director",
    affiliation: "BBDITM",
    category: "faculty",
  },
  {
    name: "Dr. Anurag Tiwari",
    role: "Assistant Director",
    affiliation: "BBDITM",
    category: "faculty",
  },
  {
    name: "Prof. Rafik Ahmad",
    role: "Branch Counselor",
    affiliation: "IEEE BBDITM Student Branch",
    category: "counsellor",
  },
];

/* ─── 2026 Executive Committee ─── */
export const officeBearers = {
  branch: [
    { name: "Mohammed Saif", role: "Chair", society: "IEEE Student Branch" },
    { name: "Vaibhav Pandey", role: "Vice-Chair", society: "IEEE Student Branch" },
    { name: "Vibhav Shukla", role: "Secretary", society: "IEEE Student Branch" },
    { name: "Arnav Gupta", role: "Treasurer", society: "IEEE Student Branch" },
  ],
  cs: [
    { name: "Swapnil Tripathi", role: "Chair", society: "Computer Society" },
    { name: "Yuvraj Buddha", role: "Vice-Chair", society: "Computer Society" },
    { name: "Saurabh Dwivedi", role: "Secretary", society: "Computer Society" },
    { name: "Arshiyan Zehra", role: "Webmaster", society: "Computer Society" },
  ],
  wie: [
    { name: "Vanshika Sharma", role: "Chair", society: "Women in Engineering" },
    { name: "Adity Khan", role: "Treasurer", society: "Women in Engineering" },
    { name: "Anshika Singh", role: "Webmaster", society: "Women in Engineering" },
  ],
  emb: [],
  pels: [
    { name: "Suresh Pandey", role: "Chair", society: "Power Electronics Society" },
    { name: "Sheetal Pal", role: "Vice-Chair", society: "Power Electronics Society" },
    { name: "Sumit Raj", role: "Webmaster", society: "Power Electronics Society" },
  ],
  sps: [
    { name: "Yash Gupta", role: "Chair", society: "Signal Processing Society" },
    { name: "Akshat Mishra", role: "Vice-Chair", society: "Signal Processing Society" },
    { name: "Arpita Yadav", role: "Secretary", society: "Signal Processing Society" },
  ],
  sight: [
    { name: "Anshul Dubey", role: "Vice-Chair", society: "IEEE SIGHT" },
    { name: "Aman Trivedi", role: "Secretary", society: "IEEE SIGHT" },
    { name: "Aayush Sharma", role: "Secretary", society: "IEEE SIGHT" },
  ],
  pes: [],
};

// Flat list for the team page
export const team = [
  ...officeBearers.branch,
  ...officeBearers.cs,
  ...officeBearers.wie,
  ...officeBearers.emb,
  ...officeBearers.pels,
  ...officeBearers.sps,
  ...officeBearers.sight,
];

/* ─── Events ─── */
export const events = [
  {
    title: "Unstoppable Journey 3.0",
    date: "Flagship · Annual",
    type: "Flagship",
    status: "Past",
    description:
      "Our signature multi-day summit with keynote speakers, technical tracks and an award ceremony.",
  },
  {
    title: "IEEE PES Day",
    date: "April",
    type: "Chapter",
    status: "Past",
    description:
      "A global celebration of power and energy with expert sessions on the future of clean electricity.",
  },
  {
    title: "Annual General Meeting",
    date: "December",
    type: "Branch",
    status: "Upcoming",
    description:
      "Year in review, financial report, new executive committee announcement and member recognition.",
  },
  {
    title: "Virtual Bootcamp — R10 SAC",
    date: "Bootcamp series",
    type: "Workshop",
    status: "Past",
    description:
      "A skills bootcamp run under IEEE Region 10 Student Activities covering leadership and technical skills.",
  },
  {
    title: "New Member Orientation",
    date: "August",
    type: "Branch",
    status: "Upcoming",
    description:
      "Orientation sessions for first-year students on what IEEE membership unlocks and how to join.",
  },
  {
    title: "Volunteer Induction",
    date: "Rolling",
    type: "Branch",
    status: "Open",
    description:
      "Applications for volunteering across technical, design, content and outreach verticals.",
  },
  {
    title: "MY STORY — WIE Activity",
    date: "WIE Series",
    type: "Chapter",
    status: "Past",
    description:
      "Inspiring stories from women in engineering, sharing their journeys, challenges and achievements.",
  },
];

/* ─── Benefits ─── */
export const benefits = [
  {
    title: "Global IEEE network",
    body: "Connect with 400,000+ members, conferences and the IEEE Xplore digital library.",
  },
  {
    title: "Hands-on projects",
    body: "Ship real hardware and software projects with peers and faculty mentors.",
  },
  {
    title: "Certified workshops",
    body: "Attend technical bootcamps with participation certificates recognised across campuses.",
  },
  {
    title: "Leadership roles",
    body: "Run events, lead a chapter and build the experience recruiters actually look for.",
  },
];
