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
  Zap,
  Trophy,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface FlashcardSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcardCount: number;
  category: string;
  materialTitle: string;
}

export default function FlashcardSuccessModal({
  isOpen,
  onClose,
  flashcardCount,
  category,
  materialTitle,
}: FlashcardSuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        {/* Success Animation Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/10 dark:via-indigo-900/10 dark:to-blue-900/10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <DialogHeader className="text-center pb-6">
            <div className="mx-auto mb-4 relative">
              {/* Main success icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>

              {/* Floating sparkles */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <div className="absolute -bottom-1 -left-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-bounce animation-delay-500">
                <Zap className="h-2.5 w-2.5 text-white" />
              </div>
            </div>

            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Flashcards Generated Successfully!
            </DialogTitle>

            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Your AI-powered flashcards are ready! Check the Flashcards section
              to study them.
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Flashcard Details Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {flashcardCount} Flashcards Created
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    From: <span className="font-medium">{materialTitle}</span>
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Category: {category}
                    </span>
                    <span>AI Generated</span>
                  </div>
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
