import { ReciterInfo } from '../types/index';

export const RECITERS: ReciterInfo[] = [
  {
    id: 'mishary',
    name: 'Mishary Rashid Al-Afasy',
    apiKey: '1',
  },
  {
    id: 'shatri',
    name: 'Abu Bakr Al-Shatri',
    apiKey: '2',
  },
  {
    id: 'qatami',
    name: 'Nasser Al-Qatami',
    apiKey: '3',
  },
  {
    id: 'dosari',
    name: 'Yasser Al-Dosari',
    apiKey: '4',
  },
];

export const getReciterApiKey = (reciterId: string): string => {
  const reciter = RECITERS.find((r) => r.id === reciterId);
  return reciter?.apiKey || '1';
};

export const getReciterName = (reciterId: string): string => {
  const reciter = RECITERS.find((r) => r.id === reciterId);
  return reciter?.name || 'Unknown';
};
