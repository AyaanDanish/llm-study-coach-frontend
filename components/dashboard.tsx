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
import { supabase } from "@/lib/supabaseClient";
import { StudyTimer } from "@/components/study-timer";

type DashboardProps = {
  user: User;
};

type DashboardView =
  | "overview"
  | "flashcards"
  | "materials"
  | "progress"
  | "settings";

export default function Dashboard({ user }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>("overview");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    null
  );

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
      <div className="w-full flex h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <Sidebar className="border-r border-indigo-100">
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
              <SidebarGroupLabel className="text-indigo-800">
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
              <SidebarGroupLabel className="text-indigo-800">
                Study Timer
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="p-4">
                  <StudyTimer />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-indigo-800">
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
                    <SidebarMenuButton onClick={handleLogout}>
                      <LogOut size={20} />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-indigo-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 p-2 rounded-full">
                <UserIcon size={20} />
              </div>
              <div>
                <p className="font-medium text-sm">{user.nickname}</p>
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

  const { materials, loading } = useStudyMaterials(user.id); // Get current study time from database
  const [currentStudyTime, setCurrentStudyTime] = useState(0);
  const [dailyTarget, setDailyTarget] = useState(30); // Default 30 minutes
  const [currentStreak, setCurrentStreak] = useState(0);
  const [flashcardsCompleted, setFlashcardsCompleted] = useState(0);
  const [isFlashcardsComplete, setIsFlashcardsComplete] = useState(false);

  useEffect(() => {
    const loadStudyProgress = async () => {
      try {
        // Get user's daily target
        const { data: profile } = await supabase
          .from("profiles")
          .select("studyminutes")
          .eq("id", user.id)
          .single();

        if (profile) {
          setDailyTarget(profile.studyminutes || 30);
        } // Get today's study record for current streak and flashcard progress
        const today = new Date().toISOString().split("T")[0];
        const { data: studyRecord } = await supabase
          .from("daily_study_records")
          .select(
            "study_time_minutes, current_streak, flashcards_completed, is_flashcards_complete"
          )
          .eq("user_id", user.id)
          .eq("date", today)
          .single();

        if (studyRecord) {
          setCurrentStudyTime(studyRecord.study_time_minutes * 60); // Convert to seconds
          setCurrentStreak(studyRecord.current_streak || 0);
          setFlashcardsCompleted(studyRecord.flashcards_completed || 0);
          setIsFlashcardsComplete(studyRecord.is_flashcards_complete || false);
        }
      } catch (error) {
        console.error("Error loading study progress:", error);
      }
    };

    loadStudyProgress();
    // Update every 10 seconds to keep in sync with timer
    const interval = setInterval(loadStudyProgress, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  const formatStudyTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes`;
  };
  const remainingStudyTime = Math.max(
    0,
    dailyTarget - Math.floor(currentStudyTime / 60)
  );
  const isGoalComplete = currentStudyTime >= dailyTarget * 60; // Convert minutes to seconds

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
        <h2 className="text-lg font-medium mb-4 text-indigo-800">
          Welcome back, {user.nickname}!
        </h2>
        <p className="text-gray-600">Here's your study plan for today:</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-full">
                  <Clock className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Study Time</p>
                  <p className="font-medium">
                    {remainingStudyTime} minutes remaining
                  </p>
                </div>
              </div>
              {isGoalComplete && (
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
              )}
            </div>{" "}
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (currentStudyTime / (dailyTarget * 60)) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>{" "}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl shadow-sm border border-green-100 transform transition-transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded-full">
                  <BookOpenCheck className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Flashcards</p>
                  <p className="font-medium">
                    {flashcardsCompleted} of {user.flashcardtarget} cards
                    completed
                  </p>
                </div>
              </div>
              {isFlashcardsComplete && (
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl shadow-sm border border-orange-100 transform transition-transform hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 p-2 rounded-full">
                <Flame className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="font-medium">
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-indigo-800">
              Study Materials
            </h2>
            <button
              className="text-indigo-600 text-sm font-medium hover:underline"
              onClick={() => setCurrentView("materials")}
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-gray-500">
                Loading study materials...
              </p>
            ) : materials.length === 0 ? (
              <div className="text-sm text-gray-500 bg-indigo-50 p-4 rounded-lg text-center h-64 flex items-center justify-center flex-col">
                <p>You haven't uploaded any study materials yet</p>
                <button
                  onClick={() => setCurrentView("materials")}
                  className="text-indigo-600 font-medium hover:underline bg-indigo-100 px-3 py-1 rounded-lg ml-2 hover:bg-indigo-200 transition mt-2"
                >
                  Upload now
                </button>
              </div>
            ) : (
              materials.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onMaterialSelect(item.id)}
                  className="flex items-center p-3 hover:bg-indigo-50 rounded-xl transition cursor-pointer border border-transparent hover:border-indigo-100"
                >
                  <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-2 rounded-lg mr-3">
                    <FileText className="text-indigo-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.subject || "Unknown Subject"}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-indigo-400" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-indigo-800">
              Weekly Progress
            </h2>
            <button
              className="text-indigo-600 text-sm font-medium hover:underline"
              onClick={() => setCurrentView("progress")}
            >
              View Details
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Study Time</span>
                <span className="text-sm text-gray-500">8/14 hours</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  style={{ width: "57%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Flashcards Reviewed</span>
                <span className="text-sm text-gray-500">85/140 cards</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: "61%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Topics Covered</span>
                <span className="text-sm text-gray-500">12/15 topics</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
                  style={{ width: "80%" }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Quiz Performance</span>
                <span className="text-sm text-gray-500">85% average</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-indigo-800">
            AI-Generated Study Tips
          </h2>
          <button className="text-indigo-600 text-sm font-medium hover:underline">
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl shadow-sm border border-amber-100 transform transition-transform hover:scale-105">
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-1.5 rounded-lg">
                <Lightbulb className="text-amber-500" size={18} />
              </div>
              <p className="font-medium">Spaced Repetition</p>
            </div>
            <p className="text-sm text-gray-600">
              Review your flashcards at increasing intervals to improve
              long-term retention.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm border border-blue-100 transform transition-transform hover:scale-105">
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-1.5 rounded-lg">
                <Lightbulb className="text-blue-500" size={18} />
              </div>
              <p className="font-medium">Active Recall</p>
            </div>
            <p className="text-sm text-gray-600">
              Test yourself on concepts rather than passively reading your
              notes.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-xl shadow-sm border border-purple-100 transform transition-transform hover:scale-105">
            <div className="flex items-center space-x-2 mb-3">
              <div className="bg-gradient-to-br from-purple-100 to-fuchsia-100 p-1.5 rounded-lg">
                <Lightbulb className="text-purple-500" size={18} />
              </div>
              <p className="font-medium">Pomodoro Technique</p>
            </div>
            <p className="text-sm text-gray-600">
              Study in focused 25-minute intervals with 5-minute breaks in
              between.
            </p>
          </div>
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
        <h2 className="text-lg font-medium mb-6 text-indigo-800">
          Account Settings
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nickname
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full max-w-md p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full max-w-md p-2 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full max-w-md p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Current goal: {formatStudyTime(formData.studyminutes)} per day
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full max-w-md p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-sm text-green-600">
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
