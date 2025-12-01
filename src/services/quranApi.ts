import axios from 'axios';
import { AyahWithTranslation } from '../types/index';

const API_BASE = 'https://api.alquran.cloud/v1';

export const quranApi = {
  // Get full surah with Arabic + English
  async getSurah(surahNumber: number) {
    try {
      console.log(`Fetching Surah ${surahNumber} from API...`);
      
      // Get Arabic
      const arabicResponse = await axios.get(
        `${API_BASE}/surah/${surahNumber}`
      );
      
      // Get English translation
      const englishResponse = await axios.get(
        `${API_BASE}/surah/${surahNumber}/en.asad`
      );

      return {
        arabic: arabicResponse.data.data.ayahs,
        english: englishResponse.data.data.ayahs,
      };
    } catch (error) {
      console.error(`Error fetching Surah ${surahNumber}:`, error);
      throw error;
    }
  },

  // Format ayahs with translation
  formatAyahs(data: { arabic: any[]; english: any[] }): AyahWithTranslation[] {
    if (!data.arabic || !data.english) {
      console.warn('Missing arabic or english data');
      return [];
    }

    const formatted = data.arabic.map((arabicAyah: any, index: number) => ({
      number: arabicAyah.number,
      text: arabicAyah.text || '',
      numberInSurah: arabicAyah.numberInSurah,
      englishText: data.english[index]?.text || '',
    }));

    return formatted;
  },

  /**
   * Get reciter audio URL - uses quranapi.pages.dev for full chapter audio
   * Based on: https://quranapi.pages.dev/getting-started/audio-recitation
   * 
   * @param surahNumber - The surah number (1-114)
   * @param reciterId - The reciter identifier (mishary, shatri, qatami, dosari)
   * @returns Promise<string> Direct MP3 URL string
   */
  async getReciterAudioUrl(surahNumber: number, reciterId: string): Promise<string> {
    // Map reciter IDs to quranapi.pages.dev reciter numbers
    // From docs: 1=Mishary, 2=Abu Bakr, 3=Nasser, 4=Yasser
    const reciterMap: { [key: string]: string } = {
      mishary: '1',  // Mishary Rashid Al Afasy
      shatri: '2',   // Abu Bakr Al Shatri
      qatami: '3',   // Nasser Al Qatami
      dosari: '4',   // Yasser Al Dosari
    };

    const reciterNumber = reciterMap[reciterId] || '1';
    
    try {
      // Get full chapter audio from quranapi.pages.dev
      // Endpoint: /api/audio/{surahNo}.json
      const apiUrl = `https://quranapi.pages.dev/api/audio/${surahNumber}.json`;
      const response = await axios.get(apiUrl, { timeout: 10000 });
      
      // Response format: { "1": { "reciter": "...", "url": "...", "originalUrl": "..." }, ... }
      const reciterData = response.data?.[reciterNumber];
      
      if (!reciterData) {
        throw new Error(`Reciter ${reciterId} (number ${reciterNumber}) not found in API response`);
      }
      
      // Prefer originalUrl (from mp3quran.net servers) as it's more reliable
      // Fallback to url (GitHub) if originalUrl is not available
      const audioUrl = reciterData.originalUrl || reciterData.url;
      
      if (!audioUrl || !audioUrl.startsWith('http')) {
        throw new Error('Invalid audio URL in API response');
      }
      
      return audioUrl;
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to get audio URL from quranapi.pages.dev:', errorMessage);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } };
        if (axiosError.response) {
          console.error('API Response status:', axiosError.response.status);
          console.error('API Response data:', JSON.stringify(axiosError.response.data, null, 2));
        }
      }
      throw new Error(`Could not get audio URL: ${errorMessage}`);
    }
  },
};
