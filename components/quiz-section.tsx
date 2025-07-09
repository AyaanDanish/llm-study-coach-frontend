"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Play,
  Trophy,
  Target,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/contexts/ThemeContext";

interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
  created_at: string;
  user_id: string;
  content_hash: string;
  study_material_title: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  answers: { [questionId: string]: number };
}

interface QuizSectionProps {
  userId: string;
}

export default function QuizSection({ userId }: QuizSectionProps) {
  const { isDarkMode } = useTheme();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [questionId: string]: number;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "quiz" | "results">("list");

  // Fetch quizzes
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching quizzes:", error);
        // If the table doesn't exist, just set empty array
        if (error.code === "42P01") {
          setQuizzes([]);
          return;
        }
        throw error;
      }

      // For each quiz, try to get the study material title from the content_hash
      const formattedQuizzes = await Promise.all(
        (data || []).map(async (quiz) => {
          try {
            // Try to get study material info using content_hash
            const { data: materialData, error: materialError } = await supabase
              .from("study_materials")
              .select("name")
              .eq("content_hash", quiz.content_hash)
              .eq("user_id", userId)
              .single();

            return {
              ...quiz,
              study_material_title: materialData?.name || "Unknown Material",
            };
          } catch (materialError) {
            console.warn(
              `Could not fetch material info for quiz ${quiz.id}:`,
              materialError
            );
            return {
              ...quiz,
              study_material_title: "Unknown Material",
            };
          }
        })
      );

      setQuizzes(formattedQuizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch quiz attempts
  const fetchQuizAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error fetching quiz attempts:", error);
        // If the table doesn't exist, just set empty array
        if (error.code === "42P01") {
          setQuizAttempts([]);
          return;
        }
        throw error;
      }

      setQuizAttempts(data || []);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      setQuizAttempts([]);
    }
  };

  useEffect(() => {
    if (userId && userId !== "placeholder-user") {
      fetchQuizzes();
      fetchQuizAttempts();
    } else {
      setLoading(false);
    }
  }, [userId]);

  // Start a quiz
  const startQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setViewMode("quiz");
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  // Submit quiz
  const submitQuiz = async () => {
    if (!currentQuiz) return;

    setSubmitting(true);
    try {
      // Calculate score
      let correctAnswers = 0;
      currentQuiz.questions.forEach((question) => {
        if (selectedAnswers[question.id] === question.correct_answer) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / currentQuiz.questions.length) * 100;

      // Save attempt to database
      const { error } = await supabase.from("quiz_attempts").insert({
        quiz_id: currentQuiz.id,
        user_id: userId,
        score,
        total_questions: currentQuiz.questions.length,
        answers: selectedAnswers,
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Refresh attempts
      await fetchQuizAttempts();
      setShowResults(true);
      setViewMode("results");
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Get quiz statistics
  const getQuizStats = (quizId: string) => {
    const attempts = quizAttempts.filter(
      (attempt) => attempt.quiz_id === quizId
    );
    if (attempts.length === 0)
      return { attempts: 0, bestScore: 0, avgScore: 0 };

    const bestScore = Math.max(...attempts.map((a) => a.score));
    const avgScore =
      attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;

    return {
      attempts: attempts.length,
      bestScore: Math.round(bestScore),
      avgScore: Math.round(avgScore),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  // Quiz taking view
  if (viewMode === "quiz" && currentQuiz) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress =
      ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentQuiz.title}
            </h2>
            <Button
              variant="outline"
              onClick={() => setViewMode("list")}
              className="text-gray-600 dark:text-gray-400"
            >
              Exit Quiz
            </Button>
          </div>
          <Progress value={progress} className="mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Question {currentQuestionIndex + 1} of{" "}
            {currentQuiz.questions.length}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                  className={`w-full p-4 text-left rounded-lg border transition-colors ${
                    selectedAnswers[currentQuestion.id] === index
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
            }
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              disabled={selectedAnswers[currentQuestion.id] === undefined}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submitQuiz}
              disabled={
                selectedAnswers[currentQuestion.id] === undefined || submitting
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Quiz"
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Results view
  if (viewMode === "results" && currentQuiz) {
    const correctAnswers = currentQuiz.questions.filter(
      (q) => selectedAnswers[q.id] === q.correct_answer
    ).length;
    const score = (correctAnswers / currentQuiz.questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Quiz Complete!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            You scored {correctAnswers} out of {currentQuiz.questions.length}{" "}
            questions
          </p>
          <div className="mt-4">
            <span
              className={`text-4xl font-bold ${
                score >= 80
                  ? "text-green-600"
                  : score >= 60
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {Math.round(score)}%
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {currentQuiz.questions.map((question, index) => {
            const userAnswer = selectedAnswers[question.id];
            const isCorrect = userAnswer === question.correct_answer;

            return (
              <Card
                key={question.id}
                className={`border-l-4 ${
                  isCorrect ? "border-l-green-500" : "border-l-red-500"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Question {index + 1}
                    </CardTitle>
                    {isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {question.question}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg ${
                          optionIndex === question.correct_answer
                            ? "bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700"
                            : optionIndex === userAnswer && !isCorrect
                            ? "bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700"
                            : "bg-gray-50 dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {option}
                          </span>
                          {optionIndex === question.correct_answer && (
                            <CheckCircle className="ml-auto h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center mt-8 space-x-4">
          <Button onClick={() => startQuiz(currentQuiz)} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Quiz
          </Button>
          <Button onClick={() => setViewMode("list")}>Back to Quizzes</Button>
        </div>
      </div>
    );
  }

  // Quiz list view
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          My Quizzes
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test your knowledge with AI-generated quizzes based on your study
          materials
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No quizzes yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Generate quizzes from your study materials to test your knowledge
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Go to Study Materials and click "Generate Quiz" next to any uploaded
            material
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => {
            const stats = getQuizStats(quiz.id);
            return (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {quiz.subject}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {quiz.questions.length} questions
                    </span>
                  </div>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    From: {quiz.study_material_title}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Attempts:
                      </span>
                      <span className="font-medium">{stats.attempts}</span>
                    </div>
                    {stats.attempts > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Best Score:
                          </span>
                          <span className="font-medium text-green-600">
                            {stats.bestScore}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Average:
                          </span>
                          <span className="font-medium">{stats.avgScore}%</span>
                        </div>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={() => startQuiz(quiz)}
                    className="w-full mt-4"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {stats.attempts > 0 ? "Take Again" : "Start Quiz"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
