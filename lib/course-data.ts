export type Role = "student" | "admin";
export type SubmissionStatus = "pending" | "submitted" | "reviewed";
export type AttendanceStatus = "present" | "absent" | "rescheduled";
export type ResourceType = "pdf" | "link" | "video" | "note";
export type PasswordRequestStatus = "pending" | "approved" | "rejected" | "used";
export type RescheduleRequestStatus = "pending" | "approved" | "rejected";
export type HomeworkKind = "class_challenge" | "home_task";
export type ReferralStatus = "pending" | "contacted" | "enrolled" | "rewarded" | "closed";

export type HomeworkDetails = {
  moduleNumber: number;
  moduleTitle: string;
  sessionNumber: number;
  sessionTitle: string;
  whatStudentsLearn: string;
  tools: string[];
  aiType: string;
  mission?: string;
  scenario?: string;
  instructions?: string[];
  prompt?: string;
  deliverables?: string[];
  checklist?: string[];
};

export type CourseModule = {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  sessionCount: number;
};

export type CourseSession = {
  id: string;
  moduleId: string;
  title: string;
  sessionNumber: number;
  globalNumber: number;
  focus: string;
  toolsCovered: string[];
  studentOutput: string;
  description: string;
  date: string;
};

export type StudentProfile = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  lastSeenAt?: string;
  parentName: string;
  parentEmail: string;
  country: string;
  timeZone: string;
  batchId: string;
  enrolledAt: string;
};

export type Batch = {
  id: string;
  name: string;
  days: string;
  timeSlot: string;
  timeZone: string;
  startDate: string;
  startTime: string;
  endTime: string;
  meetLink: string;
  moduleId: string;
  studentsCount: number;
  classSlots: BatchClassSlot[];
};

export type BatchClassSlot = {
  id: string;
  batchId: string;
  label: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  meetLink: string;
  sortOrder: number;
};

export type HomeworkItem = {
  id: string;
  sessionId: string;
  batchId: string;
  assignedStudentId?: string;
  title: string;
  description: string;
  details?: HomeworkDetails;
  kind: HomeworkKind;
  contentUrl: string;
  dueDate: string;
  createdAt: string;
  sessionName: string;
  moduleId: string;
  status: SubmissionStatus;
  notes?: string;
  startedAt?: string;
  submittedAt?: string;
  timeSpentSeconds?: number;
  submittedCount?: number;
  averageTimeSpentSeconds?: number;
  submissions?: HomeworkSubmissionSummary[];
};

export type HomeworkSubmissionSummary = {
  studentId: string;
  status: SubmissionStatus;
  startedAt?: string;
  submittedAt?: string;
  timeSpentSeconds?: number;
  screenImage?: string;
  cameraImage?: string;
  proofText?: string;
  attachmentName?: string;
  attachmentMime?: string;
  attachmentData?: string;
  proofCapturedAt?: string;
  proofExpiresAt?: string;
  browserName?: string;
  browserVersion?: string;
  osName?: string;
  deviceType?: string;
  userAgent?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  language?: string;
};

export type ResourceItem = {
  id: string;
  moduleId: string;
  sessionId: string;
  title: string;
  type: ResourceType;
  url: string;
  createdAt: string;
  sessionName: string;
};

export type Announcement = {
  id: string;
  batchId: string;
  message: string;
  createdAt: string;
};

export type FeedbackItem = {
  id: string;
  studentId: string;
  sessionId: string;
  sessionName: string;
  tutorNote: string;
  createdAt: string;
};

export type AttendanceItem = {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  date: string;
};

export type ClassJoinEvent = {
  id: string;
  sessionId: string;
  studentId: string;
  batchId: string;
  joinedAt: string;
  classDate: string;
  meetLink: string;
  studentName: string;
  sessionName: string;
};

export type ClassRescheduleRequest = {
  id: string;
  studentId: string;
  studentName: string;
  batchId: string;
  originalDate?: string;
  requestedDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  requestedTimeZone: string;
  reason: string;
  status: RescheduleRequestStatus;
  adminNote: string;
  meetLink: string;
  requestedAt: string;
  reviewedAt: string;
};

