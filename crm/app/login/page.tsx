import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign In" };

export default async function LoginPage() {
  const userId = await verifySession();
  if (userId) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold uppercase tracking-wide text-eav-black">
            EAV Wash Co.
          </h1>
          <p className="mt-1 font-body text-sm text-eav-muted">
            Sign in to your CRM
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
