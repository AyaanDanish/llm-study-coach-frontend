"use client"
import { useState } from "react"
import { Calendar, ChevronRight, Clock, CheckCircle } from "lucide-react"
import type { User } from "@/components/auth-wrapper"
import { supabase } from "@/lib/supabaseClient"

type StudyCoachAppProps = {
  initialUser: User | null
  onComplete: (userData: Partial<User>) => void
}

export default function StudyCoachApp({ initialUser, onComplete }: StudyCoachAppProps) {
  // Onboarding flow state
  const [step, setStep] = useState(1)
  const [examdate, setexamdate] = useState<string>("")
  const [studyminutes, setstudyminutes] = useState(initialUser?.studyminutes || 30)
  const [flashcardtarget, setflashcardtarget] = useState(initialUser?.flashcardtarget || 20)
  const [completed, setCompleted] = useState(false)

  // Convert minutes to hours for display
  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (hours === 0) {
      return `${remainingMinutes} minutes`
    }
    return `${hours}h ${remainingMinutes}m`
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      setCompleted(true)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = () => {
    onComplete({
      examdate,
      studyminutes,
      flashcardtarget,
      completedonboarding: true,
    })
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="border-2 border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-indigo-50/50 min-h-[350px] flex flex-col justify-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">When&apos;s your study deadline?</h2>
              <p className="text-gray-600">This helps us create a personalized learning timeline for you.</p>
              <div className="flex items-center">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="text-indigo-500" size={20} />
                  </div>
                  <input
                    type="date"
                    value={examdate || ""}
                    onChange={(e) => setexamdate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">Optional: Skip if you don&apos;t have a specific deadline date.</p>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="border-2 border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-indigo-50/50 min-h-[350px] flex flex-col justify-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">How many minutes can you study daily?</h2>
              <p className="text-gray-600">Be realistic - consistency is better than burnout.</p>
              <div className="flex items-center">
                <Clock className="mr-3 text-indigo-500" size={24} />
                <div className="w-full">
                  <input
                    type="range"
                    min="15"
                    max="120"
                    step="1"
                    value={studyminutes}
                    onChange={(e) => setstudyminutes(Number.parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>15m</span>
                    <span>45m</span>
                    <span>1h</span>
                    <span>1h 30m</span>
                    <span>2h</span>
                  </div>
                  <div className="text-center mt-6">
                    <span className="text-2xl font-bold text-indigo-600">{formatStudyTime(studyminutes)}</span>
                    <span className="text-lg font-medium text-gray-700"> per day</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="border-2 border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors bg-indigo-50/50 min-h-[350px] flex flex-col justify-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">How many flashcards can you review daily?</h2>
              <p className="text-gray-600">Flashcards are a proven way to retain information.</p>
              <div className="flex items-center">
                <div className="w-full">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={flashcardtarget}
                    onChange={(e) => setflashcardtarget(Number.parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>5</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100</span>
                  </div>
                  <div className="text-center mt-6">
                    <span className="text-2xl font-bold text-indigo-600">{flashcardtarget}</span>
                    <span className="text-lg font-medium text-gray-700"> flashcards per day</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center ${i === step
                ? "border-indigo-600 bg-indigo-600 text-white"
                : i < step
                  ? "border-indigo-600 bg-indigo-100 text-indigo-600"
                  : "border-gray-300 bg-gray-100 text-gray-500"
                }`}
            >
              {i < step && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className="text-indigo-600" size={16} />
                </div>
              )}
              <span className={i < step ? "opacity-0" : ""}>{i}</span>
            </div>
          ))}
        </div>
        <div className="my-4 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
        </div>
      </div>
    )
  }

  const renderCompletionScreen = () => {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-green-300 opacity-30 blur-xl"></div>
            <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 text-white p-5 rounded-full">
              <CheckCircle size={60} />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">You&apos;re all set!</h2>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-sm border border-indigo-100">
          <h3 className="font-medium text-gray-700 mb-4">Your Study Plan:</h3>
          <ul className="space-y-4">
            {examdate && (
              <li className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Calendar className="text-blue-500" size={20} />
                </div>
                <span>
                  Study Deadline: <span className="font-medium">{new Date(examdate).toLocaleDateString()}</span>
                </span>
              </li>
            )}
            <li className="flex items-center bg-white p-3 rounded-lg shadow-sm">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <Clock className="text-indigo-500" size={20} />
              </div>
              <span>
                Daily Study Goal: <span className="font-medium">{formatStudyTime(studyminutes)}</span>
              </span>
            </li>
            <li className="flex items-center bg-white p-3 rounded-lg shadow-sm">
              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                <CheckCircle className="text-purple-500" size={20} />
              </div>
              <span>
                Daily Flashcard Target: <span className="font-medium">{flashcardtarget} cards</span>
              </span>
            </li>
          </ul>
        </div>
        <p className="text-gray-600">Your personalized study plan is ready! Click below to start learning.</p>
        <button
          onClick={handleComplete}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-center p-4 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50 relative z-10">
        <div className="flex justify-center mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
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
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800 transition font-medium"
                >
                  Back
                </button>
              ) : (
                <div></div>
              )}
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {step === 3 ? "Finish" : (
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
  )
}
