"use client";
import { useState } from "react";
import { ChevronRight, Clock, CheckCircle } from "lucide-react";
import type { User } from "@/components/auth-wrapper";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/contexts/ThemeContext";

type StudyCoachAppProps = {
  initialUser: User | null;
  onComplete: (userData: Partial<User>) => void;
};

export default function StudyCoachApp({
  initialUser,
  onComplete,
}: StudyCoachAppProps) {
  const { isDarkMode } = useTheme();
  // Onboarding flow state
  const [step, setStep] = useState(1);
  const [studyminutes, setstudyminutes] = useState(
    initialUser?.studyminutes || 30
  );
  const [flashcardtarget, setflashcardtarget] = useState(
    initialUser?.flashcardtarget || 20
  );
  const [completed, setCompleted] = useState(false);

  // Convert minutes to hours for display
  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) {
      return `${remainingMinutes} minutes`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    const updateData: Partial<User> = {
      studyminutes,
      flashcardtarget,
      completedonboarding: true,
    };

    onComplete(updateData);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="border-2 border-indigo-300 dark:border-indigo-600 rounded-xl p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-indigo-50/50 dark:bg-indigo-900/20 min-h-[350px] flex flex-col justify-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                How many minutes can you study daily?
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Be realistic - consistency is better than burnout.
              </p>
              <div className="flex items-center">
                <Clock
                  className="mr-3 text-indigo-500 dark:text-indigo-400"
                  size={24}
                />
                <div className="w-full">
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="1"
                    value={studyminutes}
                    onChange={(e) =>
                      setstudyminutes(Number.parseInt(e.target.value))
                    }
                    className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span>15m</span>
                    <span>45m</span>
                    <span>1h</span>
                    <span>1h 30m</span>
                    <span>2h</span>
                  </div>
                  <div className="text-center mt-6">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {formatStudyTime(studyminutes)}
                    </span>
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {" "}
                      per day
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="border-2 border-indigo-300 dark:border-indigo-600 rounded-xl p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-indigo-50/50 dark:bg-indigo-900/20 min-h-[350px] flex flex-col justify-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                How many flashcards can you review daily?
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Flashcards are a proven way to retain information.
              </p>
              <div className="flex items-center">
                <div className="w-full">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={flashcardtarget}
                    onChange={(e) =>
                      setflashcardtarget(Number.parseInt(e.target.value))
                    }
                    className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <span>5</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                  <div className="text-center mt-6">
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {flashcardtarget}
                    </span>
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {" "}
                      flashcards per day
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                i === step
                  ? "border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-400 text-white dark:text-gray-900"
                  : i < step
                  ? "border-indigo-600 dark:border-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                  : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              {i < step && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle
                    className="text-indigo-600 dark:text-indigo-400"
                    size={16}
                  />
                </div>
              )}
              <span className={i < step ? "opacity-0" : ""}>{i}</span>
            </div>
          ))}
        </div>
        <div className="my-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 transition-all duration-500"
            style={{ width: `${((step - 1) / 1) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const renderCompletionScreen = () => {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-green-300 dark:bg-green-600 opacity-30 blur-xl"></div>
            <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 text-white dark:text-gray-900 p-5 rounded-full">
              <CheckCircle size={60} />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          You&apos;re all set!
        </h2>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-4">
            Your Study Plan:
          </h3>
          <ul className="space-y-4">
            <li className="flex items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3">
                <Clock
                  className="text-indigo-500 dark:text-indigo-400"
                  size={20}
                />
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                Daily Study Goal:{" "}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatStudyTime(studyminutes)}
                </span>
              </span>
            </li>
            <li className="flex items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mr-3">
                <CheckCircle
                  className="text-purple-500 dark:text-purple-400"
                  size={20}
                />
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                Daily Flashcard Target:{" "}
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {flashcardtarget} cards
                </span>
              </span>
            </li>
          </ul>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Your personalized study plan is ready! Click below to start learning.
        </p>
        <button
          onClick={handleComplete}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Go to Dashboard
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-indigo-900 flex flex-col items-center justify-center p-4 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pink-500 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-5 dark:opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 dark:bg-yellow-400 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-5 dark:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 dark:bg-blue-400 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-5 dark:opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50 dark:border-gray-700/50 relative z-10">
        <div className="flex justify-center mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Your Personalised Study Coach
          </h1>
        </div>

        {!completed ? (
          <>
            {renderProgressBar()}
            {renderStep()}

            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition font-medium"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {step === 2 ? (
                  "Finish"
                ) : (
                  <>
                    Next
                    <ChevronRight size={20} className="ml-1" />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          renderCompletionScreen()
        )}
      </div>
    </div>
  );
}
