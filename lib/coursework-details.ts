import type { HomeworkDetails, HomeworkKind } from "@/lib/course-data";

type CourseworkTask = {
  type: HomeworkKind;
  title: string;
  description: string;
  googleDocLink: string;
  mission?: string;
  scenario?: string;
  instructions?: string[];
  prompt?: string;
  deliverables?: string[];
  checklist?: string[];
};

type CourseworkSession = {
  moduleNumber: number;
  moduleTitle: string;
  sessionNumber: number;
  sessionTitle: string;
  whatStudentsLearn: string;
  tools: string[];
  aiType: string;
  tasks: CourseworkTask[];
};

export type CourseworkDetail = HomeworkDetails & {
  type: HomeworkKind;
  title: string;
  description: string;
  googleDocLink: string;
};

const moduleOneCoursework: CourseworkSession[] = [
  {
    moduleNumber: 1,
    moduleTitle: "Agentic AI Essentials: Prompts to Projects",
    sessionNumber: 1,
    sessionTitle: "Welcome to the AI Era",
    whatStudentsLearn:
      "Students learn what AI is, what it can do, what it cannot do, prompt engineering fundamentals, role-based prompting, chain-of-thought style prompting, and how to use ChatGPT, Claude, and Gemini effectively.",
    tools: ["ChatGPT", "Claude", "Gemini"],
    aiType: "AI Literacy & Prompt Engineering",
    tasks: [
      {
        type: "class_challenge",
        title: "Class Challenge 1",
        description:
          "From Ideas to Income. Students use ChatGPT, Claude, or Gemini as a business brainstorming partner to turn a personal skill into a digital product idea. The AI must ask about the student's skills, experience, and audience, then suggest 3 realistic digital product ideas such as an e-book, template pack, Notion system, mini course, or toolkit. For each idea, students must identify the target audience, problem solved, reason someone would pay, validation method, product outline, pricing strategy, launch plan, first 10 customers strategy, and scaling plan.",
        googleDocLink: "https://docs.google.com/document/d/1nyybUpzX2aHGuHzp2CBXUk1ypLQSKhlW3xcfKK_aHAM/edit?usp=drivesdk",
        mission: "Transform a personal skill into a profitable and scalable digital product business using AI as a strategy partner.",
        scenario:
          "Many creators have useful skills but struggle to turn them into income. They are unsure what to create, who to target, how to validate demand, and how to launch. In this challenge, you will use an AI assistant to turn one real skill into a practical digital product idea that people would actually want.",
        instructions: [
          "Open ChatGPT, Claude, or Gemini.",
          "Ask the AI to interview you about your skills, experience, interests, available time, and possible audience.",
          "Ask the AI to suggest 3 realistic digital product ideas you could create, such as an e-book, template pack, Notion system, mini course, or toolkit.",
          "For each idea, identify who it is for, what problem it solves, and why someone would pay for it.",
          "Choose the strongest idea and ask the AI to help you validate demand before building it.",
          "Create a simple product outline with sections, deliverables, pricing, and launch plan.",
          "End with a scaling plan that includes upsells, bundles, and version 2 improvements.",
        ],
        prompt:
          "Act as a digital product strategist and AI business coach.\n\nFirst, ask me about my skills, experience, interests, available time, and audience. Then suggest 3 digital product ideas I can realistically create.\n\nFor each idea, explain:\n1. Who it is for\n2. What problem it solves\n3. Why someone would pay for it\n4. How I can validate demand before creating it\n5. A simple product outline\n6. A pricing strategy\n7. A launch plan for getting my first 10 customers\n8. A scaling plan with upsells, bundles, and version 2 improvements\n\nKeep the ideas practical, beginner-friendly, and realistic.",
        deliverables: ["Your AI interview answers", "3 digital product ideas", "Selected best idea with reasoning", "Validation plan", "Product outline", "Pricing and launch strategy", "Scaling plan"],
        checklist: ["The product idea is realistic for your skills.", "The target audience is clearly defined.", "The validation plan happens before full product creation.", "The launch plan includes first customer strategy.", "The scaling plan includes future improvements."],
      },
      {
        type: "class_challenge",
        title: "Class Challenge 2",
        description:
          "Prompt Upgrade Battle. Students start with a weak prompt such as “Help me make money with my skill” and improve it using role, context, task, audience, constraints, and output format. They must test the improved prompt in one main AI tool, preferably ChatGPT or Claude, then compare the first weak output with the upgraded output. Deliverable: weak prompt, improved prompt, AI response, and a short reflection on why the improved prompt worked better.",
        googleDocLink: "https://docs.google.com/document/d/1knunxrtJ7HzzOW6iRpNqkR_Yofplwwg4t3BxpcDF8sE/edit?usp=drivesdk",
        mission: "Upgrade a weak prompt into a strong, structured prompt and compare the difference in AI output quality.",
        scenario:
          "A vague prompt often creates vague answers. In this challenge, you will take a weak prompt and rebuild it using role, context, task, audience, constraints, and output format. The goal is to experience how prompt engineering improves the usefulness of AI responses.",
        instructions: ["Choose a weak prompt related to learning, business, creativity, or your Launchpad project.", "Run the weak prompt in ChatGPT, Claude, or Gemini and save the output.", "Rewrite the prompt using a clear role, detailed context, exact task, target audience, constraints, and expected format.", "Run the improved prompt in the same AI tool.", "Compare both outputs side by side.", "Write a short reflection explaining what changed and why the improved prompt worked better."],
        prompt:
          "I want you to help me improve this weak prompt:\n\n[PASTE WEAK PROMPT HERE]\n\nRewrite it using:\n1. Role\n2. Context\n3. Task\n4. Audience\n5. Constraints\n6. Output format\n7. Step-by-step reasoning instructions\n\nThen explain why the new prompt is stronger.",
        deliverables: ["Weak prompt", "Output from weak prompt", "Improved prompt", "Output from improved prompt", "Short comparison reflection"],
        checklist: ["The improved prompt has a clear role and task.", "The output format is specific.", "The comparison explains real differences.", "The reflection connects to prompt engineering principles."],
      },
      {
        type: "home_task",
        title: "Home Task 1",
        description:
          "Learn Fast, Grow Fast. Students help Anuj learn any skill effectively in 30 days. Using ChatGPT, Claude, or Gemini, they must create a step-by-step 30-day learning plan with daily practice tasks, weekly milestones, revision checkpoints, motivation tips, progress tracking, and a final mini project to prove confidence in the skill.",
        googleDocLink: "https://docs.google.com/document/d/1bpUDZjG060j51lhHPVvCHWZP2IW-fOVNJikCFwLKVlw/edit?usp=drivesdk",
        mission: "Create a 30-day accelerated learning plan that helps someone learn a new skill with consistency and confidence.",
        scenario:
          "Anuj wants to learn a new skill, but he feels lost because there are too many tutorials, too many topics, and no clear direction. Some days he practices, other days he does not, and he slowly loses motivation because he cannot see progress. Your task is to use AI to design a clear 30-day roadmap that helps Anuj stay consistent and improve step by step.",
        instructions: ["Choose one skill you or Anuj wants to learn.", "Open ChatGPT, Claude, or Gemini.", "Ask the AI to act as an accelerated learning coach.", "Ask it to identify your current level: beginner, intermediate, or advanced.", "Ask it to identify the 20 percent of knowledge that gives 80 percent of useful results.", "Create a 30-day roadmap divided into 4 weeks: foundations, practice, real-world application, and advanced usage.", "Add daily learning tasks, weekly reviews, weak-area checks, and a final challenge."],
        prompt:
          "Act as an accelerated learning coach and help me learn the skill [SKILL NAME] in 30 days.\n\nFirst, ask me my current level: beginner, intermediate, or advanced.\n\nThen create a learning plan that includes:\n1. The most important fundamentals\n2. The 20 percent knowledge that gives 80 percent results\n3. A 4-week roadmap\n4. Daily learning tasks\n5. Practice exercises\n6. Weekly review checkpoints\n7. Weak-area tracking\n8. A final real-world challenge that proves I learned the skill\n\nMake the plan realistic, motivating, and easy to follow.",
        deliverables: ["Chosen skill", "Current level", "30-day roadmap", "Daily task plan", "Weekly review system", "Final challenge", "Progress tracking method"],
        checklist: ["The plan is broken into 4 clear weeks.", "Daily tasks are realistic.", "The plan includes practice and application.", "There is a final challenge to prove learning.", "Progress tracking is included."],
      },
      {
        type: "home_task",
        title: "Home Task 2",
        description:
          "Launchpad Project Starter. Students choose one personal project idea for Module 1 and use AI to define the problem, target user, project goal, required tools, first 5 tasks, and 5 reusable prompts they will use during the module. This becomes the starting point for the final showcase in Session 8.",
        googleDocLink: "https://docs.google.com/document/d/1SZ_eQLMGfKe5_vhmFfVfSK1IvhjbkbnMkovIkaYTkZs/edit?usp=drivesdk",
        mission: "Start your Module 1 Launchpad Project by defining a practical project idea and a set of reusable AI prompts.",
        scenario:
          "Your Launchpad Project will grow across Module 1. Instead of waiting until the end, you will start now by choosing a project idea, defining the problem, and preparing the prompts that will help you build it step by step.",
        instructions: ["Choose one project idea you want to build or explore during Module 1.", "Use ChatGPT, Claude, or Gemini to clarify the problem, target user, and project goal.", "Ask the AI to suggest possible features, required tools, and a simple build plan.", "Create 5 reusable prompts you can use throughout the module.", "Connect the project idea to at least one Module 1 topic such as prompting, study tools, writing, visuals, audio, productivity, or local AI."],
        prompt:
          "Act as a project mentor for my AI Launchpad Project.\n\nHelp me define a beginner-friendly project idea for Module 1.\n\nAsk me about my interests, skills, and target users. Then help me create:\n1. Project title\n2. Problem statement\n3. Target user\n4. Main goal\n5. Core features\n6. Tools I may use\n7. First 5 action steps\n8. Five reusable prompts for building the project\n\nMake the project practical, creative, and achievable.",
        deliverables: ["Project title", "Problem statement", "Target user", "Core features", "Tools list", "First 5 action steps", "5 reusable prompts"],
        checklist: ["The idea is achievable in Module 1.", "The target user is clear.", "The project connects to AI tools learned in class.", "The reusable prompts are specific.", "The next steps are simple and actionable."],
      },
    ],
  },
  {
    moduleNumber: 1,
    moduleTitle: "Agentic AI Essentials: Prompts to Projects",
    sessionNumber: 2,
    sessionTitle: "AI for School: Study Smarter",
    whatStudentsLearn:
      "Students use NotebookLM and Gemini to create study guides, explain complex topics, generate practice questions, summarize sources, create flashcards, and build a complete study system.",
    tools: ["NotebookLM", "Gemini"],
    aiType: "Practical AI",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "Arjun's Smart Learner. Students help Arjun organize scattered deep learning resources using NotebookLM. They must create a notebook, add at least 2-3 sources, organize them into a structured knowledge base, ask source-based questions, save useful notes, and generate a clean study summary.", googleDocLink: "https://docs.google.com/document/d/1UmeP8tnpIklvEHE7lCF-COwL0ju7A0S0ptipd0t7UXQ/edit?usp=drivesdk" },
      { type: "class_challenge", title: "Class Challenge 2", description: "Citation Detective. Students use NotebookLM to ask 5 questions from uploaded sources and record answers with citations. Then they ask Gemini one broader follow-up question and compare when each tool is better.", googleDocLink: "https://docs.google.com/document/d/1b9xmAMBVsq4nlCIztboSc72wcexGzbZXmQ3_Y2CGP68/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 1", description: "Shakespeare NotebookLM. Students build a NotebookLM study notebook for Shakespeare using summaries, character analyses, scenes, famous quotes, or videos, then generate a character guide, theme explanation, flashcards, and quiz.", googleDocLink: "https://docs.google.com/document/d/1hIEmdF70cOONCPSuTp2NTIMaJt6YV4EZ6RunArW2k38/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 2", description: "Personal Study System. Students create a NotebookLM or Gemini-powered study system for one real school subject with source collection, topic summary, flashcards, practice questions, weak-area list, and a 7-day study plan.", googleDocLink: "https://docs.google.com/document/d/1kITBYC3qGvRqDFjKdBjfFG4HWfp6dGhNThyrKE8jGho/edit?usp=drivesdk" },
    ],
  },
  {
    moduleNumber: 1,
    moduleTitle: "Agentic AI Essentials: Prompts to Projects",
    sessionNumber: 3,
    sessionTitle: "AI for Creative Writing",
    whatStudentsLearn:
      "Students use AI writing tools for grammar, clarity, brainstorming, outlining, drafting, rewriting, plagiarism checking, and originality improvement.",
    tools: ["Grammarly", "QuillBot", "ZeroGPT", "Sudowrite", "Paperpal"],
    aiType: "Content / Creative Writing",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "Riya's Writing Makeover. Students improve a messy paragraph using Grammarly or QuillBot, fixing grammar, clarity, tone, and sentence flow while keeping the original meaning.", googleDocLink: "https://docs.google.com/document/d/1xmNVyiuguxO_B6TgZ0RIgD8w7Uo26ss4kwBvZa30bUY/edit?usp=drivesdk" },
      { type: "class_challenge", title: "Class Challenge 2", description: "Story Builder Lab. Students use Sudowrite, ChatGPT, Claude, or Gemini to create a story concept with character, setting, conflict, 5-scene outline, and one polished opening paragraph.", googleDocLink: "https://docs.google.com/document/d/13CTwe5Dd6nKHYVACeKWuROP0TkSwmySS7AJWPvH3tZQ/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 1", description: "The Plagiarism Detector. Students help Aarav check whether writing sounds copied or too AI-generated, identify risky sections, rewrite in their own voice, and produce a clearer final version.", googleDocLink: "https://docs.google.com/document/d/1lSMBKKBQxwAw-EoW_5cTkOVWX3ZRoiKfADByEK6mWkU/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 2", description: "AI Writing Feature for Launchpad. Students design one writing-support feature for their Module 1 project, such as grammar checking, quiz generation, citation help, story drafting, or summary rewriting.", googleDocLink: "https://docs.google.com/document/d/1LuNk95-T6tusEbkOgqw7AE4NSQw5CaBKVcTe7VC23pk/edit?usp=drivesdk" },
    ],
  },
  {
    moduleNumber: 1,
    moduleTitle: "Agentic AI Essentials: Prompts to Projects",
    sessionNumber: 4,
    sessionTitle: "AI Image & Video Creation",
    whatStudentsLearn:
      "Students explore AI image and video generation for posters, concept art, storytelling, social media content, and short video creation while discussing ethics, copyright, and deepfakes.",
    tools: ["Gemini", "Canva Magic Media", "Ideogram", "Leonardo AI", "Kling AI", "Runway AI"],
    aiType: "Creative AI",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "Sahara Rain AI Video. Students create an AI-generated visual or short video showing rain falling in the Sahara Desert with animals reacting, using a detailed cinematic prompt.", googleDocLink: "https://docs.google.com/document/d/1P6AHeokYGv2HZdJ6-8qB7tL-X9Eqm5aKz-yyzcutcC0/edit?usp=drivesdk" },
      { type: "class_challenge", title: "Class Challenge 2", description: "Launchpad Visual Identity Pack. Students create at least two visuals for their Module 1 Launchpad project: one poster/banner and one concept image matching audience, tone, and purpose.", googleDocLink: "https://docs.google.com/document/d/1ClYT2-9Pd47OQjXAFxLxyn_oUu49EFYoi33CXYypOj4/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 1", description: "The Silent Factory. Students create an emotional AI image of an old man near an abandoned factory, showing memory, pride, sadness, and silence through visual storytelling.", googleDocLink: "https://docs.google.com/document/d/1IBWck7O-2UB1NLIGfBSoSzjJv7DcDm-6PIEZAAMKiiM/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 2", description: "15-Second Project Teaser. Students create a short teaser concept for their Launchpad project with teaser script, visual prompt, video prompt, and final output or storyboard.", googleDocLink: "https://docs.google.com/document/d/11iXkCPWf4Y583x53y_aBEat9gQ5ZSXhhAiOor0iLJfo/edit?usp=drivesdk" },
    ],
  },
  {
    moduleNumber: 1,
    moduleTitle: "Agentic AI Essentials: Prompts to Projects",
    sessionNumber: 5,
    sessionTitle: "AI Audio Generation",
    whatStudentsLearn:
      "Students explore how AI can generate music, voice, and sound effects. They create AI-generated audio assets for podcasts, games, storytelling, videos, and project presentations.",
    tools: ["ElevenLabs", "Suno AI", "Udio"],
    aiType: "Creative AI",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "AI Voiceover Studio. Students use ElevenLabs to create a 60-90 second voiceover for a project, story, product, or learning topic and evaluate clarity, emotion, pacing, and pronunciation.", googleDocLink: "https://docs.google.com/document/d/1CI8JhpEBbwUZrQBuS-O1vo9tcNYiHjCfQSqkQodFwx4/edit?usp=drivesdk" },
      { type: "class_challenge", title: "Class Challenge 2", description: "Soundtrack Lab. Students create a short background music track or jingle using Suno AI or Udio that matches one visual or video concept created in Session 4.", googleDocLink: "https://docs.google.com/document/d/1WEw3OfEapfEoEEvtiw4em3IDmKeePadRG4KkqT4PBqI/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 1", description: "Mini AI Podcast Episode. Students create a 1-2 minute podcast segment using an AI-written script, ElevenLabs narration, and optional Suno AI or Udio background music.", googleDocLink: "https://docs.google.com/document/d/1MAEmEzr6Vi1XgX0_iOWigK3vpNVhhpB0av9tUeY8_2U/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 2", description: "Audio Branding Kit. Students create an audio identity for their Launchpad project with voice style, intro line, outro line, optional jingle, and sound effect idea.", googleDocLink: "https://docs.google.com/document/d/1QVi4tBODsRVhrzccHdS_zfQ9dzNQM8WBsdCD8snLSlM/edit?usp=drivesdk" },
    ],
  },
  {
    moduleNumber: 1,
    moduleTitle: "Agentic AI Essentials: Prompts to Projects",
    sessionNumber: 6,
    sessionTitle: "AI for Task Organisation - The Data Analyst",
    whatStudentsLearn:
      "Students organize tasks, notes, schedules, and information using AI. They use tools like Notion AI, Reclaim AI, ChatGPT, and Claude to plan work, analyze simple data, and turn task chaos into action.",
    tools: ["Notion AI", "Reclaim AI", "ChatGPT", "Claude"],
    aiType: "Smart Data AI",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "Neha's Smart Task Tracker. Students use Notion AI to create a daily task tracker with priorities, scheduled tasks, deadlines, notes, completed work, and progress review.", googleDocLink: "https://docs.google.com/document/d/1hwBPXGrp0QsK9Zu7lPf50NBbXZs6cS7jcBhFh6O5rKo/edit?usp=drivesdk" },
      { type: "class_challenge", title: "Class Challenge 2", description: "Launchpad Project Command Center. Students convert their Module 1 Launchpad project into a task board with milestones, priorities, deadlines, blockers, and next actions.", googleDocLink: "https://docs.google.com/document/d/1wWaf3W8e20irCWGaSolsjnKryPhowgyE0h7qLlH-8Ms/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 1", description: "Arjun's 2-Hour Focus Plan. Students use Reclaim AI or a calendar-planning workflow to schedule a protected 7:00 PM to 9:00 PM study session.", googleDocLink: "https://docs.google.com/document/d/1Sx5X_J7VhJe1Z2MJi3k0OSUMqDJxTWaCTWR2y5CoQWA/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 2", description: "Mini Data Analyst Review. Students create a small table of weekly tasks, time spent, completion status, and difficulty, then use ChatGPT or Claude to analyze productivity patterns.", googleDocLink: "https://docs.google.com/document/d/1dkjyCS-MS5IqXxNW9Xqa1BhVJpUEQEElULCIsqLDv2g/edit?usp=drivesdk" },
    ],
  },
  {
    moduleNumber: 1,
    moduleTitle: "Agentic AI Essentials: Prompts to Projects",
    sessionNumber: 7,
    sessionTitle: "AI without Internet - Going Local",
    whatStudentsLearn:
      "Students learn the difference between proprietary and open-source models, explore Hugging Face, LM Studio, and Ollama, and understand how to run AI locally for privacy, offline access, and project experimentation.",
    tools: ["Hugging Face", "LM Studio", "Ollama"],
    aiType: "Local AI / Offline AI Systems",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "Local AI Test Drive. Students run or explore a local AI model using LM Studio or Ollama, then compare it with ChatGPT, Claude, or Gemini for speed, quality, privacy, ease of use, and limitations.", googleDocLink: "https://docs.google.com/document/d/1ZNbwp2iI9n915WB7QnUEYt_Bu19Okbb5JISeBp9vmRs/edit?usp=drivesdk" },
      { type: "class_challenge", title: "Class Challenge 2", description: "Offline Project Assistant. Students design a local AI assistant for their Launchpad project, defining its role, files or notes, user questions, and privacy benefits.", googleDocLink: "https://docs.google.com/document/d/1lf0DJXPRSEUcZWJ92Hl5J7F0i9Q-O-jv-tUv1Mc56VM/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 1", description: "Open-Source Model Explorer. Students choose one model from Hugging Face or Ollama and review its purpose, size, usage notes, hardware needs, strengths, limitations, and student project use case.", googleDocLink: "https://docs.google.com/document/d/1G9JZKiqDGVCgKvVfHAtgyFikcBWcPtvYXy4hyr4SNRw/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 2", description: "Local RAG Plan. Students plan how a local AI model could answer questions from their own documents or project notes using a simple retrieval-augmented generation workflow.", googleDocLink: "https://docs.google.com/document/d/1GuujEpkXBk1Bvb8JENvYsqhp1JlW0HfQU2KvOUJnxBw/edit?usp=drivesdk" },
    ],
  },
  {
    moduleNumber: 1,
    moduleTitle: "Agentic AI Essentials: Prompts to Projects",
    sessionNumber: 8,
    sessionTitle: "AI Presentations: Pitch Like a Pro / Showcase Session",
    whatStudentsLearn:
      "Students use Gamma to create polished presentations, documents, webpages, or graphics. They learn how to present their AI project with a clear structure: introduction, demo, tools, challenges, results, learning, and future improvements.",
    tools: ["Gamma"],
    aiType: "AI Productivity",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "Krishna's Final Project Showcase. Students use Gamma to create a short presentation for their Module 1 Launchpad project with problem, target user, tools, workflow, demo screenshots, challenge, result, and future improvement.", googleDocLink: "https://docs.google.com/document/d/1x846jq3KwMNBzWf7D5WtH9iwQC3TOMNmSeyXBeLEYNg/edit?usp=drivesdk" },
      { type: "class_challenge", title: "Class Challenge 2", description: "Peer Pitch Clinic. Students present a 2-minute version of their project, collect feedback on clarity, visuals, tool explanation, and confidence, then revise one slide or section in Gamma.", googleDocLink: "https://docs.google.com/document/d/1QKhSYjjFgv9QFeMi2sbEi2bEa3TY3BaYgGLoB8CtHE4/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 1", description: "Final Showcase Deck. Students complete a 6-8 slide Gamma presentation for their Module 1 project with introduction, problem, solution, tools, process, final output, reflection, and future upgrade.", googleDocLink: "https://docs.google.com/document/d/1mqP1XLuDW96FwndPUJiWa4sPgCyz4UkY7aRMmOGLNWE/edit?usp=drivesdk" },
      { type: "home_task", title: "Home Task 2", description: "Module 1 Reflection and Next-Step Plan. Students reflect on prompts, study tools, writing tools, visual tools, audio tools, productivity tools, and local AI, then choose one skill to carry into Module 2.", googleDocLink: "https://docs.google.com/document/d/1WGXUWsOnYV9ghnZzxSvGpi1P68br-GFkK-wiuhNf9dw/edit?usp=drivesdk" },
    ],
  },
];