export type PasswordChangeRequest = {
  id: string;
  studentId: string;
  studentName: string;
  status: PasswordRequestStatus;
  reason: string;
  adminNote: string;
  requestedAt: string;
  reviewedAt: string;
  usedAt: string;
};

export type ReferralSubmission = {
  id: string;
  studentId: string;
  studentName: string;
  referredName: string;
  referredContact: string;
  relationship: string;
  note: string;
  status: ReferralStatus;
  adminNote: string;
  createdAt: string;
  reviewedAt: string;
};

export const modules: CourseModule[] = [
  {
    id: "m1",
    title: "Agentic AI Essentials: Prompts to Projects",
    description:
      "An AI essentials journey from prompting fundamentals to practical study systems, creative AI, smart data, local AI, and a polished showcase.",
    orderIndex: 1,
    sessionCount: 8,
  },
  {
    id: "m2",
    title: "Vibe Coding Lab: Idea to App",
    description:
      "Students turn ideas into real apps using AI, no-code builders, design tools, AI ethics, and a smart app showcase.",
    orderIndex: 2,
    sessionCount: 8,
  },
  {
    id: "m3",
    title: "Automation Studio: Agents & Workflows",
    description:
      "Students move from AI agent foundations to real automation workflows with n8n, Zapier, ClawBot, and a final showcase.",
    orderIndex: 3,
    sessionCount: 8,
  },
];

const sessionBlueprints = [
  [
    ["Welcome to the AI Era", "Understand what AI can and cannot do, learn prompt engineering fundamentals, role prompting, and chain-of-thought style reasoning.", ["ChatGPT", "Claude", "Gemini"], "AI literacy prompt journal"],
    ["AI for School: Study Smarter", "Use AI to create study guides, explain complex topics, generate practice questions, summarize textbook chapters, and build flashcards for a real school subject.", ["Gemini", "NotebookLM"], "Complete AI study system"],
    ["AI for Creative Writing", "Use AI as a writing partner for brainstorming, outlining, drafting, editing, and improving blog posts, essays, or stories.", ["QuillBot", "ZeroGPT", "WrizzleAI"], "AI-assisted writing piece"],
    ["AI Image & Video Creation", "Explore AI image generation, Canva AI, and creative media tools while discussing AI art ethics, copyright, and deepfakes.", ["Gemini", "Canva AI", "MidJourney"], "Creative visual media board"],
    ["AI Audio Generation", "Create AI-generated music, voice, and sound effects for podcasts, games, storytelling, and creative projects.", ["Suno AI", "ElevenLabs", "Udio"], "AI audio clip or soundtrack"],
    ["AI for Tasks Organisation: The Data Analyst", "Organize tasks, notes, and information with AI; analyze simple datasets, summarize information, create task plans, and generate insights.", ["Notion AI", "Claude", "OpenAI"], "AI task and data insight system"],
    ["AI without Internet: Going Local", "Run AI without internet, organize local tasks, and understand local AI project workflows.", ["Ollama", "LM Studio", "Gemma"], "Local AI setup plan"],
    ["AI Presentations: Pitch Like a Pro / Showcase Session", "Create and present an AI-powered presentation showcasing the learning journey and module projects.", ["Gamma AI"], "Module 1 showcase presentation"],
  ],
  [
    ["Vibe Coding: No-Code App Magic", "Build a simple app with AI prompts without writing code, turning an idea into a working app and customizing the generated interface.", ["Bolt.new"], "No-code app prototype"],
    ["Vibe Coding: From Idea to App", "Build production-ready apps through conversation with AI agents that design, code, and deploy an application from start to finish.", ["Emergent.sh"], "AI-built app draft"],
    ["Figma AI Tools", "Design frontend screens using Figma AI design generation and Make features.", ["Figma AI"], "Frontend design mockup"],
    ["No-Code GPT Wrappers", "Build GPT wrappers and AI-powered apps around useful workflows and user-facing interfaces.", ["OpenAI GPTs"], "GPT wrapper prototype"],
    ["Google AI Studio: Gemini Playground / AntiGravity", "Explore Google AI Studio and Gemini Playground for hands-on AI experimentation and creative app projects.", ["Google AI Studio", "Gemini Playground"], "Gemini experiment prototype"],
    ["Exploring Google Labs AI", "Experiment with Google Labs tools and evaluate how emerging AI features can support creative projects.", ["Google Whisk.ai"], "Google Labs experiment log"],
    ["AI Ethics & Responsibility", "Evaluate AI bias, misinformation, privacy, deepfakes, disclosure, school use, and regulation, then create an AI Ethics Code.", ["Sensity AI", "Hive AI"], "School AI ethics code"],
    ["Showcase Session: Present Your Smart AI App", "Present AI-powered applications and projects built throughout the module with a clear product narrative.", ["Gamma AI"], "Module 2 smart app showcase"],
  ],
  [
    ["AI Agents and Tools", "Understand how AI agents work, what tools power them, and how agents differ from ordinary AI chat workflows.", ["AI Tools"], "AI agent concept map"],
    ["Introduction to AI Automation", "Learn automation logic through examples such as n8n workflows that summarize emails and post to Slack.", ["n8n"], "Automation logic map"],
    ["Build Your First AI Workflow", "Build a trigger-to-output workflow where a form submission is processed by AI and routed to an output such as an email notification.", ["n8n", "Gemini"], "First AI workflow"],
    ["AI Workflow: Content Pipeline", "Build a complete content pipeline where AI generates a blog post, social caption, image alt text, and a ready-to-publish package.", ["n8n"], "AI content pipeline"],
    ["Advanced Automations using Zapier", "Create advanced multi-step automation workflows that connect apps and automate complex processes.", ["Zapier"], "Advanced Zapier workflow"],
    ["Introduction to ClawBot", "Install, configure, and launch a VPS-based automation hub with ClawBot foundations.", ["ClawBot"], "ClawBot automation hub setup"],
    ["Mastering ClawBot Skills", "Implement document and file handling skills, integrate channel connectors, and extend ClawBot with custom skills.", ["ClawBot"], "Custom ClawBot skill"],
    ["Showcase Session: Present Your Smart AI App", "Present final automation projects built throughout the module and explain the workflow, tools, and impact.", ["ClawBot", "Gamma AI"], "Module 3 automation showcase"],
  ],
] as const;

