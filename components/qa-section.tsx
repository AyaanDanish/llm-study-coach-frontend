import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Trash2, MessageCircle } from "lucide-react";
import config from "../lib/config";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabaseClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

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
  console.log("🔍 Fetching Q&A for content hash:", contentHash);
  const response = await fetch(
    `${config.apiUrl}/api/qa-list?content_hash=${contentHash}`
  );

  console.log("📡 Fetch Q&A response status:", response.status);
  const data = await response.json();
  console.log("📡 Fetch Q&A response data:", data);

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch Q&A");
  }
  // Map backend results to QAItem[]
  const mappedData = (data.qa || []).map((item: any) => ({
    id: item.id?.toString() || Math.random().toString(),
    question: item.question,
    answer: item.answer,
    created_at: item.created_at,
  }));

  console.log("✅ Mapped Q&A data:", mappedData);
  return mappedData;
};

const askQuestion = async (
  contentHash: string,
  question: string
): Promise<string> => {
  console.log("🚀 Sending question to backend:", { contentHash, question });
  const response = await fetch(`${config.apiUrl}/api/ask-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content_hash: contentHash, question }),
  });

  console.log("📡 Backend response status:", response.status);
  const data = await response.json();
  console.log("📡 Backend response data:", data);

  if (!response.ok) {
    throw new Error(data.error || "Failed to get answer");
  }
  return data.answer;
};

const deleteQA = async (qaId: string): Promise<void> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Please log in to delete Q&A");
  }

  const response = await fetch(`${config.apiUrl}/api/qa/${qaId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": user.id,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete Q&A");
  }
};

export default function QASection({ contentHash, materialId }: QASectionProps) {
  const [qaList, setQaList] = useState<QAItem[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qaToDelete, setQaToDelete] = useState<string | null>(null);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const loadQA = async () => {
    setLoading(true);
    console.log("📖 Loading Q&A for content hash:", contentHash);
    try {
      const qa = await fetchQA(contentHash);
      console.log("✅ Loaded Q&A:", qa);
      setQaList(qa);
      setError(null);
    } catch (e: any) {
      console.error("❌ Error loading Q&A:", e);
      setError("Failed to load Q&A");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Q&A on mount and when contentHash changes
  useEffect(() => {
    loadQA();
  }, [contentHash]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setSubmitting(true);
    setError(null);
    console.log("🤔 Asking question:", question);
    console.log("📝 Content hash:", contentHash);

    try {
      const answer = await askQuestion(contentHash, question);
      console.log("✅ Got answer from backend:", answer);
      setQuestion("");

      // Refresh the Q&A list to get the persisted data from the backend
      console.log("🔄 Refreshing Q&A list...");
      await loadQA();
      console.log("✅ Q&A list refreshed");
    } catch (e: any) {
      console.error("❌ Error asking question:", e);
      setError(e.message || "Failed to submit question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (qaId: string) => {
    setQaToDelete(qaId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!qaToDelete) return;

    setDeletingIds((prev) => [...prev, qaToDelete]);
    try {
      await deleteQA(qaToDelete);
      // Remove the deleted item from the list
      setQaList((prev) => prev.filter((qa) => qa.id !== qaToDelete));
      // Also remove from open IDs if it was open
      setOpenIds((prev) => prev.filter((id) => id !== qaToDelete));
    } catch (e: any) {
      setError(e.message || "Failed to delete Q&A");
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== qaToDelete));
      setDeleteDialogOpen(false);
      setQaToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setQaToDelete(null);
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
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h4 className="text-md font-semibold text-indigo-700 dark:text-indigo-300">
          Ask Questions & Get Explanations
        </h4>
        {qaList.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
            {qaList.length} Q&A{qaList.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
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
      {error && (
        <div className="text-red-500 mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-gray-500 flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-indigo-600 rounded-full"></div>
          Loading Q&A...
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="text-xs text-gray-500 mb-1 font-medium">
                {date}
              </div>
              <div className="space-y-2">
                {items.map((qa) => (
                  <div
                    key={qa.id}
                    className="rounded border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-center">
                      <button
                        className="flex-1 text-left px-3 py-2 font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 focus:outline-none flex justify-between items-center"
                        onClick={() => toggleOpen(qa.id)}
                      >
                        <span>Q: {qa.question}</span>
                        <span className="ml-2 text-xs">
                          {openIds.includes(qa.id) ? "▲" : "▼"}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(qa.id)}
                        disabled={deletingIds.includes(qa.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-r disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete this Q&A"
                      >
                        {deletingIds.includes(qa.id) ? (
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-red-500 rounded-full"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {openIds.includes(qa.id) && (
                      <div className="prose dark:prose-invert px-3 pb-3 max-w-none">
                        <ReactMarkdown>{qa.answer}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {qaList.length === 0 && (
            <div className="text-gray-500 text-center py-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              Ask anything regarding your study notes!
            </div>
          )}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Q&A</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question and answer? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