const commonModuleTwoDeliverables = [
  "Tool used",
  "Prompt or build instructions",
  "Generated output, prototype, design, or plan",
  "Screenshot/link evidence",
  "One refinement note",
  "Short reflection",
];

const commonModuleTwoChecklist = [
  "The output matches the task goal.",
  "The main session tool is used properly.",
  "Evidence is included.",
  "At least one improvement or reflection is included.",
  "The work connects to the capstone journey.",
];

const commonModuleTwoInstructions = [
  "Review the session goal and the main tool for this task.",
  "Open the recommended tool and set up your workspace.",
  "Use the prompt starter or create your own improved version.",
  "Generate, build, test, or design the required output.",
  "Refine the output at least once based on what you observe.",
  "Save screenshots, links, prompts, and notes as evidence.",
  "Write a short reflection on what improved and what still needs work.",
];

const moduleTwoCoursework: CourseworkSession[] = [
  {
    moduleNumber: 2,
    moduleTitle: "Vibe Coding Lab: Idea to App",
    sessionNumber: 1,
    sessionTitle: "Vibe Coding: No-Code App Magic",
    whatStudentsLearn:
      "Students learn how to build a simple app using AI prompts without writing code. They turn an idea into a working app and customize the generated interface.",
    tools: ["Bolt.new"],
    aiType: "Vibe Coding",
    tasks: [
      {
        type: "class_challenge",
        title: "Class Challenge 1",
        description: "Idea to First App. Students use Bolt.new to turn a simple problem into a working no-code AI-generated app prototype.",
        googleDocLink: "",
        mission: "Build your first working app prototype from a simple idea using Bolt.new.",
        scenario:
          "Many students have app ideas but feel blocked because they think they need to know coding first. Bolt.new changes this by letting users describe what they want and generate a working prototype through prompts. In this challenge, you will turn a small real-life problem into a simple app.",
        instructions: [
          "Choose a simple app idea that solves a real problem for students, creators, parents, or teachers.",
          "Open Bolt.new and start with a clear app-building prompt.",
          "Include the app goal, target user, core features, and preferred style.",
          "Generate the first version of the app.",
          "Test the app and identify at least 3 things that should improve.",
          "Refine your prompt and improve the app once.",
          "Record the app link, screenshots, and your final prompt.",
        ],
        prompt:
          "Create a simple web app using Bolt.new.\n\nApp idea: [YOUR APP IDEA]\nTarget user: [USER]\nProblem it solves: [PROBLEM]\nCore features:\n1. [FEATURE 1]\n2. [FEATURE 2]\n3. [FEATURE 3]\n\nDesign style: clean, modern, beginner-friendly.\n\nBuild a working prototype with clear navigation, useful text, and a simple user flow.",
        deliverables: ["App idea and target user", "First Bolt.new prompt", "Working prototype link or screenshot", "3 improvement notes", "Refined prompt", "Final prototype link or screenshot"],
        checklist: ["The app solves a clear problem.", "The prompt includes user, goal, and features.", "The prototype has a visible interface.", "At least one improvement round is completed.", "Evidence is added clearly."],
      },
      {
        type: "class_challenge",
        title: "Class Challenge 2",
        description: "Prompt-to-Feature Upgrade. Students improve their Bolt.new app by adding one useful feature based on user needs.",
        googleDocLink: "",
        mission: "Improve your first Bolt.new prototype by adding one user-focused feature.",
        scenario:
          "A first app prototype is rarely perfect. Good builders improve an app by watching how users might use it and then adding features that make the app more useful. In this challenge, you will choose one feature that improves your first prototype.",
        instructions: ["Review the app you created in Class Challenge 1.", "Identify one feature that would make the app more useful.", "Write a feature upgrade prompt for Bolt.new.", "Ask Bolt.new to add the feature without breaking the existing app.", "Test whether the new feature works.", "Document what changed and whether the feature improved the user experience."],
        prompt:
          "Improve my existing Bolt.new app by adding this feature:\n\nFeature name: [FEATURE NAME]\nWhy users need it: [REASON]\nHow it should work: [STEP-BY-STEP BEHAVIOR]\nWhere it should appear in the app: [LOCATION]\n\nKeep the current app structure. Do not remove existing features. Make the design consistent with the current style.",
        deliverables: ["Feature name", "Reason for adding the feature", "Feature upgrade prompt", "Updated app screenshot/link", "Short before-and-after explanation"],
        checklist: ["The feature solves a real user need.", "The prompt explains how the feature should work.", "Existing app flow is not broken.", "The before-and-after explanation is clear."],
      },
      {
        type: "home_task",
        title: "Home Task 1",
        description: "Personal Utility App. Students create a small Bolt.new app for their own daily life, school, hobby, or routine.",
        googleDocLink: "",
        mission: "Build a small personal utility app using Bolt.new.",
        scenario:
          "Apps become meaningful when they solve a real problem. Your task is to build a small app that helps you personally: planning study time, tracking habits, organizing ideas, managing tasks, or helping with a hobby.",
        instructions: ["Choose one personal problem or routine you want to improve.", "Define who will use the app and what the app should help them do.", "Create a Bolt.new prompt with 3 to 5 core features.", "Generate the app and test it.", "Refine the design or features once.", "Write a short reflection explaining how the app could become part of your Module 2 capstone idea."],
        prompt:
          "Build a personal utility app in Bolt.new.\n\nPurpose: [PURPOSE]\nTarget user: [USER]\nMain problem: [PROBLEM]\nCore features:\n1. [FEATURE 1]\n2. [FEATURE 2]\n3. [FEATURE 3]\nOptional feature: [FEATURE]\n\nUse a simple, clean interface and make the app easy for a beginner to use.",
        deliverables: ["Problem statement", "Target user", "Bolt.new prompt", "App link or screenshots", "One refinement note", "Capstone connection reflection"],
        checklist: ["The app is personal and practical.", "The prompt is specific.", "The app has at least 3 useful features.", "The reflection connects to the capstone journey."],
      },
      {
        type: "home_task",
        title: "Home Task 2",
        description: "App Idea Bank. Students prepare 3 possible Module 2 capstone app ideas and select the strongest one to continue.",
        googleDocLink: "",
        mission: "Create and evaluate 3 possible app ideas for your Module 2 capstone project.",
        scenario:
          "Module 2 is about turning ideas into apps. Before choosing a final project, strong builders compare multiple ideas and select the one that is useful, realistic, and exciting. In this task, you will create an app idea bank.",
        instructions: ["Use ChatGPT, Claude, Gemini, or Bolt.new brainstorming to generate 3 app ideas.", "For each idea, define the user, problem, features, and why it matters.", "Score each idea for usefulness, difficulty, creativity, and buildability.", "Choose one idea to continue into Session 2.", "Write a short project pitch for your selected idea."],
        prompt:
          "Act as a no-code app mentor.\n\nHelp me generate 3 app ideas I can build during Module 2.\n\nFor each idea, include:\n1. App title\n2. Target user\n3. Problem solved\n4. Core features\n5. Why it is useful\n6. Difficulty level\n7. How I could build a first prototype\n\nEnd by helping me choose the strongest idea.",
        deliverables: ["3 app ideas", "Comparison table or scoring notes", "Selected app idea", "Short project pitch", "Reason for choosing the idea"],
        checklist: ["There are 3 distinct ideas.", "Each idea has a clear user and problem.", "The selected idea is realistic.", "The pitch is clear and simple."],
      },
    ],
  },
  {
    moduleNumber: 2,
    moduleTitle: "Vibe Coding Lab: Idea to App",
    sessionNumber: 2,
    sessionTitle: "Vibe Coding: From Idea to App",
    whatStudentsLearn:
      "Students build production-ready apps through conversation with AI agents that design, code, and deploy applications from start to finish.",
    tools: ["Emergent.sh"],
    aiType: "Vibe Coding",
    tasks: [
      {
        type: "class_challenge",
        title: "Class Challenge 1",
        description: "Capstone App Blueprint. Students convert their selected app idea into a structured product blueprint before building.",
        googleDocLink: "",
        mission: "Turn your selected app idea into a clear build-ready product blueprint.",
        scenario:
          "In Session 1, you explored app ideas. Now you will move from idea to build plan. Before using an AI app builder, you need to clearly define what the app does, who it serves, what screens it needs, and what features are essential.",
        instructions: ["Use the app idea selected in Session 1.", "Define the app goal, target users, and problem statement.", "List the main screens needed for the app.", "List must-have features and optional features.", "Write a user flow showing how someone moves through the app.", "Prepare a clean build prompt for Emergent.sh."],
        prompt:
          "Act as a product manager and app architect.\n\nHelp me turn this app idea into a build-ready blueprint:\n[APP IDEA]\n\nCreate:\n1. Problem statement\n2. Target users\n3. App goal\n4. Main screens\n5. Must-have features\n6. Optional features\n7. User flow\n8. Data needed\n9. Build prompt for Emergent.sh",
        deliverables: ["App problem statement", "Target user", "Main screens", "Feature list", "User flow", "Build-ready Emergent.sh prompt"],
        checklist: ["The app idea is clearly defined.", "Screens and features are realistic.", "The user flow makes sense.", "The build prompt is specific enough to use."],
      },
      {
        type: "class_challenge",
        title: "Class Challenge 2",
        description: "Build Conversation Log. Students use Emergent.sh to start building and document the AI-agent conversation.",
        googleDocLink: "",
        mission: "Use Emergent.sh to begin building your app through conversation and document the build process.",
        scenario:
          "AI app agents can design, code, and deploy applications, but they still need clear direction. In this challenge, you will guide Emergent.sh step by step and record how your instructions change the output.",
        instructions: ["Open Emergent.sh.", "Use your build-ready prompt from Class Challenge 1.", "Start the app-building conversation.", "Ask the agent to create the first working version.", "Document the main messages you sent and the changes the agent made.", "Identify one issue or missing feature and ask for a fix.", "Save the app link, screenshots, and build conversation notes."],
        prompt:
          "Build the first working version of my app.\n\nApp name: [APP NAME]\nPurpose: [PURPOSE]\nTarget user: [USER]\nScreens: [SCREENS]\nMust-have features: [FEATURES]\nDesign style: [STYLE]\n\nAfter building, explain what you created and what I should test first.",
        deliverables: ["Initial Emergent.sh prompt", "Build conversation notes", "Prototype link or screenshots", "One issue found", "Fix prompt", "Updated result"],
        checklist: ["The build conversation is documented.", "The prototype is tested.", "At least one fix or improvement is requested.", "The final result is saved."],
      },
      {
        type: "home_task",
        title: "Home Task 1",
        description: "User Flow Upgrade. Students improve their app by adding a better user journey and clearer screen structure.",
        googleDocLink: "",
        mission: "Improve your app's user journey before adding more features.",
        scenario:
          "A working app is not enough if users feel confused. Your task is to review your app from the user's point of view and improve the flow so the app feels easier to use.",
        instructions: ["Open your app prototype from Session 2.", "Pretend you are a first-time user.", "List each step a user takes from opening the app to completing the main task.", "Find confusing or missing steps.", "Ask Emergent.sh to improve the flow.", "Document the updated flow and why it is better."],
        prompt:
          "Review my app's user flow.\n\nCurrent app purpose: [PURPOSE]\nCurrent screens/features: [SCREENS AND FEATURES]\nMain user task: [TASK]\n\nIdentify confusing steps, missing screens, or weak navigation. Then suggest and implement improvements that make the app easier for a first-time user.",
        deliverables: ["Current user flow", "Problems found", "Improvement prompt", "Updated user flow", "Screenshots or link", "Short explanation"],
        checklist: ["The user flow is written step by step.", "Confusing parts are identified.", "The improvement is user-focused.", "The final explanation is clear."],
      },
      {
        type: "home_task",
        title: "Home Task 2",
        description: "Capstone Commitment Pitch. Students finalize the Module 2 capstone app idea and prepare a one-paragraph pitch.",
        googleDocLink: "",
        mission: "Commit to your Module 2 capstone app idea and write a clear pitch.",
        scenario:
          "By Session 2, students should select a project idea so they have enough time to build it across the module. This task locks in your capstone direction and prepares you for design, features, testing, and showcase.",
        instructions: ["Choose your final Module 2 capstone app idea.", "Write a one-paragraph pitch.", "Define the problem, target user, and expected final output.", "List the tools you will likely use across upcoming sessions.", "Create a mini timeline for Sessions 3 to 8.", "Identify one risk and how you will handle it."],
        prompt:
          "Help me finalize my Module 2 capstone app idea.\n\nCreate:\n1. One-paragraph pitch\n2. Problem statement\n3. Target user\n4. Final app goal\n5. Tools I may use\n6. Timeline for Sessions 3 to 8\n7. One risk and solution\n8. Success criteria for the showcase",
        deliverables: ["Final app idea", "One-paragraph pitch", "Problem and user", "Tool plan", "Session timeline", "Risk and solution", "Success criteria"],
        checklist: ["The capstone idea is selected.", "The pitch is clear.", "Timeline covers the remaining sessions.", "Risk and success criteria are included."],
      },
    ],
  },
  {
    moduleNumber: 2,
    moduleTitle: "Vibe Coding Lab: Idea to App",
    sessionNumber: 3,
    sessionTitle: "Figma AI Tools",
    whatStudentsLearn: "Students design frontends using Figma AI tools, including AI design generation and Make features.",
    tools: ["Figma AI"],
    aiType: "Vibe Coding",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "AI Frontend Makeover. Redesign your capstone app's main screen using Figma AI.", googleDocLink: "", mission: "Redesign your capstone app's main screen using Figma AI.", scenario: "Your app may work, but the interface needs to look clear, usable, and attractive. In this challenge, you will use Figma AI to create or improve the frontend design of your capstone app.", instructions: commonModuleTwoInstructions, prompt: "Use Figma AI to design a main screen for your app with a clear layout, user-friendly components, and a style that matches your target audience.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "class_challenge", title: "Class Challenge 2", description: "Clickable Screen Flow. Create a simple multi-screen app flow in Figma for your capstone idea.", googleDocLink: "", mission: "Create a simple multi-screen app flow in Figma for your capstone idea.", scenario: "Users should know where to click and what happens next. In this challenge, you will map your app into screens and connect them as a simple user journey.", instructions: commonModuleTwoInstructions, prompt: "Create a Figma screen flow with 3 to 5 screens, clear navigation, and notes explaining what each screen does.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "home_task", title: "Home Task 1", description: "Design System Starter. Create a mini design system for your capstone app.", googleDocLink: "", mission: "Create a mini design system for your capstone app.", scenario: "A good app needs consistent colors, buttons, fonts, and layout patterns. Your task is to create a small design system that can guide future app screens.", instructions: commonModuleTwoInstructions, prompt: "Create a design system with colors, typography, button styles, card styles, and layout rules for your capstone app.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "home_task", title: "Home Task 2", description: "Before-and-After UI Review. Compare your first app interface with your Figma AI improved design.", googleDocLink: "", mission: "Compare your first app interface with your Figma AI improved design.", scenario: "Design improvement is easier to see when you compare before and after. Your task is to explain how Figma AI improved usability and visual quality.", instructions: commonModuleTwoInstructions, prompt: "Compare the old and new interface and explain improvements in layout, clarity, navigation, and visual consistency.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
    ],
  },
  {
    moduleNumber: 2,
    moduleTitle: "Vibe Coding Lab: Idea to App",
    sessionNumber: 4,
    sessionTitle: "No-Code GPT Wrappers",
    whatStudentsLearn: "Students learn how to build GPT wrappers and AI-powered apps using no-code and AI-assisted tools.",
    tools: ["OpenAI GPTs"],
    aiType: "Vibe Coding",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "Custom GPT Helper. Design a custom GPT assistant that supports your capstone app's users.", googleDocLink: "", mission: "Design a custom GPT assistant that supports your capstone app's users.", scenario: "Many apps become more useful when they include an AI helper. In this challenge, you will design a GPT wrapper that solves one specific user problem inside your app.", instructions: commonModuleTwoInstructions, prompt: "Create a GPT assistant with a clear role, user instructions, conversation starters, allowed behavior, and example responses.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "class_challenge", title: "Class Challenge 2", description: "GPT Feature Integration Plan. Plan how your custom GPT could connect to your capstone app experience.", googleDocLink: "", mission: "Plan how your custom GPT could connect to your capstone app experience.", scenario: "A GPT wrapper should not feel random. It should support the user journey. In this challenge, you will decide where and how the GPT feature belongs inside your app.", instructions: commonModuleTwoInstructions, prompt: "Create a feature plan showing where the GPT assistant appears, what users ask it, and how it improves the app experience.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "home_task", title: "Home Task 1", description: "Knowledge-Based GPT. Create a GPT concept that answers using a specific knowledge base or content set.", googleDocLink: "", mission: "Create a GPT concept that answers using a specific knowledge base or content set.", scenario: "Some GPTs are useful because they are focused on a narrow topic. Your task is to design a GPT that uses selected knowledge, examples, or rules to help a specific user group.", instructions: commonModuleTwoInstructions, prompt: "Prepare a GPT plan with purpose, knowledge content, user questions, refusal rules, and testing prompts.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "home_task", title: "Home Task 2", description: "GPT Safety Test. Test your GPT wrapper for bad, vague, or risky user inputs.", googleDocLink: "", mission: "Test your GPT wrapper for bad, vague, or risky user inputs.", scenario: "AI features must be tested. Your task is to write difficult test prompts and check whether your GPT gives useful, safe, and focused answers.", instructions: commonModuleTwoInstructions, prompt: "Create a test table with user prompt, expected behavior, actual response, issue found, and improvement instruction.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
    ],
  },
  {
    moduleNumber: 2,
    moduleTitle: "Vibe Coding Lab: Idea to App",
    sessionNumber: 5,
    sessionTitle: "Google AI Studio: Gemini Playground / AntiGravity",
    whatStudentsLearn: "Students explore Google AI Studio and Gemini Playground for hands-on AI experimentation and creative projects.",
    tools: ["Google AI Studio"],
    aiType: "Vibe Coding",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "Gemini App Feature Prototype. Prototype one AI-powered feature for your capstone app using Google AI Studio.", googleDocLink: "", mission: "Prototype one AI-powered feature for your capstone app using Google AI Studio.", scenario: "Google AI Studio helps students experiment with Gemini models and turn prompts into app-like AI features. In this challenge, you will prototype one AI feature for your capstone app.", instructions: commonModuleTwoInstructions, prompt: "Build or plan a Gemini-powered feature that takes user input and returns a useful AI output for your app.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "class_challenge", title: "Class Challenge 2", description: "Prompt Settings Lab. Experiment with model instructions and output format in Google AI Studio.", googleDocLink: "", mission: "Experiment with model instructions and output format in Google AI Studio.", scenario: "The same model can behave differently depending on instructions and settings. Your task is to test how system instructions, examples, and output format improve an AI feature.", instructions: commonModuleTwoInstructions, prompt: "Test at least 3 prompt versions and compare the quality, structure, and usefulness of outputs.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "home_task", title: "Home Task 1", description: "AI Feature Test Cases. Create test cases for your Gemini-powered app feature.", googleDocLink: "", mission: "Create test cases for your Gemini-powered app feature.", scenario: "AI features need testing before launch. Your task is to define normal, edge-case, and unclear inputs and check whether the AI output remains useful.", instructions: commonModuleTwoInstructions, prompt: "Prepare a test table with input, expected output, actual output, rating, and improvement note.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "home_task", title: "Home Task 2", description: "Capstone AI Upgrade Plan. Decide how one Gemini feature can upgrade your capstone app.", googleDocLink: "", mission: "Decide how one Gemini feature can upgrade your capstone app.", scenario: "Your capstone app should become smarter as the module progresses. In this task, you will plan how a Gemini-powered feature improves the app experience.", instructions: commonModuleTwoInstructions, prompt: "Write an integration plan with feature purpose, user flow, prompt, input/output format, and success criteria.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
    ],
  },
  {
    moduleNumber: 2,
    moduleTitle: "Vibe Coding Lab: Idea to App",
    sessionNumber: 6,
    sessionTitle: "Exploring Google Labs",
    whatStudentsLearn: "Students experiment with Google Labs tools and explore creative AI experiments.",
    tools: ["Google Whisk.ai"],
    aiType: "Vibe Coding",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "Whisk Visual Experiment. Use Google Whisk to create visual concepts for your capstone app.", googleDocLink: "", mission: "Use Google Whisk to create visual concepts for your capstone app.", scenario: "Google Labs tools encourage creative experimentation. In this challenge, you will use Whisk-style visual exploration to create a visual concept connected to your app idea.", instructions: commonModuleTwoInstructions, prompt: "Create 2 to 3 visual directions for your app, product, mascot, scene, or user experience concept.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "class_challenge", title: "Class Challenge 2", description: "Creative Feature Brainstorm. Use a Google Labs-style experiment to imagine a new creative feature for your app.", googleDocLink: "", mission: "Use a Google Labs-style experiment to imagine a new creative feature for your app.", scenario: "Experimental tools can inspire features you would not think of normally. Your task is to generate a creative app feature idea using visual or concept exploration.", instructions: commonModuleTwoInstructions, prompt: "Generate 3 creative feature ideas, choose one, and explain how it could improve your app.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "home_task", title: "Home Task 1", description: "App Branding Visual Board. Create a visual board for your capstone app using Whisk or another creative AI tool.", googleDocLink: "", mission: "Create a visual board for your capstone app using Whisk or another creative AI tool.", scenario: "A visual board helps define the look and feel of an app. Your task is to create a small moodboard that communicates your app's style.", instructions: commonModuleTwoInstructions, prompt: "Create a moodboard with colors, visual references, app mood, audience fit, and at least 2 generated visuals.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "home_task", title: "Home Task 2", description: "Experiment Reflection. Reflect on how AI experiments can support product design without replacing your idea.", googleDocLink: "", mission: "Reflect on how AI experiments can support product design without replacing your idea.", scenario: "Creative AI can inspire, but the project direction should still come from you. Your task is to explain what the AI helped with and what decisions you made yourself.", instructions: commonModuleTwoInstructions, prompt: "Write a reflection covering what you generated, what you selected, what you rejected, and how the experiment improved your capstone direction.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
    ],
  },
  {
    moduleNumber: 2,
    moduleTitle: "Vibe Coding Lab: Idea to App",
    sessionNumber: 7,
    sessionTitle: "AI Ethics & Responsibility",
    whatStudentsLearn: "Students examine AI bias, misinformation, job displacement, privacy, deepfakes, AI disclosure, cheating concerns, regulation, and create an AI Ethics Code for their school.",
    tools: ["Sensity AI", "Hive AI"],
    aiType: "AI Ethics",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "AI Ethics Audit. Audit your capstone app for privacy, bias, misinformation, and misuse risks.", googleDocLink: "", mission: "Audit your capstone app for privacy, bias, misinformation, and misuse risks.", scenario: "AI-powered apps must be responsible. In this challenge, you will review your own capstone app and identify possible risks before launch.", instructions: commonModuleTwoInstructions, prompt: "Create an ethics audit covering data privacy, bias, misinformation, user safety, disclosure, and misuse prevention.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "class_challenge", title: "Class Challenge 2", description: "Deepfake & Detection Discussion. Explore how AI-generated media can mislead users and how detection tools may help.", googleDocLink: "", mission: "Explore how AI-generated media can mislead users and how detection tools may help.", scenario: "Creative AI can produce powerful images, videos, and voices, but it can also create confusion or harm. Your task is to evaluate a scenario involving deepfakes or AI-generated content.", instructions: commonModuleTwoInstructions, prompt: "Analyze a deepfake or AI-generated media scenario and propose rules for responsible creation, detection, and disclosure.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "home_task", title: "Home Task 1", description: "School AI Ethics Code. Create an AI Ethics Code for students using AI in school projects.", googleDocLink: "", mission: "Create an AI Ethics Code for students using AI in school projects.", scenario: "Students need clear rules for using AI honestly and safely. Your task is to create a practical ethics code that could be used in your school or cohort.", instructions: commonModuleTwoInstructions, prompt: "Write 8 to 10 rules covering disclosure, originality, privacy, bias checking, source verification, and responsible use.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "home_task", title: "Home Task 2", description: "Responsible App Policy. Write a responsible-use policy for your capstone app.", googleDocLink: "", mission: "Write a responsible-use policy for your capstone app.", scenario: "Every AI app should explain what it does, what it does not do, and how users should use it safely. Your task is to write a simple policy for your app.", instructions: commonModuleTwoInstructions, prompt: "Create a policy with data use, AI limitations, user responsibilities, safety rules, and disclosure language.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
    ],
  },
  {
    moduleNumber: 2,
    moduleTitle: "Vibe Coding Lab: Idea to App",
    sessionNumber: 8,
    sessionTitle: "Showcase Session - Present Your Smart AI App",
    whatStudentsLearn: "Students present the AI-powered applications and projects they built throughout the module.",
    tools: ["Gamma"],
    aiType: "AI Productivity",
    tasks: [
      { type: "class_challenge", title: "Class Challenge 1", description: "Smart App Demo Deck. Create a Gamma presentation for your Module 2 capstone app.", googleDocLink: "", mission: "Create a Gamma presentation for your Module 2 capstone app.", scenario: "The showcase is where your app becomes a real product story. In this challenge, you will create a short presentation that explains your app, shows how it works, and highlights the tools you used.", instructions: commonModuleTwoInstructions, prompt: "Create a Gamma deck with problem, target user, app demo, tools used, build journey, AI features, ethics reflection, and next steps.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "class_challenge", title: "Class Challenge 2", description: "Live Demo Rehearsal. Practice a 3-minute live demo of your app and collect feedback.", googleDocLink: "", mission: "Practice a 3-minute live demo of your app and collect feedback.", scenario: "A good demo is clear, short, and focused. Your task is to rehearse your app presentation and improve it based on feedback.", instructions: commonModuleTwoInstructions, prompt: "Present your app flow, explain one AI feature, discuss one challenge, and collect peer feedback.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "home_task", title: "Home Task 1", description: "Final Capstone Submission. Submit your final Module 2 app, presentation, and reflection.", googleDocLink: "", mission: "Submit your final Module 2 app, presentation, and reflection.", scenario: "This is your final Module 2 capstone submission. Your goal is to show what you built, how you built it, and how the app improved across sessions.", instructions: commonModuleTwoInstructions, prompt: "Submit your app link, Gamma deck, screenshots, feature summary, ethics note, and learning reflection.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
      { type: "home_task", title: "Home Task 2", description: "Version 2 Roadmap. Plan how your app could improve after the showcase.", googleDocLink: "", mission: "Plan how your app could improve after the showcase.", scenario: "Real apps continue improving after launch. Your task is to plan the next version of your capstone app based on feedback and your own ideas.", instructions: commonModuleTwoInstructions, prompt: "Create a Version 2 roadmap with user feedback, new features, design improvements, AI upgrades, and launch next steps.\n\nMake the output practical, student-friendly, and connected to my Module 2 capstone app.", deliverables: commonModuleTwoDeliverables, checklist: commonModuleTwoChecklist },
    ],
  },
];

