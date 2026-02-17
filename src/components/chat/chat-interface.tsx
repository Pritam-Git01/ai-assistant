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
  pendingMessage?: string;
  onChatCreated?: (chatId: string) => void;
}

function dbMessagesToUIMessages(dbMessages: DBMessage[]): UIMessage[] {
  return dbMessages.map((msg) => {
    const parts: UIMessage["parts"] = [];

    const safeContent =
      typeof msg.content === "string" &&
        msg.content.trim() !== "" &&
        msg.content !== "0"
        ? msg.content
        : "";

    if (safeContent) {
      parts.push({ type: "text", text: safeContent });
    }

    if (msg.toolInvocations) {
      try {
        const invocations = JSON.parse(msg.toolInvocations);
        if (Array.isArray(invocations)) {
          parts.push(...invocations);
        }
      } catch {
        console.error("Failed to parse toolInvocations");
      }
    }

    return {
      id: msg.id,
      role: msg.role as "user" | "assistant",
      content: safeContent,
      parts,
      createdAt: msg.createdAt,
    };
  });
}

export function ChatInterface({
  chatId: initialChatId,
  initialMessages,
  pendingMessage,
  onChatCreated,
}: ChatInterfaceProps) {
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(
    initialChatId
  );
  const [input, setInput] = useState("");

  const savedMessagesRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSentPendingRef = useRef(false);
  const hasSetInitialRef = useRef(false);

  const { messages, sendMessage, setMessages, status, error } = useChat();

  const isLoading = status === "submitted" || status === "streaming";

  /*
   * HYDRATE FROM DB
   */
  useEffect(() => {
    if (
      initialMessages &&
      initialMessages.length > 0 &&
      !hasSetInitialRef.current
    ) {
      hasSetInitialRef.current = true;
      const formatted = dbMessagesToUIMessages(initialMessages);
      setMessages(formatted);
      // Mark these as saved so we don't try to save them again
      initialMessages.forEach((m) => savedMessagesRef.current.add(m.id));
    }
  }, [initialMessages, setMessages]);

  /*
   * AUTO SCROLL
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /*
   * ✅ PERSIST ASSISTANT MESSAGE AFTER STREAMING FINISHES
   */
  useEffect(() => {
    if (!currentChatId) return;
    if (status !== "ready") return;

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;
    if (lastMessage.role !== "assistant") return;
    if (savedMessagesRef.current.has(lastMessage.id)) return;

    const parts = lastMessage.parts ?? [];

    const textContent = parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");

    const toolParts = parts.filter(
      (p: any) =>
        p.type.startsWith("tool-") ||
        p.type === "tool-invocation"
    );

    const toolInvocationsJson =
      toolParts.length > 0 ? JSON.stringify(toolParts) : undefined;

    savedMessagesRef.current.add(lastMessage.id);

    saveMessage(
      currentChatId,
      "assistant",
      textContent,
      toolInvocationsJson
    );
  }, [messages, status, currentChatId]);

  /*
   * AUTO SEND PENDING MESSAGE
   */
  useEffect(() => {
    if (!pendingMessage || hasSentPendingRef.current) return;
    hasSentPendingRef.current = true;

    const autoSend = async () => {
      try {
        const newChat = await createChat(pendingMessage.slice(0, 100));
        const chatId = newChat.id;

        setCurrentChatId(chatId);

        await saveMessage(chatId, "user", pendingMessage);
        await updateChatTitle(chatId, pendingMessage.slice(0, 100));

        onChatCreated?.(chatId);

        sendMessage({ text: pendingMessage });
      } catch (err) {
        console.error("Auto-send failed:", err);
        hasSentPendingRef.current = false;
      }
    };

    autoSend();
  }, [pendingMessage, sendMessage, onChatCreated]);

  /*
   * NORMAL SUBMIT
   */
  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userInput = input;
      let activeChatId = currentChatId;

      if (!activeChatId) {
        try {
          const newChat = await createChat(userInput.slice(0, 100));
          activeChatId = newChat.id;
          setCurrentChatId(newChat.id);
          onChatCreated?.(newChat.id);
        } catch {
          return;
        }
      }

      await saveMessage(activeChatId, "user", userInput);

      if (messages.length === 0) {
        await updateChatTitle(activeChatId, userInput.slice(0, 100));
      }

      sendMessage({ text: userInput });
      setInput("");
    },
    [
      currentChatId,
      input,
      messages.length,
      onChatCreated,
      sendMessage,
      isLoading,
    ]
  );

  const showWelcome =
    messages.length === 0 && !pendingMessage && !initialMessages?.length;

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {showWelcome ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>

            <div className="text-center">
              <h2 className="text-xl font-semibold">
                How can I help you today?
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Ask me anything.
              </p>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">
            Something went wrong. Please try again.
          </p>
        </div>
      )}

      <ChatInput
        input={input}
        onInputChange={setInput}
        handleSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
