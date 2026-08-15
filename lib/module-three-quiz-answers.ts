import "server-only";

import { getModuleThreeQuizById, type ModuleThreeQuizReview } from "@/lib/module-three-quizzes";

export type ModuleThreeQuizAnswer = {
  correctIndex: number;
  explanation: string;
};

const moduleThreeQuizAnswers: Record<string, readonly ModuleThreeQuizAnswer[]> = {
  "m3s1-n8n-foundations": [
    { correctIndex: 0, explanation: "A Manual Trigger lets you start a test run yourself." },
    { correctIndex: 0, explanation: "Each node represents one step or action in a workflow." },
    { correctIndex: 0, explanation: "Executing and inspecting output is the safest way to test." },
    { correctIndex: 0, explanation: "The output panel shows the data created or received by a node." },
    { correctIndex: 0, explanation: "Clear names make workflows easy to find and understand later." },
  ],
  "m3s2-google-connections": [
    { correctIndex: 0, explanation: "The Google Sheets API must be enabled for Sheets access." },
    { correctIndex: 0, explanation: "Credentials hold the connection details needed by a service." },
    { correctIndex: 0, explanation: "Google OAuth must use the redirect URL supplied by n8n." },
    { correctIndex: 0, explanation: "Proof should never expose passwords, client secrets, or API keys." },
    { correctIndex: 0, explanation: "A small read test confirms the credential is working correctly." },
  ],
  "m3s3-quiz-champion": [
    { correctIndex: 0, explanation: "The Form Trigger collects the participant's submitted values." },
    { correctIndex: 0, explanation: "An IF node sends data down a true or false path." },
    { correctIndex: 0, explanation: "Eight is at least seven, so the true path is used." },
    { correctIndex: 0, explanation: "Google Sheets provides a simple organised result record." },
    { correctIndex: 0, explanation: "Both paths must be tested to confirm the whole workflow works." },
  ],
  "m3s4-sheets-gmail": [
    { correctIndex: 0, explanation: "The workflow begins when the new spreadsheet row arrives." },
    { correctIndex: 0, explanation: "HTML gives an email headings, spacing, and readable structure." },
    { correctIndex: 0, explanation: "The Gmail node sends the prepared message." },
    { correctIndex: 0, explanation: "Mark the row Sent only after Gmail succeeds." },
    { correctIndex: 0, explanation: "Careful mapping places each spreadsheet value in the right field." },
  ],
  "m3s5-ai-story": [
    { correctIndex: 0, explanation: "The form supplies the student's story choices." },
    { correctIndex: 0, explanation: "A clear prompt gives Gemini useful instructions and limits." },
    { correctIndex: 0, explanation: "The workflow needs the generated story text from the response." },
    { correctIndex: 0, explanation: "Google Sheets can keep a record of requests and results." },
    { correctIndex: 0, explanation: "API keys are private and must never appear in submitted proof." },
  ],
  "m3s6-streamlit-foundations": [
    { correctIndex: 0, explanation: "Streamlit applications are built with Python." },
    { correctIndex: 0, explanation: "st.title displays a prominent page title." },
    { correctIndex: 0, explanation: "A text input lets the user type a short value." },
    { correctIndex: 0, explanation: "Buttons and forms allow the user to start an action." },
    { correctIndex: 0, explanation: "A working local interface is the right foundation for integration." },
  ],
  "m3s7-streamlit-n8n": [
    { correctIndex: 0, explanation: "An n8n webhook receives the request from Streamlit." },
    { correctIndex: 0, explanation: "JSON is a common format for sending structured web data." },
    { correctIndex: 0, explanation: "The workflow should return a useful result to the interface." },
    { correctIndex: 0, explanation: "A loading state tells the user that their request is processing." },
    { correctIndex: 0, explanation: "Test and production URLs correspond to different workflow states." },
  ],
  "m3s8-personal-assistant": [
    { correctIndex: 0, explanation: "The AI agent chooses how to handle the request." },
    { correctIndex: 0, explanation: "The chat model provides language understanding and generation." },
    { correctIndex: 0, explanation: "Memory retains useful context between conversation steps." },
    { correctIndex: 0, explanation: "Tools let the agent perform specific, approved actions." },
    { correctIndex: 0, explanation: "Simple test data makes every action easier and safer to review." },
  ],
};

export function getModuleThreeQuizAnswers(quizId: string) {
  return moduleThreeQuizAnswers[quizId];
}

export function reviewModuleThreeQuiz(
  quizId: string,
  selectedAnswers: number[],
): ModuleThreeQuizReview | undefined {
  const quiz = getModuleThreeQuizById(quizId);
  const answers = getModuleThreeQuizAnswers(quizId);
  if (!quiz || !answers || selectedAnswers.length !== quiz.questions.length) return undefined;

  const questions = quiz.questions.map((question, index) => {
    const selectedIndex = selectedAnswers[index] ?? -1;
    const answer = answers[index];
    return {
      questionId: question.id,
      selectedIndex,
      correctIndex: answer.correctIndex,
      explanation: answer.explanation,
      isCorrect: selectedIndex === answer.correctIndex,
    };
  });

  return {
    quizId,
    score: questions.filter((question) => question.isCorrect).length,
    totalQuestions: questions.length,
    questions,
  };
}
