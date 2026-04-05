"use client";

import { useState, useCallback } from "react";
import { config } from "../utils/config";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Collection } from "@/types/collection";
import { api } from "@/lib/api";
import { FileList } from "./FileList";
import { useCollections } from "@/context/CollectionContext";
import { useChatContext } from "@/context/ChatContext";

interface FileUploaderProps {
  collection: Collection;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ collection }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { refreshCollections } = useCollections();
  const { addMessage } = useChatContext();

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;
      if (selectedFiles) {
        const pdfFiles = Array.from(selectedFiles).filter(
          (file) => file.type === "application/pdf"
        );
        if (files.length + pdfFiles.length > config.maxFilesForAnalysis) {
          toast.error(`You can upload a maximum of ${config.maxFilesForAnalysis} files.`);
          return;
        }
        setFiles((prevFiles) => [...prevFiles, ...pdfFiles]);
      }
    },
    [files]
  );

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length < config.minFilesForAnalysis) {
      toast.error(`Please select at least ${config.minFilesForAnalysis} file(s).`);
      return;
    }

    if (files.length > config.maxFilesForAnalysis) {
      toast.error(`You can upload a maximum of ${config.maxFilesForAnalysis} files.`);
      return;
    }

    setIsUploading(true);
    try {
      // Upload files first
      await api.uploadFiles(files, collection.slug);

      // Wait a moment for the files to be processed
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Trigger business report analysis
      const aiResponse = await api.analyzeBusinessReport(collection.slug);

      if (aiResponse && aiResponse.text) {
        // Add AI response to chat using the context
        addMessage(collection.id, {
          content: aiResponse.text,
          isUser: false,
          timestamp: Date.now()
        });
      } else {
        console.error("Invalid AI response:", aiResponse);
        toast.error("Failed to analyze the document. Please try again later.");
      }

      setFiles([]);
      setRefreshKey((prev) => prev + 1);
      toast.success("Files uploaded successfully!");
      refreshCollections();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full space-y-6 h-[calc(100vh-17rem)] overflow-y-auto">
      <div
        className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-gray-300 transition-colors duration-200"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileChange({
            target: { files: e.dataTransfer.files }
          } as React.ChangeEvent<HTMLInputElement>);
        }}
      >
        <input
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <div className="space-y-2">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-gray-600">
              <p className="text-sm font-medium">Drop your PDF files here</p>
              <p className="text-xs">or click to browse</p>
            </div>
          </div>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Selected Files ({files.length})</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiles([])}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-600 truncate max-w-[80%]">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <Button type="submit" disabled={files.length === 0 || isUploading} className="w-full">
          {isUploading ? "Uploading..." : "Upload Files"}
        </Button>
      </form>

      <FileList
        key={refreshKey}
        collection={collection}
        onFileDeleted={() => setRefreshKey((prev) => prev + 1)}
      />
    </div>
  );
};
