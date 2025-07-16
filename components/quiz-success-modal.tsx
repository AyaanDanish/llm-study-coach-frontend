"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Brain,
  Trophy,
  Sparkles,
  ArrowRight,
  Target,
} from "lucide-react";

interface QuizSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewQuiz: () => void;
  quizTitle: string;
  questionCount?: number;
  materialTitle: string;
}

export default function QuizSuccessModal({
  isOpen,
  onClose,
  onViewQuiz,
  quizTitle,
  questionCount = 5,
  materialTitle,
}: QuizSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        {/* Success Animation Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/10 dark:via-emerald-900/10 dark:to-teal-900/10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-teal-400/10 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto mb-4 relative">
              {/* Main success icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>

              {/* Floating sparkles */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <div className="absolute -bottom-1 -left-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-bounce animation-delay-500">
                <Trophy className="h-2.5 w-2.5 text-white" />
              </div>
            </div>

            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Generated Successfully!
            </DialogTitle>

            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Your AI-powered quiz is ready! Check the Quizzes section to view
              and take it.
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quiz Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {quizTitle}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Based on:{" "}
                    <span className="font-medium">{materialTitle}</span>
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {questionCount} Questions
                    </span>
                    <span>Multiple Choice</span>
                    <span>AI Generated</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                    AI-Powered
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Smart questions
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-purple-800 dark:text-purple-300">
                    Track Progress
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">
                    See your scores
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
