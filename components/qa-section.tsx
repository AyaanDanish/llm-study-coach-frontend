import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import config from "../lib/config";
import ReactMarkdown from "react-markdown";

interface QAItem {
  id: string;
  question: string;
  answer: string;
  created_at: string; // ISO date string
}

interface QASectionProps {
  contentHash: string;
  materialId?: string;
}

// Fetch Q&A from backend (which fetches from Supabase)
const fetchQA = async (contentHash: string): Promise<QAItem[]> => {
  const response = await fetch(`${config.apiUrl}/api/qa-list?content_hash=${contentHash}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch Q&A");
  }
  // Map backend results to QAItem[]
  return (data.qa || []).map((item: any) => ({
    id: item.id?.toString() || Math.random().toString(),
    question: item.question,
    answer: item.answer,
    created_at: item.created_at,
  }));
};

const askQuestion = async (
  contentHash: string,
  question: string
): Promise<QAItem> => {
  const response = await fetch(`${config.apiUrl}/api/ask-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content_hash: contentHash, question }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to get answer");
  }
  // The backend stores the answer in Supabase, so we will re-fetch the list after asking
  return {
    id: Math.random().toString(),
    question,
    answer: data.answer,
    created_at: new Date().toISOString(),
  };
};

export default function QASection({ contentHash, materialId }: QASectionProps) {
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Fetch Q&A on mount and when contentHash changes
  useEffect(() => {
    setLoading(true);
    fetchQA(contentHash)
      .then(setQaList)
      .catch(() => setError("Failed to load Q&A"))
      .finally(() => setLoading(false));
  }, [contentHash]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const newQA = await askQuestion(contentHash, question);
      setQaList((prev) => [newQA, ...prev]);
      setQuestion("");
      // Do NOT re-fetch from backend after asking; keep local answers only
    } catch (e: any) {
      setError(e.message || "Failed to submit question");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit on Enter key
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !submitting && question.trim()) {
      e.preventDefault();
      handleAsk();
    }
  };

  // Group Q&A by date
  const grouped = qaList.reduce((acc, qa) => {
    const date = new Date(qa.created_at).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(qa);
    return acc;
  }, {} as Record<string, QAItem[]>);

  // Unique previous questions (excluding current input)
  const uniqueQuestions = Array.from(
    new Set(qaList.map((qa) => qa.question))
  ).filter((q) => q && q !== question);

  return (
    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700">
      <h4 className="text-md font-semibold mb-2 text-indigo-700 dark:text-indigo-300">Ask Questions & Get Explanations</h4>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          placeholder="Type your question about these notes..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setTimeout(() => setInputFocused(false), 200)}
          disabled={submitting}
        />
        <Button onClick={handleAsk} disabled={submitting || !question.trim()}>
          {submitting ? "Asking..." : "Ask"}
        </Button>
      </div>
      {inputFocused && uniqueQuestions.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-gray-500 mb-1">Previous questions:</div>
          <div className="flex flex-wrap gap-2">
            {uniqueQuestions.slice(0, 5).map((q) => (
              <button
                key={q}
                type="button"
                className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900"
                onClick={() => setQuestion(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-500">Loading Q&A...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="text-xs text-gray-500 mb-1">{date}</div>
              <div className="space-y-2">
                {items.map((qa) => (
                  <div key={qa.id} className="rounded border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <button
                      className="w-full text-left px-3 py-2 font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 focus:outline-none flex justify-between items-center"
                      onClick={() => toggleOpen(qa.id)}
                    >
                      <span>Q: {qa.question}</span>
                      <span className="ml-2 text-xs">{openIds.includes(qa.id) ? "▲" : "▼"}</span>
                    </button>
                    {openIds.includes(qa.id) && (
                      <div className="prose dark:prose-invert px-3 pb-3">
                        <ReactMarkdown>{qa.answer}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {qaList.length === 0 && <div className="text-gray-500">Ask anything regarding your study note!</div>}
        </div>
      )}
    </div>
  );
} 