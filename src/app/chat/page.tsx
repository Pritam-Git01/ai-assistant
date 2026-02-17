import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserChats } from "@/actions/chat";
import { ChatPageClient } from "./chat-page-client";

/**
 * Protected chat page - Server-Side Rendered shell.
 *
 * SSR: Authentication check and initial chat history fetch happen server-side.
 * CSR: The interactive chat interface (ChatPageClient) handles real-time
 *      messaging, tool calling, and dynamic chat selection on the client.
 *
 * This demonstrates the SSR + CSR mix:
 * - Server: Auth guard, initial data fetching (chat history)
 * - Client: Real-time AI streaming, tool rendering, interactive UI
 */
export default async function ChatPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Server-side: fetch user's chat history
  const chats = await getUserChats();

  return <ChatPageClient initialChats={chats} />;
}
