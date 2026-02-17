// FILE: app/chat/chat-page-client.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChatStore } from "@/store/chat-store";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { UserMenu } from "@/components/auth/user-menu";
import { Bot } from "lucide-react";
import { getChatWithMessages } from "@/actions/chat";
import type { Message as DBMessage } from "@/db/schema";

type PageMode = "loading" | "new" | "existing";

export function ChatPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get("id");

  const pendingMessage = useChatStore((s) => s.pendingMessage);
  const clearPendingMessage = useChatStore((s) => s.clearPendingMessage);

  const [mode, setMode] = useState<PageMode>("loading");
  const [activeChatId, setActiveChatId] = useState<string | undefined>(
    chatIdFromUrl || undefined
  );
  const [initialMessages, setInitialMessages] = useState<
    DBMessage[] | undefined
  >(undefined);

  // Track whether we created this chat ourselves (to avoid re-fetching
  // when window.history.replaceState updates the URL).
  const selfCreatedRef = useRef(false);

  // Sidebar refresh counter — increment to trigger sidebar refetch
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  // ─── Initialization: decide mode based on Zustand / URL param ───
  useEffect(() => {
    // If we just created a chat via pending message flow, don't re-fetch
    if (selfCreatedRef.current) return;

    const init = async () => {
      setMode("loading");

      // CASE 1: Pending message from "/" home page → new chat flow
      if (pendingMessage && !chatIdFromUrl) {
        setActiveChatId(undefined);
        setInitialMessages(undefined);
        setMode("new");
        console.log("")
        return;
      }

      // CASE 2: Chat ID in URL → load messages from DB
      if (chatIdFromUrl) {
        try {
          const chatData = await getChatWithMessages(chatIdFromUrl);
          if (chatData && chatData.messages) {
            setActiveChatId(chatData.id);
            setInitialMessages(chatData.messages);
            setMode("existing");
            console.log("chatData", chatData);
            return;
          }
        } catch {
          // Chat not found or error — fall through to redirect
        }
        // Chat doesn't exist → go home
        router.replace("/");
        return;
      }

      // CASE 3: No pending message, no chat ID → redirect home
      router.replace("/");
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatIdFromUrl]);

  // ─── Called by ChatInterface after it creates a session for the pending message ───
  const handleChatCreated = useCallback(
    (chatId: string) => {
      selfCreatedRef.current = true;
      setActiveChatId(chatId);
      // Update URL without triggering Next.js navigation/re-render
      window.history.replaceState(null, "", `/chat?id=${chatId}`);
      // Clear Zustand — the message has been consumed
      clearPendingMessage();
      // Refresh sidebar so the new chat appears
      setSidebarRefreshKey((k) => k + 1);
    },
    [clearPendingMessage]
  );

  // ─── Sidebar: select an existing chat ───
  const handleSelectChat = useCallback(
    (chatId: string) => {
      if (chatId === activeChatId) return;

      // Reset everything for a clean load
      selfCreatedRef.current = false;
      setMode("loading");
      setActiveChatId(undefined);
      setInitialMessages(undefined);
      clearPendingMessage();

      // Navigate — this changes searchParams which triggers our useEffect
      router.push(`/chat?id=${chatId}`);
    },
    [activeChatId, clearPendingMessage, router]
  );

  // ─── Sidebar: new chat ───
  const handleNewChat = useCallback(() => {
    clearPendingMessage();
    router.push("/");
  }, [clearPendingMessage, router]);

  // ─── Sidebar: after deleting a chat ───
  const handleDeleteChat = useCallback(() => {
    setSidebarRefreshKey((k) => k + 1);
  }, []);

  // ─── Render ───
  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <UserMenu />
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar
          key={sidebarRefreshKey}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />

        <div className="flex-1">
          {mode === "loading" ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : mode === "new" ? (
            <ChatInterface
              key="new-chat"
              pendingMessage={pendingMessage ?? undefined}
              onChatCreated={handleChatCreated}
            />
          ) : (
            <ChatInterface
              key={activeChatId || "existing"}
              chatId={activeChatId}
              initialMessages={initialMessages}
              onChatCreated={handleChatCreated}
            />
          )}
        </div>
      </div>
    </div>
  );
}