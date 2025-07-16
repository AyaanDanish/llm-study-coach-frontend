"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, Brain, Zap, Target } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/contexts/ThemeContext";
import GenerateQuizDialog from "./generate-quiz-dialog";
import QASection from "./qa-section";
import FlashcardSuccessModal from "./flashcard-success-modal";

interface StudyNotesViewerProps {
  materialId: string;
  contentHash: string;
  onClose: () => void;
  onNotesNotFound?: () => React.ReactNode;
  onGenerateNotes: () => Promise<void>;
  isGenerating: boolean;
  materialName?: string;
  materialSubject?: string;
}

export default function StudyNotesViewer({
  materialId,
  contentHash,
  onClose,
  onNotesNotFound,
  onGenerateNotes,
  isGenerating,
  materialName,
  materialSubject,
}: StudyNotesViewerProps) {
  const { isDarkMode } = useTheme();
  const [notes, setNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [flashcardSuccessModal, setFlashcardSuccessModal] = useState<{
    isOpen: boolean;
    count: number;
    category: string;
  }>({ isOpen: false, count: 0, category: "" });

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
        setGeneratingFlashcards(false);
        return;
      }

      // Create a descriptive category based on subject and material name
      let flashcardCategory = "Study Material"; // Default fallback

      if (materialSubject && materialName) {
        // Create format: "Subject - Topic"
        const cleanName = materialName
          .replace(/\.(pdf|docx?|txt)$/i, "")
          .replace(/[_-]/g, " ")
          .trim();
        flashcardCategory = `${materialSubject} - ${cleanName}`;
      } else if (materialSubject) {
        flashcardCategory = materialSubject;
      } else if (materialName) {
        const cleanName = materialName
          .replace(/\.(pdf|docx?|txt)$/i, "")
          .replace(/[_-]/g, " ")
          .trim();
        flashcardCategory = cleanName;
      }

      console.log("Flashcard category generation:", {
        materialSubject,
        materialName,
        flashcardCategory,
      });

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
            category: flashcardCategory,
          }),
        }
      );

      const data = await response.json();
      console.log("Flashcard generation response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      // Show success modal
      const flashcardCount =
        data.total_saved || data.count || data.flashcards?.length || 0;

      setFlashcardSuccessModal({
        isOpen: true,
        count: flashcardCount,
        category: flashcardCategory,
      });
    } catch (err: any) {
      console.error("Flashcard generation error:", err);
      setError(`Failed to generate flashcards: ${err.message}`);
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const handleGenerateQuiz = () => {
    console.log("Opening quiz dialog with materialId:", materialId);
    console.log("Material name:", materialName);
    console.log("Material subject:", materialSubject);
    setQuizDialogOpen(true);
  };

  const handleQuizSuccess = () => {
    setQuizDialogOpen(false);
    // Quiz generated successfully - user can navigate to Quiz section to see it
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
    <div className="space-y-3">
      {/* Compact header with inline timestamp and actions */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-medium text-indigo-800 dark:text-indigo-300">
            Study Notes
          </h3>
          {generatedAt && (
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
              {new Date(generatedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {notes && (
          <div className="flex gap-1.5">
            <Button
              onClick={handleGenerateFlashcards}
              disabled={generatingFlashcards}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30"
            >
              {generatingFlashcards ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Zap className="h-3 w-3 mr-1" />
                  Generate Flashcards
                </>
              )}
            </Button>
            <Button
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
            >
              {generatingQuiz ? (

                <Loader2 className="h-3 w-3 animate-spin" /> 
              ) : (
                <>
                  <Target className="h-3 w-3 mr-1" />
                  Generate Quiz
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {notes && <QASection contentHash={contentHash} materialId={materialId} />}

      <div className="prose prose-indigo prose-lg max-w-none bg-white dark:bg-gray-800 p-6 rounded-xl border border-indigo-100 dark:border-gray-700">
        {notes ? (
          <>
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
          </>
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
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleGenerateFlashcards}
            disabled={generatingFlashcards}
            variant="outline"
            className="flex-1"
          >
            {generatingFlashcards ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Generate Flashcards
          </Button>
          <Button
            onClick={handleGenerateQuiz}
            disabled={generatingQuiz}
            variant="outline"
            className="flex-1"
          >
            {generatingQuiz ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Target className="h-4 w-4 mr-2" />
            )}
            Generate Quiz
          </Button>
        </div>
      )}
      <GenerateQuizDialogWrapper
        isOpen={quizDialogOpen}
        onClose={() => setQuizDialogOpen(false)}
        onSuccess={handleQuizSuccess}
        contentHash={contentHash}
        materialName={materialName}
        materialSubject={materialSubject}
      />
      
      <FlashcardSuccessModal
        isOpen={flashcardSuccessModal.isOpen}
        onClose={() => setFlashcardSuccessModal({ isOpen: false, count: 0, category: "" })}
        flashcardCount={flashcardSuccessModal.count}
        category={flashcardSuccessModal.category}
        materialTitle={materialName || "Study Material"}
      />
    </div>
  );
}

// Add GenerateQuizDialog component at the end
function GenerateQuizDialogWrapper({
  isOpen,
  onClose,
  onSuccess,
  contentHash,
  materialName,
  materialSubject,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contentHash: string;
  materialName?: string;
  materialSubject?: string;
}) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };

    if (isOpen) {
      getUserId();
    }
  }, [isOpen]);

  if (!userId) return null;

  return (
    <GenerateQuizDialog
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      userId={userId}
      contentHash={contentHash}
      materialTitle={materialName || "Study Material"}
      materialSubject={materialSubject || "General"}
    />
  );
}
