"use client"

import { useState, useEffect } from "react"
import type { User } from "@/components/auth-wrapper"
import {
  BookOpen,
  Clock,
  FileText,
  Home,
  LogOut,
  Settings,
  UserIcon,
  BarChart,
  BookOpenCheck,
  Brain,
  Lightbulb,
  Search,
  ChevronRight,
  Bell,
  Calendar,
  Sparkles,
  Zap,
  Award,
  TrendingUp,
  CheckCircle2,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import FlashcardSection from "@/components/flashcard-section"
import StudyMaterialsSection from "@/components/study-materials-section"
import ProgressSection from "@/components/progress-section"

type DashboardProps = {
  user: User
}

type DashboardView = "overview" | "flashcards" | "materials" | "progress" | "settings"

export default function FancyDashboard({ user }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>("overview")
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const renderContent = () => {
    switch (currentView) {
      case "overview":
        return <FancyOverviewContent user={user} currentTime={currentTime} />
      case "flashcards":
        return <FlashcardSection />
      case "materials":
        return <StudyMaterialsSection />
      case "progress":
        return <ProgressSection user={user} />
      case "settings":
        return <SettingsContent user={user} />
      default:
        return <FancyOverviewContent user={user} currentTime={currentTime} />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar variant="floating">
          <SidebarHeader className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg">
                <BookOpen size={24} />
              </div>
              <div>
                <h1 className="font-bold text-lg">Study Coach</h1>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setCurrentView("overview")} isActive={currentView === "overview"}>
                      <Home size={20} />
                      <span>Overview</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setCurrentView("flashcards")}
                      isActive={currentView === "flashcards"}
                    >
                      <BookOpenCheck size={20} />
                      <span>Flashcards</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setCurrentView("materials")}
                      isActive={currentView === "materials"}
                    >
                      <FileText size={20} />
                      <span>Study Materials</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setCurrentView("progress")} isActive={currentView === "progress"}>
                      <BarChart size={20} />
                      <span>Progress</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setCurrentView("settings")} isActive={currentView === "settings"}>
                      <Settings size={20} />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <LogOut size={20} />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-2 rounded-full">
                <UserIcon size={20} />
              </div>
              <div>
                <p className="font-medium text-sm">{user.nickname}</p>
                <p className="text-xs text-gray-500">{user.studentId}</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4 md:hidden" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {currentView === "overview" && "Dashboard"}
                    {currentView === "flashcards" && "Flashcards"}
                    {currentView === "materials" && "Study Materials"}
                    {currentView === "progress" && "Progress Tracking"}
                    {currentView === "settings" && "Account Settings"}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {currentTime.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button className="p-2 rounded-full hover:bg-white hover:shadow-md transition-all">
                  <Search size={20} className="text-gray-600" />
                </button>
                <button className="p-2 rounded-full hover:bg-white hover:shadow-md transition-all">
                  <Bell size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

function FancyOverviewContent({ user, currentTime }: { user: User; currentTime: Date }) {
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {getGreeting()}, {user.nickname}!
            </h2>
            <p className="text-blue-100">Here's your study plan for today:</p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Calendar className="mr-2" size={18} />
              <span>
                {currentTime.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition-all">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <p className="text-sm text-blue-100">Study Time</p>
                <p className="font-medium">{user.studyHours} hours today</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition-all">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <BookOpenCheck className="text-white" size={20} />
              </div>
              <div>
                <p className="text-sm text-blue-100">Flashcards</p>
                <p className="font-medium">{user.flashcardTarget} cards to review</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition-all">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Brain className="text-white" size={20} />
              </div>
              <div>
                <p className="text-sm text-blue-100">Focus Topics</p>
                <p className="font-medium">3 topics today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-2 rounded-lg text-white mr-3">
                <FileText size={20} />
              </div>
              <h2 className="text-lg font-medium">Today's Study Materials</h2>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:underline flex items-center">
              View All <ChevronRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
              <div className="bg-amber-100 p-2 rounded-lg mr-3">
                <FileText className="text-amber-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium">Chapter 5: Data Structures</p>
                <p className="text-sm text-gray-500">Computer Science • 45 min</p>
              </div>
              <div className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">Priority</div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium">Introduction to Algorithms</p>
                <p className="text-sm text-gray-500">Computer Science • 30 min</p>
              </div>
              <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">New</div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <FileText className="text-green-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium">Big O Notation</p>
                <p className="text-sm text-gray-500">Computer Science • 20 min</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg text-white mr-3">
                <TrendingUp size={20} />
              </div>
              <h2 className="text-lg font-medium">Weekly Progress</h2>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:underline flex items-center">
              View Details <ChevronRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium flex items-center">
                  <Clock size={16} className="mr-1 text-blue-500" /> Study Time
                </span>
                <span className="text-sm text-gray-500">8/14 hours</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: "57%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium flex items-center">
                  <BookOpenCheck size={16} className="mr-1 text-green-500" /> Flashcards Reviewed
                </span>
                <span className="text-sm text-gray-500">85/140 cards</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-600" style={{ width: "61%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium flex items-center">
                  <CheckCircle2 size={16} className="mr-1 text-purple-500" /> Topics Covered
                </span>
                <span className="text-sm text-gray-500">12/15 topics</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600" style={{ width: "80%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium flex items-center">
                  <Award size={16} className="mr-1 text-amber-500" /> Quiz Performance
                </span>
                <span className="text-sm text-gray-500">85% average</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600" style={{ width: "85%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-2 rounded-lg text-white mr-3">
              <Sparkles size={20} />
            </div>
            <h2 className="text-lg font-medium">AI-Generated Study Tips</h2>
          </div>
          <button className="text-blue-600 text-sm font-medium hover:underline flex items-center">
            Refresh <Zap size={16} className="ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 p-4 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="text-amber-500" size={18} />
              <p className="font-medium">Spaced Repetition</p>
            </div>
            <p className="text-sm text-gray-600">
              Review your flashcards at increasing intervals to improve long-term retention.
            </p>
          </div>

          <div className="border border-gray-200 p-4 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="text-amber-500" size={18} />
              <p className="font-medium">Active Recall</p>
            </div>
            <p className="text-sm text-gray-600">Test yourself on concepts rather than passively reading your notes.</p>
          </div>

          <div className="border border-gray-200 p-4 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="text-amber-500" size={18} />
              <p className="font-medium">Pomodoro Technique</p>
            </div>
            <p className="text-sm text-gray-600">
              Study in focused 25-minute intervals with 5-minute breaks in between.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsContent({ user }: { user: User }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-medium mb-6 flex items-center">
        <Settings className="mr-2 text-blue-600" size={20} />
        Account Settings
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
          <input
            type="text"
            defaultValue={user.nickname}
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
          <input
            type="text"
            defaultValue={user.studentId}
            disabled
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg bg-gray-50"
          />
          <p className="mt-1 text-sm text-gray-500">Student ID cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Daily Study Hours</label>
          <input
            type="number"
            defaultValue={user.studyHours}
            min="0.5"
            max="12"
            step="0.5"
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Daily Flashcard Target</label>
          <input
            type="number"
            defaultValue={user.flashcardTarget}
            min="5"
            max="200"
            step="5"
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="pt-4">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
