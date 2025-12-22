"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Loader2 } from "lucide-react";
import { getStoredDownloads, removeDownload, clearDownloads, type DownloadItem } from "@/lib/downloads";
import { getAuthHeaders } from "@/lib/fetch-utils";

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [downloadingUri, setDownloadingUri] = useState<string | null>(null);

  // Load downloads from localStorage
  useEffect(() => {
    const loadDownloads = () => {
      setDownloads(getStoredDownloads());
    };

    loadDownloads();

    // Listen for storage changes (in case downloads are added from other tabs)
    const handleStorageChange = () => {
      loadDownloads();
    };

    // Listen for custom event when download is added in same tab
    const handleDownloadAdded = () => {
      loadDownloads();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("download-added", handleDownloadAdded);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("download-added", handleDownloadAdded);
    };
  }, []);

  const handleGetContent = async (downloadUri: string, fileName: string) => {
    setDownloadingUri(downloadUri);

    try {
      // Use proxy endpoint to avoid CORS issues
      const proxyUrl = `/api/records/download-proxy?uri=${encodeURIComponent(downloadUri)}`;
      
      // Fetch through our proxy
      const response = await fetch(proxyUrl, {
        method: "GET",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download file");
      }

      // Get the file as a blob
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Get filename from Content-Disposition header or use the stored name
      const contentDisposition = response.headers.get("Content-Disposition");
      let downloadFileName = fileName || "download";
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
          downloadFileName = fileNameMatch[1].replace(/['"]/g, "");
        }
      }
      
      a.download = downloadFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert(error instanceof Error ? error.message : "Failed to download file");
    } finally {
      setDownloadingUri(null);
    }
  };

  const handleRemove = (fileId: string) => {
    removeDownload(fileId);
    setDownloads(getStoredDownloads());
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all downloads?")) {
      clearDownloads();
      setDownloads([]);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Downloads</h1>
          <p className="text-muted-foreground mt-2">
            Track and download files you've requested
          </p>
        </div>
        {downloads.length > 0 && (
          <Button
            onClick={handleClearAll}
            variant="outline"
            className="border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Downloads List */}
      {downloads.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">
            No downloads yet. Click the download button on any file in the Records page to track it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((download) => (
            <div
              key={download.fileId}
              className="rounded-xl bg-sky-100/60 dark:bg-sky-900/20 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {download.fileName}
                  </h3>
                  {download.recordName && download.recordName !== download.fileName && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {download.recordName}
                    </p>
                  )}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      File ID: <span className="font-mono">{download.fileId}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Requested: {formatDate(download.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={() => handleGetContent(download.downloadUri, download.fileName)}
                    disabled={downloadingUri === download.downloadUri}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {downloadingUri === download.downloadUri ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Get Content
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleRemove(download.fileId)}
                    variant="outline"
                    size="icon"
                    className="border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-300"
                    title="Remove from list"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
