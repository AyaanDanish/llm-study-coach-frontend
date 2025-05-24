"use client"

import { useState, useEffect } from "react"
import LoginForm from "@/components/login-form"
import SignupForm from "@/components/signup-form"
import StudyCoachApp from "@/components/study-coach-app"
import Dashboard from "@/components/dashboard"
import { supabase } from "@/lib/supabaseClient"
import { BookOpenIcon, SparklesIcon } from "lucide-react"

export type User = {
  id: string
  nickname: string
  email?: string
  examdate?: string
  studyhours: number
  flashcardtarget: number
  completedonboarding: boolean
}

async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
  return data as User;
}

async function updateUserProfile(userId: string, updates: Partial<User>) {
  console.log("Updating user profile with data:", updates);
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return null;
  }
  return data as User;
}

export default function AuthWrapper() {
  const [currentView, setCurrentView] = useState<"landing" | "login" | "signup" | "onboarding" | "dashboard">("landing")
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profile => {
          if (profile) {
            setUser({ ...profile, email: session.user.email || "" });
            setCurrentView(profile.completedonboarding ? "dashboard" : "onboarding");
          }
        });
      } else {
        setCurrentView("landing");
      }
    });
  }, []);

  function handleLogin(userData: { email: string; password: string }) {
    const { email, password } = userData;
    supabase.auth.signInWithPassword({ email, password }).then(({ data, error }) => {
      if (error) {
        alert(error.message);
        return;
      }
      if (data.user) {
        fetchUserProfile(data.user.id).then(profile => {
          if (profile) {
            setUser({ ...profile, email: data.user.email || "" }); 
            setCurrentView(profile.completedonboarding ? "dashboard" : "onboarding");
          } else {
            alert("Profile not found");
          }
        });
      }
    });
  }

  async function handleSignup(userData: { nickname: string; email: string; password: string }) {
    const { email, password, nickname } = userData;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
      return;
    }
    if (data.user) {
      console.log("User signed up:", data.user);
      const { error: insertError } = await supabase.from('profiles').insert({
        id: data.user.id,
        nickname,
        studyhours: 2,
        flashcardtarget: 20,
        completedonboarding: false,
        examdate: null,
      });
      if (insertError) {
        alert(insertError.message);
        return;
      }
      const profile = await fetchUserProfile(data.user.id);
      if (profile) {
        setUser(profile);
        setCurrentView("onboarding");
      }
    }
  }

  async function handleOnboardingComplete(updatedUserData: Partial<User>) {
    console.log("Onboarding complete with data:", updatedUserData);
  if (user) {
    const updatedUser = await updateUserProfile(user.id, {
      ...updatedUserData,
      completedonboarding: true,
    });
    if (updatedUser) {
      setUser(updatedUser);
      setCurrentView("dashboard");
    }
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
