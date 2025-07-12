"use client";

import type React from "react";

import { useState, useEffect } from "react";
import type { User } from "@/components/auth-wrapper";
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
  Flame,
  Lightbulb,
  ChevronRight,
  Loader2,
  CheckCircle,
  Moon,
  Sun,
  Brain,
} from "lucide-react";
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
} from "@/components/ui/sidebar";
import FlashcardSection from "@/components/flashcard-section";
import StudyMaterialsSection from "@/components/study-materials-section";
import ProgressSection from "@/components/progress-section";
import QuizSection from "@/components/quiz-section";
import { supabase } from "@/lib/supabaseClient";
import { StudyTimer } from "@/components/study-timer";
import { useTimer } from "@/contexts/TimerContext";
import { CircularProgress } from "@/components/ui/circular-progress";
import { useTheme } from "@/contexts/ThemeContext";

type DashboardProps = {
  user: User;
};

type DashboardView =
  | "overview"
  | "flashcards"
  | "quizzes"
  | "materials"
  | "progress"
  | "settings";

export default function Dashboard({ user }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>("overview");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null
  );
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleMaterialSelect = (materialId: string) => {
    setSelectedMaterialId(materialId);
    setCurrentView("materials");
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        alert("Error logging out");
        return;
      }
      // The auth state change will be handled by the AuthWrapper
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Error logging out");
    }
  };
  const renderContent = () => {
    switch (currentView) {
      case "overview":
        return (
          <OverviewContent
            user={user}
            setCurrentView={setCurrentView}
            currentView={currentView}
            onMaterialSelect={handleMaterialSelect}
          />
        );
      case "flashcards":
        return <FlashcardSection />;
      case "quizzes":
        return <QuizSection userId={user.id} />;
      case "materials":
        return (
          <StudyMaterialsSection
            userId={user.id}
            selectedMaterialId={selectedMaterialId}
            onClearSelection={() => setSelectedMaterialId(null)}
          />
        );
      case "progress":
        return <ProgressSection user={user} />;
      case "settings":
        return <SettingsContent user={user} />;
      default:
        return (
          <OverviewContent
            user={user}
            setCurrentView={setCurrentView}
            currentView={currentView}
            onMaterialSelect={handleMaterialSelect}
          />
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="w-full flex h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Sidebar className="border-r border-indigo-100 dark:border-gray-700 bg-white dark:bg-gray-900">
          <SidebarHeader className="p-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg">
                <BookOpen size={24} />
              </div>
              <div>
                <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Study Coach
                </h1>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-indigo-800 dark:text-indigo-300">
                Main
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setCurrentView("overview")}
                      isActive={currentView === "overview"}
                    >
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
                      onClick={() => setCurrentView("quizzes")}
                      isActive={currentView === "quizzes"}
                    >
                      <Brain size={20} />
                      <span>Quizzes</span>
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
                    <SidebarMenuButton
                      onClick={() => setCurrentView("progress")}
                      isActive={currentView === "progress"}
                    >
                      <BarChart size={20} />
                      <span>Progress</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-indigo-800 dark:text-indigo-300">
                Study Timer
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="p-4">
                  <StudyTimer />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-indigo-800 dark:text-indigo-300">
                Account
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setCurrentView("settings")}
                      isActive={currentView === "settings"}
                    >
                      <Settings size={20} />
                      <span>Settings</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={toggleDarkMode}>
                      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                      <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                      <LogOut size={20} />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-indigo-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-600 dark:text-indigo-300 p-2 rounded-full">
                <UserIcon size={20} />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {user.nickname}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="w-full flex-1 overflow-auto">
          <div className="w-full p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4 md:hidden" />
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  {currentView === "overview" && "Dashboard"}
                  {currentView === "flashcards" && "Flashcards"}
                  {currentView === "quizzes" && "Quizzes"}
                  {currentView === "materials" && "Study Materials"}
                  {currentView === "progress" && "Progress Tracking"}
                  {currentView === "settings" && "Account Settings"}
                </h1>
              </div>
            </div>

            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

// Custom hook for study materials (moved outside component)
function useStudyMaterials(userId: string) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMaterials() {
      setLoading(true);
      const { data, error } = await supabase
        .from("study_materials")
        .select("*")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false })
        .limit(3);

      if (error) console.error(error);
      else setMaterials(data || []);

      setLoading(false);
    }

    if (userId && userId !== "placeholder-user") {
      fetchMaterials();
    } else {
      setLoading(false);
    }
  }, [userId]);

  return { materials, loading };
}

