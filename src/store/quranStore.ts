import { create } from 'zustand';
import {
    AyahWithTranslation,
    QuranStoreState,
    Reciter,
} from '../types/index';

export const useQuranStore = create<QuranStoreState>((set) => ({
  selectedReciter: 'mishary',
  selectedSurah: null,
  currentAyahs: [],
  isLoading: false,
  error: null,

  setSelectedReciter: (reciter: Reciter) =>
    set({ selectedReciter: reciter }),
  setSelectedSurah: (surah: number) => set({ selectedSurah: surah }),
  setCurrentAyahs: (ayahs: AyahWithTranslation[]) =>
    set({ currentAyahs: ayahs }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
}));
