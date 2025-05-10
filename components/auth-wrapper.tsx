"use client"

import { useState } from "react"
import LoginForm from "@/components/login-form"
import SignupForm from "@/components/signup-form"
import StudyCoachApp from "@/components/study-coach-app"
import Dashboard from "@/components/dashboard"

export type User = {
  id: string
  nickname: string
  email?: string
  studentId: string
  examDate?: string
  studyHours: number
  flashcardTarget: number
  completedOnboarding: boolean
}

export default function AuthWrapper() {
  const [currentView, setCurrentView] = useState<"landing" | "login" | "signup" | "onboarding" | "dashboard">("landing")
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = (userData: User) => {
    setUser(userData)
    setCurrentView("dashboard")
  }

  const handleSignup = (userData: Partial<User>) => {
    // In a real app, this would be an API call to create the user
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 9),
      nickname: userData.nickname || "",
      studentId: userData.studentId || "",
      studyHours: 2,
      flashcardTarget: 20,
      completedOnboarding: false,
    }
    setUser(newUser)
    setCurrentView("onboarding")
  }

  const handleOnboardingComplete = (updatedUserData: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...updatedUserData,
        completedOnboarding: true,
      }
      setUser(updatedUser)
      setCurrentView("dashboard")
    }
  }

  if (currentView === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-800 flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute -bottom-8 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        </div>

        <div className="w-full max-w-lg text-center space-y-8 relative z-10">
          {/* Logo and title */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-75 blur-xl"></div>
              <div className="relative bg-gradient-to-br from-indigo-100 to-white text-indigo-600 p-5 rounded-full shadow-xl">
                <BookOpenIcon size={64} />
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            Your Personalised Study Coach
          </h1>

          <div className="flex items-center justify-center space-x-2 mb-6">
            <SparklesIcon size={20} className="text-yellow-300" />
            <h2 className="text-xl font-medium text-indigo-100">Your AI-Powered Learning Assistant</h2>
            <SparklesIcon size={20} className="text-yellow-300" />
          </div>

          <p className="text-lg max-w-md mx-auto text-indigo-100">
            Create a customized study plan, generate flashcards, and get personalized help with any subject.
          </p>

          <div className="mt-12 flex gap-4 justify-center">
            <button
              onClick={() => setCurrentView("signup")}
              className="px-8 py-3 bg-white text-indigo-600 rounded-full font-medium hover:bg-indigo-50 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
            >
              Sign Up
            </button>
            <button
              onClick={() => setCurrentView("login")}
              className="px-8 py-3 bg-transparent border border-white text-white rounded-full font-medium hover:bg-white/10 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
            >
              Login
            </button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg transform transition hover:scale-105">
              <h3 className="font-medium">Smart Study Plans</h3>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg transform transition hover:scale-105">
              <h3 className="font-medium">AI Flashcards</h3>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg transform transition hover:scale-105">
              <h3 className="font-medium">24/7 Assistance</h3>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "login") {
    return (
      <LoginForm
        onLogin={handleLogin}
        onBackToLanding={() => setCurrentView("landing")}
        onSignupClick={() => setCurrentView("signup")}
      />
    )
  }

  if (currentView === "signup") {
    return (
      <SignupForm
        onSignup={handleSignup}
        onBackToLanding={() => setCurrentView("landing")}
        onLoginClick={() => setCurrentView("login")}
      />
    )
  }

  if (currentView === "onboarding") {
    return <StudyCoachApp initialUser={user} onComplete={handleOnboardingComplete} />
  }

  if (currentView === "dashboard") {
    return <Dashboard user={user!} />
  }

  return null
}

// Icons
import { BookOpenIcon, SparklesIcon } from "lucide-react"
