"use client";

import { useState, useEffect, useCallback } from "react"
import { BookOpen, ChevronLeft, ChevronRight, Plus, Search, Settings, Shuffle } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type Flashcard = {
  id: string
  front: string
  back: string
  category: string
  lastReviewed?: Date
  difficulty: "easy" | "medium" | "hard"
  user_id: string
}

/*
// Mock data for flashcards
const mockFlashcards: Flashcard[] = [
  {
    id: "1",
    front: "What is Big O Notation?",
    back: "Big O notation is a mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity. In computer science, it's used to classify algorithms according to how their run time or space requirements grow as the input size grows.",
    category: "Algorithms",
    difficulty: "medium",
  },
  {
    id: "2",
    front: "What is a Stack data structure?",
    back: "A stack is a linear data structure that follows the Last In First Out (LIFO) principle. The last item to be inserted is the first one to be deleted. Basic operations include push (insert) and pop (remove).",
    category: "Data Structures",
    difficulty: "easy",
  },
  {
    id: "3",
    front: "What is a Queue data structure?",
    back: "A queue is a linear data structure that follows the First In First Out (FIFO) principle. The first item to be inserted is the first one to be deleted. Basic operations include enqueue (insert) and dequeue (remove).",
    category: "Data Structures",
    difficulty: "easy",
  },
  {
    id: "4",
    front: "What is a Binary Search Tree?",
    back: "A binary search tree is a node-based binary tree data structure that has the following properties: The left subtree of a node contains only nodes with keys lesser than the node's key. The right subtree of a node contains only nodes with keys greater than the node's key.",
    category: "Data Structures",
    difficulty: "hard",
  },
  {
    id: "5",
    front: "What is the time complexity of quicksort?",
    back: "The average time complexity of quicksort is O(n log n), where n is the number of items being sorted. In the worst case, it's O(n²), but this is rare with good pivot selection strategies.",
    category: "Algorithms",
    difficulty: "medium",
  },
]
*/