const baseDates = [
  "2026-06-15",
  "2026-06-17",
  "2026-06-22",
  "2026-06-24",
  "2026-06-29",
  "2026-07-01",
  "2026-07-06",
  "2026-07-08",
  "2026-07-13",
  "2026-07-15",
  "2026-07-20",
  "2026-07-22",
  "2026-07-27",
  "2026-07-29",
  "2026-08-03",
  "2026-08-05",
  "2026-08-10",
  "2026-08-12",
  "2026-08-17",
  "2026-08-19",
  "2026-08-24",
  "2026-08-26",
  "2026-08-31",
  "2026-09-02",
];

export const sessions: CourseSession[] = sessionBlueprints.flatMap((moduleSessions, moduleIndex) =>
  moduleSessions.map(([title, focus, toolsCovered, studentOutput], sessionIndex) => {
    const globalNumber = moduleIndex * 8 + sessionIndex + 1;
    return {
      id: `m${moduleIndex + 1}s${sessionIndex + 1}`,
      moduleId: `m${moduleIndex + 1}`,
      title,
      sessionNumber: sessionIndex + 1,
      globalNumber,
      focus,
      toolsCovered: [...toolsCovered],
      studentOutput,
      description: `${focus} Students leave with a concrete artifact they can refine between sessions.`,
      date: baseDates[globalNumber - 1],
    };
  }),
);

export const demoStudent: StudentProfile = {
  id: "11111111-1111-4111-8111-111111111111",
  userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  fullName: "Aarav Mehta",
  email: "student@demo.com",
  lastSeenAt: "2026-06-01T09:10:00.000Z",
  parentName: "Priya Mehta",
  parentEmail: "parent@example.com",
  country: "India",
  timeZone: "Asia/Kolkata",
  batchId: "summer-alpha",
  enrolledAt: "2026-06-01T09:00:00.000Z",
};

