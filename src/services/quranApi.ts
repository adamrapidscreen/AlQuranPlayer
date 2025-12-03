import axios from 'axios';
import { AyahWithTranslation } from '../types/index';

const API_BASE = 'https://api.alquran.cloud/v1';

// Cache for surah text to avoid re-fetching
const surahTextCache = new Map<number, { arabic: any[]; english: any[] }>();

export const quranApi = {
  // Get full surah with Arabic + English (cached)
  async getSurah(surahNumber: number) {
    try {
      // Check cache first
      if (surahTextCache.has(surahNumber)) {
        return surahTextCache.get(surahNumber)!;
      }
      
      // Fetch both in parallel for better performance
      const [arabicResponse, englishResponse] = await Promise.all([
        axios.get(`${API_BASE}/surah/${surahNumber}`),
        axios.get(`${API_BASE}/surah/${surahNumber}/en.asad`),
      ]);

      const data = {
        arabic: arabicResponse.data.data.ayahs,
        english: englishResponse.data.data.ayahs,
      };
      
      // Cache the result
      surahTextCache.set(surahNumber, data);
      
      return data;
    } catch (error) {
      console.error(`Error fetching Surah ${surahNumber}:`, error);
      throw error;
    }
  },

  // Format ayahs with translation
  formatAyahs(data: { arabic: any[]; english: any[] }): AyahWithTranslation[] {
    if (!data?.arabic || !data?.english) {
      return [];
    }

    return data.arabic.map((arabicAyah: any, index: number) => ({
      number: arabicAyah.number,
      text: arabicAyah.text || '',
      numberInSurah: arabicAyah.numberInSurah,
      englishText: data.english[index]?.text || '',
    }));
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
      const response = await axios.get(apiUrl, { timeout: 30000 }); // Increased to 30 seconds
      
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
      console.error('Failed to get audio URL:', errorMessage);
      throw new Error(`Could not get audio URL: ${errorMessage}`);
    }
  },
};
