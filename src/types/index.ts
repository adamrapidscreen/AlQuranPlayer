// All TypeScript types for the app

export interface Surah {
    number: number;
    name: string;
    englishName: string;
    numberOfAyahs: number;
  }
  
  export interface Ayah {
    number: number;
    text: string;
    numberInSurah: number;
  }
  
  export interface AyahWithTranslation extends Ayah {
    englishText: string;
  }
  
  export interface Audio {
    reciter: string;
    url: string;
  }
  
  export interface TimingData {
    surahNo: number;
    ayahNo: number;
    arabic: string;
    english: string;
    audio: { [key: string]: Audio };
  }
  
  export type Reciter = 'mishary' | 'shatri' | 'qatami' | 'dosari';
  
  export interface ReciterInfo {
    id: Reciter;
    name: string;
    apiKey: string;
  }
  
  export interface QuranStoreState {
    selectedReciter: Reciter;
    selectedSurah: number | null;
    currentAyahs: AyahWithTranslation[];
    isLoading: boolean;
    error: string | null;
  
    setSelectedReciter: (reciter: Reciter) => void;
    setSelectedSurah: (surah: number) => void;
    setCurrentAyahs: (ayahs: AyahWithTranslation[]) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
  }
  