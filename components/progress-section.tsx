"use client"

import { useState } from "react"
import type { User } from "@/components/auth-wrapper"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

type ProgressSectionProps = {
  user: User
}

type ProgressData = {
  date: string
  studyTime: number
  flashcardsReviewed: number
  topicsCompleted: number
  quizScore?: number
}

// Mock data for progress tracking
const mockProgressData: ProgressData[] = [
  {
    date: "2023-06-01",
    studyTime: 1.5,
    flashcardsReviewed: 15,
    topicsCompleted: 2,
    quizScore: 85,
  },
  {
    date: "2023-06-02",
    studyTime: 2,
    flashcardsReviewed: 20,
    topicsCompleted: 1,
    quizScore: 90,
  },
  {
    date: "2023-06-03",
    studyTime: 1,
    flashcardsReviewed: 10,
    topicsCompleted: 1,
  },
  {
    date: "2023-06-04",
    studyTime: 2.5,
    flashcardsReviewed: 25,
    topicsCompleted: 3,
    quizScore: 75,
  },
  {
    date: "2023-06-05",
    studyTime: 1.5,
    flashcardsReviewed: 15,
    topicsCompleted: 2,
  },
  {
    date: "2023-06-06",
    studyTime: 0.5,
    flashcardsReviewed: 5,
    topicsCompleted: 0,
  },
  {
    date: "2023-06-07",
    studyTime: 3,
    flashcardsReviewed: 30,
    topicsCompleted: 4,
    quizScore: 95,
  },
]

export default function ProgressSection({ user }: ProgressSectionProps) {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week")
  const [currentDate, setCurrentDate] = useState(new Date())

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    if (timeRange === "day") {
      newDate.setDate(newDate.getDate() - 1)
    } else if (timeRange === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (timeRange === "day") {
      newDate.setDate(newDate.getDate() + 1)
    } else if (timeRange === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }

    if (timeRange === "day") {
      return currentDate.toLocaleDateString(undefined, options)
    } else if (timeRange === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      return `${startOfWeek.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${endOfWeek.toLocaleDateString(undefined, options)}`
    } else {
      return currentDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    }
  }

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalStudyTime = mockProgressData.reduce((sum, day) => sum + day.studyTime, 0)
    const totalFlashcards = mockProgressData.reduce((sum, day) => sum + day.flashcardsReviewed, 0)
    const totalTopics = mockProgressData.reduce((sum, day) => sum + day.topicsCompleted, 0)

    const quizScores = mockProgressData
      .filter((day) => day.quizScore !== undefined)
      .map((day) => day.quizScore as number)
    const averageQuizScore =
      quizScores.length > 0 ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length) : 0

    return {
      totalStudyTime,
      totalFlashcards,
      totalTopics,
      averageQuizScore,
      daysStudied: mockProgressData.length,
      studyStreak: 5, // Mock value
    }
  }

  const summary = calculateSummary()

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-medium text-indigo-800">Progress Summary</h2>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTimeRange("day")}
              className={`px-3 py-1 rounded-xl text-sm ${timeRange === "day"
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Day
            </button>
            <button
              onClick={() => setTimeRange("week")}
              className={`px-3 py-1 rounded-xl text-sm ${timeRange === "week"
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange("month")}
              className={`px-3 py-1 rounded-xl text-sm ${timeRange === "month"
                  ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm border border-blue-100 transform transition-transform hover:scale-105">
            <p className="text-sm text-gray-600">Total Study Time</p>
            <p className="text-2xl font-bold text-blue-700">{summary.totalStudyTime} hrs</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl shadow-sm border border-green-100 transform transition-transform hover:scale-105">
            <p className="text-sm text-gray-600">Flashcards Reviewed</p>
            <p className="text-2xl font-bold text-green-700">{summary.totalFlashcards}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-xl shadow-sm border border-purple-100 transform transition-transform hover:scale-105">
            <p className="text-sm text-gray-600">Topics Completed</p>
            <p className="text-2xl font-bold text-purple-700">{summary.totalTopics}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl shadow-sm border border-amber-100 transform transition-transform hover:scale-105">
            <p className="text-sm text-gray-600">Average Quiz Score</p>
            <p className="text-2xl font-bold text-amber-700">{summary.averageQuizScore}%</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl shadow-sm border border-indigo-100 transform transition-transform hover:scale-105">
            <p className="text-sm text-gray-600">Days Studied</p>
            <p className="text-2xl font-bold text-indigo-700">{summary.daysStudied}</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl shadow-sm border border-red-100 transform transition-transform hover:scale-105">
            <p className="text-sm text-gray-600">Study Streak</p>
            <p className="text-2xl font-bold text-red-700">{summary.studyStreak} days</p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-indigo-800">Daily Progress</h2>

          <div className="flex items-center space-x-2">
            <button onClick={handlePrevious} className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600">
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center space-x-1 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1 rounded-xl">
              <Calendar size={16} className="text-indigo-500" />
              <span className="text-sm">{formatDateRange()}</span>
            </div>

            <button
              onClick={handleNext}
              className="p-1 rounded-full hover:bg-indigo-100 text-indigo-600"
              disabled={new Date(currentDate).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)}
            >
              <ChevronRight
                size={20}
                className={
                  new Date(currentDate).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)
                    ? "text-indigo-300"
                    : "text-indigo-600"
                }
              />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-indigo-100 rounded-xl overflow-hidden">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider rounded-tl-xl">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                  Study Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                  Flashcards
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider">
                  Topics
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-indigo-700 uppercase tracking-wider rounded-tr-xl">
                  Quiz Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-indigo-100">
              {mockProgressData.map((day, index) => (
                <tr key={index} className="hover:bg-indigo-50 transition">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: `${(day.studyTime / user.studyminutes) * 100}%` }}
                        ></div>
                      </div>
                      {day.studyTime} hrs
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          style={{ width: `${(day.flashcardsReviewed / user.flashcardTarget) * 100}%` }}
                        ></div>
                      </div>
                      {day.flashcardsReviewed}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{day.topicsCompleted}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {day.quizScore ? (
                      <span className="px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 rounded-full">
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

      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100">
        <h2 className="text-lg font-medium mb-6 text-indigo-800">Study Habits Analysis</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
            <h3 className="text-md font-medium mb-3 text-indigo-700">Study Time Distribution</h3>
            <div className="h-48 bg-white rounded-xl flex items-end justify-around p-4 border border-indigo-100">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                const height = [30, 45, 20, 80, 60, 25, 90][index]
                const gradientClass = [
                  "from-blue-400 to-indigo-500",
                  "from-indigo-400 to-purple-500",
                  "from-purple-400 to-fuchsia-500",
                  "from-fuchsia-400 to-pink-500",
                  "from-pink-400 to-rose-500",
                  "from-rose-400 to-red-500",
                  "from-red-400 to-orange-500",
                ][index]

                return (
                  <div key={day} className="flex flex-col items-center">
                    <div
                      className={`w-8 bg-gradient-to-t ${gradientClass} rounded-t-lg mb-2 shadow-md transform transition-all duration-300 hover:scale-110`}
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-600">{day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
            <h3 className="text-md font-medium mb-3 text-blue-700">Performance Trends</h3>
            <div className="h-48 bg-white rounded-xl p-4 relative border border-blue-100">
              <div className="absolute inset-0 p-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
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
                  <span className="text-xs text-gray-500">Study Time</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                  <span className="text-xs text-gray-500">Flashcards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}