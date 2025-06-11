"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

type Flashcard = {
    id: string
    front: string
    back: string
    category: string
    difficulty: "easy" | "medium" | "hard"
    user_id: string
}

interface CreateFlashcardDialogProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    userId: string
    editMode?: boolean
    initialData?: Flashcard
}

export default function CreateFlashcardDialog({
    isOpen,
    onClose,
    onSuccess,
    userId,
    editMode = false,
    initialData
}: CreateFlashcardDialogProps) {
    const [front, setFront] = useState(initialData?.front || "")
    const [back, setBack] = useState(initialData?.back || "")
    const [category, setCategory] = useState(initialData?.category || "")
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(initialData?.difficulty || "medium")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    // Reset form when dialog opens/closes or initialData changes
    useEffect(() => {
        if (isOpen && initialData) {
            setFront(initialData.front)
            setBack(initialData.back)
            setCategory(initialData.category)
            setDifficulty(initialData.difficulty)
        } else if (!isOpen) {
            setFront("")
            setBack("")
            setCategory("")
            setDifficulty("medium")
            setError("")
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!front.trim() || !back.trim() || !category.trim()) {
            setError("Please fill in all fields")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            if (editMode && initialData) {
                // Update existing flashcard
                const { error: updateError } = await supabase
                    .from("flashcards")
                    .update({
                        front: front.trim(),
                        back: back.trim(),
                        category: category.trim(),
                        difficulty,
                    })
                    .eq("id", initialData.id)

                if (updateError) throw updateError
            } else {
                // Create new flashcard
                const { error: insertError } = await supabase
                    .from("flashcards")
                    .insert([
                        {
                            front: front.trim(),
                            back: back.trim(),
                            category: category.trim(),
                            difficulty,
                            user_id: userId,
                        },
                    ])

                if (insertError) throw insertError
            }

            // Reset form and close dialog
            setFront("")
            setBack("")
            setCategory("")
            setDifficulty("medium")
            onSuccess()
            onClose()
        } catch (err: any) {
            console.error("Error saving flashcard:", err)
            setError(err.message || "Failed to save flashcard")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) {
            setFront("")
            setBack("")
            setCategory("")
            setDifficulty("medium")
            setError("")
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        <Plus className="h-5 w-5" />
                        {editMode ? "Edit Flashcard" : "Create New Flashcard"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Question Input */}
                    <div className="space-y-2">
                        <Label htmlFor="front" className="text-base">Question</Label>
                        <Textarea
                            id="front"
                            placeholder="Enter your question here..."
                            value={front}
                            onChange={(e) => setFront(e.target.value)}
                            className="min-h-[100px] resize-none text-lg"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Answer Input */}
                    <div className="space-y-2">
                        <Label htmlFor="back" className="text-base">Answer</Label>
                        <Textarea
                            id="back"
                            placeholder="Enter your answer here..."
                            value={back}
                            onChange={(e) => setBack(e.target.value)}
                            className="min-h-[150px] resize-none text-lg"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Category and Difficulty */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                placeholder="e.g., Algorithms, Data Structures"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="difficulty">Difficulty</Label>
                            <Select
                                value={difficulty}
                                onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="difficulty">
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy" className="text-green-600">Easy</SelectItem>
                                    <SelectItem value="medium" className="text-yellow-600">Medium</SelectItem>
                                    <SelectItem value="hard" className="text-red-600">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="border-gray-200 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !front.trim() || !back.trim() || !category.trim()}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {editMode ? "Saving..." : "Creating..."}
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {editMode ? "Save Changes" : "Create Flashcard"}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
} 