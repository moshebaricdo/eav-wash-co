"use client";

import { useTransition, useState } from "react";
import { sendSmsTest } from "./actions";

export function SmsTestButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setResult(null);
          startTransition(async () => {
            const response = await sendSmsTest();
            setResult(response);
          });
        }}
        className="rounded-md border border-eav-border bg-eav-white px-2.5 py-1.5 font-body text-xs font-medium text-eav-black transition-colors hover:bg-eav-surface disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Sending..." : "Send Test SMS"}
      </button>
      {result && (
        <span className={`font-body text-xs ${result.ok ? "text-emerald-600" : "text-red-600"}`}>
          {result.message}
        </span>
      )}
    </div>
  );
}
