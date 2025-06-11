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

interface StudyMaterialsSectionProps {
  userId: string;
}

type GroupedMaterials = {
  [subject: string]: StudyMaterial[];
};

export default function StudyMaterialsSection({
  userId,
}: StudyMaterialsSectionProps) {
  const [currentView, setCurrentView] = useState<"files" | "content">("files");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<StudyMaterial | null>(null);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [error, setError] = useState("");

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
    setSelectedFile(file);
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

  const renderFilesView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading study materials...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchMaterials} variant="outline">
            Try Again
          </Button>
        </div>
      );
    }

    if (Object.keys(filteredMaterials).length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-12 w-12 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No study materials yet
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? "No materials match your search."
              : "Upload your first PDF to get started."}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
              <Search className="text-indigo-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-indigo-200 rounded-xl w-full sm:w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/80"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
            >
              <Upload size={18} className="mr-2" />
              Upload
            </Button>

            <Button
              onClick={fetchMaterials}
              variant="outline"
              size="sm"
              className="border-indigo-200 hover:bg-indigo-50 text-indigo-600"
              title="Refresh materials"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        <div className="border border-indigo-100 rounded-xl divide-y divide-indigo-100 bg-white/80 backdrop-blur-sm shadow-sm">
          {Object.entries(filteredMaterials).map(([subject, files]) => {
            const isExpanded = expandedFolders.includes(subject);

            return (
              <div key={subject}>
                {/* Subject Folder */}
                <div
                  className="flex items-center p-4 hover:bg-indigo-50 cursor-pointer transition border-b border-indigo-100"
                  onClick={() => toggleFolder(subject)}
                >
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-lg mr-3">
                    <Folder className="text-blue-500" size={20} />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">
                    {subject}
                  </span>
                  <span className="text-sm text-gray-500 mr-3">
                    {files.length} files
                  </span>
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-indigo-400" />
                  ) : (
                    <ChevronRight size={18} className="text-indigo-400" />
                  )}
                </div>

                {/* Files in Subject */}
                {isExpanded && (
                  <div className="bg-gray-50/50">
                    {files.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center p-4 pl-12 hover:bg-indigo-50 transition border-b border-indigo-50 last:border-b-0"
                      >
                        <div className="bg-gradient-to-br from-red-100 to-rose-100 p-2 rounded-lg mr-3">
                          <FileText className="text-red-500" size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {material.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(material.file_size)} •{" "}
                            {formatDate(material.uploaded_at)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openFile(material)}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            <BookOpen size={16} className="mr-1" />
                            View
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              >
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => downloadFile(material)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteFile(material)}
                                className="text-red-600 hover:text-red-700"
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
    if (!selectedFile) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setCurrentView("files")}
            variant="outline"
            className="border-gray-200 hover:bg-gray-50"
          >
            Back to Files
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => downloadFile(selectedFile)}
              variant="outline"
              className="border-indigo-200 hover:bg-indigo-50 text-indigo-600"
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                {selectedFile.name.replace(/\.[^/.]+$/, "")}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  {selectedFile.subject}
                </span>
                <span>{formatFileSize(selectedFile.file_size)}</span>
                <span>{formatDate(selectedFile.uploaded_at)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm border border-blue-100">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-full">
                  <Clock className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Uploaded</p>
                  <p className="font-medium">
                    {formatDate(selectedFile.uploaded_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl shadow-sm border border-green-100">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded-full">
                  <FileText className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">File Size</p>
                  <p className="font-medium">
                    {formatFileSize(selectedFile.file_size)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-xl shadow-sm border border-purple-100">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-purple-100 to-fuchsia-100 p-2 rounded-full">
                  <Brain className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subject</p>
                  <p className="font-medium">{selectedFile.subject}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
            <h3 className="text-lg font-medium mb-4 text-indigo-800">
              Study Material Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={() => downloadFile(selectedFile)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                className="border-indigo-200 hover:bg-indigo-50 text-indigo-600"
              >
                <Brain className="h-4 w-4 mr-2" />
                Generate Quiz (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-indigo-100">
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
