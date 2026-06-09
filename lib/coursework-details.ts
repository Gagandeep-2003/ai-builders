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

function normalizeDocLink(value: string) {
  const match = value.match(/\/document\/d\/([^/]+)/);
  return match?.[1] ?? value;
}

const moduleOneDetails = new Map<string, CourseworkDetail>(
  moduleOneCoursework.flatMap((session) =>
    session.tasks.map((task) => [
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

export function getCourseworkDetailByUrl(url: string) {
  return moduleOneDetails.get(normalizeDocLink(url));
}
