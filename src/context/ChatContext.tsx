"use client";

import { createContext, useContext, ReactNode } from "react";

interface Message {
  content: string;
  isUser: boolean;
  timestamp: number;
}

interface ChatContextType {
  addMessage: (collectionId: string, message: Message) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const addMessage = (collectionId: string, message: Message) => {
    // Get existing messages
    const chatMessages = localStorage.getItem(`chat_messages_${collectionId}`);
    const messages = chatMessages ? JSON.parse(chatMessages) : [];

    // Add new message
    messages.push(message);

    // Save to localStorage
    localStorage.setItem(`chat_messages_${collectionId}`, JSON.stringify(messages));

    // Dispatch a custom event
    window.dispatchEvent(
      new CustomEvent("chatMessageAdded", {
        detail: { collectionId, messages }
      })
    );
  };

  return <ChatContext.Provider value={{ addMessage }}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
