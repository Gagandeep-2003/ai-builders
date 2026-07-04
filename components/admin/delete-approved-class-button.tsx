"use client";

import { Trash2 } from "lucide-react";
import { deleteApprovedRescheduleAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/ui/submit-button";

export function DeleteApprovedClassButton({ requestId, studentName }: { requestId: string; studentName: string }) {
  return (
    <form
      action={deleteApprovedRescheduleAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete this approved class for ${studentName}? It will disappear from the student's schedule.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="requestId" value={requestId} />
      <SubmitButton
        pendingLabel="Deleting..."
        className="button-motion inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-danger/35 bg-danger/10 px-3 py-2 text-sm font-bold text-rose-200 hover:bg-danger/15"
      >
        <Trash2 className="h-4 w-4" />
        Delete class
      </SubmitButton>
    </form>
  );
}