function normalizeDocLink(value: string) {
  const match = value.match(/\/document\/d\/([^/]+)/);
  return match?.[1] ?? value;
}

function normalizeTaskTitle(value: string) {
  return value
    .replace(/^Module\s+\d+\s+·\s+Session\s+\d+:\s+.*?\s+—\s+/i, "")
    .trim()
    .toLowerCase();
}

function detailKey(moduleNumber: number, sessionNumber: number, kind: HomeworkKind, title: string) {
  return `${moduleNumber}:${sessionNumber}:${kind}:${normalizeTaskTitle(title)}`;
}

const allCoursework = [...moduleOneCoursework, ...moduleTwoCoursework];

const courseworkByDocId = new Map<string, CourseworkDetail>(
  allCoursework.flatMap((session) =>
    session.tasks
      .filter((task) => task.googleDocLink)
      .map((task) => [
        normalizeDocLink(task.googleDocLink),
        {
          moduleNumber: session.moduleNumber,
          moduleTitle: session.moduleTitle,
          sessionNumber: session.sessionNumber,
          sessionTitle: session.sessionTitle,
          whatStudentsLearn: session.whatStudentsLearn,
          tools: session.tools,
          aiType: session.aiType,
          mission: task.mission ?? `Complete ${task.title} for ${session.sessionTitle}.`,
          scenario:
            task.scenario ??
            `This task connects to ${session.sessionTitle}. ${session.whatStudentsLearn}`,
          instructions:
            task.instructions ??
            [
              "Open the linked Google Doc and read the task brief carefully.",
              `Use ${session.tools.join(", ")} or the approved session tools to complete the activity.`,
              "Follow the required output format from the document.",
              "Save your work and return to the portal when you are ready to submit.",
            ],
          prompt:
            task.prompt ??
            `Use the linked Google Doc for the full prompt and task instructions for ${session.sessionTitle}.`,
          deliverables:
            task.deliverables ??
            [
              "Completed Google Doc activity",
              "Final output or screenshot where applicable",
              "Short reflection on what you created or learned",
            ],
          checklist:
            task.checklist ??
            [
              "The linked document has been reviewed.",
              "The activity output is complete.",
              "The work connects to the session tools and learning goal.",
              "The final work is ready to submit in the portal.",
            ],
          ...task,
        },
      ]),
  ),
);

