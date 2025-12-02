import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import {
    AyahWithTranslation,
    QuranStoreState,
    Reciter,
} from '../types/index';

export const useQuranStore = create<QuranStoreState>((set) => {
  // Load persisted reciter on app start
  (async () => {
    try {
      const savedReciter = await AsyncStorage.getItem('@selected_reciter');
      if (savedReciter) {
        set({ selectedReciter: savedReciter as Reciter });
        console.log(`Loaded persisted reciter: ${savedReciter}`);
      }
    } catch (e) {
      console.error('Failed to load reciter:', e);
    }
  })();

  return {
    selectedReciter: 'mishary',
    selectedSurah: null,
    currentAyahs: [],
    isLoading: false,
    error: null,
    sleepTimerEndTime: null,

    setSelectedReciter: (reciter: Reciter) => {
      set({ selectedReciter: reciter });
      // Persist to AsyncStorage
      AsyncStorage.setItem('@selected_reciter', reciter).catch((e) => {
        console.error('Failed to save reciter:', e);
      });
      console.log(`Reciter set to: ${reciter}`);
    },
    setSelectedSurah: (surah: number) => set({ selectedSurah: surah }),
    setCurrentAyahs: (ayahs: AyahWithTranslation[]) =>
      set({ currentAyahs: ayahs }),
    setIsLoading: (loading: boolean) => set({ isLoading: loading }),
    setError: (error: string | null) => set({ error }),
    setSleepTimerEndTime: (endTime: number | null) => set({ sleepTimerEndTime: endTime }),
  };
});
