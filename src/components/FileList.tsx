"use client";

import { useEffect, useState, useCallback } from "react"; // 1. Added useCallback
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Collection } from "@/types/collection";
import { api, FileItem } from "@/lib/api";
import { useCollections } from "@/context/CollectionContext";

interface FileListProps {
  collection: Collection;
  onFileDeleted?: () => void;
}

export const FileList: React.FC<FileListProps> = ({ collection, onFileDeleted }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshCollections } = useCollections();

  // 2. Wrapped fetchFiles in useCallback to make it stable
  const fetchFiles = useCallback(async () => {
    try {
      const data = await api.getFiles(collection.slug);
      setFiles(data.results);
      // Return true if any file is still processing
      return data.results.some((file) => file.status === "processing");
    } catch (error) {
      console.error("Error fetching files - ", error);
      toast.error("Failed to load files");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [collection.slug]); 

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    const startPolling = async () => {
      const hasProcessingFiles = await fetchFiles();

      if (hasProcessingFiles) {
        // If there are processing files, set up polling
        pollingInterval = setInterval(async () => {
          const stillProcessing = await fetchFiles();
          if (!stillProcessing) {
            // If no more processing files, clear the interval
            clearInterval(pollingInterval);
          }
        }, 3000); // Poll every 3 seconds
      }
    };

    startPolling();

    // Cleanup function
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [collection.slug, fetchFiles]); // 3. Added fetchFiles to the dependency array

  const handleDelete = async (fileId: string) => {
    try {
      await api.deleteFile(fileId);
      toast.success("File deleted successfully");
      fetchFiles();
      refreshCollections();
      onFileDeleted?.();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "N/A";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getStatusColor = (status: FileItem["status"]) => {
    switch (status) {
      case "processing":
        return "text-yellow-600 bg-yellow-50";
      case "completed":
        return "text-green-600 bg-green-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading files...</div>;
  }

  if (files.length === 0) {
    return <div className="text-center py-4 text-gray-500">No files uploaded yet</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Uploaded Files</h3>
      </div>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex flex-col flex-1 mr-4">
              <span className="text-sm text-gray-600 truncate">{file.originalFilename}</span>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(file.status)}`}>
                  {file.status}
                </span>
              </div>
              {file.status === "error" && file.processingError && (
                <span className="text-xs text-red-500 mt-1">{file.processingError}</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(file.id)}
              className="text-red-400 hover:text-red-600 hover:bg-red-50"
              disabled={file.status === "processing"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
