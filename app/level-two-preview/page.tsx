import type { Metadata } from "next";
import { LevelTwoStory } from "@/components/portal/level-two-story";
import { requireStudentAccess } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Level 2 · Agentic AI Story",
  description: "Discover the next chapter of the AI Builders journey: LangChain, LangGraph and dependable AI evaluation.",
  robots: { index: false, follow: false },
};

export default async function LevelTwoPreviewPage() {
  const profile = await requireStudentAccess();
  const firstName = profile.fullName.trim().split(/\s+/)[0] || "Builder";

  return <LevelTwoStory firstName={firstName} />;
}
