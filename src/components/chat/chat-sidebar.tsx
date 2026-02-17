// FILE: components/chat/chat-sidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquarePlus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { getUserChats, deleteChat } from "@/actions/chat";
import type { Chat } from "@/db/schema";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  activeChatId?: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat?: () => void;
}

export function ChatSidebar({
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}: ChatSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch chats on mount (self-contained — no server props needed)
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    getUserChats()
      .then((data) => {
        if (!cancelled) setChats(data);
      })
      .catch(() => { })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteChat(chatId);

    // Remove from local state immediately
    setChats((prev) => prev.filter((c) => c.id !== chatId));

    // If we deleted the active chat, go to new chat
    if (activeChatId === chatId) {
      onNewChat();
    }
    onDeleteChat?.();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const d = new Date(date);
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  if (isCollapsed) {
    return (
      <div className="flex h-full w-12 flex-col items-center border-r bg-muted/30 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="mb-2"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNewChat}>
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-66 flex-col border-r bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <h2 className="text-base font-semibold">Chat History</h2>
        <div className="flex items-center gap-1">
          <button
           
            onClick={onNewChat}
            className="size-9 cursor-pointer hover:bg-accent rounded-lg flex items-center justify-center"
          >
            <MessageSquarePlus className="size-5" />
          </button>
          <button
          
            onClick={() => setIsCollapsed(true)}
            className="size-9 cursor-pointer hover:bg-accent rounded-lg flex items-center justify-center"
          >
            <PanelLeftClose className="size-5" />
          </button>
        </div>
      </div>

      <Separator />

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 w-full">
          {isLoading ? (
            <div className="flex w-full justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : chats.length === 0 ? (
            <p className="px-2 py-8 text-center text-xs text-muted-foreground">
              No conversations yet. Start a new chat!
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  "group flex cursor-pointer w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent overflow-visible",
                  activeChatId === chat.id && "bg-accent"
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />

                <div className="flex min-w-0 flex-1 items-center justify-between">
                  <p className="truncate font-medium">{chat.title}</p>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => handleDelete(chat.id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}