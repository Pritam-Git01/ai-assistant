// FILE: store/chat-store.ts
import { create } from "zustand";

interface ChatStore {
  // The first message typed on the "/" home page
  pendingMessage: string | null;
  setPendingMessage: (msg: string | null) => void;
  clearPendingMessage: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  pendingMessage: null,
  setPendingMessage: (msg) => set({ pendingMessage: msg }),
  clearPendingMessage: () => set({ pendingMessage: null }),
}));