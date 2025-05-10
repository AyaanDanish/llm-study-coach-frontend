"use client"

import type React from "react"

import { useState } from "react"
import {
  FileText,
  Folder,
  Plus,
  Search,
  Upload,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  BookOpen,
  CheckCircle,
  Clock,
  Brain,
} from "lucide-react"

type StudyMaterial = {
  id: string
  name: string
  type: "file" | "folder"
  fileType?: "pdf" | "doc" | "ppt" | "other"
  size?: string
  lastModified?: Date
  children?: StudyMaterial[]
  summary?: string
  content?: string[]
  quiz?: Quiz
}

type Quiz = {
  id: string
  title: string
  questions: Question[]
}

type Question = {
  id: string
  text: string
  options: string[]
  correctAnswer: number
}

// Mock data for study materials
const mockStudyMaterials: StudyMaterial[] = [
  {
    id: "folder1",
    name: "Computer Science",
    type: "folder",
    children: [
      {
        id: "file1",
        name: "Data Structures.pdf",
        type: "file",
        fileType: "pdf",
        size: "2.4 MB",
        lastModified: new Date("2023-04-15"),
        summary:
          "This document covers fundamental data structures including arrays, linked lists, stacks, queues, trees, and graphs. It explains their implementations, time complexities, and use cases.",
        content: [
          "Chapter 1: Introduction to Data Structures",
          "Chapter 2: Arrays and Linked Lists",
          "Chapter 3: Stacks and Queues",
          "Chapter 4: Trees and Graphs",
          "Chapter 5: Hash Tables",
        ],
        quiz: {
          id: "quiz1",
          title: "Data Structures Quiz",
          questions: [
            {
              id: "q1",
              text: "Which data structure follows the Last In First Out (LIFO) principle?",
              options: ["Queue", "Stack", "Linked List", "Array"],
              correctAnswer: 1,
            },
            {
              id: "q2",
              text: "What is the time complexity of searching an element in a binary search tree in the worst case?",
              options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
              correctAnswer: 2,
            },
            {
              id: "q3",
              text: "Which of the following is NOT a linear data structure?",
              options: ["Array", "Linked List", "Queue", "Tree"],
              correctAnswer: 3,
            },
          ],
        },
      },
      {
        id: "file2",
        name: "Algorithms.pdf",
        type: "file",
        fileType: "pdf",
        size: "3.1 MB",
        lastModified: new Date("2023-04-20"),
        summary:
          "This document covers various algorithms including sorting, searching, graph algorithms, and dynamic programming. It analyzes their time and space complexities.",
        content: [
          "Chapter 1: Introduction to Algorithms",
          "Chapter 2: Sorting Algorithms",
          "Chapter 3: Searching Algorithms",
          "Chapter 4: Graph Algorithms",
          "Chapter 5: Dynamic Programming",
        ],
        quiz: {
          id: "quiz2",
          title: "Algorithms Quiz",
          questions: [
            {
              id: "q1",
              text: "What is the average time complexity of quicksort?",
              options: ["O(1)", "O(log n)", "O(n log n)", "O(n²)"],
              correctAnswer: 2,
            },
            {
              id: "q2",
              text: "Which algorithm is used to find the shortest path in a weighted graph?",
              options: ["Depth-First Search", "Breadth-First Search", "Dijkstra's Algorithm", "Binary Search"],
              correctAnswer: 2,
            },
          ],
        },
      },
    ],
  },
  {
    id: "folder2",
    name: "Mathematics",
    type: "folder",
    children: [
      {
        id: "file3",
        name: "Calculus.pdf",
        type: "file",
        fileType: "pdf",
        size: "4.2 MB",
        lastModified: new Date("2023-05-10"),
        summary:
          "This document covers differential and integral calculus, including limits, derivatives, integrals, and their applications.",
        content: [
          "Chapter 1: Limits and Continuity",
          "Chapter 2: Derivatives",
          "Chapter 3: Applications of Derivatives",
          "Chapter 4: Integrals",
          "Chapter 5: Applications of Integrals",
        ],
      },
      {
        id: "file4",
        name: "Linear Algebra.pdf",
        type: "file",
        fileType: "pdf",
        size: "3.8 MB",
        lastModified: new Date("2023-05-15"),
      },
    ],
  },
  {
    id: "file5",
    name: "Study Tips.pdf",
    type: "file",
    fileType: "pdf",
    size: "1.2 MB",
    lastModified: new Date("2023-06-01"),
  },
]