const courseworkByTask = new Map<string, CourseworkDetail>(
  allCoursework.flatMap((session) =>
    session.tasks.map((task) => [
      detailKey(session.moduleNumber, session.sessionNumber, task.type, task.title),
      {
        moduleNumber: session.moduleNumber,
        moduleTitle: session.moduleTitle,
        sessionNumber: session.sessionNumber,
        sessionTitle: session.sessionTitle,
        whatStudentsLearn: session.whatStudentsLearn,
        tools: session.tools,
        aiType: session.aiType,
        mission: task.mission ?? `Complete ${task.title} for ${session.sessionTitle}.`,
        scenario:
          task.scenario ??
          `This task connects to ${session.sessionTitle}. ${session.whatStudentsLearn}`,
        instructions:
          task.instructions ??
          [
            "Open the linked Google Doc and read the task brief carefully.",
            `Use ${session.tools.join(", ")} or the approved session tools to complete the activity.`,
            "Follow the required output format from the document.",
            "Save your work and return to the portal when you are ready to submit.",
          ],
        prompt:
          task.prompt ??
          `Use the linked Google Doc for the full prompt and task instructions for ${session.sessionTitle}.`,
        deliverables:
          task.deliverables ??
          [
            "Completed Google Doc activity",
            "Final output or screenshot where applicable",
            "Short reflection on what you created or learned",
          ],
        checklist:
          task.checklist ??
          [
            "The linked document has been reviewed.",
            "The activity output is complete.",
            "The work connects to the session tools and learning goal.",
            "The final work is ready to submit in the portal.",
          ],
        ...task,
      },
    ]),
  ),
);

export function getCourseworkDetail({
  contentUrl,
  title,
  kind,
}: {
  contentUrl: string;
  title: string;
  kind: HomeworkKind;
}) {
  if (contentUrl) {
    const byDoc = courseworkByDocId.get(normalizeDocLink(contentUrl));
    if (byDoc) return byDoc;
  }

  const moduleMatch = title.match(/^Module\s+(\d+)\s+·\s+Session\s+(\d+):/i);
  if (!moduleMatch) return undefined;

  return courseworkByTask.get(detailKey(Number(moduleMatch[1]), Number(moduleMatch[2]), kind, title));
}
