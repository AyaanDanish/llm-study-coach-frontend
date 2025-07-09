"use client";

import { useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useTimer } from "@/contexts/TimerContext";

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
  const {
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
  } = useTimer();

  // Get user session and load today's study data
  useEffect(() => {
    if (isInitialized) return; // Prevent re-initialization

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
  }, [isInitialized]); // Only depend on isInitialized
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
  }, [isRunning, userId, time, setIsRunning, setSessionStartTime]);
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
  }, [
    userId,
    setTime,
    setIsRunning,
    setSessionStartTime,
    setTargetReachedNotified,
  ]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 p-4 transform transition-transform hover:scale-105">
      <div className="flex flex-col items-center space-y-3">
        <div className="text-3xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          {formatTime(time)}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Target status */}
        <div className="text-sm text-center">
          {isTargetReached ? (
            <span className="text-green-600 dark:text-green-400 font-medium">
              🎉 Daily target reached!
            </span>
          ) : (
            <span className="text-gray-600 dark:text-gray-400">
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
            className="h-8 w-8 border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
          >
            <RotateCcw className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
          </Button>{" "}
        </div>
      </div>
    </div>
  );
}