export default function StudyMaterialsSection() {
  const [currentView, setCurrentView] = useState<"files" | "content" | "quiz">("files")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["folder1"])
  const [selectedFile, setSelectedFile] = useState<StudyMaterial | null>(null)
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const toggleFolder = (folderId: string) => {
    if (expandedFolders.includes(folderId)) {
      setExpandedFolders(expandedFolders.filter((id) => id !== folderId))
    } else {
      setExpandedFolders([...expandedFolders, folderId])
    }
  }

  const openFile = (file: StudyMaterial) => {
    setSelectedFile(file)
    setCurrentView("content")
    setCurrentQuizQuestion(0)
    setSelectedAnswers([])
    setQuizSubmitted(false)
  }

  const startQuiz = () => {
    if (selectedFile?.quiz) {
      setCurrentView("quiz")
    }
  }

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[questionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const submitQuiz = () => {
    setQuizSubmitted(true)
  }

  const renderFileIcon = (fileType?: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="text-red-500" size={20} />
      case "doc":
        return <FileText className="text-blue-500" size={20} />
      case "ppt":
        return <FileText className="text-orange-500" size={20} />
      default:
        return <FileText className="text-gray-500" size={20} />
    }
  }

  const renderFilesView = () => {
    const renderMaterials = (materials: StudyMaterial[], level = 0) => {
      return materials.map((material) => {
        if (material.type === "folder") {
          const isExpanded = expandedFolders.includes(material.id)

          return (
            <div key={material.id}>
              <div
                className="flex items-center p-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition border border-transparent hover:border-indigo-100"
                onClick={() => toggleFolder(material.id)}
              >
                <div style={{ width: `${level * 16}px` }} />
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-lg mr-3">
                  <Folder className="text-blue-500" size={20} />
                </div>
                <span className="flex-1 font-medium">{material.name}</span>
                {isExpanded ? (
                  <ChevronDown size={18} className="text-indigo-400" />
                ) : (
                  <ChevronRight size={18} className="text-indigo-400" />
                )}
              </div>

              {isExpanded && material.children && <div>{renderMaterials(material.children, level + 1)}</div>}
            </div>
          )
        } else {
          return (
            <div
              key={material.id}
              className="flex items-center p-3 hover:bg-indigo-50 rounded-xl cursor-pointer transition border border-transparent hover:border-indigo-100"
              onClick={() => openFile(material)}
            >
              <div style={{ width: `${level * 16}px` }} />
              <div
                className={`p-2 rounded-lg mr-3 ${
                  material.fileType === "pdf"
                    ? "bg-gradient-to-br from-red-100 to-rose-100"
                    : material.fileType === "doc"
                      ? "bg-gradient-to-br from-blue-100 to-indigo-100"
                      : material.fileType === "ppt"
                        ? "bg-gradient-to-br from-orange-100 to-amber-100"
                        : "bg-gradient-to-br from-gray-100 to-slate-100"
                }`}
              >
                {renderFileIcon(material.fileType)}
              </div>
              <span className="flex-1">{material.name}</span>
              <span className="text-sm text-gray-500">{material.size}</span>
              <button className="p-1 hover:bg-indigo-100 rounded-full ml-2 text-indigo-500">
                <MoreHorizontal size={16} />
              </button>
            </div>
          )
        }
      })
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
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-indigo-200 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg flex items-center">
              <Upload size={18} className="mr-2" />
              Upload
            </button>

            <button className="p-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-600">
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="border border-indigo-100 rounded-xl divide-y divide-indigo-100 bg-white/80 backdrop-blur-sm shadow-sm">
          {renderMaterials(mockStudyMaterials)}
        </div>
      </div>
    )
  }

  const renderContentView = () => {
    if (!selectedFile) return null

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentView("files")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition flex items-center"
          >
            Back to Files
          </button>

          {selectedFile.quiz && (
            <button
              onClick={startQuiz}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg flex items-center"
            >
              <BookOpen size={18} className="mr-2" />
              Take Quiz
            </button>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            {selectedFile.name.replace(/\.[^/.]+$/, "")}
          </h2>

          {selectedFile.summary && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-indigo-800">Summary</h3>
              <p className="text-gray-700 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                {selectedFile.summary}
              </p>
            </div>
          )}

          {selectedFile.content && (
            <div>
              <h3 className="text-lg font-medium mb-2 text-indigo-800">Content</h3>
              <ul className="space-y-2">
                {selectedFile.content.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center p-3 hover:bg-indigo-50 rounded-xl transition border border-transparent hover:border-indigo-100"
                  >
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-lg mr-3">
                      <FileText className="text-blue-600" size={18} />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm border border-blue-100 transform transition-transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-full">
                  <Clock className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Time</p>
                  <p className="font-medium">45 minutes</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl shadow-sm border border-green-100 transform transition-transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded-full">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completion</p>
                  <p className="font-medium">Not started</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-xl shadow-sm border border-purple-100 transform transition-transform hover:scale-105">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-purple-100 to-fuchsia-100 p-2 rounded-full">
                  <Brain className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="font-medium">Intermediate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4 text-indigo-800">AI-Generated Learning Materials</h3>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
              <h4 className="font-medium mb-2 text-indigo-700">Key Concepts</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Data structures are specialized formats for organizing and storing data</li>
                <li>Different data structures have different time and space complexities</li>
                <li>Choosing the right data structure is crucial for efficient algorithms</li>
                <li>Common operations include insertion, deletion, searching, and traversal</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
              <h4 className="font-medium mb-2 text-blue-700">Practice Questions</h4>
              <ul className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>Compare and contrast arrays and linked lists. When would you use one over the other?</li>
                <li>Explain how a hash table works and discuss collision resolution strategies.</li>
                <li>Describe the difference between a stack and a queue with real-world examples.</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-xl border border-purple-100 shadow-sm">
              <h4 className="font-medium mb-2 text-purple-700">Study Tips</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-700">
                <li>Implement each data structure from scratch to understand its inner workings</li>
                <li>Practice solving problems that require specific data structures</li>
                <li>Compare the time complexity of operations across different data structures</li>
                <li>Create visual representations to better understand complex structures like trees and graphs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderQuizView = () => {
    if (!selectedFile?.quiz) return null

    const quiz = selectedFile.quiz
    const currentQuestion = quiz.questions[currentQuizQuestion]

    if (quizSubmitted) {
      // Calculate score
      let correctAnswers = 0
      selectedAnswers.forEach((answer, index) => {
        if (answer === quiz.questions[index].correctAnswer) {
          correctAnswers++
        }
      })

      const score = Math.round((correctAnswers / quiz.questions.length) * 100)

      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentView("content")}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition flex items-center"
            >
              Back to Content
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl p-6 shadow-sm text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-full text-3xl font-bold">
                {score}%
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Quiz Results
            </h2>
            <p className="text-gray-600 mb-6">
              You got {correctAnswers} out of {quiz.questions.length} questions correct.
            </p>

            <div className="space-y-6 text-left">
              {quiz.questions.map((question, index) => {
                const isCorrect = selectedAnswers[index] === question.correctAnswer

                return (
                  <div
                    key={index}
                    className={`border rounded-xl p-4 ${
                      isCorrect
                        ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                        : "border-red-200 bg-gradient-to-br from-red-50 to-rose-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`mt-1 mr-3 p-1 rounded-full ${
                          isCorrect
                            ? "bg-gradient-to-br from-green-100 to-emerald-100 text-green-600"
                            : "bg-gradient-to-br from-red-100 to-rose-100 text-red-600"
                        }`}
                      >
                        {isCorrect ? <CheckCircle size={16} /> : <X size={16} />}
                      </div>
                      <div>
                        <p className="font-medium">{question.text}</p>
                        <p className="text-sm mt-1">
                          {isCorrect ? (
                            <span className="text-green-600">Correct: {question.options[question.correctAnswer]}</span>
                          ) : (
                            <>
                              <span className="text-red-600">
                                Your answer: {question.options[selectedAnswers[index]]}
                              </span>
                              <br />
                              <span className="text-green-600">
                                Correct answer: {question.options[question.correctAnswer]}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => {
                setCurrentQuizQuestion(0)
                setSelectedAnswers([])
                setQuizSubmitted(false)
              }}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentView("content")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition flex items-center"
          >
            Back to Content
          </button>

          <div className="text-sm text-gray-600">
            Question {currentQuizQuestion + 1} of {quiz.questions.length}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl p-6 shadow-sm">
          <div className="mb-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                style={{ width: `${(currentQuizQuestion / (quiz.questions.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          <h3 className="text-xl font-medium mb-6">{currentQuestion.text}</h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`border rounded-xl p-4 cursor-pointer transition transform hover:scale-105 ${
                  selectedAnswers[currentQuizQuestion] === index
                    ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                }`}
                onClick={() => handleAnswerSelect(currentQuizQuestion, index)}
              >
                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                      selectedAnswers[currentQuizQuestion] === index
                        ? "border-indigo-500 bg-indigo-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedAnswers[currentQuizQuestion] === index && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentQuizQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuizQuestion === 0}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentQuizQuestion < quiz.questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuizQuestion((prev) => prev + 1)}
                disabled={selectedAnswers[currentQuizQuestion] === undefined}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={
                  selectedAnswers.length !== quiz.questions.length || selectedAnswers.some((a) => a === undefined)
                }
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100">
      {currentView === "files" && renderFilesView()}
      {currentView === "content" && renderContentView()}
      {currentView === "quiz" && renderQuizView()}
    </div>
  )
}

// X icon for quiz results
function X(props: React.ComponentProps<typeof Clock>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