export const demoBatch: Batch = {
  id: "summer-alpha",
  name: "Summer Alpha Cohort",
  days: "Mon / Wed",
  timeSlot: "5:00 PM - 6:30 PM IST",
  timeZone: "Asia/Kolkata",
  startDate: "2026-06-15",
  startTime: "17:00",
  endTime: "18:30",
  meetLink: "https://meet.google.com/demo-ai-builders",
  moduleId: "m1",
  studentsCount: 12,
  classSlots: [
    {
      id: "summer-alpha-mon",
      batchId: "summer-alpha",
      label: "Monday class",
      dayOfWeek: 1,
      startTime: "17:00",
      endTime: "18:30",
      meetLink: "https://meet.google.com/demo-ai-builders",
      sortOrder: 1,
    },
    {
      id: "summer-alpha-wed",
      batchId: "summer-alpha",
      label: "Wednesday class",
      dayOfWeek: 3,
      startTime: "17:00",
      endTime: "18:30",
      meetLink: "https://meet.google.com/demo-ai-builders",
      sortOrder: 2,
    },
  ],
};

export const demoHomework: HomeworkItem[] = [
  {
    id: "hw-m1s1-class",
    sessionId: "m1s1",
    batchId: demoBatch.id,
    title: "Session 1 Class Challenge",
    description: "Complete the in-class prompt and reflection challenge for Welcome to the AI Era.",
    kind: "class_challenge",
    contentUrl: "https://docs.google.com/document/d/1C0I22ZjEqAs-YN5Q5xqt3qKxgly_rEItJVgnV43fFbU/edit?usp=sharing",
    dueDate: "2026-06-10",
    createdAt: "2026-06-08T10:30:00.000Z",
    sessionName: "Welcome to the AI Era",
    moduleId: "m1",
    status: "pending",
  },
  {
    id: "hw-m1s1-home",
    sessionId: "m1s1",
    batchId: demoBatch.id,
    title: "Session 1 Home Task",
    description: "Complete the home task for Welcome to the AI Era and mark it complete after reviewing the document.",
    kind: "home_task",
    contentUrl: "https://docs.google.com/document/d/166ROF2jMqKAtzMhx1VXyBkk0iy0W0UzdhyKF2kDTTmA/edit?usp=sharing",
    dueDate: "2026-06-12",
    createdAt: "2026-06-08T10:35:00.000Z",
    sessionName: "Welcome to the AI Era",
    moduleId: "m1",
    status: "pending",
  },
  {
    id: "hw-m1s2-class",
    sessionId: "m1s2",
    batchId: demoBatch.id,
    title: "Session 2 Class Challenge",
    description: "Complete the in-class study system challenge for AI for School: Study Smarter.",
    kind: "class_challenge",
    contentUrl: "https://docs.google.com/document/d/1CQh5XrIXikVHZ9dq9GJi1TBf3nJscCG3_ONY4SWl6GM/edit?usp=sharing",
    dueDate: "2026-06-17",
    createdAt: "2026-06-15T10:30:00.000Z",
    sessionName: "AI for School: Study Smarter",
    moduleId: "m1",
    status: "pending",
  },
  {
    id: "hw-m1s2-home",
    sessionId: "m1s2",
    batchId: demoBatch.id,
    title: "Session 2 Home Task",
    description: "Complete the home task for AI for School: Study Smarter and mark it complete after reviewing the document.",
    kind: "home_task",
    contentUrl: "https://docs.google.com/document/d/1hrvSw3m6gjRpRu5UPHzF6X0fB9_K37_ufHJJJbhOQ1Q/edit?usp=sharing",
    dueDate: "2026-06-19",
    createdAt: "2026-06-15T10:35:00.000Z",
    sessionName: "AI for School: Study Smarter",
    moduleId: "m1",
    status: "pending",
  },
  {
    id: "hw-m1s3-class",
    sessionId: "m1s3",
    batchId: demoBatch.id,
    title: "Session 3 Class Challenge",
    description: "Complete the in-class creative writing challenge for AI for Creative Writing.",
    kind: "class_challenge",
    contentUrl: "https://docs.google.com/document/d/1hrvSw3m6gjRpRu5UPHzF6X0fB9_K37_ufHJJJbhOQ1Q/edit?usp=sharing",
    dueDate: "2026-06-24",
    createdAt: "2026-06-22T10:30:00.000Z",
    sessionName: "AI for Creative Writing",
    moduleId: "m1",
    status: "pending",
  },
  {
    id: "hw-m1s3-home",
    sessionId: "m1s3",
    batchId: demoBatch.id,
    title: "Session 3 Home Task",
    description: "Complete the home task for AI for Creative Writing and mark it complete after reviewing the document.",
    kind: "home_task",
    contentUrl: "https://docs.google.com/document/d/1tTUOerSCutvkHhMvj6rRT-QBOirOtdeeM4HVex2eBec/edit?usp=sharing",
    dueDate: "2026-06-26",
    createdAt: "2026-06-22T10:35:00.000Z",
    sessionName: "AI for Creative Writing",
    moduleId: "m1",
    status: "pending",
  },
];

