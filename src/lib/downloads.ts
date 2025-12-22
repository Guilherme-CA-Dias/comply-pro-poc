export interface DownloadItem {
  fileId: string;
  fileName: string;
  downloadUri: string;
  timestamp: string;
  recordName?: string;
}

const DOWNLOADS_STORAGE_KEY = 'file-downloads';

export function getStoredDownloads(): DownloadItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(DOWNLOADS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading downloads from localStorage:', error);
    return [];
  }
}

export function addDownload(download: DownloadItem): void {
  if (typeof window === 'undefined') return;
  
  try {
    const downloads = getStoredDownloads();
    // Check if this fileId already exists, if so, update it instead of adding duplicate
    const existingIndex = downloads.findIndex(d => d.fileId === download.fileId);
    
    if (existingIndex >= 0) {
      downloads[existingIndex] = download;
    } else {
      downloads.unshift(download); // Add to beginning
    }
    
    localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(downloads));
  } catch (error) {
    console.error('Error saving download to localStorage:', error);
  }
}

export function removeDownload(fileId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const downloads = getStoredDownloads();
    const filtered = downloads.filter(d => d.fileId !== fileId);
    localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing download from localStorage:', error);
  }
}

export function clearDownloads(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(DOWNLOADS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing downloads from localStorage:', error);
  }
}

