"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Brain, FileText, Sparkles } from "lucide-react";
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
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generationMethod, setGenerationMethod] = useState<
    "content" | "material"
  >("content");
  const [studyMaterials, setStudyMaterials] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const fetchStudyMaterials = async () => {
    setLoadingMaterials(true);
    try {
      // Get user's study materials
      const { data: materials, error } = await supabase
        .from("study_materials")
        .select("id, title, content_hash, subject, uploaded_at")
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

  const handleMethodChange = (method: "content" | "material") => {
    setGenerationMethod(method);
    setError("");

    if (method === "material" && studyMaterials.length === 0) {
      fetchStudyMaterials();
    }
  };

  const generateFromContent = async () => {
    if (!content.trim() || !category.trim()) {
      setError("Please provide both content and category");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:5000"
        }/api/generate-flashcards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": userId,
          },
          body: JSON.stringify({
            content: content.trim(),
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
      setContent("");
      setCategory("");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

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

  const handleSubmit = () => {
    if (generationMethod === "content") {
      generateFromContent();
    } else {
      generateFromMaterial();
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setContent("");
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
            Generate AI Flashcards
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Method Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Generation Method</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={generationMethod === "content" ? "default" : "outline"}
                onClick={() => handleMethodChange("content")}
                className="flex items-center gap-2 h-auto p-4"
                disabled={isGenerating}
              >
                <FileText className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">From Content</div>
                  <div className="text-xs opacity-70">
                    Paste your own content
                  </div>
                </div>
              </Button>
              <Button
                type="button"
                variant={
                  generationMethod === "material" ? "default" : "outline"
                }
                onClick={() => handleMethodChange("material")}
                className="flex items-center gap-2 h-auto p-4"
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">From Study Material</div>
                  <div className="text-xs opacity-70">Use existing notes</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Content Input */}
          {generationMethod === "content" && (
            <div className="space-y-2">
              <Label htmlFor="content">Study Content</Label>
              <Textarea
                id="content"
                placeholder="Paste your study content here (lecture notes, textbook content, etc.)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] resize-none"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500">
                Provide the content you want to create flashcards from
              </p>
            </div>
          )}

          {/* Material Selection */}
          {generationMethod === "material" && (
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isGenerating}
                >
                  <option value="">Choose a study material...</option>
                  {studyMaterials.map((material) => (
                    <option
                      key={material.content_hash}
                      value={material.content_hash}
                    >
                      {material.title} ({material.subject}) -{" "}
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
          )}

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
              concepts from your content.
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
            onClick={handleSubmit}
            disabled={
              isGenerating ||
              (generationMethod === "content" &&
                (!content.trim() || !category.trim())) ||
              (generationMethod === "material" &&
                (!selectedMaterial || !category.trim()))
            }
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
