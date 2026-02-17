// FILE: app/chat/page.tsx
// The "/chat" route — handles both new chats (from Zustand) and
// existing chats (from ?id= query param).
// DELETE the old app/chat/[chatId]/page.tsx — no longer needed.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ChatPageClient } from "./chat-page-client";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Suspense fallback={<ChatLoading />}>
      <ChatPageClient />
    </Suspense>
  );
}

function ChatLoading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}