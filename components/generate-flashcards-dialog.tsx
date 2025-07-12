"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Brain, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface GenerateFlashcardsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function GenerateFlashcardsDialog({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: GenerateFlashcardsDialogProps) {
  const [category, setCategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const fetchStudyMaterials = async () => {
    setLoadingMaterials(true);
    try {
      // Get user's study materials
      const { data: materials, error } = await supabase
        .from("study_materials")
        .select("id, name, content_hash, subject, uploaded_at")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setStudyMaterials(materials || []);
    } catch (error: any) {
      console.error("Error fetching study materials:", error);
      setError("Failed to load study materials");
    } finally {
      setLoadingMaterials(false);
    }
  };

  // Fetch materials when dialog opens
  useEffect(() => {
    if (isOpen && studyMaterials.length === 0) {
      fetchStudyMaterials();
    }
  }, [isOpen]);

  const generateFromMaterial = async () => {
    if (!selectedMaterial || !category.trim()) {
      setError("Please select a study material and provide a category");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:5000"
        }/api/generate-flashcards-from-material/${selectedMaterial}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": userId,
          },
          body: JSON.stringify({
            category: category.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      // Success
      onSuccess();
      onClose();

      // Reset form
      setSelectedMaterial("");
      setCategory("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setCategory("");
      setSelectedMaterial("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" />
            Generate AI Flashcards from Study Materials
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Material Selection */}
          <div className="space-y-2">
            <Label htmlFor="material">Select Study Material</Label>
            {loadingMaterials ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : studyMaterials.length > 0 ? (
              <select
                id="material"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                disabled={isGenerating}
              >
                <option value="">Choose a study material...</option>
                {studyMaterials.map((material) => (
                  <option
                    key={material.content_hash}
                    value={material.content_hash}
                  >
                    {material.name} ({material.subject}) -{" "}
                    {new Date(material.uploaded_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No study materials found</p>
                <p className="text-xs">Upload some study materials first</p>
              </div>
            )}
          </div>

          {/* Category Input */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Biology, Mathematics, History"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500">
              This will be used to organize your flashcards
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm">
              <Brain className="h-4 w-4 inline mr-1" />
              AI will generate 8-15 flashcards covering the most important
              concepts from your study material.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={generateFromMaterial}
            disabled={isGenerating || !selectedMaterial || !category.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate Flashcards
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
