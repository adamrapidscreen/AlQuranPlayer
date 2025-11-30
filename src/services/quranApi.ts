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

      console.log(`Successfully fetched Surah ${surahNumber}`);
      
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
  formatAyahs(data: any): AyahWithTranslation[] {
    console.log('formatAyahs called');
    
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

    console.log(`Formatted ${formatted.length} ayahs`);
    return formatted;
  },

  // Get reciter audio URL
  getReciterAudioUrl(
    surahNumber: number,
    ayahNumber: number,
    reciterId: string
  ): string {
    const reciterMap: { [key: string]: string } = {
      mishary: 'ar.alafasy',
      shatri: 'ar.shatri',
      qatami: 'ar.qahtani',
      dosari: 'ar.dosari',
    };

    const reciter = reciterMap[reciterId] || 'ar.alafasy';
    return `${API_BASE}/ayah/${surahNumber}:${ayahNumber}/${reciter}`;
  },
};