function OverviewContent({
  user,
  setCurrentView,
  currentView,
  onMaterialSelect,
}: {
  user: User;
  setCurrentView: React.Dispatch<React.SetStateAction<DashboardView>>;
  currentView: DashboardView;
  onMaterialSelect: (materialId: string) => void;
}) {
  const { materials, loading } = useStudyMaterials(user.id);

  // Get real-time study time from timer context
  const {
    time: currentStudyTime,
    progress,
    isTargetReached,
    minutesToTarget,
    dailyTarget,
  } = useTimer();

  const [currentStreak, setCurrentStreak] = useState(0);
  const [flashcardsCompleted, setFlashcardsCompleted] = useState(0);
  const [isFlashcardsComplete, setIsFlashcardsComplete] = useState(false);

  // Weekly progress state
  const [weeklyProgress, setWeeklyProgress] = useState({
    studyTime: { current: 0, target: 0, percentage: 0 },
    flashcards: { current: 0, target: 0, percentage: 0 },
    quizPerformance: { average: 0, percentage: 0 },
  });

  // Study tips array with 20 different tips
  const allStudyTips = [
    {
      title: "Spaced Repetition",
      description:
        "Review your flashcards at increasing intervals to improve long-term retention.",
      color: "amber",
      icon: "Lightbulb",
    },
    {
      title: "Active Recall",
      description:
        "Test yourself on concepts rather than passively reading your notes.",
      color: "blue",
      icon: "Lightbulb",
    },
    {
      title: "Pomodoro Technique",
      description:
        "Study in focused 25-minute intervals with 5-minute breaks in between.",
      color: "purple",
      icon: "Lightbulb",
    },
    {
      title: "Feynman Technique",
      description:
        "Explain concepts in simple terms to identify gaps in your understanding.",
      color: "green",
      icon: "Lightbulb",
    },
    {
      title: "Mind Mapping",
      description:
        "Create visual diagrams to connect ideas and improve memory retention.",
      color: "pink",
      icon: "Lightbulb",
    },
    {
      title: "Study Environment",
      description: "Find a quiet, well-lit space dedicated solely to studying.",
      color: "indigo",
      icon: "Lightbulb",
    },
    {
      title: "Sleep Schedule",
      description:
        "Get 7-9 hours of sleep to consolidate memories and improve focus.",
      color: "cyan",
      icon: "Lightbulb",
    },
    {
      title: "Eliminate Distractions",
      description:
        "Turn off notifications and put away devices while studying.",
      color: "orange",
      icon: "Lightbulb",
    },
    {
      title: "Practice Testing",
      description:
        "Take practice quizzes to identify weak areas and reinforce learning.",
      color: "red",
      icon: "Lightbulb",
    },
    {
      title: "Study Groups",
      description:
        "Collaborate with peers to gain different perspectives and explanations.",
      color: "yellow",
      icon: "Lightbulb",
    },
    {
      title: "Break Down Topics",
      description: "Divide complex subjects into smaller, manageable chunks.",
      color: "emerald",
      icon: "Lightbulb",
    },
    {
      title: "Use Multiple Senses",
      description:
        "Combine reading, writing, listening, and visual aids for better retention.",
      color: "violet",
      icon: "Lightbulb",
    },
    {
      title: "Regular Reviews",
      description:
        "Schedule weekly reviews of previous material to maintain knowledge.",
      color: "slate",
      icon: "Lightbulb",
    },
    {
      title: "Set Clear Goals",
      description:
        "Define specific, measurable objectives for each study session.",
      color: "rose",
      icon: "Lightbulb",
    },
    {
      title: "Use Mnemonics",
      description:
        "Create memory aids like acronyms or rhymes for complex information.",
      color: "lime",
      icon: "Lightbulb",
    },
    {
      title: "Take Notes by Hand",
      description:
        "Writing notes manually can improve comprehension and memory.",
      color: "teal",
      icon: "Lightbulb",
    },
    {
      title: "Teach Others",
      description:
        "Explaining concepts to someone else reinforces your own learning.",
      color: "sky",
      icon: "Lightbulb",
    },
    {
      title: "Stay Hydrated",
      description:
        "Drink plenty of water to maintain cognitive function and focus.",
      color: "blue",
      icon: "Lightbulb",
    },
    {
      title: "Use Analogies",
      description:
        "Connect new information to familiar concepts for better understanding.",
      color: "purple",
      icon: "Lightbulb",
    },
    {
      title: "Review Before Sleep",
      description:
        "Study important material before bed to enhance memory consolidation.",
      color: "indigo",
      icon: "Lightbulb",
    },
  ];

  // State for current study tips (randomly selected)
  const [currentStudyTips, setCurrentStudyTips] = useState<typeof allStudyTips>(
    []
  );

  // Function to get 3 random study tips
  const getRandomStudyTips = () => {
    const shuffled = [...allStudyTips].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Initialize random study tips on component mount
  useEffect(() => {
    setCurrentStudyTips(getRandomStudyTips());
  }, []);

  // Function to refresh study tips
  const refreshStudyTips = () => {
    setCurrentStudyTips(getRandomStudyTips());
  };

  useEffect(() => {
    const loadStudyProgress = async () => {
      try {
        // Get today's study record for current streak and flashcard progress
        const today = new Date().toISOString().split("T")[0];
        const { data: studyRecord } = await supabase
          .from("daily_study_records")
          .select(
            "current_streak, flashcards_completed, is_flashcards_complete"
          )
          .eq("user_id", user.id)
          .eq("date", today)
          .single();

        if (studyRecord) {
          setCurrentStreak(studyRecord.current_streak || 0);
          setFlashcardsCompleted(studyRecord.flashcards_completed || 0);
          setIsFlashcardsComplete(studyRecord.is_flashcards_complete || false);
        }
      } catch (error) {
        console.error("Error loading study progress:", error);
      }
    };

    loadStudyProgress();
    // Update every 30 seconds to keep streak and flashcard data in sync
    const interval = setInterval(loadStudyProgress, 30000);
    return () => clearInterval(interval);
  }, [user.id]);

  useEffect(() => {
    const loadWeeklyProgress = async () => {
      try {
        // Get start and end of current week (Monday to Sunday)
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
        const startOfWeek = new Date(now);
        startOfWeek.setDate(
          now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
        );
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        // Get daily study records for the week
        const { data: weeklyRecords } = await supabase
          .from("daily_study_records")
          .select("study_time_minutes, flashcards_completed")
          .eq("user_id", user.id)
          .gte("date", startOfWeek.toISOString().split("T")[0])
          .lte("date", endOfWeek.toISOString().split("T")[0]);

        // Calculate weekly study time
        const totalStudyMinutes =
          weeklyRecords?.reduce(
            (sum, record) => sum + (record.study_time_minutes || 0),
            0
          ) || 0;
        const weeklyStudyTarget = user.studyminutes * 7; // Daily target * 7 days
        const studyTimePercentage = Math.min(
          100,
          (totalStudyMinutes / weeklyStudyTarget) * 100
        );

        // Calculate weekly flashcards
        const totalFlashcards =
          weeklyRecords?.reduce(
            (sum, record) => sum + (record.flashcards_completed || 0),
            0
          ) || 0;
        const weeklyFlashcardTarget = user.flashcardtarget * 7; // Daily target * 7 days
        const flashcardsPercentage = Math.min(
          100,
          (totalFlashcards / weeklyFlashcardTarget) * 100
        );

        // Get quiz performance for the week
        const { data: quizAttempts } = await supabase
          .from("quiz_attempts")
          .select("score")
          .eq("user_id", user.id)
          .gte("completed_at", startOfWeek.toISOString())
          .lte("completed_at", endOfWeek.toISOString());

        const averageQuizScore =
          quizAttempts && quizAttempts.length > 0
            ? quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
              quizAttempts.length
            : 0;

        setWeeklyProgress({
          studyTime: {
            current: totalStudyMinutes,
            target: weeklyStudyTarget,
            percentage: studyTimePercentage,
          },
          flashcards: {
            current: totalFlashcards,
            target: weeklyFlashcardTarget,
            percentage: flashcardsPercentage,
          },
          quizPerformance: {
            average: averageQuizScore,
            percentage: averageQuizScore,
          },
        });
      } catch (error) {
        console.error("Error loading weekly progress:", error);
      }
    };

    loadWeeklyProgress();
    // Update every 5 minutes to keep weekly progress relatively fresh
    const interval = setInterval(loadWeeklyProgress, 300000);
    return () => clearInterval(interval);
  }, [user.id, user.studyminutes, user.flashcardtarget]);

  const formatStudyTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes`;
  };

  const remainingStudyTime = Math.max(0, minutesToTarget);
  const isGoalComplete = isTargetReached;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700">
        <h2 className="text-lg font-medium mb-4 text-indigo-800 dark:text-indigo-300">
          Welcome back, {user.nickname}!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Here's your study plan for today:
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 ">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl shadow-sm border border-blue-100 dark:border-blue-800 transform transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800 p-2 rounded-full">
                  <Clock
                    className="text-blue-600 dark:text-blue-400"
                    size={20}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Study Time
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {remainingStudyTime} minutes remaining
                  </p>
                </div>
              </div>
              {isGoalComplete && (
                <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                  <CheckCircle
                    className="text-green-600 dark:text-green-400"
                    size={20}
                  />
                </div>
              )}
            </div>{" "}
            <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                }}
              />
            </div>
          </div>{" "}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl shadow-sm border border-green-100 dark:border-green-800 transform transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 p-2 rounded-full">
                  <BookOpenCheck
                    className="text-green-600 dark:text-green-400"
                    size={20}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Flashcards
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {flashcardsCompleted} of {user.flashcardtarget} cards
                    completed
                  </p>
                </div>
              </div>
              {isFlashcardsComplete && (
                <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                  <CheckCircle
                    className="text-green-600 dark:text-green-400"
                    size={20}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl shadow-sm border border-orange-100 dark:border-orange-800 transform transition-transform hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-800 dark:to-red-800 p-2 rounded-full">
                <Flame
                  className="text-orange-600 dark:text-orange-400"
                  size={20}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current Streak
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {currentStreak > 0
                    ? `${currentStreak} days`
                    : "Start your streak!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-indigo-800 dark:text-indigo-300">
              Study Materials
            </h2>
            <button
              className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
              onClick={() => setCurrentView("materials")}
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading study materials...
              </p>
            ) : materials.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg text-center h-64 flex items-center justify-center flex-col">
                <p>You haven't uploaded any study materials yet</p>
                <button
                  onClick={() => setCurrentView("materials")}
                  className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline bg-indigo-100 dark:bg-indigo-800 px-3 py-1 rounded-lg ml-2 hover:bg-indigo-200 dark:hover:bg-indigo-700 transition mt-2"
                >
                  Upload now
                </button>
              </div>
            ) : (
              materials.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onMaterialSelect(item.id)}
                  className="flex items-center p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition cursor-pointer border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800"
                >
                  <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-700 p-2 rounded-lg mr-3">
                    <FileText
                      className="text-indigo-600 dark:text-indigo-400"
                      size={20}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium truncate text-gray-900 dark:text-gray-100">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.subject || "Unknown Subject"}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-indigo-400 dark:text-indigo-500"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-indigo-800 dark:text-indigo-300">
              Weekly Progress
            </h2>
            <button
              className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
              onClick={() => setCurrentView("progress")}
            >
              View Details
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center space-y-3">
                <CircularProgress
                  percentage={weeklyProgress.studyTime.percentage}
                  color="#3B82F6"
                  size={100}
                  strokeWidth={8}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {Math.round(weeklyProgress.studyTime.percentage)}%
                    </div>
                  </div>
                </CircularProgress>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Study Time
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(weeklyProgress.studyTime.current / 60)}h{" "}
                    {weeklyProgress.studyTime.current % 60}m /{" "}
                    {Math.round(weeklyProgress.studyTime.target / 60)}h{" "}
                    {weeklyProgress.studyTime.target % 60}m
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <CircularProgress
                  percentage={weeklyProgress.flashcards.percentage}
                  color="#10B981"
                  size={100}
                  strokeWidth={8}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {Math.round(weeklyProgress.flashcards.percentage)}%
                    </div>
                  </div>
                </CircularProgress>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Flashcards
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {weeklyProgress.flashcards.current}/
                    {weeklyProgress.flashcards.target} cards
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <CircularProgress
                  percentage={weeklyProgress.quizPerformance.percentage}
                  color="#F59E0B"
                  size={100}
                  strokeWidth={8}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                      {Math.round(weeklyProgress.quizPerformance.percentage)}%
                    </div>
                  </div>
                </CircularProgress>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Quiz Performance
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(weeklyProgress.quizPerformance.average)}%
                    average
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-indigo-800 dark:text-indigo-300">
            Study Tips
          </h2>
          <button
            onClick={refreshStudyTips}
            className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentStudyTips.map((tip, index) => {
            // Define color mappings for consistent styling
            const colorMap: Record<
              string,
              { bg: string; border: string; icon: string; iconBg: string }
            > = {
              amber: {
                bg: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
                border: "border-amber-100 dark:border-amber-800",
                icon: "text-amber-500 dark:text-amber-400",
                iconBg:
                  "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-800 dark:to-orange-800",
              },
              blue: {
                bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
                border: "border-blue-100 dark:border-blue-800",
                icon: "text-blue-500 dark:text-blue-400",
                iconBg:
                  "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800",
              },
              purple: {
                bg: "bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20",
                border: "border-purple-100 dark:border-purple-800",
                icon: "text-purple-500 dark:text-purple-400",
                iconBg:
                  "bg-gradient-to-br from-purple-100 to-fuchsia-100 dark:from-purple-800 dark:to-fuchsia-800",
              },
              green: {
                bg: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
                border: "border-green-100 dark:border-green-800",
                icon: "text-green-500 dark:text-green-400",
                iconBg:
                  "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800",
              },
              pink: {
                bg: "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
                border: "border-pink-100 dark:border-pink-800",
                icon: "text-pink-500 dark:text-pink-400",
                iconBg:
                  "bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-800 dark:to-rose-800",
              },
              indigo: {
                bg: "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20",
                border: "border-indigo-100 dark:border-indigo-800",
                icon: "text-indigo-500 dark:text-indigo-400",
                iconBg:
                  "bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-800 dark:to-purple-800",
              },
              cyan: {
                bg: "bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20",
                border: "border-cyan-100 dark:border-cyan-800",
                icon: "text-cyan-500 dark:text-cyan-400",
                iconBg:
                  "bg-gradient-to-br from-cyan-100 to-teal-100 dark:from-cyan-800 dark:to-teal-800",
              },
              orange: {
                bg: "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
                border: "border-orange-100 dark:border-orange-800",
                icon: "text-orange-500 dark:text-orange-400",
                iconBg:
                  "bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-800 dark:to-red-800",
              },
              red: {
                bg: "bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20",
                border: "border-red-100 dark:border-red-800",
                icon: "text-red-500 dark:text-red-400",
                iconBg:
                  "bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-800 dark:to-pink-800",
              },
              yellow: {
                bg: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20",
                border: "border-yellow-100 dark:border-yellow-800",
                icon: "text-yellow-500 dark:text-yellow-400",
                iconBg:
                  "bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-800 dark:to-amber-800",
              },
              emerald: {
                bg: "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
                border: "border-emerald-100 dark:border-emerald-800",
                icon: "text-emerald-500 dark:text-emerald-400",
                iconBg:
                  "bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-800 dark:to-green-800",
              },
              violet: {
                bg: "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20",
                border: "border-violet-100 dark:border-violet-800",
                icon: "text-violet-500 dark:text-violet-400",
                iconBg:
                  "bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-800 dark:to-purple-800",
              },
              slate: {
                bg: "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20",
                border: "border-slate-100 dark:border-slate-800",
                icon: "text-slate-500 dark:text-slate-400",
                iconBg:
                  "bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800",
              },
              rose: {
                bg: "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20",
                border: "border-rose-100 dark:border-rose-800",
                icon: "text-rose-500 dark:text-rose-400",
                iconBg:
                  "bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-800 dark:to-pink-800",
              },
              lime: {
                bg: "bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20",
                border: "border-lime-100 dark:border-lime-800",
                icon: "text-lime-500 dark:text-lime-400",
                iconBg:
                  "bg-gradient-to-br from-lime-100 to-green-100 dark:from-lime-800 dark:to-green-800",
              },
              teal: {
                bg: "bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20",
                border: "border-teal-100 dark:border-teal-800",
                icon: "text-teal-500 dark:text-teal-400",
                iconBg:
                  "bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-800 dark:to-cyan-800",
              },
              sky: {
                bg: "bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20",
                border: "border-sky-100 dark:border-sky-800",
                icon: "text-sky-500 dark:text-sky-400",
                iconBg:
                  "bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-800 dark:to-blue-800",
              },
            };

            const colors = colorMap[tip.color] || colorMap.blue; // fallback to blue

            return (
              <div
                key={index}
                className={`${colors.bg} p-4 rounded-xl shadow-sm border ${colors.border} transform transition-transform hover:scale-105`}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className={`${colors.iconBg} p-1.5 rounded-lg`}>
                    <Lightbulb className={`${colors.icon}`} size={18} />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {tip.title}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {tip.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SettingsContent({ user }: { user: User }) {
  const [formData, setFormData] = useState({
    nickname: user.nickname,
    email: user.email || "",
    studyminutes: user.studyminutes,
    flashcardtarget: user.flashcardtarget,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          nickname: formData.nickname,
          studyminutes: formData.studyminutes,
          flashcardtarget: formData.flashcardtarget,
        })
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSuccess(true);
      // Update the user object in the parent component
      // window.location.reload() // Temporary solution to refresh the user data
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Convert minutes to hours for display
  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) {
      return `${remainingMinutes} minutes`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700">
        <h2 className="text-lg font-medium mb-6 text-indigo-800 dark:text-indigo-300">
          Account Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nickname
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full max-w-md p-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full max-w-md p-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Daily Study Time
            </label>
            <input
              type="number"
              name="studyminutes"
              value={formData.studyminutes}
              onChange={handleChange}
              min="15"
              max="120"
              step="1"
              className="w-full max-w-md p-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Current goal: {formatStudyTime(formData.studyminutes)} per day
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Daily Flashcard Target
            </label>
            <input
              type="number"
              name="flashcardtarget"
              value={formData.flashcardtarget}
              onChange={handleChange}
              min="5"
              max="200"
              step="5"
              className="w-full max-w-md p-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
              <p className="text-sm text-green-600 dark:text-green-400">
                Profile updated successfully!
              </p>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="inline-block h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
