"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Shuffle,
  Eye,
  EyeOff,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  Brain,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import CreateFlashcardDialog from "./create-flashcard-dialog";
import GenerateFlashcardsDialog from "./generate-flashcards-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Flashcard = {
  id: string;
  front: string;
  back: string;
  category: string;
  lastReviewed?: Date;
  difficulty: "easy" | "medium" | "hard";
  user_id: string;
};

export default function FlashcardSection() {
  const [currentDeck, setCurrentDeck] = useState<string>("all");
  const [currentView, setCurrentView] = useState<"browse" | "study">("browse");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]); // State to store fetched flashcards
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [user, setUser] = useState<any>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [deletingCard, setDeletingCard] = useState<Flashcard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set()); // Track studied cards for today
  const [isMarkingStudied, setIsMarkingStudied] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  // Function to fetch the current user session
  const getSession = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (!user) {
      setError("Please log in to view your flashcards.");
      setLoading(false);
    }
  }, []);

  // Fetch user session and listen for auth state changes on component mount
  useEffect(() => {
    getSession(); // Initial session check

    // Listen for auth state changes for real-time user updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        // If a user logs in or session refreshes, fetch flashcards
        fetchFlashcards(session.user.id);
      } else {
        // If user logs out, clear flashcards and show login message
        setFlashcards([]);
        setError("Please log in to view your flashcards.");
        setLoading(false); // Stop loading if user logs out
      }
    });

    return () => {
      subscription.unsubscribe(); // Clean up subscription on unmount
    };
  }, [getSession]); // Dependency array ensures it runs only once on mount

  // Function to fetch flashcards from Supabase for the current user
  const fetchFlashcards = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      // If no user ID, don't attempt to fetch
      setFlashcards([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // The RLS policy will automatically filter by user_id
      const { data, error } = await supabase.from("flashcards").select("*");

      if (error) {
        throw error;
      }
      // Ensure 'difficulty' and 'category' are correctly typed
      const typedData: Flashcard[] = data.map((card: any) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        category: card.category,
        lastReviewed: card.lastReviewed,
        difficulty: card.difficulty,
        user_id: card.user_id, // Include user_id from fetched data
      }));

      setFlashcards(typedData);
    } catch (error: any) {
      console.error("Error fetching flashcards:", error.message);
      setError("Failed to fetch flashcards. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch flashcards when the user state changes (e.g., after initial login or auth state change)
  useEffect(() => {
    if (user) {
      // Only fetch if a user is authenticated
      fetchFlashcards(user.id);
    }
  }, [user, fetchFlashcards]); // Re-fetch when user object changes or fetchFlashcards memoized function changes

  // Add a function to get unique categories
  const uniqueCategories = useMemo(() => {
    const categories = new Set(flashcards.map((card) => card.category));
    return Array.from(categories).sort();
  }, [flashcards]);

  // Update the filtering logic
  const filteredFlashcards = useMemo(() => {
    return flashcards.filter((card) => {
      const matchesSearch =
        card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDeck =
        currentDeck === "all" || card.category === currentDeck;
      return matchesSearch && matchesDeck;
    });
  }, [flashcards, searchQuery, currentDeck]);

  const handleNextCard = () => {
    if (currentCardIndex < filteredFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const resetCardIndex = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // Placeholder for creating a flashcard (implement this with a form later)
  // Example of creating a flashcard (requires a form/modal)
  const handleCreateFlashcard = async () => {
    if (!user) {
      alert("Please log in to create flashcards.");
      return;
    }

    // get these values from a form
    const newFlashcardData = {
      front: "New Flashcard Front",
      back: "New Flashcard Back",
      category: "Algorithms", // Example category
      difficulty: "medium", // Example difficulty
      user_id: user.id, // Attach the current user's ID
    };

    try {
      const { data, error } = await supabase
        .from("flashcards")
        .insert([newFlashcardData])
        .select(); // Use .select() to return the inserted data

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Add the newly created card to your state
        setFlashcards((prevCards) => [...prevCards, data[0] as Flashcard]);
        alert("Flashcard created successfully!");
      }
    } catch (error: any) {
      console.error("Error creating flashcard:", error.message);
      alert("Failed to create flashcard: " + error.message);
    }
  };

  // Add function to handle card deletion
  const handleDeleteCard = async (card: Flashcard) => {
    if (!user) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", card.id);

      if (error) throw error;

      // Remove the card from the local state
      setFlashcards((prevCards) => prevCards.filter((c) => c.id !== card.id));
      setDeletingCard(null);
    } catch (error: any) {
      console.error("Error deleting flashcard:", error);
      alert("Failed to delete flashcard: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Add function to mark flashcard as studied
  const handleMarkAsStudied = async (card: Flashcard) => {
    if (!user) return;
    setIsMarkingStudied(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // Get user's flashcard target first
      const { data: profile } = await supabase
        .from("profiles")
        .select("flashcardtarget")
        .eq("id", user.id)
        .single();

      const flashcardTarget = profile?.flashcardtarget || 10;

      // First try to get the existing record
      let { data: existingRecord, error: fetchError } = await supabase
        .from("daily_study_records")
        .select("flashcards_completed, is_study_time_complete")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (fetchError && fetchError.code === "PGRST116") {
        // No record exists, try to create one
        const { error: insertError } = await supabase
          .from("daily_study_records")
          .insert({
            user_id: user.id,
            date: today,
            study_time_minutes: 0,
            flashcards_completed: 1, // First flashcard
            is_study_time_complete: false,
            is_flashcards_complete: 1 >= flashcardTarget,
            is_day_complete: false,
            current_streak: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          // If this fails due to unique constraint (race condition),
          // fetch the record that was created by another request
          if (insertError.code === "23505") {
            console.log("Race condition detected, fetching existing record...");
            const { data: raceRecord, error: raceError } = await supabase
              .from("daily_study_records")
              .select("flashcards_completed, is_study_time_complete")
              .eq("user_id", user.id)
              .eq("date", today)
              .single();

            if (raceError) {
              console.error(
                "Error fetching record after race condition:",
                raceError
              );
              return;
            }
            existingRecord = raceRecord;
          } else {
            console.error("Error creating study record:", insertError);
            return;
          }
        }
      } else if (fetchError) {
        console.error("Error fetching study record:", fetchError);
        return;
      }

      // If we have an existing record, update it
      if (existingRecord) {
        const newFlashcardsCount =
          (existingRecord.flashcards_completed || 0) + 1;
        const isFlashcardsComplete = newFlashcardsCount >= flashcardTarget;

        const { error: updateError } = await supabase
          .from("daily_study_records")
          .update({
            flashcards_completed: newFlashcardsCount,
            is_flashcards_complete: isFlashcardsComplete,
            is_day_complete:
              isFlashcardsComplete && existingRecord.is_study_time_complete,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("date", today);

        if (updateError) {
          console.error("Error updating study record:", updateError);
          return;
        }
      }

      // Mark card as studied locally
      const newStudiedCards = new Set(studiedCards).add(card.id);
      setStudiedCards(newStudiedCards);

      // Save to localStorage for session persistence
      if (user) {
        saveStudiedCards(newStudiedCards, user.id);
      }

      // Auto-advance to next card if not the last one
      if (currentCardIndex < filteredFlashcards.length - 1) {
        handleNextCard();
      }

      console.log("✅ Flashcard marked as studied!");
    } catch (error: any) {
      console.error("Error marking flashcard as studied:", error);
      alert("Failed to mark flashcard as studied: " + error.message);
    } finally {
      setIsMarkingStudied(false);
    }
  };
  // Function to load today's studied cards from localStorage
  const loadStudiedCards = useCallback(async (userId: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const storageKey = `studied-cards-${userId}-${today}`;

      // Load studied cards from localStorage for today's session
      const storedStudiedCards = localStorage.getItem(storageKey);
      if (storedStudiedCards) {
        try {
          const cardIds = JSON.parse(storedStudiedCards);
          if (Array.isArray(cardIds)) {
            setStudiedCards(new Set(cardIds));
            console.log(
              `📚 Loaded ${cardIds.length} studied cards from session storage`
            );
          }
        } catch (parseError) {
          console.error("Error parsing stored studied cards:", parseError);
          // Clear invalid data
          localStorage.removeItem(storageKey);
          setStudiedCards(new Set());
        }
      } else {
        setStudiedCards(new Set());
      }
    } catch (error) {
      console.error("Error loading studied cards:", error);
      setStudiedCards(new Set());
    }
  }, []);
  // Function to save studied cards to localStorage
  const saveStudiedCards = useCallback(
    (cardIds: Set<string>, userId: string) => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const storageKey = `studied-cards-${userId}-${today}`;
        localStorage.setItem(storageKey, JSON.stringify(Array.from(cardIds)));
      } catch (error) {
        console.error("Error saving studied cards to localStorage:", error);
      }
    },
    []
  );

  // Function to clean up old studied card data from localStorage
  const cleanupOldStudiedCards = useCallback((userId: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const keysToRemove: string[] = [];

      // Check all localStorage keys for old studied card data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          key.startsWith(`studied-cards-${userId}-`) &&
          !key.endsWith(today)
        ) {
          keysToRemove.push(key);
        }
      }

      // Remove old keys
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      if (keysToRemove.length > 0) {
        console.log(
          `🧹 Cleaned up ${keysToRemove.length} old studied card records`
        );
      }
    } catch (error) {
      console.error("Error cleaning up old studied cards:", error);
    }
  }, []); // Load studied cards when user changes
  useEffect(() => {
    if (user) {
      loadStudiedCards(user.id);
      cleanupOldStudiedCards(user.id);
    }
  }, [user, loadStudiedCards, cleanupOldStudiedCards]);
  // Preserve and restore scroll position using sessionStorage
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem(
        "flashcard-scroll-position",
        window.scrollY.toString()
      );
    };

    // Restore scroll position when component mounts
    const savedScrollPosition = sessionStorage.getItem(
      "flashcard-scroll-position"
    );
    if (savedScrollPosition) {
      const scrollY = parseInt(savedScrollPosition, 10);
      if (scrollY > 0) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, scrollY);
        });
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Clear scroll position when leaving flashcard section
  useEffect(() => {
    return () => {
      if (currentView === "browse") {
        sessionStorage.removeItem("flashcard-scroll-position");
      }
    };
  }, [currentView]);

  const renderBrowseView = () => {
    if (!user && !loading && error) {
      return (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm">
          <p className="text-red-600 font-medium text-lg">{error}</p>
          <p className="text-gray-500 mt-2">
            Please log in to view and manage your flashcards.
          </p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center py-12">
          <p className="text-indigo-600">Loading flashcards...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-600">
          <p>{error}</p>
          <button
            onClick={() => (user ? fetchFlashcards(user.id) : getSession())}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-indigo-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search flashcards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-indigo-200 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={currentDeck}
              onChange={(e) => setCurrentDeck(e.target.value)}
              className="p-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80"
            >
              <option value="all">All Decks</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              onClick={() => setCurrentView("study")}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg flex items-center"
            >
              <BookOpen size={18} className="mr-2" />
              Study
            </button>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="p-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-600 transition-colors"
              title={showAnswers ? "Hide answers" : "Show answers"}
            >
              {showAnswers ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>{" "}
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="p-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-600 transition-colors"
              title="Create new flashcard"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={() => setGenerateDialogOpen(true)}
              className="p-2 rounded-xl border border-purple-200 hover:bg-purple-50 text-purple-600 transition-colors"
              title="Generate AI flashcards"
            >
              <Brain size={18} />
            </button>
          </div>
        </div>

        {filteredFlashcards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlashcards.map((card) => (
              <div
                key={card.id}
                className="bg-white border border-indigo-100 rounded-xl p-5 hover:shadow-md transition transform hover:scale-105 hover:border-indigo-300 relative group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        card.category === "Algorithms"
                          ? "bg-gradient-to-r from-purple-100 to-fuchsia-100 text-purple-800"
                          : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800"
                      }`}
                    >
                      {card.category}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        card.difficulty === "easy"
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                          : card.difficulty === "medium"
                          ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800"
                          : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800"
                      }`}
                    >
                      {card.difficulty.charAt(0).toUpperCase() +
                        card.difficulty.slice(1)}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="More options"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditingCard(card)}
                        className="text-indigo-600 cursor-pointer"
                      >
                        <Pencil size={16} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingCard(card)}
                        className="text-red-600 cursor-pointer"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-medium mb-2 line-clamp-2">{card.front}</h3>
                {showAnswers && (
                  <p className="text-sm text-gray-600 line-clamp-3 mt-2 border-t border-indigo-100 pt-2">
                    {card.back}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm">
            <p className="text-gray-500">
              No flashcards found. Try a different search or create new ones.
            </p>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg flex items-center mx-auto"
            >
              <Plus size={18} className="mr-2" />
              Create Flashcard
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderStudyView = () => {
    if (!user && !loading && error) {
      return (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm">
          <p className="text-red-600 font-medium text-lg">{error}</p>
          <p className="text-gray-500 mt-2">
            Please log in to study your flashcards.
          </p>
          {/* You might add a login button here */}
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center py-12">
          <p className="text-indigo-600">Loading flashcards for study...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-600">
          <p>{error}</p>
          <button
            onClick={() => (user ? fetchFlashcards(user.id) : getSession())} // Retry or get session
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
          >
            Retry
          </button>
        </div>
      );
    }

    if (filteredFlashcards.length === 0) {
      return (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm">
          <p className="text-gray-500">
            No flashcards available for study. Try a different deck or create
            new ones.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => setCurrentView("browse")}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
            >
              Back to Browse
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg flex items-center">
              <Plus size={18} className="mr-2" />
              Create Flashcard
            </button>
          </div>
        </div>
      );
    }

    const currentCard = filteredFlashcards[currentCardIndex];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentView("browse")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition flex items-center"
          >
            <ChevronLeft size={18} className="mr-1" />
            Back
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {currentCardIndex + 1} of {filteredFlashcards.length}
            </span>
            <button
              onClick={resetCardIndex}
              className="p-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-600"
              title="Return to first card"
            >
              <Shuffle size={18} />
            </button>
            <button
              className="p-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-600"
              title="Settings"
            >
              <Settings size={18} />
            </button>{" "}
          </div>
        </div>{" "}
        {/* Progress indicator */}
        <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Session Progress</span>
            <span className="text-sm font-medium text-indigo-600">
              {studiedCards.size} studied today
              {studiedCards.size > 0 && (
                <span className="ml-1 text-xs text-green-600">✓</span>
              )}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  filteredFlashcards.length > 0
                    ? (studiedCards.size / filteredFlashcards.length) * 100
                    : 0
                }%`,
              }}
            ></div>
          </div>
          {studiedCards.size >= (user?.flashcardtarget || 10) && (
            <div className="mt-2 text-center">
              <span className="text-green-600 font-medium text-sm">
                🎉 Daily flashcard target reached! Great job!
              </span>
            </div>
          )}
        </div>
        <div
          className="relative bg-white border border-indigo-100 rounded-xl p-6 shadow-md mx-auto max-w-2xl aspect-video cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:border-indigo-300"
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ perspective: "1000px" }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center p-6 backface-hidden transition-transform duration-500 rounded-xl bg-gradient-to-br from-white to-indigo-50"
            style={{
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              backfaceVisibility: "hidden",
            }}
          >
            <h3 className="text-xl font-medium text-center">
              {currentCard.front}
            </h3>
          </div>

          <div
            className="absolute inset-0 flex items-center justify-center p-6 backface-hidden transition-transform duration-500 rounded-xl bg-gradient-to-br from-white to-purple-50"
            style={{
              transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)",
              backfaceVisibility: "hidden",
            }}
          >
            <p className="text-gray-800">{currentCard.back}</p>
          </div>

          <div className="absolute bottom-3 right-3 text-sm text-gray-500">
            Click to flip
          </div>
        </div>{" "}
        <div className="flex justify-center space-x-4 pt-4">
          <button
            onClick={handlePrevCard}
            disabled={currentCardIndex === 0}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} className="mr-1" />
            Previous
          </button>

          <button
            onClick={() => handleMarkAsStudied(currentCard)}
            disabled={isMarkingStudied || studiedCards.has(currentCard.id)}
            className={`px-6 py-2 rounded-xl transition flex items-center ${
              studiedCards.has(currentCard.id)
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <CheckCircle size={18} className="mr-2" />
            {isMarkingStudied
              ? "Marking..."
              : studiedCards.has(currentCard.id)
              ? "Studied ✓"
              : "Mark as Studied"}
          </button>

          <button
            onClick={handleNextCard}
            disabled={currentCardIndex === filteredFlashcards.length - 1}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100">
      {currentView === "browse" ? renderBrowseView() : renderStudyView()}
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCard}
        onOpenChange={() => setDeletingCard(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Flashcard</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this flashcard? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCard && handleDeleteCard(deletingCard)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Edit Dialog */}
      {editingCard && (
        <CreateFlashcardDialog
          isOpen={!!editingCard}
          onClose={() => setEditingCard(null)}
          onSuccess={() => {
            fetchFlashcards(user?.id);
            setEditingCard(null);
          }}
          userId={user?.id || ""}
          editMode={true}
          initialData={editingCard}
        />
      )}{" "}
      {/* Existing Create Dialog */}
      {user && !editingCard && (
        <CreateFlashcardDialog
          isOpen={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onSuccess={() => fetchFlashcards(user.id)}
          userId={user.id}
        />
      )}
      {/* AI Generate Dialog */}
      {user && (
        <GenerateFlashcardsDialog
          isOpen={generateDialogOpen}
          onClose={() => setGenerateDialogOpen(false)}
          onSuccess={() => fetchFlashcards(user.id)}
          userId={user.id}
        />
      )}
    </div>
  );
}
