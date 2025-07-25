"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabaseClient";
import { blobUploadService } from "@/lib/blobUploadService";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  userId: string;
}

export default function UploadDialog({
  isOpen,
  onClose,
  onUploadSuccess,
  userId,
}: UploadDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subject, setSubject] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find((file) => file.type === "application/pdf");

    if (pdfFile) {
      setSelectedFile(pdfFile);
      setError("");
    } else {
      setError("Please select a PDF file");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setError("");
    } else {
      setError("Please select a PDF file");
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

  const handleUpload = async () => {
    if (!selectedFile || !subject.trim()) {
      setError("Please select a file and enter a subject name");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Get user session for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const fileSize = selectedFile.size;
      const useBlobUpload = blobUploadService.shouldUseBlobUpload(fileSize);

      console.log(
        `File size: ${formatFileSize(
          fileSize
        )}, Using blob upload: ${useBlobUpload}`
      );

      let contentHash: string;
      let filePath: string | null = null;

      if (useBlobUpload) {
        // For large files (>4MB), use blob upload workflow
        console.log("Using blob upload workflow for large file...");

        // Upload to blob first
        const uploadResult = await blobUploadService.uploadFileToBlob(
          selectedFile,
          session.user.id
        );
        if (!uploadResult.success || !uploadResult.blob_url) {
          throw new Error(uploadResult.error || "Failed to upload to blob");
        }

        // Generate hash from blob
        const hashResult = await blobUploadService.generateHashFromBlob(
          uploadResult.blob_url,
          session.user.id
        );

        if (!hashResult.success || !hashResult.content_hash) {
          throw new Error(
            hashResult.error || "Failed to generate content hash"
          );
        }

        contentHash = hashResult.content_hash;
        // Store blob URL for later use
        filePath = uploadResult.blob_url;
      } else {
        // For smaller files (<4MB), use traditional Supabase storage upload
        console.log("Using traditional upload workflow for smaller file...");

        // Generate unique filename
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const supabaseFilePath = `${userId}/${fileName}`;

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("pdf-uploads")
          .upload(supabaseFilePath, selectedFile);

        if (uploadError) {
          throw uploadError;
        }

        // Create form data to send to backend for hash generation
        const formData = new FormData();
        formData.append("file", selectedFile);

        // Send to backend to generate hash
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:5000"
          }/api/generate-hash`,
          {
            method: "POST",
            headers: {
              "X-User-ID": session.user.id,
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to generate content hash");
        }

        contentHash = data.content_hash;
        filePath = uploadData.path;
      }

      // Save file metadata to database with the generated hash
      const materialData: any = {
        name: selectedFile.name,
        subject: subject.trim(),
        file_size: selectedFile.size,
        user_id: userId,
        file_type: "pdf",
        content_hash: contentHash,
        is_blob_upload: useBlobUpload,
      };

      if (useBlobUpload) {
        // For blob uploads, store the blob URL
        materialData.blob_url = filePath;
        materialData.file_path = `blob:${selectedFile.name}`; // Placeholder path for blob files
      } else {
        // For traditional uploads, store the Supabase storage path
        materialData.file_path = filePath;
      }

      const { error: dbError } = await supabase
        .from("study_materials")
        .insert(materialData);

      if (dbError) {
        throw dbError;
      }

      console.log("Upload completed successfully!");

      // Reset form and close dialog
      setSelectedFile(null);
      setSubject("");
      onUploadSuccess();
      onClose();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setSubject("");
    setError("");
    setDragActive(false);
  };

  const handleClose = () => {
    if (!uploading) {
      resetDialog();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-600" />
            Upload Study Material
          </DialogTitle>
          <DialogDescription>
            Upload a PDF file and categorize it by subject for easy
            organization.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subject Input */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Name</Label>
            <Input
              id="subject"
              placeholder="e.g., Computer Science, Mathematics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* File Upload Area */}
          <div className="space-y-4">
            <Label>PDF File</Label>

            {!selectedFile ? (
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />

                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Upload className="h-8 w-8 text-indigo-600" />
                  </div>

                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drop your PDF here, or{" "}
                      <span className="text-indigo-600 hover:text-indigo-700">
                        browse
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports PDF files up to 500MB (large files use optimized
                      upload)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-xl p-4 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-red-100 to-rose-100 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      <p className="text-xs text-blue-600 font-medium">
                        {blobUploadService.shouldUseBlobUpload(
                          selectedFile.size
                        )
                          ? "⚡ Large file - using optimized blob upload"
                          : "📁 Standard upload"}
                      </p>
                    </div>
                  </div>

                  {!uploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </Button>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !subject.trim() || uploading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
