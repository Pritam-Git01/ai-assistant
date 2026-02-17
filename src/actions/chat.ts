"use server";

import { db } from "@/lib/db";
import { chats, messages } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Get all chats for the authenticated user (ordered by most recent)
 */
export async function getUserChats() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const userChats = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, session.user.id))
    .orderBy(desc(chats.updatedAt));

  return userChats;
}

/**
 * Get a specific chat with all its messages
 */
export async function getChatWithMessages(chatId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const chat = await db.query.chats.findFirst({
    where: eq(chats.id, chatId),
    with: {
      messages: {
        orderBy: [asc(messages.createdAt)],
      },
    },
  });

  // Ensure the chat belongs to the current user
  if (!chat || chat.userId !== session.user.id) {
    return null;
  }

  return chat;
}

/**
 * Create a new chat conversation
 */
export async function createChat(title?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [newChat] = await db
    .insert(chats)
    .values({
      userId: session.user.id,
      title: title || "New Chat",
    })
    .returning();

  revalidatePath("/chat", "layout");
  return newChat;
}

/**
 * Save a message to a chat
 */
export async function saveMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string,
  toolInvocations?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [newMessage] = await db
    .insert(messages)
    .values({
      chatId,
      role,
      content,
      toolInvocations: toolInvocations || null,
    })
    .returning();

  // Update the chat's updatedAt timestamp
  await db
    .update(chats)
    .set({ updatedAt: new Date() })
    .where(eq(chats.id, chatId));

  return newMessage;
}

/**
 * Update chat title (uses first user message as title)
 */
export async function updateChatTitle(chatId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db
    .update(chats)
    .set({ title: title.slice(0, 100) })
    .where(eq(chats.id, chatId));

  revalidatePath("/chat", "layout");
}

/**
 * Delete a chat and all its messages
 */
export async function deleteChat(chatId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.delete(chats).where(eq(chats.id, chatId));

  revalidatePath("/chat", "layout");
}