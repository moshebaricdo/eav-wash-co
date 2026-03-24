"use server";

import { redirect } from "next/navigation";
import { destroySession, verifySession } from "@/lib/auth";
import { sendTestSmsNotification } from "@/lib/notifications/quo";

export async function logout() {
  await destroySession();
  redirect("/login");
}

export async function sendSmsTest() {
  const userId = await verifySession();
  if (!userId) {
    return { ok: false as const, message: "You are not authorized." };
  }

  try {
    const result = await sendTestSmsNotification();
    if (!result.sent) {
      if (result.reason === "missing-config") {
        return {
          ok: false as const,
          message: "Quo is not configured. Set QUO_API_KEY, QUO_FROM_NUMBER, and QUO_NOTIFY_TO_NUMBERS.",
        };
      }
      return { ok: false as const, message: "Quo API request failed. Check server logs." };
    }

    return { ok: true as const, message: "Test SMS sent." };
  } catch (error) {
    console.error("[notifications] Failed to send test SMS", error);
    return { ok: false as const, message: "Unexpected error sending test SMS." };
  }
}