export default function FlashcardSection() {
  const [currentDeck, setCurrentDeck] = useState<"all" | "algorithms" | "data-structures">("all")
  const [currentView, setCurrentView] = useState<"browse" | "study">("browse")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]) // State to store fetched flashcards
  const [loading, setLoading] = useState(true) // Loading state
  const [error, setError] = useState<string | null>(null) // Error state
  const [user, setUser] = useState<any>(null);

  // Function to fetch the current user session
  const getSession = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (!user) {
      setError("Please log in to view your flashcards.")
      setLoading(false)
    }
  }, [])

  // Fetch user session and listen for auth state changes on component mount
  useEffect(() => {
    getSession() // Initial session check

    // Listen for auth state changes for real-time user updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        // If a user logs in or session refreshes, fetch flashcards
        fetchFlashcards(session.user.id)
      } else {
        // If user logs out, clear flashcards and show login message
        setFlashcards([]);
        setError("Please log in to view your flashcards.");
        setLoading(false); // Stop loading if user logs out
      }
    })

    return () => {
      subscription.unsubscribe() // Clean up subscription on unmount
    }
  }, [getSession]) // Dependency array ensures it runs only once on mount

  // Function to fetch flashcards from Supabase for the current user
  const fetchFlashcards = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      // If no user ID, don't attempt to fetch
      setFlashcards([]);
      setLoading(false);
      return;
    }

    setLoading(true)
    setError(null)
    try {
      // The RLS policy will automatically filter by user_id
      const { data, error } = await supabase.from("flashcards").select("*")

      if (error) {
        throw error
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

      setFlashcards(typedData)
    } catch (error: any) {
      console.error("Error fetching flashcards:", error.message)
      setError("Failed to fetch flashcards. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch flashcards when the user state changes (e.g., after initial login or auth state change)
  useEffect(() => {
    if (user) { // Only fetch if a user is authenticated
      fetchFlashcards(user.id)
    }
  }, [user, fetchFlashcards]) // Re-fetch when user object changes or fetchFlashcards memoized function changes
  // Filter flashcards based on current deck and search query
  const filteredFlashcards = flashcards.filter((card) => {
    const matchesDeck =
      currentDeck === "all" ||
      (currentDeck === "algorithms" && card.category === "Algorithms") ||
      (currentDeck === "data-structures" && card.category === "Data Structures")

    const matchesSearch =
      searchQuery === "" ||
      card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesDeck && matchesSearch
  })

  const handleNextCard = () => {
    if (currentCardIndex < filteredFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleShuffleCards = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    // In a real app, you would shuffle the array here
  }

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
      user_id: user.id // Attach the current user's ID
    };

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert([newFlashcardData])
        .select(); // Use .select() to return the inserted data

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Add the newly created card to your state
        setFlashcards(prevCards => [...prevCards, data[0] as Flashcard]);
        alert("Flashcard created successfully!");
      }

    } catch (error: any) {
      console.error("Error creating flashcard:", error.message);
      alert("Failed to create flashcard: " + error.message);
    }
  };

  const renderBrowseView = () => {
    if (!user && !loading && error) {
      return (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm">
          <p className="text-red-600 font-medium text-lg">{error}</p>
          <p className="text-gray-500 mt-2">Please log in to view and manage your flashcards.</p>
          {/* You might add a login button here */}
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center py-12">
          <p className="text-indigo-600">Loading flashcards...</p>
        </div>
      )
    }

     if (error) {
      return (
        <div className="text-center py-12 text-red-600">
          <p>{error}</p>
          <button
            onClick={() => user ? fetchFlashcards(user.id) : getSession()} // Retry or get session
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
          >
            Retry
          </button>
        </div>
      )
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
              onChange={(e) => setCurrentDeck(e.target.value as any)}
              className="p-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80"
            >
              <option value="all">All Decks</option>
              <option value="algorithms">Algorithms</option>
              <option value="data-structures">Data Structures</option>
            </select>

            <button
              onClick={() => setCurrentView("study")}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg flex items-center"
            >
              <BookOpen size={18} className="mr-2" />
              Study
            </button>

            <button className="p-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-600">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlashcards.map((card) => (
            <div
              key={card.id}
              className="bg-white border border-indigo-100 rounded-xl p-5 hover:shadow-md transition transform hover:scale-105 hover:border-indigo-300"
            >
              <div className="flex items-start justify-between mb-3">
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
                  {card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1)}
                </span>
              </div>

              <h3 className="font-medium mb-2 line-clamp-2">{card.front}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">{card.back}</p>
            </div>
          ))}
        </div>

        {filteredFlashcards.length === 0 && (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm">
            <p className="text-gray-500">No flashcards found. Try a different search or create new ones.</p>
            <button className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg flex items-center mx-auto">
              <Plus size={18} className="mr-2" />
              Create Flashcard
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderStudyView = () => {
    if (!user && !loading && error) {
      return (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm">
          <p className="text-red-600 font-medium text-lg">{error}</p>
          <p className="text-gray-500 mt-2">Please log in to study your flashcards.</p>
          {/* You might add a login button here */}
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center py-12">
          <p className="text-indigo-600">Loading flashcards for study...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-600">
          <p>{error}</p>
          <button
            onClick={() => user ? fetchFlashcards(user.id) : getSession()} // Retry or get session
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-md"
          >
            Retry
          </button>
        </div>
      )
    }

    if (filteredFlashcards.length === 0) {
      return (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm">
          <p className="text-gray-500">No flashcards available for study. Try a different deck or create new ones.</p>
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
      )
    }

    const currentCard = filteredFlashcards[currentCardIndex]

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
              onClick={handleShuffleCards}
              className="p-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-600"
              title="Shuffle cards"
            >
              <Shuffle size={18} />
            </button>

            <button
              className="p-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-600"
              title="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
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
            <h3 className="text-xl font-medium text-center">{currentCard.front}</h3>
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

          <div className="absolute bottom-3 right-3 text-sm text-gray-500">Click to flip</div>
        </div>

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
            onClick={handleNextCard}
            disabled={currentCardIndex === filteredFlashcards.length - 1}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={18} className="ml-1" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100">
      {currentView === "browse" ? renderBrowseView() : renderStudyView()}
    </div>
  )
}
