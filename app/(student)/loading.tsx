import { LoaderCircle } from "lucide-react";

export default function StudentRouteLoading() {
  return (
    <div className="flex min-h-40 items-center gap-3 py-8 text-sm text-text-secondary">
      <LoaderCircle className="h-4 w-4 animate-spin text-accent" />
      <span>Opening your page...</span>
    </div>
  );
}
