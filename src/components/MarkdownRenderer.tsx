"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  isUserMessage?: boolean;
}

export function MarkdownRenderer({ content, isUserMessage = false }: MarkdownRendererProps) {
  if (isUserMessage) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-xl font-bold mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-semibold mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-medium mb-2">{children}</h3>,
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-zinc-700 dark:text-zinc-300">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-900 dark:text-zinc-50">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-800 dark:text-zinc-200">{children}</em>
          ),
          code: ({ children }) => (
            <code className="bg-zinc-100 dark:bg-zinc-800 rounded px-1 py-0.5 text-sm font-mono">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-zinc-200 dark:border-zinc-700 pl-4 italic my-2">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800">
              {children}
            </td>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
