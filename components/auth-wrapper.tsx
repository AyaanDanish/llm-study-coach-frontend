"use client"

import { useState, useEffect } from "react"
import LoginForm from "@/components/login-form"
import SignupForm from "@/components/signup-form"
import StudyCoachApp from "@/components/study-coach-app"
import Dashboard from "@/components/dashboard"
import EmailConfirmation from "@/components/email-confirmation"
import { supabase } from "@/lib/supabaseClient"
import { BookOpenIcon, SparklesIcon } from "lucide-react"

export type User = {
  id: string
  nickname: string
  email?: string
  examdate?: string
  studyminutes: number
  flashcardtarget: number
  completedonboarding: boolean
}

async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    return null
  }
  return data as User
}

async function updateUserProfile(userId: string, updates: Partial<User>) {
  console.log("Updating user profile with data:", updates)
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating profile:", error)
    return null
  }
  return data as User
}

export default function AuthWrapper() {
  const [currentView, setCurrentView] = useState<
    "landing" | "login" | "signup" | "email-confirmation" | "onboarding" | "dashboard"
  >("landing")
  const [user, setUser] = useState<User | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string>("")

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Current session:", session)

      if (session?.user) {
        console.log("User email confirmed:", session.user.email_confirmed_at)

        // For development: Skip email confirmation if using placeholder Supabase
        const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")

        if (!session.user.email_confirmed_at && !isPlaceholder) {
          setPendingEmail(session.user.email || "")
          setCurrentView("email-confirmation")
          return
        }

        fetchUserProfile(session.user.id).then((profile) => {
          if (profile) {
            setUser({ ...profile, email: session.user.email || "" })
            setCurrentView(profile.completedonboarding ? "dashboard" : "onboarding")
          }
        })
      } else {
        setCurrentView("landing")
      }
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session)

      if (event === "SIGNED_IN" && session?.user) {
        const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")

        if (!session.user.email_confirmed_at && !isPlaceholder) {
          setPendingEmail(session.user.email || "")
          setCurrentView("email-confirmation")
          return
        }

        fetchUserProfile(session.user.id).then((profile) => {
          if (profile) {
            setUser({ ...profile, email: session.user.email || "" })
            setCurrentView(profile.completedonboarding ? "dashboard" : "onboarding")
          }
        })
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setPendingEmail("")
        setCurrentView("landing")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  function handleLogin(userData: { email: string; password: string }) {
    const { email, password } = userData
    supabase.auth.signInWithPassword({ email, password }).then(({ data, error }) => {
      if (error) {
        alert(error.message)
        return
      }
      if (data.user) {
        const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")

        if (!data.user.email_confirmed_at && !isPlaceholder) {
          setPendingEmail(data.user.email || "")
          setCurrentView("email-confirmation")
          return
        }

        fetchUserProfile(data.user.id).then((profile) => {
          if (profile) {
            setUser({ ...profile, email: data.user.email || "" })
            setCurrentView(profile.completedonboarding ? "dashboard" : "onboarding")
          } else {
            alert("Profile not found")
          }
        })
      }
    })
  }

  async function handleSignup(userData: { nickname: string; email: string; password: string }) {
    const { email, password, nickname } = userData

    console.log("Attempting signup for:", email)

    // Check if using placeholder Supabase
    const isPlaceholder = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")

    if (isPlaceholder) {
      alert("⚠️ Using placeholder Supabase. Email confirmation is disabled for development.")
    }

    // Sign up with email confirmation required (if not placeholder)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: isPlaceholder
        ? {}
        : {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
    })

    console.log("Signup response:", { data, error })

    if (error) {
      alert(error.message)
      return
    }

    if (data.user) {
      console.log("User signed up:", data.user)

      // Create profile
      const { error: insertError } = await supabase.from("profiles").insert({
        id: data.user.id,
        nickname,
        studyminutes: 30,
        flashcardtarget: 20,
        completedonboarding: false,
        examdate: null,
      })

      if (insertError) {
        alert(insertError.message)
        return
      }

      // If using placeholder or email already confirmed, proceed directly
      if (isPlaceholder || data.user.email_confirmed_at) {
        const profile = await fetchUserProfile(data.user.id)
        if (profile) {
          setUser(profile)
          setCurrentView("onboarding")
        }
      } else {
        // Set pending email and show confirmation screen
        setPendingEmail(email)
        setCurrentView("email-confirmation")
      }
    }
  }

  async function handleOnboardingComplete(updatedUserData: Partial<User>) {
    console.log("Onboarding complete with data:", updatedUserData)
    if (user) {
      const updatedUser = await updateUserProfile(user.id, {
        ...updatedUserData,
        completedonboarding: true,
      })
      if (updatedUser) {
        setUser(updatedUser)
        setCurrentView("dashboard")
      }
    }
  }

  async function handleResendConfirmation() {
    if (!pendingEmail) return

    console.log("Resending confirmation to:", pendingEmail)

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    console.log("Resend response:", { error })

    if (error) {
      alert(`Error: ${error.message}`)
    } else {
      alert("Confirmation email sent! Please check your inbox and spam folder.")
    }
  }

  if (currentView === "landing") {
    return (
      <div className="h-screen bg-gradient-to-br from-violet-600 via-indigo-700 to-purple-800 flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute -bottom-8 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        </div>

        <div className="w-full max-w-lg text-center space-y-6 relative z-10">
          {/* Logo and title */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-75 blur-xl"></div>
              <div className="relative bg-gradient-to-br from-indigo-100 to-white text-indigo-600 p-4 rounded-full shadow-xl">
                <BookOpenIcon size={48} />
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
            Your Personalised LLM Study Coach
          </h1>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <SparklesIcon size={18} className="text-yellow-300" />
            <h2 className="text-lg font-medium text-indigo-100">An Intelligent AI-Powered Learning Assistant</h2>
            <SparklesIcon size={18} className="text-yellow-300" />
          </div>

          <p className="text-base max-w-md mx-auto text-indigo-100">
            Get easily digestible notes, generate flashcards, take quizzes and level up your study game.
          </p>

          <div className="mt-8 flex gap-4 justify-center">
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

          <div className="mt-8 grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg transform transition hover:scale-105">
              <h3 className="font-medium text-sm">Smart Study Plans</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg transform transition hover:scale-105">
              <h3 className="font-medium text-sm">AI Flashcards</h3>
            </div>
            <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg transform transition hover:scale-105">
              <h3 className="font-medium text-sm">24/7 Assistance</h3>
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

  if (currentView === "email-confirmation") {
    return (
      <EmailConfirmation
        email={pendingEmail}
        onResendConfirmation={handleResendConfirmation}
        onBackToLanding={() => setCurrentView("landing")}
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
