import { Mail, MapPin, Phone, UserRound } from "lucide-react";
import { updateDemoRequestAction, type DemoRequestStatus } from "@/app/actions/demo-request";
import { AnimatedPage } from "@/components/ui/animated";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/auth";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type DemoRequest = {
  id: string;
  parent_name: string;
  student_name: string;
  email: string;
  phone: string | null;
  student_age: number | null;
  country: string;
  time_zone: string;
  goals: string;
  preferred_schedule: string;
  status: DemoRequestStatus;
  admin_note: string | null;
  created_at: string;
};

const statusLabels: Record<DemoRequestStatus, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  closed: "Closed",
};

export default async function AdminDemoRequestsPage() {
  await requireAdmin();
  const supabase = createServiceRoleSupabaseClient();
  let requests: DemoRequest[] = [];
  let setupRequired = !supabase;

  if (supabase) {
    const { data, error } = await supabase
      .from("demo_requests")
      .select(
        "id, parent_name, student_name, email, phone, student_age, country, time_zone, goals, preferred_schedule, status, admin_note, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) {
      setupRequired = true;
    } else {
      requests = (data ?? []) as DemoRequest[];
    }
  }

  const counts = {
    new: requests.filter((request) => request.status === "new").length,
    contacted: requests.filter((request) => request.status === "contacted").length,
    scheduled: requests.filter((request) => request.status === "scheduled").length,
    closed: requests.filter((request) => request.status === "closed").length,
  };

  return (
    <AnimatedPage>
      <PageHeader
        title="Demo Requests"
        subtitle="Follow parent enquiries from the first message through a confirmed course demonstration."
      />

      {setupRequired ? (
        <section className="rounded-lg border border-accent-warm/35 bg-accent-warm/10 p-5">
          <h2 className="font-heading text-lg font-bold">One-time setup required</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Run <span className="font-mono text-text-primary">supabase/demo-requests-migration.sql</span> in the Supabase SQL Editor and confirm the Vercel service-role environment variable is available.
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["New", counts.new],
              ["Contacted", counts.contacted],
              ["Scheduled", counts.scheduled],
              ["Closed", counts.closed],
            ].map(([label, count]) => (
              <div key={String(label)} className="premium-card rounded-lg p-5">
                <p className="font-mono text-xs uppercase text-text-muted">{label}</p>
                <p className="mt-2 font-heading text-3xl font-bold">{count}</p>
              </div>
            ))}
          </section>

          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="font-heading text-2xl font-bold">Enquiry inbox</h2>
              <span className="font-mono text-xs uppercase text-text-muted">
                {requests.length} total
              </span>
            </div>

            {requests.length ? (
              <div className="grid gap-4">
                {requests.map((request) => (
                  <article key={request.id} className="rounded-lg border border-border bg-bg-card p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                      <div>
                        <p className="font-mono text-xs uppercase text-accent">
                          {statusLabels[request.status]} request
                        </p>
                        <h3 className="mt-2 font-heading text-xl font-bold">
                          {request.student_name}
                          {request.student_age ? `, age ${request.student_age}` : ""}
                        </h3>
                        <p className="mt-1 text-sm text-text-secondary">
                          Parent or guardian: {request.parent_name}
                        </p>
                      </div>
                      <time className="text-xs text-text-muted" dateTime={request.created_at}>
                        {new Intl.DateTimeFormat("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(request.created_at))}
                      </time>
                    </div>

                    <div className="grid gap-4 py-5 text-sm md:grid-cols-2 xl:grid-cols-4">
                      <a className="inline-flex items-center gap-2 text-accent" href={`mailto:${request.email}`}>
                        <Mail className="h-4 w-4" /> {request.email}
                      </a>
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4 text-text-muted" />
                        {request.phone || "No phone supplied"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-text-muted" />
                        {request.country} / {request.time_zone}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-text-muted" />
                        {request.parent_name}
                      </span>
                    </div>

                    <div className="grid gap-5 border-y border-border py-5 lg:grid-cols-2">
                      <div>
                        <p className="font-mono text-xs uppercase text-text-muted">Learning goals</p>
                        <p className="mt-2 whitespace-pre-wrap leading-7 text-text-secondary">{request.goals}</p>
                      </div>
                      <div>
                        <p className="font-mono text-xs uppercase text-text-muted">Preferred schedule</p>
                        <p className="mt-2 whitespace-pre-wrap leading-7 text-text-secondary">
                          {request.preferred_schedule}
                        </p>
                      </div>
                    </div>

                    <form action={updateDemoRequestAction} className="mt-5 grid gap-3 lg:grid-cols-[12rem_1fr_auto]">
                      <input type="hidden" name="id" value={request.id} />
                      <label className="sr-only" htmlFor={`status-${request.id}`}>
                        Request status
                      </label>
                      <select
                        id={`status-${request.id}`}
                        name="status"
                        defaultValue={request.status}
                        className="rounded-md border border-border bg-bg-base px-3 py-2.5 text-sm"
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <label className="sr-only" htmlFor={`note-${request.id}`}>
                        Admin note
                      </label>
                      <input
                        id={`note-${request.id}`}
                        name="adminNote"
                        defaultValue={request.admin_note ?? ""}
                        placeholder="Private admin note"
                        maxLength={1500}
                        className="rounded-md border border-border bg-bg-base px-3 py-2.5 text-sm"
                      />
                      <SubmitButton
                        pendingLabel="Updating..."
                        className="rounded-md bg-accent px-4 py-2.5 font-bold text-[#07110d]"
                      >
                        Update
                      </SubmitButton>
                    </form>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border py-16 text-center">
                <h3 className="font-heading text-lg font-bold">No demo requests yet</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  New parent enquiries will appear here.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </AnimatedPage>
  );
}
