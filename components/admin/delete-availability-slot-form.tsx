"use client";

import { Trash2 } from "lucide-react";
import { removeAvailabilitySlotAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/ui/submit-button";

type DeleteAvailabilitySlotFormProps = {
  slotId: string;
  label: string;
  variant?: "icon" | "chip";
};

export function DeleteAvailabilitySlotForm({
  slotId,
  label,
  variant = "icon",
}: DeleteAvailabilitySlotFormProps) {
  const message = `Remove ${label} from your available slots? Students will no longer be able to request this time.`;

  return (
    <form
      action={removeAvailabilitySlotAction}
      onSubmit={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slotId" value={slotId} />
      {variant === "chip" ? (
        <SubmitButton
          pendingLabel="Removing..."
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-2 text-xs text-text-secondary transition hover:border-rose-300/40 hover:text-rose-100"
        >
          <span>{label}</span>
          <Trash2 className="h-3.5 w-3.5" />
        </SubmitButton>
      ) : (
        <SubmitButton
          pendingLabel=""
          className="grid h-9 w-9 place-items-center rounded-xl border border-current/20 bg-bg-base/30 text-current transition hover:bg-rose-400/15 hover:text-rose-100"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove {label}</span>
        </SubmitButton>
      )}
    </form>
  );
}
