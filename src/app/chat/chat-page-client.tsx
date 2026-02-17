"use client";

import { useState, useCallback, useEffect } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { UserMenu } from "@/components/auth/user-menu";
import { getChatWithMessages, getUserChats } from "@/actions/chat";
import { Bot } from "lucide-react";
import type { Chat, Message as DBMessage } from "@/db/schema";

interface ChatPageClientProps {
  initialChats: Chat[];
}

/**
 * Client component for the chat page.
 * Manages chat selection, sidebar state, and renders the chat interface.
 * This is the CSR part - handles all interactive elements.
 */
export function ChatPageClient({ initialChats }: ChatPageClientProps) {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChatId, setActiveChatId] = useState<string | undefined>();
  const [activeMessages, setActiveMessages] = useState<DBMessage[]>([]);
  const [chatKey, setChatKey] = useState(0);

  // Refresh chat list from server
  const refreshChats = useCallback(async () => {
    const updatedChats = await getUserChats();
    setChats(updatedChats);
  }, []);

  // Select and load a chat
  const handleSelectChat = useCallback(async (chatId: string) => {
    const chatData = await getChatWithMessages(chatId);
    if (chatData) {
      setActiveChatId(chatData.id);
      setActiveMessages(chatData.messages);
      setChatKey((prev) => prev + 1); // Force re-mount of ChatInterface
    }
  }, []);

  // Start a new chat
  const handleNewChat = useCallback(() => {
    setActiveChatId(undefined);
    setActiveMessages([]);
    setChatKey((prev) => prev + 1);
  }, []);

  // When a chat is created from the interface, update sidebar
  const handleChatCreated = useCallback(
    async (chatId: string) => {
      setActiveChatId(chatId);
      await refreshChats();
    },
    [refreshChats]
  );

  // Refresh chats when activeChatId changes to keep sidebar in sync
  useEffect(() => {
    if (activeChatId) {
      refreshChats();
    }
  }, [activeChatId, refreshChats]);

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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Chat History */}
        <ChatSidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
        />

        {/* Chat Interface */}
        <div className="flex-1">
          <ChatInterface
            key={chatKey}
            chatId={activeChatId}
            initialMessages={activeMessages}
            onChatCreated={handleChatCreated}
          />
        </div>
      </div>
    </div>
  );
}
