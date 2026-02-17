"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useCallback, useState } from "react";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { saveMessage, updateChatTitle, createChat } from "@/actions/chat";
import { Bot } from "lucide-react";
import type { Message as DBMessage } from "@/db/schema";
import type { UIMessage } from "ai";

interface ChatInterfaceProps {
  chatId?: string;
  initialMessages?: DBMessage[];
  onChatCreated?: (chatId: string) => void;
}

/**
 * Convert persisted DB messages into the UIMessage format expected by AI SDK v6.
 * v6 uses `parts` array instead of flat `content` / `toolInvocations`.
 */
function dbMessagesToUIMessages(dbMessages: DBMessage[]): UIMessage[] {
  return dbMessages.map((msg) => {
    const parts: UIMessage["parts"] = [];

    if (msg.content) {
      parts.push({ type: "text" as const, text: msg.content });
    }

    if (msg.toolInvocations) {
      try {
        const invocations = JSON.parse(msg.toolInvocations);
        for (const inv of invocations) {
          parts.push(inv);
        }
      } catch {
        // Ignore malformed JSON
      }
    }

    return {
      id: msg.id,
      role: msg.role as "user" | "assistant",
      parts,
      createdAt: msg.createdAt,
    } as UIMessage;
  });
}

export function ChatInterface({
  chatId: initialChatId,
  initialMessages,
  onChatCreated,
}: ChatInterfaceProps) {
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(initialChatId);
  const [input, setInput] = useState("");
  const chatCreatedRef = useRef(false);
  const savedMessagesRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const formattedInitialMessages = initialMessages
    ? dbMessagesToUIMessages(initialMessages)
    : [];

  const { messages, sendMessage, status, error } = useChat({
    api: "/api/chat",
    initialMessages: formattedInitialMessages,
    onFinish: async (message) => {
      if (!currentChatId || savedMessagesRef.current.has(message.id)) return;
      savedMessagesRef.current.add(message.id);

      // Safely handle parts — it can be undefined in some edge cases
      const parts = message.parts ?? [];

      const textContent = parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");

      const toolParts = parts.filter(
        (p) => p.type !== "text" && p.type !== "reasoning"
      );
      const toolInvocationsJson =
        toolParts.length > 0 ? JSON.stringify(toolParts) : undefined;

      await saveMessage(
        currentChatId,
        "assistant",
        textContent,
        toolInvocationsJson
      );
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      let activeChatId = currentChatId;

      if (!activeChatId && !chatCreatedRef.current) {
        chatCreatedRef.current = true;
        try {
          const newChat = await createChat(input.slice(0, 100));
          activeChatId = newChat.id;
          setCurrentChatId(newChat.id);
          onChatCreated?.(newChat.id);
        } catch {
          chatCreatedRef.current = false;
          return;
        }
      }

      if (activeChatId) {
        await saveMessage(activeChatId, "user", input);
      }

      if (activeChatId && messages.length === 0) {
        await updateChatTitle(activeChatId, input.slice(0, 100));
      }

      sendMessage({ text: input });
      setInput("");
    },
    [currentChatId, input, messages.length, onChatCreated, sendMessage, isLoading]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold">How can I help you today?</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                I can check the weather, look up F1 race schedules, and fetch stock
                prices. Ask me anything!
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
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">
            Something went wrong. Please try again.
          </p>
        </div>
      )}

      {/* Input Area */}
      <ChatInput
        input={input}
        onInputChange={setInput}
        handleSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}