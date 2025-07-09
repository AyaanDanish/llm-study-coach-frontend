"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Brain, Target, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import config from "@/lib/config";

interface GenerateQuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  contentHash: string;
  materialTitle: string;
  materialSubject: string;
}

export default function GenerateQuizDialog({
  isOpen,
  onClose,
  onSuccess,
  userId,
  contentHash,
  materialTitle,
  materialSubject,
}: GenerateQuizDialogProps) {
  const [quizTitle, setQuizTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generationProgress, setGenerationProgress] = useState("");

  const handleGenerate = async () => {
    if (!quizTitle.trim()) {
      setError("Please enter a quiz title");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGenerationProgress("Preparing quiz generation...");

    try {
      // Generate quiz via backend API (backend will handle material fetching)
      setGenerationProgress("Generating quiz questions...");
      console.log("Sending request to backend with:", {
        content_hash: contentHash,
        material_title: materialTitle,
        material_subject: materialSubject,
        quiz_title: quizTitle.trim(),
        user_id: userId,
      });

      const response = await fetch(`${config.apiUrl}/generate-quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content_hash: contentHash,
          material_title: materialTitle,
          material_subject: materialSubject,
          quiz_title: quizTitle.trim(),
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        console.error("Response status:", response.status);
        console.error("Response headers:", response.headers);
        throw new Error(errorData.error || "Failed to generate quiz");
      }

      const data = await response.json();
      console.log("Quiz generated successfully:", data);

      setGenerationProgress("Saving quiz to database...");

      // Save the generated quiz to the database
      const { error: insertError } = await supabase.from("quizzes").insert({
        id: data.quiz_id,
        title: quizTitle.trim(),
        subject: materialSubject,
        questions: data.questions,
        user_id: userId,
        content_hash: contentHash,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Database insert error:", insertError);
        throw insertError;
      }

      setGenerationProgress("Quiz generated successfully!");

      // Reset form
      setQuizTitle("");

      // Close dialog and refresh
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      setError(error.message || "Failed to generate quiz. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setQuizTitle("");
      setError("");
      setGenerationProgress("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Generate Quiz
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Study Material
              </span>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{materialTitle}</strong> ({materialSubject})
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              This will generate 5 multiple-choice questions based on your study
              material
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quiz-title">Quiz Title</Label>
            <Input
              id="quiz-title"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Enter a name for your quiz"
              disabled={isGenerating}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </span>
              </div>
            </div>
          )}

          {generationProgress && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-indigo-800 dark:text-indigo-200">
                  {generationProgress}
                </span>
              </div>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Quiz Format
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• 5 multiple-choice questions</li>
              <li>• 4 options per question</li>
              <li>• 1 correct answer per question</li>
              <li>• Questions based on your study material</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!quizTitle.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate Quiz
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
