import type { QuizAttempt } from "@/lib/course-data";

export type ModuleThreeQuizQuestion = {
  id: string;
  prompt: string;
  options: readonly [string, string, string, string];
};

export type ModuleThreeQuiz = {
  id: string;
  sessionGlobalNumber: number;
  sessionNumber: number;
  title: string;
  description: string;
  questions: readonly ModuleThreeQuizQuestion[];
};

export type ModuleThreeQuizQuestionReview = {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
  explanation: string;
  isCorrect: boolean;
};

export type ModuleThreeQuizReview = {
  quizId: string;
  score: number;
  totalQuestions: number;
  questions: ModuleThreeQuizQuestionReview[];
};

export type ModuleThreeQuizActivity = {
  sessionId: string;
  sessionNumber: number;
  unlocked: boolean;
  quiz?: ModuleThreeQuiz;
  attempts: QuizAttempt[];
  review?: ModuleThreeQuizReview;
};

export type ReviewedModuleThreeQuizAttempt = QuizAttempt & {
  review?: ModuleThreeQuizReview;
};

export type AdminModuleThreeQuizActivity = {
  sessionId: string;
  sessionNumber: number;
  quiz: ModuleThreeQuiz;
  attempts: ReviewedModuleThreeQuizAttempt[];
};

export const moduleThreeQuizzes: readonly ModuleThreeQuiz[] = [
  {
    id: "m3s1-n8n-foundations",
    sessionGlobalNumber: 17,
    sessionNumber: 1,
    title: "n8n Foundations Check",
    description: "Five quick questions about nodes, triggers, and running your first workflow.",
    questions: [
      {
        id: "m3s1-q1",
        prompt: "Which node is useful for starting a workflow while you are testing it?",
        options: ["Manual Trigger", "Gmail", "Google Sheets", "IF"],
      },
      {
        id: "m3s1-q2",
        prompt: "What is a node in n8n?",
        options: ["A step in a workflow", "A password", "A browser tab", "A spreadsheet row"],
      },
      {
        id: "m3s1-q3",
        prompt: "What should you do to test a new workflow?",
        options: ["Execute it and inspect the output", "Publish it without testing", "Delete every node", "Close n8n"],
      },
      {
        id: "m3s1-q4",
        prompt: "Where can you check the data produced by a node?",
        options: ["The output panel", "The browser history", "The desktop wallpaper", "The login screen"],
      },
      {
        id: "m3s1-q5",
        prompt: "Why should a workflow have a clear name?",
        options: ["It is easier to find later", "It makes the internet faster", "It removes all errors", "It changes your email"],
      },
    ],
  },
  {
    id: "m3s2-google-connections",
    sessionGlobalNumber: 18,
    sessionNumber: 2,
    title: "Google Connection Check",
    description: "A simple review of APIs, OAuth, credentials, and secret safety.",
    questions: [
      {
        id: "m3s2-q1",
        prompt: "What must usually be enabled before n8n can use Google Sheets?",
        options: ["The Google Sheets API", "Airplane mode", "A printer", "A social media account"],
      },
      {
        id: "m3s2-q2",
        prompt: "What does an n8n credential store?",
        options: ["Connection details for a service", "Your workflow screenshots", "Your homework title", "Your browser bookmarks"],
      },
      {
        id: "m3s2-q3",
        prompt: "What should match when setting up Google OAuth for n8n?",
        options: ["The redirect URL", "The desktop background", "The spreadsheet colour", "The email font"],
      },
      {
        id: "m3s2-q4",
        prompt: "Which is the safest way to submit proof of a connected credential?",
        options: ["Hide all secrets in the screenshot", "Share the client secret", "Post the password", "Export the API key"],
      },
      {
        id: "m3s2-q5",
        prompt: "Why run a small read test after connecting Google Sheets?",
        options: ["To confirm the connection works", "To delete the spreadsheet", "To change the account password", "To disable the API"],
      },
    ],
  },
  {
    id: "m3s3-quiz-champion",
    sessionGlobalNumber: 19,
    sessionNumber: 3,
    title: "Quiz Champion Check",
    description: "Review forms, IF branches, result labels, and Google Sheets output.",
    questions: [
      {
        id: "m3s3-q1",
        prompt: "Which node collects answers from the quiz participant?",
        options: ["Form Trigger", "Gmail", "Schedule Trigger", "Merge"],
      },
      {
        id: "m3s3-q2",
        prompt: "Which node checks whether the score is 7 or higher?",
        options: ["IF", "Edit Fields", "Manual Trigger", "Wait"],
      },
      {
        id: "m3s3-q3",
        prompt: "A score of 8 should follow which IF path?",
        options: ["True", "False", "Error", "Paused"],
      },
      {
        id: "m3s3-q4",
        prompt: "Why save quiz results to Google Sheets?",
        options: ["To keep an organised record", "To make the form invisible", "To stop the workflow", "To remove the score"],
      },
      {
        id: "m3s3-q5",
        prompt: "How should you test a two-path workflow?",
        options: ["Test both the true and false paths", "Test only one path", "Do not execute it", "Delete the IF node"],
      },
    ],
  },
  {
    id: "m3s4-sheets-gmail",
    sessionGlobalNumber: 20,
    sessionNumber: 4,
    title: "Sheets to Gmail Check",
    description: "Five easy questions about processing rows and sending formatted email.",
    questions: [
      {
        id: "m3s4-q1",
        prompt: "What starts the class workflow?",
        options: ["A new Google Sheets row", "A deleted browser tab", "A calendar colour", "A desktop notification"],
      },
      {
        id: "m3s4-q2",
        prompt: "What is HTML used for in the email?",
        options: ["Clear formatting and structure", "Changing the recipient password", "Deleting the sheet", "Disabling Gmail"],
      },
      {
        id: "m3s4-q3",
        prompt: "Which node sends the final message?",
        options: ["Gmail", "IF", "Form Trigger", "Wait"],
      },
      {
        id: "m3s4-q4",
        prompt: "When should the row be marked as Sent?",
        options: ["After the email succeeds", "Before reading the row", "Before the workflow starts", "Only when an error occurs"],
      },
      {
        id: "m3s4-q5",
        prompt: "Why map spreadsheet columns carefully?",
        options: ["So the correct values reach the email", "So the sheet changes colour", "So Gmail logs out", "So the trigger disappears"],
      },
    ],
  },
  {
    id: "m3s5-ai-story",
    sessionGlobalNumber: 21,
    sessionNumber: 5,
    title: "AI Story Workflow Check",
    description: "Review form input, controlled prompts, Gemini output, and safe API use.",
    questions: [
      {
        id: "m3s5-q1",
        prompt: "What provides the story choices to the workflow?",
        options: ["A form", "A deleted node", "A timer only", "A browser bookmark"],
      },
      {
        id: "m3s5-q2",
        prompt: "Why give Gemini a clear prompt?",
        options: ["To guide the requested output", "To turn off n8n", "To delete Gmail", "To hide the form"],
      },
      {
        id: "m3s5-q3",
        prompt: "What should be extracted from the Gemini response?",
        options: ["The generated story text", "The API key", "The account password", "The browser history"],
      },
      {
        id: "m3s5-q4",
        prompt: "Where can the generated story be recorded?",
        options: ["Google Sheets", "The login button", "The browser address bar", "The mouse settings"],
      },
      {
        id: "m3s5-q5",
        prompt: "What should never be shared in homework proof?",
        options: ["An API key", "A workflow name", "A story title", "A successful output"],
      },
    ],
  },
  {
    id: "m3s6-streamlit-foundations",
    sessionGlobalNumber: 22,
    sessionNumber: 6,
    title: "Streamlit Foundations Check",
    description: "A gentle check of Streamlit pages, widgets, and local testing.",
    questions: [
      {
        id: "m3s6-q1",
        prompt: "What language is commonly used to build a Streamlit app?",
        options: ["Python", "SQL only", "CSS only", "Spreadsheet formulas only"],
      },
      {
        id: "m3s6-q2",
        prompt: "What does st.title add to a Streamlit page?",
        options: ["A page title", "An API key", "A database password", "A Gmail account"],
      },
      {
        id: "m3s6-q3",
        prompt: "Which element can collect a short answer from a user?",
        options: ["A text input", "A browser refresh", "A file name only", "A node connection"],
      },
      {
        id: "m3s6-q4",
        prompt: "Why use a button or form in Streamlit?",
        options: ["To let the user trigger an action", "To close Python forever", "To remove the page title", "To disconnect the internet"],
      },
      {
        id: "m3s6-q5",
        prompt: "What should you do before connecting a Streamlit app to n8n?",
        options: ["Confirm the local interface works", "Delete the app", "Publish an empty file", "Remove every input"],
      },
    ],
  },
  {
    id: "m3s7-streamlit-n8n",
    sessionGlobalNumber: 23,
    sessionNumber: 7,
    title: "Streamlit + n8n Check",
    description: "Review webhooks, JSON, responses, and reliable interface states.",
    questions: [
      {
        id: "m3s7-q1",
        prompt: "Which n8n feature receives data from the Streamlit app?",
        options: ["A webhook", "A sticky note", "A browser theme", "A spreadsheet colour"],
      },
      {
        id: "m3s7-q2",
        prompt: "Which format is commonly sent between Streamlit and n8n?",
        options: ["JSON", "A printed page", "A desktop icon", "A font file"],
      },
      {
        id: "m3s7-q3",
        prompt: "What should n8n send back after processing the request?",
        options: ["A useful response", "The API password", "An empty browser", "A deleted workflow"],
      },
      {
        id: "m3s7-q4",
        prompt: "What should the Streamlit app show while waiting?",
        options: ["A clear loading state", "A fake success message", "A blank screen only", "The user's password"],
      },
      {
        id: "m3s7-q5",
        prompt: "Why test both the test and production webhook URLs?",
        options: ["They are used in different workflow states", "They always contain the same data", "They change the computer clock", "They remove the response"],
      },
    ],
  },
  {
    id: "m3s8-personal-assistant",
    sessionGlobalNumber: 24,
    sessionNumber: 8,
    title: "Personal Assistant Check",
    description: "A final, friendly review of agents, memory, tools, and safe testing.",
    questions: [
      {
        id: "m3s8-q1",
        prompt: "What helps the personal assistant decide which action to take?",
        options: ["An AI agent", "A spreadsheet colour", "A browser bookmark", "A page title"],
      },
      {
        id: "m3s8-q2",
        prompt: "What supplies the language intelligence to the agent?",
        options: ["A chat model", "A printer", "A date field", "A screenshot"],
      },
      {
        id: "m3s8-q3",
        prompt: "What is memory used for in an assistant workflow?",
        options: ["Keeping useful conversation context", "Storing public passwords", "Deleting every request", "Changing the browser size"],
      },
      {
        id: "m3s8-q4",
        prompt: "Why connect tools such as Gmail or Calendar to an agent?",
        options: ["So it can perform approved actions", "So it can reveal secrets", "So it never needs testing", "So the workflow has no trigger"],
      },
      {
        id: "m3s8-q5",
        prompt: "What is the safest way to test the final assistant?",
        options: ["Use simple test data and review each action", "Use private data immediately", "Skip every test", "Share all credentials"],
      },
    ],
  },
] as const;

export function getModuleThreeQuizById(quizId: string) {
  return moduleThreeQuizzes.find((quiz) => quiz.id === quizId);
}

export function getModuleThreeQuizBySession(globalNumber: number) {
  return moduleThreeQuizzes.find((quiz) => quiz.sessionGlobalNumber === globalNumber);
}
