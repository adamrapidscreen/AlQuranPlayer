import * as FileSystemLegacy from 'expo-file-system/legacy';

const AUDIO_DIR = (FileSystemLegacy.documentDirectory || '') + 'quran-audio/';

export const audioCache = {
  async getAudioFilePath(surahNumber: number, reciterId: string): Promise<string> {
    const path = `${AUDIO_DIR}surah-${surahNumber}-reciter-${reciterId}.mp3`;
    // Ensure it's a proper file:// URI
    if (path.startsWith('file://')) {
      return path;
    }
    // documentDirectory already includes file:// prefix, so path should be correct
    return path;
  },

  async audioExists(surahNumber: number, reciterId: string): Promise<boolean> {
    try {
      const filePath = await this.getAudioFilePath(surahNumber, reciterId);
      const info = await FileSystemLegacy.getInfoAsync(filePath);
      
      if (!info.exists) {
        return false;
      }
      
      // Validate file size - MP3 files should be between 10KB and 50MB
      // Files < 10KB are likely error pages or corrupted downloads
      // Files > 50MB are suspiciously large for a single surah
      const fileSize = info.size || 0;
      const MIN_SIZE = 10 * 1024; // 10KB
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB
      
      if (fileSize < MIN_SIZE || fileSize > MAX_SIZE) {
        await this.deleteAudio(surahNumber, reciterId);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking audio existence:', error);
      return false;
    }
  },

  async downloadAudio(
    surahNumber: number,
    reciterId: string,
    url: string,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    try {
      await FileSystemLegacy.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
      const filePath = await this.getAudioFilePath(surahNumber, reciterId);

      const downloadResumable = FileSystemLegacy.createDownloadResumable(
        url,
        filePath,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          if (onProgress) {
            onProgress(Math.round(progress * 100));
          }
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (!result || !result.uri) {
        throw new Error('Download completed but no file URI returned');
      }
      
      // Verify file exists and has valid size
      const fileInfo = await FileSystemLegacy.getInfoAsync(result.uri);
      if (!fileInfo.exists) {
        throw new Error(`Downloaded file does not exist at: ${result.uri}`);
      }
      
      const fileSize = fileInfo.size || 0;
      const MIN_SIZE = 10 * 1024; // 10KB
      
      // Validate file size - MP3 files should be at least 10KB
      // Error pages (404, etc.) are typically < 10KB
      if (fileSize < MIN_SIZE) {
        throw new Error(
          `Downloaded file is too small (${fileSize} bytes). ` +
          `This is likely an error page, not an audio file. ` +
          `The URL may be invalid: ${url}`
        );
      }
      
      return result.uri;
    } catch (error: unknown) {
      console.error('Error downloading audio:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; statusText?: string } };
        if (axiosError.response) {
          console.error('HTTP Error:', axiosError.response.status, axiosError.response.statusText);
          throw new Error(
            `Download failed: HTTP ${axiosError.response.status} - ${axiosError.response.statusText || 'Unknown error'}`
          );
        }
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Download failed: ${errorMessage}`);
    }
  },

  async deleteAudio(surahNumber: number, reciterId: string): Promise<void> {
    try {
      const filePath = await this.getAudioFilePath(surahNumber, reciterId);
      await FileSystemLegacy.deleteAsync(filePath, { idempotent: true });
    } catch (error) {
      console.error('Error deleting audio:', error);
    }
  },

  async clearAllCache(): Promise<void> {
    try {
      await FileSystemLegacy.deleteAsync(AUDIO_DIR, { idempotent: true });
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  },
};
