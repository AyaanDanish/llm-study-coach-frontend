"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  Folder,
  Plus,
  Search,
  Upload,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  BookOpen,
  Clock,
  Brain,
  Loader2,
  Download,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { supabase, type StudyMaterial } from "@/lib/supabaseClient";
import UploadDialog from "./upload-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StudyNotesViewer from "./study-notes-viewer";
import { useTheme } from "@/contexts/ThemeContext";

interface StudyMaterialsSectionProps {
  userId: string;
  selectedMaterialId?: string | null;
  onClearSelection?: () => void;
}

type GroupedMaterials = {
  [subject: string]: StudyMaterial[];
};

export default function StudyMaterialsSection({
  userId,
  selectedMaterialId,
  onClearSelection,
}: StudyMaterialsSectionProps) {
  const { isDarkMode } = useTheme();
  const [currentView, setCurrentView] = useState<"files" | "content">("files");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [selectedMaterial, setSelectedMaterial] =
    useState<StudyMaterial | null>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  // Fetch materials from Supabase
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("study_materials")
        .select("*")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false });

      if (error) {
        throw error;
      }

      setMaterials(data || []);

      // Auto-expand first subject folder
      if (data && data.length > 0) {
        const subjects = [...new Set(data.map((m) => m.subject))];
        if (subjects.length > 0) {
          setExpandedFolders([subjects[0]]);
        }
      }
    } catch (err: any) {
      console.error("Error fetching materials:", err);
      setError(err.message || "Failed to load study materials");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (userId && userId !== "placeholder-user") {
      fetchMaterials();
    } else {
      setLoading(false);
    }
  }, [userId]);

  // Handle selectedMaterialId from dashboard
  useEffect(() => {
    if (selectedMaterialId && materials.length > 0) {
      const material = materials.find((m) => m.id === selectedMaterialId);
      if (material) {
        setSelectedMaterial(material);
        setCurrentView("content");
        // Clear the selection after opening
        onClearSelection?.();
      }
    }
  }, [selectedMaterialId, materials, onClearSelection]);

  // Group materials by subject
  const groupedMaterials: GroupedMaterials = materials.reduce(
    (acc, material) => {
      const subject = material.subject;
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(material);
      return acc;
    },
    {} as GroupedMaterials
  );

  // Filter materials based on search query
  const filteredMaterials = Object.entries(groupedMaterials).reduce(
    (acc, [subject, files]) => {
      const filteredFiles = files.filter(
        (file) =>
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filteredFiles.length > 0) {
        acc[subject] = filteredFiles;
      }
      return acc;
    },
    {} as GroupedMaterials
  );

  const toggleFolder = (subject: string) => {
    if (expandedFolders.includes(subject)) {
      setExpandedFolders(expandedFolders.filter((s) => s !== subject));
    } else {
      setExpandedFolders([...expandedFolders, subject]);
    }
  };

  const openFile = (file: StudyMaterial) => {
    setSelectedMaterial(file);
    setCurrentView("content");
  };

  const downloadFile = async (material: StudyMaterial) => {
    try {
      const { data, error } = await supabase.storage
        .from("pdf-uploads")
        .download(material.file_path);

      if (error) {
        throw error;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = material.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download error:", err);
      setError(err.message || "Failed to download file");
    }
  };

  const deleteFile = async (material: StudyMaterial) => {
    if (!confirm(`Are you sure you want to delete "${material.name}"?`)) {
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("pdf-uploads")
        .remove([material.file_path]);

      if (storageError) {
        throw storageError;
      }

      // Delete associated study notes if they exist
      if (material.content_hash) {
        const { error: notesError } = await supabase
          .from("study_notes")
          .delete()
          .eq("content_hash", material.content_hash);

        if (notesError) {
          console.error("Error deleting study notes:", notesError);
          // Continue with material deletion even if notes deletion fails
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("study_materials")
        .delete()
        .eq("id", material.id);

      if (dbError) {
        throw dbError;
      }

      // Refresh materials
      fetchMaterials();
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const generateNotes = async (material: StudyMaterial) => {
    try {
      setIsGeneratingNotes(true);
      setError(""); // Clear any previous errors
      console.log("Starting note generation for material:", material.id);

      // Validate content hash exists
      if (!material.content_hash) {
        throw new Error(
          "Material content hash is missing. Please re-upload the file."
        );
      }

      // Get the file from Supabase storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("pdf-uploads")
        .download(material.file_path);

      if (downloadError) {
        console.error("Error downloading file:", downloadError);
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      console.log("File downloaded successfully");

      // Create form data
      const formData = new FormData();
      formData.append(
        "file",
        fileData,
        material.file_path.split("/").pop() || material.name
      );
      formData.append("subject", material.subject);
      formData.append("content_hash", material.content_hash);

      // Get user session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        console.error("No active session found");
        throw new Error("You must be logged in to generate notes");
      }

      console.log("Sending file to backend for processing...");
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:5000";
      console.log("Backend URL:", backendUrl);

      // Send to backend
      const response = await fetch(`${backendUrl}/api/process-pdf`, {
        method: "POST",
        headers: {
          "X-User-ID": session.user.id,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend error:", errorData);
        throw new Error(
          errorData.error ||
            `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Notes generated successfully:", data);

      // Refresh the materials list to get updated data
      await fetchMaterials();

      // Clear any previous errors on success
      setError("");
    } catch (err: any) {
      console.error("Error generating notes:", err);
      const errorMessage =
        err.message || "Failed to generate notes. Please try again.";
      setError(errorMessage);

      // Also show a user-friendly alert for immediate feedback
      alert(`Error generating notes: ${errorMessage}`);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const renderFilesView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading study materials...
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchMaterials} variant="outline">
            Try Again
          </Button>
        </div>
      );
    }

    if (Object.keys(filteredMaterials).length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No study materials yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery
              ? "No materials match your search."
              : "Upload your first PDF to get started."}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Material
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search
                className="text-indigo-400 dark:text-indigo-300"
                size={18}
              />
            </div>
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-indigo-200 dark:border-gray-600 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 shadow-md hover:shadow-lg"
            >
              <Upload size={18} className="mr-2" />
              Upload
            </Button>

            <Button
              onClick={fetchMaterials}
              variant="outline"
              size="sm"
              className="border-indigo-200 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400"
              title="Refresh materials"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        <div className="border border-indigo-100 dark:border-gray-700 rounded-xl divide-y divide-indigo-100 dark:divide-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm">
          {Object.entries(filteredMaterials).map(([subject, files]) => {
            const isExpanded = expandedFolders.includes(subject);

            return (
              <div key={subject}>
                {/* Subject Folder */}
                <div
                  className="flex items-center p-4 hover:bg-indigo-50 dark:hover:bg-gray-700 cursor-pointer transition border-b border-indigo-100 dark:border-gray-700"
                  onClick={() => toggleFolder(subject)}
                >
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-2 rounded-lg mr-3">
                    <Folder
                      className="text-blue-500 dark:text-blue-400"
                      size={20}
                    />
                  </div>
                  <span className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                    {subject}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">
                    {files.length} files
                  </span>
                  {isExpanded ? (
                    <ChevronDown
                      size={18}
                      className="text-indigo-400 dark:text-indigo-300"
                    />
                  ) : (
                    <ChevronRight
                      size={18}
                      className="text-indigo-400 dark:text-indigo-300"
                    />
                  )}
                </div>

                {/* Files in Subject */}
                {isExpanded && (
                  <div className="bg-gray-50/50 dark:bg-gray-700/20">
                    {files.map((material) => (
                      <div
                        key={material.id}
                        onClick={() => openFile(material)}
                        className="flex items-center p-4 pl-12 hover:bg-indigo-50 dark:hover:bg-gray-700 transition border-b border-indigo-50 dark:border-gray-700 last:border-b-0 cursor-pointer group"
                      >
                        <div className="bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 p-2 rounded-lg mr-3">
                          <FileText
                            className="text-red-500 dark:text-red-400"
                            size={18}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {material.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(material.file_size)} •{" "}
                            {formatDate(material.uploaded_at)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={(e) => e.stopPropagation()} // Prevent row click when clicking dropdown
                              >
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click when clicking menu items
                                  downloadFile(material);
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click when clicking menu items
                                  deleteFile(material);
                                }}
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContentView = () => {
    if (!selectedMaterial) return null;

    return (
      <div className="space-y-6">
        {" "}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              setCurrentView("files");
              setSelectedMaterial(null);
            }}
            variant="outline"
            className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Files
          </Button>

          <Button
            onClick={() => downloadFile(selectedMaterial)}
            variant="outline"
            className="border-indigo-200 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400"
          >
            <Download size={16} className="mr-2" />
            Download
          </Button>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-indigo-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {selectedMaterial.name.replace(/\.[^/.]+$/, "")}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md">
              {selectedMaterial.subject}
            </span>
            <span>{formatFileSize(selectedMaterial.file_size)}</span>
            <span>{formatDate(selectedMaterial.uploaded_at)}</span>
          </div>
        </div>{" "}
        {/* Notes Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-indigo-100 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              <Button
                onClick={() => setError("")}
                variant="ghost"
                size="sm"
                className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/20"
              >
                Dismiss
              </Button>
            </div>
          )}

          {isGeneratingNotes ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Generating study notes...
                </p>
              </div>
            </div>
          ) : selectedMaterial.content_hash ? (
            <StudyNotesViewer
              materialId={selectedMaterial.id}
              contentHash={selectedMaterial.content_hash}
              onClose={() => {}}
              onNotesNotFound={() => (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This material hasn't been processed for notes yet.
                  </p>
                  <Button
                    onClick={() => generateNotes(selectedMaterial)}
                    disabled={isGeneratingNotes}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Brain size={16} className="mr-2" />
                    {isGeneratingNotes ? "Generating..." : "Generate Notes"}
                  </Button>
                </div>
              )}
              onGenerateNotes={() => generateNotes(selectedMaterial)}
              isGenerating={isGeneratingNotes}
              materialName={selectedMaterial.name}
              materialSubject={selectedMaterial.subject}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This material hasn't been processed for notes yet.
              </p>
              <Button
                onClick={() => generateNotes(selectedMaterial)}
                disabled={isGeneratingNotes}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain size={16} className="mr-2" />
                {isGeneratingNotes ? "Generating..." : "Generate Notes"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100 dark:border-gray-700">
      {currentView === "files" && renderFilesView()}
      {currentView === "content" && renderContentView()}

      <UploadDialog
        isOpen={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadSuccess={fetchMaterials}
        userId={userId}
      />
    </div>
  );
}
