"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabaseClient";

interface StudyNotesViewerProps {
    materialId: string;
    contentHash: string;
    onClose: () => void;
    onNotesNotFound?: () => React.ReactNode;
    onGenerateNotes: () => Promise<void>;
    isGenerating: boolean;
}

export default function StudyNotesViewer({
    materialId,
    contentHash,
    onClose,
    onNotesNotFound,
    onGenerateNotes,
    isGenerating,
}: StudyNotesViewerProps) {
    const [notes, setNotes] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generatedAt, setGeneratedAt] = useState<string | null>(null);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000'}/api/notes/${contentHash}`);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 404 && onNotesNotFound) {
                    return onNotesNotFound();
                }
                throw new Error(data.error || "Failed to fetch notes");
            }

            setNotes(data.content);
            setGeneratedAt(data.generated_at);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateNotes = async () => {
        try {
            await onGenerateNotes();
            await fetchNotes(); // Refresh notes after generation
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [contentHash]);

    if (loading || isGenerating) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">
                        {isGenerating ? "Generating study notes..." : "Loading study notes..."}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        if (error.includes("Notes not found") && onNotesNotFound) {
            return onNotesNotFound();
        }

        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchNotes} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-indigo-800">Study Notes</h3>
                    {generatedAt && (
                        <p className="text-sm text-gray-500">
                            Generated on {new Date(generatedAt).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>

            <div className="prose prose-indigo max-w-none bg-white p-6 rounded-xl border border-indigo-100">
                {notes ? (
                    <ReactMarkdown>{notes}</ReactMarkdown>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">No notes available. Click "Generate Notes" to create study notes for this material.</p>
                        <Button
                            onClick={handleGenerateNotes}
                            disabled={isGenerating}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Brain className="h-4 w-4" />
                                    Generate Notes
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
} 