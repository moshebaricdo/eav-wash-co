"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, { error: "" });

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="font-body text-sm text-red-600">{state.error}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="font-body text-xs font-medium text-eav-black"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2.5 font-body text-sm text-eav-black placeholder:text-eav-muted focus:border-eav-orange outline-none"
          placeholder="you@email.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="font-body text-xs font-medium text-eav-black"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-md border-2 border-eav-border bg-eav-white px-3.5 py-2.5 font-body text-sm text-eav-black placeholder:text-eav-muted focus:border-eav-orange outline-none"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-md bg-eav-orange font-body text-sm font-semibold text-eav-white transition-all hover:brightness-95 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {pending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
