// FILE: app/home-client.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/chat-store";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatInput } from "@/components/chat/chat-input";
import { UserMenu } from "@/components/auth/user-menu";
import { Bot } from "lucide-react";

export function HomeClient() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const setPendingMessage = useChatStore((s) => s.setPendingMessage);

  // On submit: store message in Zustand → redirect to /chat
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;

      setPendingMessage(trimmed);
      setInput("");
      router.push("/chat");
    },
    [input, setPendingMessage, router]
  );

  // Sidebar: click existing chat → go to /chat?id=xxx
  const handleSelectChat = useCallback(
    (chatId: string) => {
      router.push(`/chat?id=${chatId}`);
    },
    [router]
  );

  // Already on home, just clear
  const handleNewChat = useCallback(() => {
    setInput("");
  }, []);

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
          activeChatId={undefined}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />

        <div className="flex flex-1 flex-col">
          {/* Welcome Screen */}
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                How can I help you today?
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                I can check the weather, look up F1 race schedules, and fetch
                stock prices. Ask me anything!
              </p>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                "What's the weather in Tokyo?",
                "When is the next F1 race?",
                "What's Apple's stock price?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <ChatInput
            input={input}
            onInputChange={setInput}
            handleSubmit={handleSubmit}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
}