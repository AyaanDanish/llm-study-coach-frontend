"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, Brain, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/contexts/ThemeContext";

interface StudyNotesViewerProps {
  materialId: string;
  contentHash: string;
  onClose: () => void;
  onNotesNotFound?: () => React.ReactNode;
  onGenerateNotes: () => Promise<void>;
  isGenerating: boolean;
}

export default function StudyNotesViewer({
  materialId,
  contentHash,
  onClose,
  onNotesNotFound,
  onGenerateNotes,
  isGenerating,
}: StudyNotesViewerProps) {
  const { isDarkMode } = useTheme();
  const [notes, setNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:5000"
        }/api/notes/${contentHash}`
      );
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 && onNotesNotFound) {
          return onNotesNotFound();
        }
        throw new Error(data.error || "Failed to fetch notes");
      }

      setNotes(data.content);
      setGeneratedAt(data.generated_at);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNotes = async () => {
    try {
      await onGenerateNotes();
      await fetchNotes(); // Refresh notes after generation
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      setGeneratingFlashcards(true);
      setError(null);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please log in to generate flashcards");
        return;
      }
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:5000"
        }/api/generate-flashcards-from-material/${contentHash}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": user.id,
          },
          body: JSON.stringify({
            category: "Study Material", // Default category
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      // Show success message (you might want to use a toast notification here)
      alert(`Successfully generated ${data.total_saved} flashcards!`);
    } catch (err: any) {
      setError(`Failed to generate flashcards: ${err.message}`);
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [contentHash]);

  if (loading || isGenerating) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {isGenerating
              ? "Generating study notes..."
              : "Loading study notes..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    if (error.includes("Notes not found") && onNotesNotFound) {
      return onNotesNotFound();
    }

    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={fetchNotes} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {" "}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-300">
            Study Notes
          </h3>
          {generatedAt && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Generated on {new Date(generatedAt).toLocaleString()}
            </p>
          )}
        </div>

        {notes && (
          <Button
            onClick={handleGenerateFlashcards}
            disabled={generatingFlashcards}
            variant="outline"
            size="sm"
            className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30"
          >
            {generatingFlashcards ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Flashcards
              </>
            )}
          </Button>
        )}
      </div>{" "}
      <div className="prose prose-indigo prose-lg max-w-none bg-white dark:bg-gray-800 p-6 rounded-xl border border-indigo-100 dark:border-gray-700">
        {notes ? (
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-indigo-800 dark:text-indigo-300 mb-4">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-indigo-700 dark:text-indigo-400 mb-3 mt-6">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-400 mb-2 mt-4">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-3 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-3 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-gray-700 dark:text-gray-300 ml-2">
                  {children}
                </li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-indigo-800 dark:text-indigo-300">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-600 dark:text-gray-400">
                  {children}
                </em>
              ),
              hr: () => (
                <hr className="my-6 border-indigo-200 dark:border-gray-600" />
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-indigo-300 dark:border-indigo-600 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
                  {children}
                </blockquote>
              ),
              code: ({ children, ...props }) => {
                const isInline = !props.className?.includes("language-");
                return isInline ? (
                  <code className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-1 py-0.5 rounded text-sm">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-gray-900 dark:text-gray-100">
                      {children}
                    </code>
                  </pre>
                );
              },
            }}
          >
            {notes}
          </ReactMarkdown>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No notes available. Click "Generate Notes" to create study notes
              for this material.
            </p>
            <Button
              onClick={handleGenerateNotes}
              disabled={isGenerating}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />
                  Generate Notes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      {notes && (
        <div className="mt-4">
          <Button
            onClick={handleGenerateFlashcards}
            disabled={generatingFlashcards}
            variant="outline"
            className="w-full"
          >
            {generatingFlashcards ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Generate Flashcards
          </Button>
        </div>
      )}
    </div>
  );
}
