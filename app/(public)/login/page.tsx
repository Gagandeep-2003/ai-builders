import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:88px_88px]" />
      <div className="w-full">
        <div className="mb-8 text-center">
          <Link href="/" className="font-mono text-xs uppercase text-accent">
            AI Builders Summer Bootcamp
          </Link>
        </div>
        <LoginForm />
        <p className="mx-auto mt-5 max-w-md text-center text-sm text-text-muted">
          Demo logins: student@demo.com / student1234 and admin@bootcamp.com / admin1234.
        </p>
      </div>
    </main>
  );
}
