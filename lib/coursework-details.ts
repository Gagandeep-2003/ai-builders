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

const moduleThreeCoursework: CourseworkSession[] = [
  {
    moduleNumber: 3,
    moduleTitle: "Automation Studio: Agents & Workflows",
    sessionNumber: 1,
    sessionTitle: "AI Agents and Tools",
    whatStudentsLearn:
      "Students are introduced to AI agents, tool use, goals, memory, actions, and how agents can support multi-step work.",
    tools: ["ChatGPT", "Claude", "Gemini", "AI agent tools"],
    aiType: "AI Agents",
    tasks: [
      {
        type: "class_challenge",
        title: "Class Challenge 1",
        description: "Agent Role Designer. Students design an AI agent for a real workflow and define its goal, tools, inputs, actions, and success criteria.",
        googleDocLink: "",
        mission: "Design a useful AI agent that can complete a multi-step task instead of only answering one question.",
        scenario:
          "AI agents are different from simple chatbots because they can follow a goal, use tools, make decisions, and complete steps. In this challenge, you will design an agent that helps with a real workflow such as study planning, content creation, customer support, research, or project management.",
        instructions: ["Choose one real workflow that has multiple steps.", "Define the user and the problem the agent will solve.", "Give the agent a clear role and goal.", "List the inputs and tools the agent may need.", "Write the step-by-step actions the agent should take.", "Define what a successful final output looks like."],
        prompt:
          "Act as an AI agent designer.\n\nHelp me design an AI agent for this workflow:\n[WORKFLOW]\n\nCreate:\n1. Agent name\n2. User it helps\n3. Main goal\n4. Inputs needed\n5. Tools needed\n6. Step-by-step actions\n7. Expected final output\n8. Safety rules\n9. Success criteria\n\nMake the agent practical and beginner-friendly.",
        deliverables: ["Workflow chosen", "Agent name and role", "User and problem", "Inputs and tools list", "Step-by-step action plan", "Safety rules", "Success criteria"],
        checklist: ["Agent goal is clear.", "Workflow has more than one step.", "Tools are relevant to the task.", "Safety rules are included.", "Success criteria are measurable."],
      },
      {
        type: "class_challenge",
        title: "Class Challenge 2",
        description: "Human vs Agent Workflow. Students compare a manual workflow with an AI-agent-assisted workflow.",
        googleDocLink: "",
        mission: "Understand how AI agents reduce repetitive work by comparing manual steps with agent-supported steps.",
        scenario:
          "Before building automation, you must understand the current process. In this challenge, you will map how a task is done manually and then redesign it as an AI-agent-supported workflow.",
        instructions: ["Choose a repeated task such as weekly planning, summarizing emails, making posts, researching topics, or organizing files.", "Map the manual workflow step by step.", "Identify slow, repetitive, or error-prone steps.", "Design an AI-agent-assisted version.", "Decide which steps should stay human-controlled.", "Create a comparison table and final recommendation."],
        prompt:
          "Compare a manual workflow with an AI-agent-assisted workflow.\n\nTask: [TASK]\n\nCreate:\n1. Manual workflow steps\n2. Pain points\n3. AI-agent workflow steps\n4. Steps automated by AI\n5. Steps controlled by humans\n6. Time saved estimate\n7. Risks or limitations\n8. Final recommendation",
        deliverables: ["Manual workflow map", "Pain points list", "AI-agent workflow map", "Human-control steps", "Comparison table", "Final recommendation"],
        checklist: ["Manual process is clearly mapped.", "Agent workflow is realistic.", "Human oversight is included.", "Comparison explains time or quality improvement."],
      },
      {
        type: "home_task",
        title: "Home Task 1",
        description: "Personal Agent Idea. Students design a personal AI agent that helps with school, productivity, creativity, or daily life.",
        googleDocLink: "",
        mission: "Create a personal AI agent concept that could become your Module 3 automation project.",
        scenario:
          "Your final Module 3 project will grow across sessions. This task helps you start by choosing an agent idea that can later connect to n8n, Zapier, or ClawBot workflows.",
        instructions: ["Choose one personal area where an AI agent could help you.", "Define the repeated task or problem.", "Describe what the agent should do daily or weekly.", "List tools or apps it might connect to.", "Write 5 user commands the agent should understand.", "Explain what the agent should not do.", "Connect this idea to a possible final automation showcase."],
        prompt:
          "Act as a personal AI automation coach.\n\nHelp me design a personal AI agent for:\n[AREA OR PROBLEM]\n\nInclude:\n1. Agent name\n2. Problem it solves\n3. Daily or weekly tasks\n4. Apps/tools it connects to\n5. Five example user commands\n6. Boundaries and safety rules\n7. First version plan\n8. Future upgrade idea",
        deliverables: ["Personal agent idea", "Problem and user", "Task list", "Tool/app connection list", "5 example commands", "Boundaries", "Final project connection"],
        checklist: ["Agent idea is useful and realistic.", "The task is repeated enough for automation.", "Tools/apps are identified.", "Boundaries are clear.", "Connection to final project is explained."],
      },
      {
        type: "home_task",
        title: "Home Task 2",
        description: "Agent Safety Rules. Students write safety and control rules for an AI agent.",
        googleDocLink: "",
        mission: "Create safety, privacy, and human-approval rules for an AI agent before automation begins.",
        scenario:
          "A powerful agent can make mistakes if it acts without limits. In this task, you will create rules that keep an AI agent safe, transparent, and human-controlled.",
        instructions: ["Choose the AI agent you designed in class or at home.", "List what data the agent can access and what it should never access.", "Define actions that require human approval.", "Define what the agent should do when unsure.", "Write user-facing disclosure text.", "Create a simple safety checklist."],
        prompt:
          "Act as an AI safety reviewer.\n\nReview this agent:\n[AGENT DESCRIPTION]\n\nCreate safety rules for:\n1. Data access\n2. Privacy boundaries\n3. Actions requiring human approval\n4. What to do when unsure\n5. Mistake handling\n6. User disclosure\n7. Safety checklist\n8. Final risk rating",
        deliverables: ["Agent description", "Data access rules", "Human approval rules", "Uncertainty handling", "User disclosure text", "Safety checklist"],
        checklist: ["Privacy boundaries are specific.", "Human approval is required for risky actions.", "User disclosure is understandable.", "Safety checklist is practical."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: "Automation Studio: Agents & Workflows",
    sessionNumber: 2,
    sessionTitle: "Introduction to AI Automation",
    whatStudentsLearn:
      "Students learn what automation is, why it matters, and how tools like n8n can connect triggers, AI processing, and outputs.",
    tools: ["n8n"],
    aiType: "AI Automation",
    tasks: [
      {
        type: "class_challenge",
        title: "Class Challenge 1",
        description: "Automation Map. Students map a simple workflow using trigger, action, AI step, and output.",
        googleDocLink: "",
        mission: "Design your first automation map before building it in n8n.",
        scenario:
          "Automation is easier when the workflow is clear. In this challenge, you will map a simple process such as form response to summary, email to task, or topic to content idea.",
        instructions: ["Choose a simple repeated workflow.", "Identify the trigger that starts the workflow.", "List the data that enters the workflow.", "Decide where AI should be used.", "Define the final output.", "Draw or write the workflow as Trigger -> AI Step -> Action -> Output.", "Explain why automation is useful for this case."],
        prompt:
          "Act as an automation architect.\n\nHelp me design an automation for:\n[WORKFLOW]\n\nCreate:\n1. Trigger\n2. Input data\n3. AI processing step\n4. Output action\n5. Apps/tools involved\n6. Workflow diagram in text\n7. Why this should be automated\n8. Possible failure points",
        deliverables: ["Workflow idea", "Trigger", "Input data", "AI step", "Output", "Text workflow diagram", "Failure points"],
        checklist: ["Trigger is clear.", "AI step has a purpose.", "Output is specific.", "Failure points are considered."],
      },
      {
        type: "class_challenge",
        title: "Class Challenge 2",
        description: "n8n Node Detective. Students identify the role of different nodes in a sample automation.",
        googleDocLink: "",
        mission: "Understand how n8n workflows are built from connected nodes.",
        scenario:
          "n8n workflows are made of nodes. Each node has a job: start, receive data, transform data, call AI, send output, or notify someone. In this challenge, you will break down a workflow into node roles.",
        instructions: ["Open or review a simple n8n workflow example.", "Identify the trigger node.", "Identify processing or transformation nodes.", "Identify where AI could be added.", "Identify the output or notification node.", "Create a node-role table.", "Suggest one improvement to the workflow."],
        prompt:
          "Explain this n8n workflow in simple terms:\n[PASTE OR DESCRIBE WORKFLOW]\n\nCreate a table with:\n1. Node name\n2. Node purpose\n3. Input\n4. Output\n5. Why it is needed\n6. Possible improvement",
        deliverables: ["Workflow reviewed", "Node-role table", "AI insertion point", "Output node explanation", "One improvement idea"],
        checklist: ["Trigger node is identified.", "Node roles are accurate.", "AI insertion point makes sense.", "Improvement idea is practical."],
      },
      {
        type: "home_task",
        title: "Home Task 1",
        description: "Automation Opportunity List. Students list 5 tasks in their life or project that could be automated.",
        googleDocLink: "",
        mission: "Find automation opportunities that could become your Module 3 project.",
        scenario:
          "Automation should solve real repeated problems. In this task, you will look at your school, personal routine, content work, or app project and identify tasks that repeat often.",
        instructions: ["List 5 repeated tasks from school, life, content, or project work.", "For each task, identify trigger, input, action, and output.", "Rate each task for usefulness, difficulty, and time saved.", "Choose the strongest automation idea.", "Explain why it should be built first.", "Prepare a first workflow sketch."],
        prompt:
          "Act as an automation coach.\n\nHelp me find 5 tasks I can automate.\n\nFor each task, include:\n1. Task name\n2. Trigger\n3. Input\n4. Output\n5. Apps/tools involved\n6. Time saved\n7. Difficulty\n8. Usefulness score\n\nEnd by helping me choose the best first automation.",
        deliverables: ["5 automation ideas", "Trigger/input/output for each", "Usefulness and difficulty scores", "Selected best idea", "First workflow sketch"],
        checklist: ["All 5 ideas are repeated tasks.", "Trigger and output are clear.", "Scoring is thoughtful.", "Selected idea is realistic."],
      },
      {
        type: "home_task",
        title: "Home Task 2",
        description: "Manual-to-Automated Reflection. Students document one task before and after automation.",
        googleDocLink: "",
        mission: "Explain how automation changes a real workflow.",
        scenario:
          "Good automation does not just save clicks; it changes how work moves. In this task, you will document how one workflow looks manually and how it could work after automation.",
        instructions: ["Choose one repeated manual task.", "Write the current manual process.", "Estimate time and effort required.", "Write the automated version.", "Identify tools needed.", "Explain risks or checks needed.", "Write a short before-and-after reflection."],
        prompt:
          "Compare my manual workflow with an automated version.\n\nManual task: [TASK]\n\nCreate:\n1. Current manual steps\n2. Time and effort estimate\n3. Automated workflow\n4. Tools needed\n5. AI role if any\n6. Human approval checkpoints\n7. Benefits\n8. Risks",
        deliverables: ["Manual process", "Automated process", "Tool list", "Human approval points", "Benefits and risks", "Reflection"],
        checklist: ["Manual workflow is specific.", "Automated workflow is realistic.", "Human checks are included.", "Reflection explains the difference."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: "Automation Studio: Agents & Workflows",
    sessionNumber: 3,
    sessionTitle: "Build Your First AI Workflow",
    whatStudentsLearn:
      "Students build a simple n8n automation using triggers, AI processing, outputs, nodes, connections, and AI nodes.",
    tools: ["n8n"],
    aiType: "AI Automation",
    tasks: [
      {
        type: "class_challenge",
        title: "Class Challenge 1",
        description: "First AI Workflow Build. Students build a simple n8n workflow that takes input, uses AI, and creates an output.",
        googleDocLink: "",
        mission: "Build your first functional AI workflow in n8n.",
        scenario:
          "You have already mapped automation. Now you will build a simple workflow that starts with an input, sends it to an AI step, and produces a useful output such as a summary, email draft, task list, or content idea.",
        instructions: ["Open n8n.", "Create a new workflow.", "Add a trigger or manual trigger.", "Add an AI or text-processing step.", "Add an output step such as note, email draft, document, or response.", "Run the workflow with sample input.", "Save screenshots of the workflow and output."],
        prompt:
          "Help me build a beginner n8n AI workflow.\n\nWorkflow goal: [GOAL]\nInput: [INPUT]\nAI task: [SUMMARIZE / CLASSIFY / DRAFT / EXTRACT / PLAN]\nOutput: [OUTPUT]\n\nGive me a node-by-node plan and a test input I can use.",
        deliverables: ["Workflow goal", "Node list", "Test input", "AI output", "Workflow screenshot", "Run result"],
        checklist: ["Workflow has trigger, AI step, and output.", "Workflow runs with test input.", "Output matches goal.", "Evidence is clear."],
      },
      {
        type: "class_challenge",
        title: "Class Challenge 2",
        description: "Debug the Workflow. Students identify and fix one issue in their n8n automation.",
        googleDocLink: "",
        mission: "Learn how to test and debug an automation workflow.",
        scenario:
          "Real workflows often fail because of missing data, wrong field mapping, unclear prompts, or broken outputs. In this challenge, you will intentionally review your workflow and fix one issue.",
        instructions: ["Run your Class Challenge 1 workflow.", "Look for an issue, weak output, wrong mapping, or unclear result.", "Identify the node where the issue happens.", "Update the prompt, field mapping, or node setting.", "Run the workflow again.", "Document before and after results."],
        prompt:
          "Act as an n8n workflow debugger.\n\nMy workflow is:\n[DESCRIBE WORKFLOW]\n\nProblem:\n[DESCRIBE ISSUE]\n\nHelp me identify:\n1. Likely cause\n2. Node to check\n3. Field or prompt to fix\n4. Test input\n5. Expected corrected output",
        deliverables: ["Issue found", "Node causing issue", "Fix applied", "Before result", "After result", "Debug reflection"],
        checklist: ["Issue is clearly described.", "Fix targets the correct node or prompt.", "Workflow is retested.", "Before-and-after evidence is included."],
      },
      {
        type: "home_task",
        title: "Home Task 1",
        description: "Student Helper Workflow. Students build or design an n8n workflow that helps with school or productivity.",
        googleDocLink: "",
        mission: "Create a practical student-focused AI workflow.",
        scenario:
          "AI workflows become useful when they solve daily problems. This task asks you to build or plan a workflow that helps with study notes, reminders, summaries, assignments, or task planning.",
        instructions: ["Choose a student problem.", "Define the trigger and input.", "Use AI to summarize, plan, rewrite, classify, or extract.", "Define the output.", "Build the workflow in n8n if possible.", "If building is not possible, create a detailed node plan.", "Test or simulate the workflow."],
        prompt:
          "Design an n8n workflow for a student helper.\n\nProblem: [PROBLEM]\nInput: [INPUT]\nAI action: [ACTION]\nOutput: [OUTPUT]\n\nCreate a node plan with trigger, AI step, output step, test data, and improvement ideas.",
        deliverables: ["Student problem", "Workflow plan or build", "Node list", "Test data", "Output evidence", "Improvement idea"],
        checklist: ["Problem is student-focused.", "Workflow is practical.", "AI step adds value.", "Testing or simulation is included."],
      },
      {
        type: "home_task",
        title: "Home Task 2",
        description: "Automation Build Log. Students keep a build diary for their first automation.",
        googleDocLink: "",
        mission: "Document your automation process like a real workflow builder.",
        scenario:
          "Automation builders need to record what they tried, what failed, and what improved. This task helps you create a build log for your first workflow so you can explain your process in the final showcase.",
        instructions: ["Choose the workflow you built or planned.", "Write the first version of the workflow.", "Record problems, errors, or weak outputs.", "Write how you fixed or improved them.", "Save screenshots or notes.", "Write a final summary of what you learned."],
        prompt:
          "Help me write a build log for my n8n automation.\n\nWorkflow: [WORKFLOW]\n\nCreate sections for:\n1. Goal\n2. First version\n3. Test input\n4. Problem found\n5. Fix attempted\n6. Improved result\n7. What I learned\n8. Next improvement",
        deliverables: ["Workflow goal", "First version notes", "Problems found", "Fixes", "Screenshots/links", "Learning summary"],
        checklist: ["Build process is documented.", "Problems and fixes are included.", "Evidence is included.", "Learning summary is honest."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: "Automation Studio: Agents & Workflows",
    sessionNumber: 4,
    sessionTitle: "AI Workflow: Content Pipeline",
    whatStudentsLearn:
      "Students build an advanced n8n content pipeline that turns a topic into a blog post, social caption, image alt text, and ready-to-publish content package.",
    tools: ["n8n", "OpenAI / Claude", "Google Docs or Sheets"],
    aiType: "AI Automation",
    tasks: [
      {
        type: "class_challenge",
        title: "Class Challenge 1",
        description: "Topic to Content Package. Students build a content pipeline that turns one topic into multiple content outputs.",
        googleDocLink: "",
        mission: "Create a content automation pipeline that transforms one idea into a complete content package.",
        scenario:
          "Creators often need to turn one idea into many formats: blog, captions, summaries, and image text. In this challenge, you will design or build an AI workflow that produces multiple outputs from one topic.",
        instructions: ["Choose one topic related to your project, school, business, or creativity.", "Define the input format.", "Create an AI prompt that generates a blog outline, short post, caption, and image alt text.", "Build or plan the workflow in n8n.", "Send the outputs to a document, sheet, or clear response.", "Review the outputs and improve the prompt once."],
        prompt:
          "Create a content package from this topic:\n[TOPIC]\n\nGenerate:\n1. Blog title\n2. Blog outline\n3. Short educational post\n4. Social media caption\n5. Image alt text\n6. Hashtag ideas\n7. Call-to-action\n\nKeep the tone clear, useful, and age-appropriate.",
        deliverables: ["Topic chosen", "Workflow/node plan", "Prompt used", "Blog outline", "Social caption", "Image alt text", "Refinement note"],
        checklist: ["One topic creates multiple outputs.", "Outputs are organized.", "Prompt is refined once.", "Pipeline could be repeated with new topics."],
      },
      {
        type: "class_challenge",
        title: "Class Challenge 2",
        description: "Audience Tone Switcher. Students adapt the same content for different audiences using AI automation.",
        googleDocLink: "",
        mission: "Build or design a workflow that changes content tone for different audiences.",
        scenario:
          "Good content changes depending on the audience. A message for students is different from a message for parents, teachers, or customers. In this challenge, you will use AI to adapt one content idea for different groups.",
        instructions: ["Choose one content idea.", "Select 3 audiences.", "Write one base message.", "Use AI to adapt the message for each audience.", "If using n8n, create branches or repeated AI steps.", "Compare the outputs and explain what changed."],
        prompt:
          "Adapt this content idea for different audiences:\n[CONTENT IDEA]\n\nAudiences:\n1. Students\n2. Parents or teachers\n3. General public/customers\n\nFor each audience, create:\n1. Tone\n2. Short message\n3. Call-to-action\n4. Words to avoid\n5. Why this version fits the audience",
        deliverables: ["Base content idea", "3 audience versions", "Tone notes", "Workflow or prompt plan", "Comparison explanation"],
        checklist: ["Each audience version is different.", "Tone choices are explained.", "Content stays accurate.", "Comparison is clear."],
      },
      {
        type: "home_task",
        title: "Home Task 1",
        description: "Weekly Content Engine. Students create a workflow plan for generating a weekly content calendar.",
        googleDocLink: "",
        mission: "Design a repeatable AI content workflow for one week of content.",
        scenario:
          "A content pipeline becomes powerful when it can be reused. In this task, you will design a weekly content engine that generates ideas, captions, and publishing notes from a single theme.",
        instructions: ["Choose one weekly theme.", "Generate 5 content ideas.", "Create captions or post summaries for each idea.", "Add recommended format: blog, short video, carousel, or infographic.", "Add a simple posting schedule.", "Explain how the workflow could be automated in n8n."],
        prompt:
          "Create a weekly content calendar for this theme:\n[THEME]\n\nGenerate:\n1. Five content ideas\n2. Format for each idea\n3. Caption or post summary\n4. Target audience\n5. Publishing day\n6. Call-to-action\n7. How this could be automated in n8n",
        deliverables: ["Weekly theme", "5 content ideas", "Captions/summaries", "Publishing schedule", "n8n automation plan", "Reflection"],
        checklist: ["Calendar has 5 useful ideas.", "Each idea has a format and audience.", "Schedule is realistic.", "Automation plan is clear."],
      },
      {
        type: "home_task",
        title: "Home Task 2",
        description: "Capstone Content Pipeline. Students connect the content pipeline idea to their final automation project.",
        googleDocLink: "",
        mission: "Plan how a content pipeline can support your Module 3 final automation showcase.",
        scenario:
          "Your final project should show a useful workflow. This task helps you decide whether your capstone automation can include a content pipeline, reporting pipeline, or notification pipeline.",
        instructions: ["Review your Module 3 automation project idea.", "Decide what content or report the workflow could generate.", "Define the input, AI processing, and output.", "List where the output should be saved or sent.", "Write the prompt for the AI step.", "Create a test example."],
        prompt:
          "Help me add a content or report pipeline to my automation project.\n\nProject idea: [PROJECT]\n\nCreate:\n1. Input\n2. AI processing step\n3. Output format\n4. Destination app\n5. Prompt for AI step\n6. Test example\n7. Success criteria\n8. Possible improvements",
        deliverables: ["Project connection", "Input/process/output plan", "Prompt", "Test example", "Destination app", "Success criteria"],
        checklist: ["Pipeline connects to the capstone idea.", "Input and output are clear.", "Prompt is reusable.", "Success criteria are included."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: "Automation Studio: Agents & Workflows",
    sessionNumber: 5,
    sessionTitle: "Advanced Automations using Zapier",
    whatStudentsLearn:
      "Students create advanced automation workflows using Zapier to connect apps and automate complex multi-step processes.",
    tools: ["Zapier"],
    aiType: "AI Automation",
    tasks: [
      {
        type: "class_challenge",
        title: "Class Challenge 1",
        description: "Zapier Multi-App Workflow. Students design a Zapier workflow connecting two or more apps.",
        googleDocLink: "",
        mission: "Create a multi-app automation plan using Zapier.",
        scenario:
          "Zapier helps connect apps without writing code. In this challenge, you will design a workflow that starts in one app and automatically triggers actions in another app.",
        instructions: ["Choose a workflow involving at least two apps.", "Define the trigger app and trigger event.", "Define the action app and action result.", "Add one filter, condition, or formatting step if possible.", "Write the Zapier setup plan.", "Test or simulate the workflow with sample data."],
        prompt:
          "Design a Zapier automation.\n\nWorkflow goal: [GOAL]\nTrigger app: [APP]\nTrigger event: [EVENT]\nAction app: [APP]\nAction result: [RESULT]\n\nInclude optional filter, test data, expected output, and possible failure points.",
        deliverables: ["Workflow goal", "Trigger app/event", "Action app/result", "Filter or condition", "Test data", "Expected output"],
        checklist: ["At least two apps are connected.", "Trigger and action are clear.", "Test data is included.", "Failure points are considered."],
      },
      {
        type: "class_challenge",
        title: "Class Challenge 2",
        description: "Lead-to-Message Automation. Students create a Zapier workflow for responding to a form, lead, or request.",
        googleDocLink: "",
        mission: "Design an automation that responds to a user submission or request.",
        scenario:
          "Many real businesses automate form responses, signups, leads, and support requests. In this challenge, you will design a workflow that receives user input and sends a helpful response or records it.",
        instructions: ["Choose a form or request scenario.", "Define the input fields.", "Create a trigger from form submission or new row.", "Create an action such as email, message, spreadsheet update, or task creation.", "Add a response template.", "Explain how this saves time and reduces missed follow-ups."],
        prompt:
          "Create a Zapier workflow for a new submission.\n\nScenario: [SCENARIO]\nInput fields: [FIELDS]\n\nDesign:\n1. Trigger\n2. Filter or condition\n3. Action 1\n4. Action 2 if needed\n5. Message template\n6. Data storage plan\n7. Test example",
        deliverables: ["Scenario", "Input fields", "Trigger/action plan", "Response template", "Storage plan", "Test example"],
        checklist: ["Submission flow is clear.", "Response is useful.", "Data storage is planned.", "Workflow reduces manual follow-up."],
      },
      {
        type: "home_task",
        title: "Home Task 1",
        description: "Zapier vs n8n Comparison. Students compare Zapier and n8n for their automation project.",
        googleDocLink: "",
        mission: "Decide whether Zapier or n8n is better for your final automation idea.",
        scenario:
          "Different automation tools fit different needs. In this task, you will compare Zapier and n8n based on ease of use, flexibility, cost, integrations, and project fit.",
        instructions: ["Choose your Module 3 automation idea.", "List what apps/tools it needs.", "Compare how Zapier would handle it.", "Compare how n8n would handle it.", "Identify pros and cons of each.", "Choose the better tool for your project and explain why."],
        prompt:
          "Compare Zapier and n8n for this automation project:\n[PROJECT]\n\nEvaluate:\n1. Ease of setup\n2. Flexibility\n3. Integrations\n4. AI support\n5. Cost/limitations\n6. Best fit\n7. Final recommendation",
        deliverables: ["Project idea", "Tool needs", "Zapier pros/cons", "n8n pros/cons", "Final tool recommendation"],
        checklist: ["Comparison is based on the project.", "Both tools are evaluated fairly.", "Recommendation is clear.", "Limitations are included."],
      },
      {
        type: "home_task",
        title: "Home Task 2",
        description: "Automation Failure Plan. Students create a fallback plan for an automation that may fail.",
        googleDocLink: "",
        mission: "Create a plan for what happens when automation breaks.",
        scenario:
          "Real automations can fail because apps disconnect, fields change, AI outputs are weak, or users submit messy data. This task helps you design a backup plan.",
        instructions: ["Choose one workflow from n8n or Zapier.", "List 5 things that could go wrong.", "For each failure, define how the system or user should respond.", "Create a notification or logging plan.", "Decide when a human should review the workflow.", "Write a final reliability checklist."],
        prompt:
          "Act as an automation reliability reviewer.\n\nReview this workflow:\n[WORKFLOW]\n\nCreate:\n1. Five possible failures\n2. Cause of each failure\n3. How to detect it\n4. What should happen next\n5. Human review point\n6. Logging or notification plan\n7. Reliability checklist",
        deliverables: ["Workflow reviewed", "5 failure risks", "Detection plan", "Human review plan", "Notification/logging plan", "Reliability checklist"],
        checklist: ["Risks are realistic.", "Fallback steps are clear.", "Human review is included.", "Checklist improves reliability."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: "Automation Studio: Agents & Workflows",
    sessionNumber: 6,
    sessionTitle: "Introduction to ClawBot",
    whatStudentsLearn:
      "Students learn ClawBot foundations, including installation, configuration, VPS setup, and launching an automation hub.",
    tools: ["ClawBot"],
    aiType: "AI Automation",
    tasks: [
      {
        type: "class_challenge",
        title: "Class Challenge 1",
        description: "ClawBot Setup Map. Students create a setup plan for launching a ClawBot automation hub.",
        googleDocLink: "",
        mission: "Plan the setup of a ClawBot automation hub step by step.",
        scenario:
          "Before launching an automation hub, you need a clear setup plan: environment, configuration, access, skills, and testing. In this challenge, you will map how ClawBot would be prepared for a real use case.",
        instructions: ["Define what your ClawBot hub should help automate.", "List setup requirements such as environment, account, VPS, or configuration.", "List the channels or tools it may connect to.", "Define the first skill or workflow it should support.", "Create a test plan for confirming the setup works.", "Write questions or blockers you need to resolve."],
        prompt:
          "Act as a ClawBot setup mentor.\n\nHelp me plan a ClawBot automation hub for:\n[USE CASE]\n\nCreate:\n1. Goal of the hub\n2. Setup requirements\n3. Tools/channels to connect\n4. First skill to add\n5. Configuration checklist\n6. Test plan\n7. Possible blockers",
        deliverables: ["ClawBot use case", "Setup requirements", "Channel/tool list", "First skill idea", "Configuration checklist", "Test plan"],
        checklist: ["Hub goal is clear.", "Setup requirements are listed.", "First skill is practical.", "Testing plan is included."],
      },
      {
        type: "class_challenge",
        title: "Class Challenge 2",
        description: "Automation Hub Use Case. Students design one real ClawBot workflow for a team, class, or project.",
        googleDocLink: "",
        mission: "Design a real automation hub workflow that ClawBot could support.",
        scenario:
          "ClawBot becomes valuable when it supports a team workflow. In this challenge, you will design how it could help a class, club, business, or project team handle repeated tasks.",
        instructions: ["Choose a team or group scenario.", "Identify the repeated task or communication problem.", "Define the trigger and expected response.", "List what information ClawBot needs.", "Write sample commands or messages.", "Define how the workflow should report completion."],
        prompt:
          "Design a ClawBot workflow for this group:\n[GROUP]\n\nProblem: [PROBLEM]\n\nCreate:\n1. Workflow name\n2. Trigger command/message\n3. Data needed\n4. ClawBot action steps\n5. Output message\n6. Completion report\n7. Human approval point if needed",
        deliverables: ["Group scenario", "Workflow name", "Trigger command", "Required data", "Action steps", "Output message", "Completion report"],
        checklist: ["Workflow solves a group problem.", "Trigger is easy to understand.", "Output is clear.", "Human approval is added if needed."],
      },
      {
        type: "home_task",
        title: "Home Task 1",
        description: "ClawBot Launch Checklist. Students create a launch checklist for a safe and organized ClawBot setup.",
        googleDocLink: "",
        mission: "Prepare a launch checklist for using ClawBot responsibly.",
        scenario:
          "Launching an automation hub without a checklist can lead to broken workflows, wrong permissions, or messy outputs. This task helps you prepare a careful launch process.",
        instructions: ["Choose a ClawBot use case.", "List setup requirements.", "List access and permission rules.", "List test cases.", "List safety and rollback steps.", "Create a final launch checklist."],
        prompt:
          "Create a ClawBot launch checklist for:\n[USE CASE]\n\nInclude:\n1. Setup steps\n2. Required accounts/access\n3. Permissions\n4. Skills/workflows to enable\n5. Test cases\n6. Safety checks\n7. Rollback plan\n8. Final launch approval checklist",
        deliverables: ["Use case", "Setup checklist", "Permission rules", "Test cases", "Safety checks", "Rollback plan"],
        checklist: ["Checklist is practical.", "Permissions are considered.", "Test cases are included.", "Rollback plan is clear."],
      },
      {
        type: "home_task",
        title: "Home Task 2",
        description: "ClawBot Project Fit. Students decide whether ClawBot fits their final automation project.",
        googleDocLink: "",
        mission: "Evaluate whether ClawBot should be part of your final Module 3 project.",
        scenario:
          "Not every automation needs ClawBot. This task helps you decide whether your capstone should use ClawBot, n8n, Zapier, or a combination.",
        instructions: ["Describe your final automation project idea.", "List what the automation must do.", "Compare ClawBot, n8n, and Zapier for your idea.", "Identify where ClawBot adds value.", "Decide whether to include ClawBot.", "Write your tool decision clearly."],
        prompt:
          "Evaluate tool fit for my automation project:\n[PROJECT]\n\nCompare:\n1. ClawBot\n2. n8n\n3. Zapier\n\nFor each, explain strengths, limitations, setup difficulty, and project fit. End with a final recommendation.",
        deliverables: ["Project description", "Tool comparison", "ClawBot value", "Final tool decision", "Reasoning"],
        checklist: ["Project needs are clear.", "Tools are compared fairly.", "Decision is explained.", "ClawBot is included only if useful."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: "Automation Studio: Agents & Workflows",
    sessionNumber: 7,
    sessionTitle: "Mastering ClawBot Skills",
    whatStudentsLearn:
      "Students implement document and file handling skills, integrate channel connectors, and extend ClawBot with custom skills.",
    tools: ["ClawBot"],
    aiType: "AI Automation",
    tasks: [
      {
        type: "class_challenge",
        title: "Class Challenge 1",
        description: "Custom Skill Designer. Students design one ClawBot skill for document, file, or channel handling.",
        googleDocLink: "",
        mission: "Design a custom ClawBot skill that performs a useful action.",
        scenario:
          "A skill makes an automation hub more powerful. In this challenge, you will design one skill that helps users handle documents, files, messages, or project information.",
        instructions: ["Choose one skill type: document summary, file organization, channel update, task creation, or report generation.", "Define the command that triggers the skill.", "Define the input data.", "Define the action steps.", "Define the final output.", "Write test cases for the skill.", "Add safety or confirmation rules."],
        prompt:
          "Act as a ClawBot custom skill designer.\n\nDesign a skill for:\n[SKILL PURPOSE]\n\nInclude:\n1. Skill name\n2. Trigger command\n3. Inputs needed\n4. Step-by-step behavior\n5. Output format\n6. Test cases\n7. Confirmation or safety rules\n8. Success criteria",
        deliverables: ["Skill name", "Trigger command", "Input requirements", "Behavior steps", "Output format", "Test cases", "Safety rules"],
        checklist: ["Skill has a clear purpose.", "Trigger command is simple.", "Output format is defined.", "Test cases and safety rules are included."],
      },
      {
        type: "class_challenge",
        title: "Class Challenge 2",
        description: "Channel Connector Flow. Students design how ClawBot sends updates through a communication channel.",
        googleDocLink: "",
        mission: "Design a channel-connected workflow for updates, summaries, or alerts.",
        scenario:
          "Automation becomes more useful when it reaches people in the right place. In this challenge, you will design a ClawBot connector flow that sends useful information to a channel such as chat, email, or project workspace.",
        instructions: ["Choose the channel or destination.", "Choose what event should trigger an update.", "Define what message should be sent.", "Define the message format.", "Add rules for who should receive it.", "Add failure or retry behavior.", "Create a sample output message."],
        prompt:
          "Design a ClawBot channel connector workflow.\n\nChannel: [CHANNEL]\nTrigger: [TRIGGER]\nAudience: [AUDIENCE]\n\nCreate:\n1. Message purpose\n2. Data included\n3. Message template\n4. Delivery rules\n5. Failure handling\n6. Sample output\n7. Improvement idea",
        deliverables: ["Channel selected", "Trigger", "Audience", "Message template", "Delivery rules", "Sample output", "Failure handling"],
        checklist: ["Channel choice matches the workflow.", "Message is useful and concise.", "Delivery rules are clear.", "Failure handling is considered."],
      },
      {
        type: "home_task",
        title: "Home Task 1",
        description: "File Handling Skill Plan. Students design a ClawBot skill that processes uploaded files.",
        googleDocLink: "",
        mission: "Plan a file-handling skill for a real document or project workflow.",
        scenario:
          "Many automation systems need to read, summarize, rename, sort, or extract information from files. In this task, you will design a ClawBot file-handling skill.",
        instructions: ["Choose a file type such as PDF, document, spreadsheet, image, or notes.", "Define what the skill should do with the file.", "List inputs and expected outputs.", "Write a sample command.", "Define error cases such as wrong file type or missing data.", "Explain how the skill supports your final automation project."],
        prompt:
          "Design a ClawBot file-handling skill.\n\nFile type: [FILE TYPE]\nTask: [TASK]\n\nInclude:\n1. Skill name\n2. Sample command\n3. Input requirements\n4. Processing steps\n5. Output format\n6. Error cases\n7. Project connection",
        deliverables: ["File type", "Skill name", "Sample command", "Processing steps", "Output format", "Error cases", "Project connection"],
        checklist: ["File type and task are clear.", "Output format is specific.", "Error cases are realistic.", "Project connection is explained."],
      },
      {
        type: "home_task",
        title: "Home Task 2",
        description: "Final Automation Architecture. Students map their final Module 3 automation system.",
        googleDocLink: "",
        mission: "Create a complete architecture map for your final automation showcase.",
        scenario:
          "Before the final showcase, you need to know how all parts connect: trigger, tools, AI step, data, output, and user. This task helps you map your complete automation system.",
        instructions: ["Choose your final Module 3 automation project.", "List all tools involved.", "Define trigger, AI step, actions, and output.", "Show where ClawBot, n8n, or Zapier fits.", "Add safety and human review checkpoints.", "Create a text-based architecture diagram.", "List what still needs to be built or tested."],
        prompt:
          "Create an architecture map for my final automation project:\n[PROJECT]\n\nInclude:\n1. User\n2. Trigger\n3. Input data\n4. Tools/apps\n5. AI processing step\n6. Automation actions\n7. Output/destination\n8. Human review point\n9. Safety checks\n10. What still needs testing",
        deliverables: ["Final project description", "Tool list", "Architecture diagram", "Human review points", "Safety checks", "Testing to-do list"],
        checklist: ["Architecture is complete.", "Tools are connected logically.", "Human review is included.", "Testing plan is clear."],
      },
    ],
  },
  {
    moduleNumber: 3,
    moduleTitle: "Automation Studio: Agents & Workflows",
    sessionNumber: 8,
    sessionTitle: "Showcase Session - Present Your Smart Automation",
    whatStudentsLearn:
      "Students present their final automation projects and explain the workflow, tools, AI steps, testing, results, and future improvements.",
    tools: ["Gamma", "n8n", "Zapier", "ClawBot"],
    aiType: "AI Productivity",
    tasks: [
      {
        type: "class_challenge",
        title: "Class Challenge 1",
        description: "Automation Showcase Deck. Students create a final presentation for their Module 3 automation project.",
        googleDocLink: "",
        mission: "Create a polished showcase deck for your final automation system.",
        scenario:
          "A final automation project needs to be explained clearly: what problem it solves, how the workflow runs, which tools are used, what AI does, and how the result helps users.",
        instructions: ["Open Gamma or another approved presentation tool.", "Create a deck for your final automation project.", "Include problem, user, workflow diagram, tools, AI step, demo evidence, testing, safety, and future improvements.", "Keep slides visual and concise.", "Add screenshots or workflow images.", "Prepare a 3-minute explanation."],
        prompt:
          "Create a Gamma presentation outline for my automation project:\n[PROJECT]\n\nInclude slides for:\n1. Title and problem\n2. Target user\n3. Workflow overview\n4. Tools used\n5. AI/agent role\n6. Demo screenshots\n7. Testing results\n8. Safety and human review\n9. Impact\n10. Future improvements",
        deliverables: ["Gamma deck link or export", "Workflow diagram", "Tool explanation", "Demo screenshots", "Testing results", "Future improvement slide"],
        checklist: ["Presentation explains the problem clearly.", "Workflow diagram is included.", "Tools and AI role are explained.", "Demo evidence is included.", "Future improvements are thoughtful."],
      },
      {
        type: "class_challenge",
        title: "Class Challenge 2",
        description: "Live Automation Demo Rehearsal. Students practice presenting the workflow live and collect feedback.",
        googleDocLink: "",
        mission: "Practice a clear live demo of your automation project.",
        scenario:
          "A good showcase is not only a deck; it is also a smooth demonstration. In this challenge, you will rehearse your automation demo and improve it based on feedback.",
        instructions: ["Prepare a 3-minute demo script.", "Show the trigger, workflow, AI step, and final output.", "Explain one challenge and how you solved it.", "Present to a partner or small group.", "Collect feedback on clarity, confidence, and workflow understanding.", "Improve one part of your demo."],
        prompt:
          "Act as a demo coach.\n\nReview my automation demo plan:\n[DEMO PLAN]\n\nGive feedback on:\n1. Opening explanation\n2. Workflow clarity\n3. Tool explanation\n4. Demo order\n5. Timing\n6. Risky/confusing parts\n7. One improvement to make first",
        deliverables: ["Demo script", "Peer feedback", "Improved demo section", "Before-and-after note", "Final rehearsal reflection"],
        checklist: ["Demo script is clear.", "Feedback is collected.", "One improvement is made.", "Workflow can be explained in 3 minutes."],
      },
      {
        type: "home_task",
        title: "Home Task 1",
        description: "Final Automation Submission. Students submit their final workflow, links, screenshots, and reflection.",
        googleDocLink: "",
        mission: "Submit your complete Module 3 automation project package.",
        scenario:
          "This is your final Module 3 submission. You will collect all evidence of your automation project so it is ready for review, grading, or portfolio use.",
        instructions: ["Submit the workflow link or screenshots.", "Submit the presentation deck.", "Submit a short explanation of the problem and user.", "Submit the trigger, AI step, action, and output.", "Include testing evidence.", "Include safety or human review notes.", "Write a reflection on what you learned."],
        prompt:
          "Help me prepare my final automation submission.\n\nProject: [PROJECT]\n\nCreate sections for:\n1. Project summary\n2. User/problem\n3. Workflow steps\n4. Tools used\n5. AI/agent role\n6. Demo evidence\n7. Testing evidence\n8. Safety notes\n9. Learning reflection\n10. Future upgrades",
        deliverables: ["Workflow link or screenshots", "Presentation link", "Project summary", "Testing evidence", "Safety notes", "Learning reflection", "Future upgrade plan"],
        checklist: ["All project evidence is included.", "Workflow is understandable.", "Testing and safety notes are present.", "Reflection is specific."],
      },
      {
        type: "home_task",
        title: "Home Task 2",
        description: "Automation Version 2 Roadmap. Students plan how to improve the workflow after feedback.",
        googleDocLink: "",
        mission: "Create a realistic Version 2 roadmap for your automation project.",
        scenario:
          "Real automation systems improve over time. After testing and presenting, you should know what to fix, expand, or simplify. This task helps you plan the next version.",
        instructions: ["Review your final automation project.", "Collect feedback or self-review notes.", "List 3 problems or limitations.", "List 3 future improvements.", "Prioritize improvements by impact and difficulty.", "Create a 2-week improvement roadmap.", "Explain what success would look like in Version 2."],
        prompt:
          "Create a Version 2 roadmap for my automation project:\n[PROJECT]\n\nInclude:\n1. Current limitations\n2. User feedback\n3. Three improvements\n4. Priority ranking\n5. Two-week timeline\n6. Tools or skills needed\n7. Success criteria\n8. Long-term vision",
        deliverables: ["Current limitations", "Feedback notes", "3 improvements", "Priority ranking", "2-week roadmap", "Success criteria", "Long-term vision"],
        checklist: ["Limitations are honest.", "Improvements are realistic.", "Timeline is practical.", "Success criteria are clear."],
      },
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

const allCoursework = [...moduleOneCoursework, ...moduleTwoCoursework, ...moduleThreeCoursework];

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
