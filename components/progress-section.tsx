"use client";

import { useState, useEffect } from "react";
import type { User } from "@/components/auth-wrapper";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useTheme } from "@/contexts/ThemeContext";

type ProgressSectionProps = {
  user: User;
};

type ProgressData = {
  date: string;
  studyTime: number;
  flashcardsReviewed: number;
  topicsCompleted: number;
  quizScore?: number;
  targetReached: boolean;
  quizAttempts?: number;
};

type WeeklyStats = {
  totalStudyTime: number;
  targetStudyTime: number;
  totalFlashcards: number;
  targetFlashcards: number;
  averageQuizScore: number;
  totalQuizAttempts: number;
  studyDaysCompleted: number;
  currentStreak: number;
};

export default function ProgressSection({ user }: ProgressSectionProps) {
  const { isDarkMode } = useTheme();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalStudyTime: 0,
    targetStudyTime: 0,
    totalFlashcards: 0,
    targetFlashcards: 0,
    averageQuizScore: 0,
    totalQuizAttempts: 0,
    studyDaysCompleted: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        setLoading(true);

        // Get data for the last 30 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const { data: records, error } = await supabase
          .from("daily_study_records")
          .select("*")
          .eq("user_id", user.id)
          .gte("date", startDate.toISOString().split("T")[0])
          .order("date", { ascending: true });

        if (error) {
          console.error("Error loading progress data:", error);
          setProgressData([]);
          return;
        }

        // Get quiz data for the same period
        const { data: quizData } = await supabase
          .from("quiz_attempts")
          .select("score, completed_at")
          .eq("user_id", user.id)
          .gte("completed_at", startDate.toISOString());

        // Group quiz attempts by date
        const quizByDate: {
          [key: string]: { scores: number[]; count: number };
        } = {};
        quizData?.forEach((quiz) => {
          const date = quiz.completed_at.split("T")[0];
          if (!quizByDate[date]) {
            quizByDate[date] = { scores: [], count: 0 };
          }
          quizByDate[date].scores.push(quiz.score);
          quizByDate[date].count++;
        });

        const formattedData: ProgressData[] = records.map((record) => {
          const dateQuizData = quizByDate[record.date];
          const averageQuizScore =
            dateQuizData?.scores.length > 0
              ? dateQuizData.scores.reduce((sum, score) => sum + score, 0) /
                dateQuizData.scores.length
              : undefined;

          return {
            date: record.date,
            studyTime: record.study_time_minutes || 0,
            flashcardsReviewed: record.flashcards_completed || 0,
            topicsCompleted: 1, // Could be calculated from study materials
            quizScore: averageQuizScore,
            quizAttempts: dateQuizData?.count || 0,
            targetReached: record.is_study_time_complete || false,
          };
        });

        setProgressData(formattedData);

        // Calculate weekly stats for current week
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
        const startOfWeek = new Date(now);
        startOfWeek.setDate(
          now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
        );

        const weeklyRecords = records.filter((record) => {
          const recordDate = new Date(record.date);
          return recordDate >= startOfWeek && recordDate <= now;
        });

        const totalStudyTime = weeklyRecords.reduce(
          (sum, record) => sum + (record.study_time_minutes || 0),
          0
        );
        const totalFlashcards = weeklyRecords.reduce(
          (sum, record) => sum + (record.flashcards_completed || 0),
          0
        );
        const studyDaysCompleted = weeklyRecords.filter(
          (record) => record.is_day_complete
        ).length;
        const currentStreak =
          weeklyRecords.length > 0
            ? weeklyRecords[weeklyRecords.length - 1].current_streak || 0
            : 0;

        // Calculate quiz stats for the week
        const weeklyQuizData =
          quizData?.filter((quiz) => {
            const quizDate = new Date(quiz.completed_at);
            return quizDate >= startOfWeek && quizDate <= now;
          }) || [];

        const averageQuizScore =
          weeklyQuizData.length > 0
            ? weeklyQuizData.reduce((sum, quiz) => sum + quiz.score, 0) /
              weeklyQuizData.length
            : 0;

        setWeeklyStats({
          totalStudyTime,
          targetStudyTime: user.studyminutes * 7, // Daily target * 7 days
          totalFlashcards,
          targetFlashcards: user.flashcardtarget * 7, // Daily target * 7 days
          averageQuizScore,
          totalQuizAttempts: weeklyQuizData.length,
          studyDaysCompleted,
          currentStreak,
        });
      } catch (error) {
        console.error("Error loading progress data:", error);
        setProgressData([]);
      } finally {
        setLoading(false);
      }
    };

    loadProgressData();
  }, [user.id, user.studyminutes, user.flashcardtarget]);

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (timeRange === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (timeRange === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (timeRange === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (timeRange === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    if (timeRange === "day") {
      return currentDate.toLocaleDateString(undefined, options);
    } else if (timeRange === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })} - ${endOfWeek.toLocaleDateString(undefined, options)}`;
    } else {
      return currentDate.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    }
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    if (timeRange === "week") {
      return {
        totalStudyTime: Math.round((weeklyStats.totalStudyTime / 60) * 10) / 10, // Convert to hours, round to 1 decimal
        totalFlashcards: weeklyStats.totalFlashcards,
        averageQuizScore: Math.round(weeklyStats.averageQuizScore),
        daysStudied: weeklyStats.studyDaysCompleted,
        studyStreak: weeklyStats.currentStreak,
      };
    } else if (timeRange === "day") {
      // For day view, show only the current selected day's data
      const currentDateString = currentDate.toISOString().split("T")[0];
      const dayData = progressData.find(
        (day) => day.date === currentDateString
      );

      return {
        totalStudyTime: dayData?.studyTime || 0, // In minutes for day view
        totalFlashcards: dayData?.flashcardsReviewed || 0,
        averageQuizScore: dayData?.quizScore
          ? Math.round(dayData.quizScore)
          : 0,
        daysStudied: (dayData?.studyTime || 0) > 0 ? 1 : 0,
        studyStreak: weeklyStats.currentStreak,
      };
    } else {
      // For month view, use the progressData calculation
      const totalStudyTime = progressData.reduce(
        (sum, day) => sum + day.studyTime,
        0
      );
      const totalFlashcards = progressData.reduce(
        (sum, day) => sum + day.flashcardsReviewed,
        0
      );

      const quizScores = progressData
        .filter((day) => day.quizScore !== undefined)
        .map((day) => day.quizScore as number);
      const averageQuizScore =
        quizScores.length > 0
          ? Math.round(
              quizScores.reduce((sum, score) => sum + score, 0) /
                quizScores.length
            )
          : 0;

      return {
        totalStudyTime: Math.round((totalStudyTime / 60) * 10) / 10, // Convert to hours for month
        totalFlashcards,
        averageQuizScore,
        daysStudied: progressData.filter((day) => day.studyTime > 0).length,
        studyStreak: weeklyStats.currentStreak,
      };
    }
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-medium text-indigo-800 dark:text-indigo-300">
            Progress Summary
          </h2>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTimeRange("day")}
              className={`px-3 py-1 rounded-xl text-sm ${
                timeRange === "day"
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setTimeRange("week")}
              className={`px-3 py-1 rounded-xl text-sm ${
                timeRange === "week"
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange("month")}
              className={`px-3 py-1 rounded-xl text-sm ${
                timeRange === "month"
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 text-indigo-700 dark:text-indigo-300 font-medium"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800 transform transition-transform hover:scale-105">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Study Time
            </p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {timeRange === "day"
                ? `${summary.totalStudyTime} min`
                : `${summary.totalStudyTime} hrs`}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl shadow-sm border border-green-100 dark:border-green-800 transform transition-transform hover:scale-105">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Flashcards Reviewed
            </p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-400">
              {summary.totalFlashcards}
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl shadow-sm border border-amber-100 dark:border-amber-800 transform transition-transform hover:scale-105">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average Quiz Score
            </p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              {summary.averageQuizScore}%
            </p>
          </div>

          {timeRange !== "day" && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800 transform transition-transform hover:scale-105">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Days Studied
              </p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                {summary.daysStudied}
              </p>
            </div>
          )}

          <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-4 rounded-xl shadow-sm border border-red-100 dark:border-red-800 transform transition-transform hover:scale-105">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Study Streak
            </p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-400">
              {summary.studyStreak} days
            </p>
          </div>
        </div>
      </div>

      {timeRange === "week" && (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700">
          <h2 className="text-lg font-medium text-indigo-800 dark:text-indigo-300 mb-6">
            Weekly Targets
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Study Time
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  {Math.round(
                    (weeklyStats.totalStudyTime / weeklyStats.targetStudyTime) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (weeklyStats.totalStudyTime /
                        weeklyStats.targetStudyTime) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {Math.round((weeklyStats.totalStudyTime / 60) * 10) / 10}h /{" "}
                {Math.round((weeklyStats.targetStudyTime / 60) * 10) / 10}h
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Flashcards
                </span>
                <span className="text-xs text-green-600 dark:text-green-400">
                  {Math.round(
                    (weeklyStats.totalFlashcards /
                      weeklyStats.targetFlashcards) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (weeklyStats.totalFlashcards /
                        weeklyStats.targetFlashcards) *
                        100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                {weeklyStats.totalFlashcards} / {weeklyStats.targetFlashcards}{" "}
                cards
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Quiz Performance
                </span>
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  {Math.round(weeklyStats.averageQuizScore)}%
                </span>
              </div>
              <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, weeklyStats.averageQuizScore)}%`,
                  }}
                />
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                {weeklyStats.totalQuizAttempts} quiz
                {weeklyStats.totalQuizAttempts !== 1 ? "es" : ""} completed
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-indigo-800 dark:text-indigo-300">
            Daily Progress
          </h2>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              className="p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center space-x-1 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-3 py-1 rounded-xl">
              <Calendar
                size={16}
                className="text-indigo-500 dark:text-indigo-400"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {formatDateRange()}
              </span>
            </div>

            <button
              onClick={handleNext}
              className="p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400"
              disabled={
                new Date(currentDate).setHours(0, 0, 0, 0) >=
                new Date().setHours(0, 0, 0, 0)
              }
            >
              <ChevronRight
                size={20}
                className={
                  new Date(currentDate).setHours(0, 0, 0, 0) >=
                  new Date().setHours(0, 0, 0, 0)
                    ? "text-indigo-300 dark:text-indigo-600"
                    : "text-indigo-600 dark:text-indigo-400"
                }
              />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-indigo-100 dark:divide-gray-700 rounded-xl overflow-hidden">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider rounded-tl-xl">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Study Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Flashcards
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider rounded-tr-xl">
                  Quiz Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-indigo-100 dark:divide-gray-700">
              {progressData.map((day, index) => (
                <tr
                  key={index}
                  className="hover:bg-indigo-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {new Date(day.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (day.studyTime / user.studyminutes) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      {day.studyTime > 0
                        ? day.studyTime >= 60
                          ? `${Math.round((day.studyTime / 60) * 10) / 10}h`
                          : `${day.studyTime}m`
                        : "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (day.flashcardsReviewed / user.flashcardtarget) *
                                100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      {day.flashcardsReviewed}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {day.quizScore ? (
                      <div className="flex items-center">
                        <span className="px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-800 dark:text-amber-400 rounded-full text-xs">
                          {Math.round(day.quizScore)}%
                        </span>
                        {day.quizAttempts && day.quizAttempts > 1 && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            ({day.quizAttempts} quiz
                            {day.quizAttempts !== 1 ? "es" : ""})
                          </span>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