export const demoResources: ResourceItem[] = [
  {
    id: "res-1",
    moduleId: "m1",
    sessionId: "m1s1",
    title: "AI Era Prompt Journal Template",
    type: "note",
    url: "https://example.com/ai-use-map",
    createdAt: "2026-06-15T10:00:00.000Z",
    sessionName: "Welcome to the AI Era",
  },
  {
    id: "res-2",
    moduleId: "m1",
    sessionId: "m1s3",
    title: "Creative Writing AI Drafting Guide",
    type: "pdf",
    url: "https://example.com/creative-writing-ai-guide.pdf",
    createdAt: "2026-06-22T10:00:00.000Z",
    sessionName: "AI for Creative Writing",
  },
  {
    id: "res-3",
    moduleId: "m2",
    sessionId: "m2s2",
    title: "Vibe Coding From Idea to App Demo",
    type: "video",
    url: "https://example.com/vibe-coding-idea-to-app",
    createdAt: "2026-07-15T10:00:00.000Z",
    sessionName: "Vibe Coding: From Idea to App",
  },
  {
    id: "res-4",
    moduleId: "m3",
    sessionId: "m3s4",
    title: "n8n Content Pipeline Checklist",
    type: "link",
    url: "https://example.com/n8n-content-pipeline",
    createdAt: "2026-08-19T10:00:00.000Z",
    sessionName: "AI Workflow: Content Pipeline",
  },
];

export const demoAnnouncements: Announcement[] = [
  {
    id: "ann-1",
    batchId: demoBatch.id,
    message: "Bring one school assignment you want to improve with AI for the next session.",
    createdAt: "2026-06-27T09:15:00.000Z",
  },
  {
    id: "ann-2",
    batchId: demoBatch.id,
    message: "The class link has been updated for the remaining summer sessions.",
    createdAt: "2026-06-25T12:00:00.000Z",
  },
  {
    id: "ann-3",
    batchId: demoBatch.id,
    message: "Portfolio reviews begin after Session 8. Keep your artifacts organized.",
    createdAt: "2026-06-20T08:30:00.000Z",
  },
];

export const demoAttendance: AttendanceItem[] = [
  ...sessions.slice(0, 5).map((session) => ({
    id: `att-${session.id}`,
    sessionId: session.id,
    studentId: demoStudent.id,
    status: "present" as AttendanceStatus,
    date: session.date,
  })),
  {
    id: "att-m1s6",
    sessionId: "m1s6",
    studentId: demoStudent.id,
    status: "rescheduled",
    date: "2026-07-01",
  },
];

export const demoFeedback: FeedbackItem[] = [
  {
    id: "fb-1",
    studentId: demoStudent.id,
    sessionId: "m1s3",
    sessionName: "AI for Creative Writing",
    tutorNote: "Strong improvement in AI-assisted outlining. Next step: explain which edits were yours and which were AI suggestions.",
    createdAt: "2026-06-22T13:15:00.000Z",
  },
  {
    id: "fb-2",
    studentId: demoStudent.id,
    sessionId: "m1s5",
    sessionName: "AI Audio Generation",
    tutorNote: "Good creative direction on the audio idea. Next step: describe the mood, audience, and usage context more clearly.",
    createdAt: "2026-06-29T13:15:00.000Z",
  },
];

export const demoClassJoinEvents: ClassJoinEvent[] = [];
export const demoPasswordChangeRequests: PasswordChangeRequest[] = [];
