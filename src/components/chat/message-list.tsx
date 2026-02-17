"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ToolResult } from "@/components/tools/tool-result";
import { Bot, User, Loader2 } from "lucide-react";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";

interface MessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const { data: session } = useSession();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-20">
      {messages.map((message) => (
        <div key={message.id} className="flex gap-3">
          {/* Avatar */}
          <Avatar className="mt-0.5 h-8 w-8 shrink-0">
            {message.role === "user" ? (
              <>
                <AvatarImage src={session?.user?.image || ""} alt="User" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </>
            ) : (
              <AvatarFallback className="bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </AvatarFallback>
            )}
          </Avatar>

          {/* Message Content - v6 parts-based rendering */}
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              {message.role === "user"
                ? session?.user?.name || "You"
                : "AI Assistant"}
            </p>

            {message.parts.map((part, index) => {
              // Text parts
              if (part.type === "text") {
                return (
                  <div key={`${message.id}-${index}`} className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                  </div>
                );
              }

              // Tool invocation parts (v6 format: tool-<toolName>)
              if (
                part.type.startsWith("tool-") ||
                part.type === "tool-invocation"
              ) {
                // Handle both static tool parts (tool-getWeather) and
                // generic tool-invocation parts
                const toolPart = part as {
                  type: string;
                  toolName?: string;
                  toolCallId: string;
                  state: string;
                  input?: Record<string, unknown>;
                  output?: unknown;
                  args?: Record<string, unknown>;
                  result?: unknown;
                };

                const toolName =
                  toolPart.toolName ||
                  part.type.replace("tool-", "");

                const args = toolPart.input || toolPart.args || {};
                const result = toolPart.output || toolPart.result;

                // Map v6 states to our ToolResult states
                let state = "call";
                if (
                  toolPart.state === "output-available" ||
                  toolPart.state === "result"
                ) {
                  state = "result";
                }

                return (
                  <ToolResult
                    key={toolPart.toolCallId || `${message.id}-${index}`}
                    toolName={toolName}
                    args={args as Record<string, unknown>}
                    result={result}
                    state={state}
                  />
                );
              }

              return null;
            })}
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="flex gap-3">
          <Avatar className="mt-0.5 h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2 pt-1">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>
        </div>
      )}
    </div>
  );
}