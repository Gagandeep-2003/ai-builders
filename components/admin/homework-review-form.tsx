"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { reviewHomeworkSubmissionAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/ui/submit-button";

export function HomeworkReviewForm({
  homeworkId,
  studentId,
  initialFeedback = "",
  reviewed,
}: {
  homeworkId: string;
  studentId: string;
  initialFeedback?: string;
  reviewed: boolean;
}) {
  const [decision, setDecision] = useState(reviewed ? "approved" : "approved");

  return (
    <form action={reviewHomeworkSubmissionAction} className="mt-4 rounded-xl border border-accent/25 bg-bg-base/45 p-4">
      <input type="hidden" name="homeworkId" value={homeworkId} />
      <input type="hidden" name="studentId" value={studentId} />
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-accent" />
        <p className="font-mono text-xs uppercase text-accent">Mentor review</p>
      </div>
      <label className="mt-3 block">
        <span className="font-mono text-[10px] uppercase text-text-muted">Decision</span>
        <select
          name="decision"
          value={decision}
          onChange={(event) => setDecision(event.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm text-text-primary"
        >
          <option value="approved">Approve submission</option>
          <option value="revision_requested">Request changes</option>
        </select>
      </label>
      <label className="mt-3 block">
        <span className="font-mono text-[10px] uppercase text-text-muted">
          Feedback {decision === "revision_requested" ? "· required" : "· optional"}
        </span>
        <textarea
          name="mentorFeedback"
          defaultValue={initialFeedback}
          required={decision === "revision_requested"}
          placeholder={decision === "revision_requested" ? "Explain what the student should improve before resubmitting." : "Add a short encouraging note for the student."}
          className="mt-2 min-h-24 w-full rounded-lg border border-border bg-bg-elevated px-3 py-2.5 text-sm leading-6 text-text-primary"
        />
      </label>
      <SubmitButton
        pendingLabel="Saving review..."
        className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 font-bold text-bg-base"
      >
        {decision === "revision_requested" ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        {decision === "revision_requested" ? "Send revision request" : reviewed ? "Update review" : "Approve work"}
      </SubmitButton>
    </form>
  );
}
