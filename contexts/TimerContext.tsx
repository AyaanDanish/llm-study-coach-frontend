"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";

interface TimerContextType {
  time: number;
  isRunning: boolean;
  dailyTarget: number;
  progress: number;
  isTargetReached: boolean;
  minutesToTarget: number;
  userId: string | null;
  isInitialized: boolean;
  sessionStartTime: Date | null;
  targetReachedNotified: boolean;
  setTime: (time: number) => void;
  setIsRunning: (isRunning: boolean) => void;
  setDailyTarget: (target: number) => void;
  setUserId: (userId: string | null) => void;
  setIsInitialized: (initialized: boolean) => void;
  setSessionStartTime: (startTime: Date | null) => void;
  setTargetReachedNotified: (notified: boolean) => void;
  formatTime: (seconds: number) => string;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [dailyTarget, setDailyTarget] = useState(30);
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [targetReachedNotified, setTargetReachedNotified] = useState(false);

  const targetSeconds = dailyTarget * 60;
  const progress = Math.min((time / targetSeconds) * 100, 100);
  const isTargetReached = time >= targetSeconds;
  const minutesToTarget = Math.max(0, Math.ceil((targetSeconds - time) / 60));

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Timer increment effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRunning) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  // Database sync effect
  useEffect(() => {
    if (!isInitialized || !userId) return;

    const updateDatabase = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const studyTimeMinutes = Math.floor(time / 60);
        const targetMinutes = dailyTarget;
        const isStudyTimeComplete = studyTimeMinutes >= targetMinutes;

        const updateData = {
          study_time_minutes: studyTimeMinutes,
          is_study_time_complete: isStudyTimeComplete,
          is_day_complete: isStudyTimeComplete,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("daily_study_records")
          .update(updateData)
          .eq("user_id", userId)
          .eq("date", today);

        if (error) {
          console.error("Error updating study time:", error);
        }

        // Broadcast update to other components that might not be using the context
        window.dispatchEvent(
          new CustomEvent("studyTimerUpdate", {
            detail: {
              time,
              progress,
              isTargetReached,
              minutesToTarget,
              isRunning,
              userId,
            },
          })
        );
      } catch (error) {
        console.error("Error updating study time:", error);
      }
    };

    // Update database more frequently:
    // - Every 5 seconds when running
    // - Immediately when timer stops
    // - On time milestones (every minute)
    const shouldUpdate =
      (!isRunning && time > 0) || // Timer just stopped
      (isRunning && time > 0 && time % 5 === 0) || // Every 5 seconds while running
      (time > 0 && time % 60 === 0); // Every minute

    if (shouldUpdate) {
      updateDatabase();
    }
  }, [
    time,
    isInitialized,
    userId,
    dailyTarget,
    isRunning,
    progress,
    isTargetReached,
    minutesToTarget,
  ]);

  // Target completion detection
  useEffect(() => {
    if (!isInitialized || !userId) return;

    const targetSeconds = dailyTarget * 60;
    const isTargetJustReached = time >= targetSeconds && !targetReachedNotified;

    if (isTargetJustReached) {
      setTargetReachedNotified(true);

      // Immediately update database when target is reached
      const updateTargetCompletion = async () => {
        try {
          const today = new Date().toISOString().split("T")[0];
          const studyTimeMinutes = Math.floor(time / 60);

          console.log("🎉 Study target reached! Updating database...");

          const { error } = await supabase
            .from("daily_study_records")
            .update({
              study_time_minutes: studyTimeMinutes,
              is_study_time_complete: true,
              is_day_complete: true,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("date", today);

          if (error) {
            console.error("Error updating target completion:", error);
          } else {
            console.log("✅ Target completion recorded in database");
          }
        } catch (error) {
          console.error("Error updating target completion:", error);
        }
      };

      updateTargetCompletion();
    }

    // Reset notification flag if time goes below target (e.g., after reset)
    if (time < targetSeconds && targetReachedNotified) {
      setTargetReachedNotified(false);
    }
  }, [time, dailyTarget, isInitialized, userId, targetReachedNotified]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && isRunning && userId) {
        console.log("Page became visible, syncing with database");
        try {
          const today = new Date().toISOString().split("T")[0];
          const studyTimeMinutes = Math.floor(time / 60);

          await supabase
            .from("daily_study_records")
            .update({
              study_time_minutes: studyTimeMinutes,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("date", today);
        } catch (error) {
          console.error("Error syncing with database:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [time, isRunning, userId]);

  // Listen for auth state changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        console.log("User signed out, resetting timer state");
        setTime(0);
        setIsRunning(false);
        setUserId(null);
        setSessionStartTime(null);
        setTargetReachedNotified(false);
        setIsInitialized(false);
      } else if (event === "SIGNED_IN" && session?.user) {
        console.log("User signed in, reinitializing timer");
        setIsInitialized(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <TimerContext.Provider
      value={{
        time,
        isRunning,
        dailyTarget,
        progress,
        isTargetReached,
        minutesToTarget,
        userId,
        isInitialized,
        sessionStartTime,
        targetReachedNotified,
        setTime,
        setIsRunning,
        setDailyTarget,
        setUserId,
        setIsInitialized,
        setSessionStartTime,
        setTargetReachedNotified,
        formatTime,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
