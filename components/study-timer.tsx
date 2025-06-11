"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerState {
    time: number;
    isRunning: boolean;
    lastActiveTimestamp: number;
    currentDay: string;
}

const STORAGE_KEY = "study-timer-state";

export function StudyTimer() {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load initial state from localStorage
    useEffect(() => {
        const loadState = () => {
            const savedState = localStorage.getItem(STORAGE_KEY);
            console.log("Loading saved state:", savedState);

            if (savedState) {
                try {
                    const state: TimerState = JSON.parse(savedState);
                    const today = new Date().toDateString();

                    // Reset if it's a new day
                    if (state.currentDay !== today) {
                        console.log("New day detected, resetting timer");
                        localStorage.removeItem(STORAGE_KEY);
                        return;
                    }

                    // Always restore the saved time, regardless of running state
                    setTime(state.time);
                    setIsRunning(state.isRunning);

                    // If timer was running, calculate elapsed time
                    if (state.isRunning) {
                        const now = Date.now();
                        const elapsedSeconds = Math.floor((now - state.lastActiveTimestamp) / 1000);
                        console.log("Timer was running, elapsed seconds:", elapsedSeconds);
                        setTime(prev => state.time + elapsedSeconds);
                    }
                } catch (error) {
                    console.error("Error loading timer state:", error);
                    localStorage.removeItem(STORAGE_KEY);
                }
            }
            setIsInitialized(true);
        };

        loadState();
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        if (!isInitialized) return; // Don't save during initial load

        const state: TimerState = {
            time,
            isRunning,
            lastActiveTimestamp: Date.now(),
            currentDay: new Date().toDateString(),
        };
        console.log("Saving timer state:", state);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [time, isRunning, isInitialized]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    const toggleTimer = useCallback(() => {
        setIsRunning((prev) => !prev);
    }, []);

    const resetTimer = useCallback(() => {
        console.log("Resetting timer");
        setTime(0);
        setIsRunning(false);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isRunning) {
            intervalId = setInterval(() => {
                setTime((prevTime) => {
                    const newTime = prevTime + 1;
                    // Save state immediately when time changes
                    const state: TimerState = {
                        time: newTime,
                        isRunning,
                        lastActiveTimestamp: Date.now(),
                        currentDay: new Date().toDateString(),
                    };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isRunning]);

    // Add event listeners for page visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && isRunning) {
                console.log("Page became visible, updating timestamp");
                const state: TimerState = {
                    time,
                    isRunning,
                    lastActiveTimestamp: Date.now(),
                    currentDay: new Date().toDateString(),
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [time, isRunning]);

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4">
            <div className="flex flex-col items-center space-y-3">
                <div className="text-3xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    {formatTime(time)}
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant={isRunning ? "destructive" : "default"}
                        size="icon"
                        onClick={toggleTimer}
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
                        className="h-8 w-8 border-indigo-200 hover:bg-indigo-50"
                    >
                        <RotateCcw className="h-3 w-3 text-indigo-600" />
                    </Button>
                </div>
            </div>
        </div>
    );
} 