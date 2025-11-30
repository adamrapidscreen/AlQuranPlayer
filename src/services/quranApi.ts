import axios from 'axios';
import { AyahWithTranslation } from '../types/index';

const API_BASE = 'https://quranapi.pages.dev/api';

export const quranApi = {
  // Get single verse
  async getAyah(surahNumber: number, ayahNumber: number) {
    try {
      const response = await axios.get(
        `${API_BASE}/${surahNumber}/${ayahNumber}.json`
      );
      console.log(
        `Fetched Surah ${surahNumber}, Ayah ${ayahNumber}:`,
        response.data
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching Surah ${surahNumber}, Ayah ${ayahNumber}:`,
        error
      );
      throw error;
    }
  },

  // Get full surah
  async getSurah(surahNumber: number) {
    try {
      const response = await axios.get(`${API_BASE}/${surahNumber}.json`);
      console.log(`Fetched Surah ${surahNumber}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Surah ${surahNumber}:`, error);
      throw error;
    }
  },

  // Format ayahs with translation
  formatAyahs(data: any): AyahWithTranslation[] {
    if (!data.ayahs) {
      console.warn('No ayahs found in response');
      return [];
    }

    return data.ayahs.map((ayah: any) => ({
      number: ayah.number,
      text: ayah.text || '',
      numberInSurah: ayah.numberInSurah,
      englishText: ayah.englishText || '',
    }));
  },
};
