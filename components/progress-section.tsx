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
};

export default function ProgressSection({ user }: ProgressSectionProps) {
  const { isDarkMode } = useTheme();
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
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

        const formattedData: ProgressData[] = records.map((record) => ({
          date: record.date,
          studyTime: record.study_time_minutes / 60, // Convert to hours
          flashcardsReviewed: record.flashcards_completed || 0,
          topicsCompleted: 1, // Could be calculated from study materials
          quizScore: undefined, // Could be added later
          targetReached: record.is_study_time_complete || false,
        }));

        setProgressData(formattedData);
      } catch (error) {
        console.error("Error loading progress data:", error);
        setProgressData([]);
      } finally {
        setLoading(false);
      }
    };

    loadProgressData();
  }, [user.id]);

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
    const totalStudyTime = progressData.reduce(
      (sum, day) => sum + day.studyTime,
      0
    );
    const totalFlashcards = progressData.reduce(
      (sum, day) => sum + day.flashcardsReviewed,
      0
    );
    const totalTopics = progressData.reduce(
      (sum, day) => sum + day.topicsCompleted,
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
      totalStudyTime,
      totalFlashcards,
      totalTopics,
      averageQuizScore,
      daysStudied: progressData.length,
      studyStreak: 5, // Mock value
    };
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
              {summary.totalStudyTime} hrs
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

          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 p-4 rounded-xl shadow-sm border border-purple-100 dark:border-purple-800 transform transition-transform hover:scale-105">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Topics Completed
            </p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
              {summary.totalTopics}
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

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800 transform transition-transform hover:scale-105">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Days Studied
            </p>
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
              {summary.daysStudied}
            </p>
          </div>

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
                <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  Topics
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
                            width: `${
                              (day.studyTime / user.studyminutes) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      {day.studyTime} hrs
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full mr-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{
                            width: `${
                              (day.flashcardsReviewed / user.flashcardtarget) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      {day.flashcardsReviewed}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {day.topicsCompleted}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {day.quizScore ? (
                      <span className="px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-800 dark:text-amber-400 rounded-full">
                        {day.quizScore}%
                      </span>
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

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700">
        <h2 className="text-lg font-medium mb-6 text-indigo-800 dark:text-indigo-300">
          Study Habits Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">
            <h3 className="text-md font-medium mb-3 text-indigo-700 dark:text-indigo-300">
              Study Time Distribution
            </h3>
            <div className="h-48 bg-white dark:bg-gray-800 rounded-xl flex items-end justify-around p-4 border border-indigo-100 dark:border-gray-700">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (day, index) => {
                  const height = [30, 45, 20, 80, 60, 25, 90][index];
                  const gradientClass = [
                    "from-blue-400 to-indigo-500",
                    "from-indigo-400 to-purple-500",
                    "from-purple-400 to-fuchsia-500",
                    "from-fuchsia-400 to-pink-500",
                    "from-pink-400 to-rose-500",
                    "from-rose-400 to-red-500",
                    "from-red-400 to-orange-500",
                  ][index];

                  return (
                    <div key={day} className="flex flex-col items-center">
                      <div
                        className={`w-8 bg-gradient-to-t ${gradientClass} rounded-t-lg mb-2 shadow-md transform transition-all duration-300 hover:scale-110`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {day}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm">
            <h3 className="text-md font-medium mb-3 text-blue-700 dark:text-blue-400">
              Performance Trends
            </h3>
            <div className="h-48 bg-white dark:bg-gray-800 rounded-xl p-4 relative border border-blue-100 dark:border-gray-700">
              <div className="absolute inset-0 p-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient
                      id="gradient1"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    <linearGradient
                      id="gradient2"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <polyline
                    points="0,70 15,65 30,60 45,40 60,35 75,30 90,20"
                    fill="none"
                    stroke="url(#gradient1)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points="0,80 15,75 30,70 45,65 60,55 75,60 90,50"
                    fill="none"
                    stroke="url(#gradient2)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Study Time
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Flashcards
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
