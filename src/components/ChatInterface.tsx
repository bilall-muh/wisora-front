"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collection } from "@/types/collection";
import { Card } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Message {
  content: string;
  isUser: boolean;
  timestamp: number;
}

interface AIResponse {
  text: string;
  processingTime: number;
  status: string;
}

interface APIResponse {
  status: string;
  data: {
    aiResponse: AIResponse;
  };
}

interface ChatInterfaceProps {
  collection: Collection;
}

export function ChatInterface({ collection }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    // Initialize messages from localStorage if available
    if (typeof window !== "undefined") {
      const savedMessages = localStorage.getItem(`chat_messages_${collection.id}`);
      return savedMessages ? JSON.parse(savedMessages) : [];
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`chat_messages_${collection.id}`, JSON.stringify(messages));
  }, [messages, collection.id]);

  // Listen for custom chat message events
  useEffect(() => {
    const handleCustomEvent = (e: CustomEvent<{ collectionId: string; messages: Message[] }>) => {
      if (e.detail.collectionId === collection.id) {
        setMessages(e.detail.messages);
      }
    };

    window.addEventListener("chatMessageAdded", handleCustomEvent as EventListener);
    return () => window.removeEventListener("chatMessageAdded", handleCustomEvent as EventListener);
  }, [collection.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (input.trim()) {
      setIsLoading(true);
      setMessages([
        ...messages,
        {
          content: input,
          isUser: true,
          timestamp: Date.now()
        }
      ]);
      const query = input;
      setInput("");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/pdf/similar?query=${encodeURIComponent(
            query
          )}&collection=${encodeURIComponent(collection.slug)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }
        const data: APIResponse = await response.json();

        localStorage.setItem("pdfResults", JSON.stringify(data));

        setMessages((prev) => [
          ...prev,
          {
            content: data?.data?.aiResponse?.text || "No relevant results found",
            isUser: false,
            timestamp: Date.now()
          }
        ]);
      } catch (error) {
        console.error("Error fetching results:", error);
        setMessages((prev) => [
          ...prev,
          {
            content: "Sorry, there was an error fetching the results.",
            isUser: false,
            timestamp: Date.now()
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(`chat_messages_${collection.id}`);
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const aiResponse = await api.analyzeBusinessReport(collection.slug);
      if (aiResponse && aiResponse.text) {
        setMessages((prev) => [
          ...prev,
          {
            content: aiResponse.text,
            isUser: false,
            timestamp: Date.now()
          }
        ]);
      } else {
        console.error("Invalid AI response:", aiResponse);
        toast.error("Failed to generate the report. Please try again later.");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("An error occurred while generating the report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10.5rem)] bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex-none p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Chat</h2>
          <div className="flex gap-2">
            <Button
              onClick={generateReport}
              variant="default"
              size="sm"
              disabled={isGenerating}
              className=" "
            >
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
            <Button
              onClick={clearChat}
              variant="ghost"
              size="sm"
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Clear Chat
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 ${message.isUser ? "justify-end" : "justify-start"}`}
          >
            {!message.isUser && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            )}
            <div
              className={`group relative flex flex-col max-w-[85%] ${
                message.isUser ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.isUser
                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-800 rounded-br-sm"
                    : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 rounded-bl-sm"
                }`}
              >
                <MarkdownRenderer content={message.content} isUserMessage={message.isUser} />
              </div>
              <span
                className={`text-xs mt-1 text-zinc-500 dark:text-zinc-400 ${
                  message.isUser ? "text-right" : "text-left"
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
            {message.isUser && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 dark:bg-zinc-700 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-zinc-100 dark:text-zinc-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <Card className="px-4 py-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl rounded-bl-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="flex-none p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
            className="flex-1 h-10 px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:focus-visible:ring-zinc-400"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading}
            variant="default"
            className="h-10 px-4 text-sm font-medium"
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}
