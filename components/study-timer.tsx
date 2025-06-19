"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface DailyStudyRecord {
  id: string;
  user_id: string;
  date: string;
  study_time_started: string | null;
  study_time_completed: string | null;
  study_time_minutes: number;
  is_study_time_complete: boolean;
  current_streak: number;
}

export function StudyTimer() {
  const [time, setTime] = useState(0); // time in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [dailyTarget, setDailyTarget] = useState<number>(30); // default 30 minutes
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [targetReachedNotified, setTargetReachedNotified] = useState(false);

  // Get user session and load today's study data
  useEffect(() => {
    const initializeTimer = async () => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setIsInitialized(true);
          return;
        }

        setUserId(user.id);

        // Get user's daily target from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("studyminutes")
          .eq("id", user.id)
          .single();

        if (profile) {
          setDailyTarget(profile.studyminutes || 30);
        } // Get or create today's study record
        const today = new Date().toISOString().split("T")[0];

        let { data: studyRecord, error } = await supabase
          .from("daily_study_records")
          .select("*")
          .eq("user_id", user.id)
          .eq("date", today)
          .single();

        if (error && error.code === "PGRST116") {
          // Record doesn't exist, create one
          const { data: newRecord, error: insertError } = await supabase
            .from("daily_study_records")
            .insert({
              user_id: user.id,
              date: today,
              study_time_minutes: 0,
              flashcards_completed: 0,
              is_study_time_complete: false,
              is_flashcards_complete: false,
              is_day_complete: false,
              current_streak: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (insertError) {
            // Handle race condition (another component created the record)
            if (insertError.code === "23505") {
              console.log(
                "Race condition detected in timer, fetching existing record..."
              );
              const { data: existingRecord, error: fetchError } = await supabase
                .from("daily_study_records")
                .select("*")
                .eq("user_id", user.id)
                .eq("date", today)
                .single();

              if (fetchError) {
                console.error(
                  "Error fetching record after race condition:",
                  fetchError
                );
                setIsInitialized(true);
                return;
              }
              studyRecord = existingRecord;
            } else {
              console.error("Error creating study record:", insertError);
              setIsInitialized(true);
              return;
            }
          } else {
            studyRecord = newRecord;
          }
        } else if (error) {
          console.error("Error fetching study record:", error);
          setIsInitialized(true);
          return;
        }

        // Check if there's an active session first, then set time accordingly
        if (
          studyRecord.study_time_started &&
          !studyRecord.study_time_completed
        ) {
          console.log(
            "Restoring active session from:",
            studyRecord.study_time_started
          );
          setIsRunning(true);
          setSessionStartTime(new Date(studyRecord.study_time_started));

          // For active sessions, calculate total time from session start
          // This prevents double-counting issues
          const sessionStart = new Date(studyRecord.study_time_started);
          const now = new Date();
          const totalElapsedSeconds = Math.floor(
            (now.getTime() - sessionStart.getTime()) / 1000
          );

          // Use the elapsed time from session start as the total time
          // This is more reliable than adding to stored minutes
          setTime(totalElapsedSeconds);

          console.log(
            `Restored active session: session_start=${studyRecord.study_time_started}, total_elapsed=${totalElapsedSeconds}s`
          );
        } else if (
          studyRecord.study_time_started &&
          studyRecord.study_time_completed
        ) {
          // Session was completed, use stored time
          setTime(studyRecord.study_time_minutes * 60);
          setIsRunning(false);
          setSessionStartTime(null);
          console.log(
            `Restored completed session: stored_time=${studyRecord.study_time_minutes}min`
          );
        } else {
          // No session yet today, use stored time
          setTime(studyRecord.study_time_minutes * 60);
          setIsRunning(false);
          setSessionStartTime(null);
          console.log(
            `No active session: stored_time=${studyRecord.study_time_minutes}min`
          );
        }

        // Initialize target completion notification based on current time and target
        const targetSeconds = (profile?.studyminutes || 30) * 60;
        const currentTimeSeconds = studyRecord.study_time_minutes * 60;
        setTargetReachedNotified(currentTimeSeconds >= targetSeconds);
      } catch (error) {
        console.error("Error initializing timer:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeTimer();
  }, []); // Update database whenever time changes
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
  }, [time, isInitialized, userId, dailyTarget, isRunning]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };
  const toggleTimer = useCallback(async () => {
    if (!userId) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();

      if (isRunning) {
        // Stop the timer
        setIsRunning(false);
        setSessionStartTime(null);

        // Update database with session end
        await supabase
          .from("daily_study_records")
          .update({
            study_time_completed: now,
            study_time_minutes: Math.floor(time / 60),
            updated_at: now,
          })
          .eq("user_id", userId)
          .eq("date", today);
      } else {
        // Start the timer
        setIsRunning(true);
        setSessionStartTime(new Date());

        // Update database with session start
        await supabase
          .from("daily_study_records")
          .update({
            study_time_started: now,
            study_time_completed: null,
            updated_at: now,
          })
          .eq("user_id", userId)
          .eq("date", today);
      }
    } catch (error) {
      console.error("Error toggling timer:", error);
    }
  }, [isRunning, userId, time]);
  const resetTimer = useCallback(async () => {
    if (!userId) return;

    try {
      console.log("Resetting timer");
      setTime(0);
      setIsRunning(false);
      setSessionStartTime(null);
      setTargetReachedNotified(false); // Reset target completion notification

      const today = new Date().toISOString().split("T")[0];
      const now = new Date().toISOString();

      // Reset database record
      await supabase
        .from("daily_study_records")
        .update({
          study_time_started: null,
          study_time_completed: null,
          study_time_minutes: 0,
          is_study_time_complete: false,
          is_day_complete: false,
          updated_at: now,
        })
        .eq("user_id", userId)
        .eq("date", today);
    } catch (error) {
      console.error("Error resetting timer:", error);
    }
  }, [userId]);
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
  }, [isRunning]); // Handle page visibility changes (optional - could save state to DB)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible" && isRunning && userId) {
        // Optionally sync with database when page becomes visible
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
  }, [time, isRunning, userId]); // Listen for auth state changes to handle logout/login
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        console.log("User signed out, resetting timer state"); // Reset timer state
        setTime(0);
        setIsRunning(false);
        setUserId(null);
        setSessionStartTime(null);
        setTargetReachedNotified(false);
        setIsInitialized(false);
      } else if (event === "SIGNED_IN" && session?.user) {
        // User signed in, reinitialize timer
        console.log("User signed in, reinitializing timer");
        setIsInitialized(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Calculate progress
  const targetSeconds = dailyTarget * 60;
  const progress = Math.min((time / targetSeconds) * 100, 100);
  const isTargetReached = time >= targetSeconds;
  const minutesToTarget = Math.max(0, Math.ceil((targetSeconds - time) / 60));

  // Handle target completion detection
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
              is_day_complete: true, // Mark day as complete when study target is reached
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

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4">
      <div className="flex flex-col items-center space-y-3">
        <div className="text-3xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          {formatTime(time)}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Target status */}
        <div className="text-sm text-center">
          {isTargetReached ? (
            <span className="text-green-600 font-medium">
              🎉 Daily target reached!
            </span>
          ) : (
            <span className="text-gray-600">
              {minutesToTarget} minutes to target
            </span>
          )}
        </div>

        <div className="flex space-x-2">
          <Button
            variant={isRunning ? "destructive" : "default"}
            size="icon"
            onClick={toggleTimer}
            disabled={!userId}
            className="h-8 w-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            {isRunning ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetTimer}
            disabled={!userId}
            className="h-8 w-8 border-indigo-200 hover:bg-indigo-50"
          >
            <RotateCcw className="h-3 w-3 text-indigo-600" />
          </Button>{" "}
        </div>
      </div>
    </div>
  );
}
