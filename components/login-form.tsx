"use client"

import type React from "react"

import { useState } from "react"
import type { User } from "@/components/auth-wrapper"
import { ArrowLeft, ChevronRight, UserIcon, Lock, BookOpen } from "lucide-react"

type LoginFormProps = {
  onLogin: (userData: User) => void
  onBackToLanding: () => void
  onSignupClick: () => void
}

export default function LoginForm({ onLogin, onBackToLanding, onSignupClick }: LoginFormProps) {
  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (studentId.trim() === "" || password.trim() === "") {
      setError("Please enter both student ID and password")
      return
    }

    // In a real app, this would be an API call to authenticate the user
    // For demo purposes, we'll just simulate a successful login
    const mockUser: User = {
      id: "user123",
      nickname: "Demo User",
      studentId: studentId,
      studyHours: 2,
      flashcardTarget: 20,
      completedOnboarding: true,
    }

    onLogin(mockUser)
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
        <div className="flex items-center mb-8">
          <button onClick={onBackToLanding} className="p-2 rounded-full hover:bg-indigo-50 transition text-indigo-600">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center mx-auto pr-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg mr-2">
              <BookOpen size={20} />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Study Coach
            </h1>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200 shadow-sm">{error}</div>
          )}

          <div>
            <label htmlFor="student-id" className="block text-sm font-medium text-gray-700 mb-1">
              Student ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="text-indigo-500" size={18} />
              </div>
              <input
                id="student-id"
                type="text"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value)
                  if (error) setError("")
                }}
                placeholder="e.g. STUD12345"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="text-indigo-500" size={18} />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError("")
                }}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div className="flex justify-end mt-2">
              <button type="button" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Log In <ChevronRight size={20} className="ml-1" />
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={onSignupClick}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
