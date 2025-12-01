import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuranStore } from '../store/quranStore';
import { Surah } from '../types/index';
import { getReciterName } from '../utils/constants';

// All 114 surahs of the Quran
const ALL_SURAHS: Surah[] = [
  { number: 1, name: 'Al-Fatihah', englishName: 'The Opening', numberOfAyahs: 7 },
  { number: 2, name: 'Al-Baqarah', englishName: 'The Cow', numberOfAyahs: 286 },
  { number: 3, name: 'Ali Imran', englishName: 'The Family of Imran', numberOfAyahs: 200 },
  { number: 4, name: 'An-Nisa', englishName: 'The Women', numberOfAyahs: 176 },
  { number: 5, name: 'Al-Maidah', englishName: 'The Table', numberOfAyahs: 120 },
  { number: 6, name: 'Al-Anam', englishName: 'The Cattle', numberOfAyahs: 165 },
  { number: 7, name: 'Al-Araf', englishName: 'The Heights', numberOfAyahs: 206 },
  { number: 8, name: 'Al-Anfal', englishName: 'The Spoils of War', numberOfAyahs: 75 },
  { number: 9, name: 'At-Taubah', englishName: 'The Repentance', numberOfAyahs: 129 },
  { number: 10, name: 'Yunus', englishName: 'Jonah', numberOfAyahs: 109 },
  { number: 11, name: 'Hud', englishName: 'Hud', numberOfAyahs: 123 },
  { number: 12, name: 'Yusuf', englishName: 'Joseph', numberOfAyahs: 111 },
  { number: 13, name: 'Ar-Rad', englishName: 'The Thunder', numberOfAyahs: 43 },
  { number: 14, name: 'Ibrahim', englishName: 'Abraham', numberOfAyahs: 52 },
  { number: 15, name: 'Al-Hijr', englishName: 'The Rocky Tract', numberOfAyahs: 99 },
  { number: 16, name: 'An-Nahl', englishName: 'The Bee', numberOfAyahs: 128 },
  { number: 17, name: 'Al-Isra', englishName: 'The Night Journey', numberOfAyahs: 111 },
  { number: 18, name: 'Al-Kahf', englishName: 'The Cave', numberOfAyahs: 110 },
  { number: 19, name: 'Maryam', englishName: 'Mary', numberOfAyahs: 98 },
  { number: 20, name: 'Ta-Ha', englishName: 'Ta-Ha', numberOfAyahs: 135 },
  { number: 21, name: 'Al-Anbiya', englishName: 'The Prophets', numberOfAyahs: 112 },
  { number: 22, name: 'Al-Hajj', englishName: 'The Pilgrimage', numberOfAyahs: 78 },
  { number: 23, name: 'Al-Muminun', englishName: 'The Believers', numberOfAyahs: 118 },
  { number: 24, name: 'An-Nur', englishName: 'The Light', numberOfAyahs: 64 },
  { number: 25, name: 'Al-Furqan', englishName: 'The Criterion', numberOfAyahs: 77 },
  { number: 26, name: 'Ash-Shuara', englishName: 'The Poets', numberOfAyahs: 227 },
  { number: 27, name: 'An-Naml', englishName: 'The Ant', numberOfAyahs: 93 },
  { number: 28, name: 'Al-Qasas', englishName: 'The Stories', numberOfAyahs: 88 },
  { number: 29, name: 'Al-Ankabut', englishName: 'The Spider', numberOfAyahs: 69 },
  { number: 30, name: 'Ar-Rum', englishName: 'The Romans', numberOfAyahs: 60 },
  { number: 31, name: 'Luqman', englishName: 'Luqman', numberOfAyahs: 34 },
  { number: 32, name: 'As-Sajdah', englishName: 'The Prostration', numberOfAyahs: 30 },
  { number: 33, name: 'Al-Ahzab', englishName: 'The Clans', numberOfAyahs: 73 },
  { number: 34, name: 'Saba', englishName: 'Sheba', numberOfAyahs: 54 },
  { number: 35, name: 'Fatir', englishName: 'The Originator', numberOfAyahs: 45 },
  { number: 36, name: 'Ya-Sin', englishName: 'Ya-Sin', numberOfAyahs: 83 },
  { number: 37, name: 'As-Saffat', englishName: 'Those Ranged in Rows', numberOfAyahs: 182 },
  { number: 38, name: 'Sad', englishName: 'Sad', numberOfAyahs: 88 },
  { number: 39, name: 'Az-Zumar', englishName: 'The Groups', numberOfAyahs: 75 },
  { number: 40, name: 'Ghafir', englishName: 'The Forgiver', numberOfAyahs: 85 },
  { number: 41, name: 'Fussilat', englishName: 'Explained in Detail', numberOfAyahs: 54 },
  { number: 42, name: 'Ash-Shura', englishName: 'The Consultation', numberOfAyahs: 53 },
  { number: 43, name: 'Az-Zukhruf', englishName: 'The Gold', numberOfAyahs: 89 },
  { number: 44, name: 'Ad-Dukhan', englishName: 'The Smoke', numberOfAyahs: 59 },
  { number: 45, name: 'Al-Jathiyah', englishName: 'The Crouching', numberOfAyahs: 37 },
  { number: 46, name: 'Al-Ahqaf', englishName: 'The Wind-Curved Sandhills', numberOfAyahs: 35 },
  { number: 47, name: 'Muhammad', englishName: 'Muhammad', numberOfAyahs: 38 },
  { number: 48, name: 'Al-Fath', englishName: 'The Victory', numberOfAyahs: 29 },
  { number: 49, name: 'Al-Hujurat', englishName: 'The Rooms', numberOfAyahs: 18 },
  { number: 50, name: 'Qaf', englishName: 'Qaf', numberOfAyahs: 45 },
  { number: 51, name: 'Adh-Dhariyat', englishName: 'The Winnowing Winds', numberOfAyahs: 60 },
  { number: 52, name: 'At-Tur', englishName: 'The Mount', numberOfAyahs: 49 },
  { number: 53, name: 'An-Najm', englishName: 'The Star', numberOfAyahs: 62 },
  { number: 54, name: 'Al-Qamar', englishName: 'The Moon', numberOfAyahs: 55 },
  { number: 55, name: 'Ar-Rahman', englishName: 'The Beneficent', numberOfAyahs: 78 },
  { number: 56, name: 'Al-Waqiah', englishName: 'The Event', numberOfAyahs: 96 },
  { number: 57, name: 'Al-Hadid', englishName: 'The Iron', numberOfAyahs: 29 },
  { number: 58, name: 'Al-Mujadila', englishName: 'The Pleading Woman', numberOfAyahs: 22 },
  { number: 59, name: 'Al-Hashr', englishName: 'The Exile', numberOfAyahs: 24 },
  { number: 60, name: 'Al-Mumtahanah', englishName: 'She That is to be Examined', numberOfAyahs: 13 },
  { number: 61, name: 'As-Saff', englishName: 'The Ranks', numberOfAyahs: 14 },
  { number: 62, name: 'Al-Jumuah', englishName: 'Friday', numberOfAyahs: 11 },
  { number: 63, name: 'Al-Munafiqun', englishName: 'The Hypocrites', numberOfAyahs: 11 },
  { number: 64, name: 'At-Taghabun', englishName: 'The Mutual Disillusion', numberOfAyahs: 18 },
  { number: 65, name: 'At-Talaq', englishName: 'The Divorce', numberOfAyahs: 12 },
  { number: 66, name: 'At-Tahrim', englishName: 'The Prohibition', numberOfAyahs: 12 },
  { number: 67, name: 'Al-Mulk', englishName: 'The Sovereignty', numberOfAyahs: 30 },
  { number: 68, name: 'Al-Qalam', englishName: 'The Pen', numberOfAyahs: 52 },
  { number: 69, name: 'Al-Haqqah', englishName: 'The Reality', numberOfAyahs: 52 },
  { number: 70, name: 'Al-Maarij', englishName: 'The Ascending Stairways', numberOfAyahs: 44 },
  { number: 71, name: 'Nuh', englishName: 'Noah', numberOfAyahs: 28 },
  { number: 72, name: 'Al-Jinn', englishName: 'The Jinn', numberOfAyahs: 28 },
  { number: 73, name: 'Al-Muzzammil', englishName: 'The Enshrouded One', numberOfAyahs: 20 },
  { number: 74, name: 'Al-Muddathir', englishName: 'The Cloaked One', numberOfAyahs: 56 },
  { number: 75, name: 'Al-Qiyamah', englishName: 'The Resurrection', numberOfAyahs: 40 },
  { number: 76, name: 'Al-Insan', englishName: 'The Man', numberOfAyahs: 31 },
  { number: 77, name: 'Al-Mursalat', englishName: 'The Emissaries', numberOfAyahs: 50 },
  { number: 78, name: 'An-Naba', englishName: 'The Tidings', numberOfAyahs: 40 },
  { number: 79, name: 'An-Naziat', englishName: 'Those Who Drag Forth', numberOfAyahs: 46 },
  { number: 80, name: 'Abasa', englishName: 'He Frowned', numberOfAyahs: 42 },
  { number: 81, name: 'At-Takwir', englishName: 'The Overthrowing', numberOfAyahs: 29 },
  { number: 82, name: 'Al-Infitar', englishName: 'The Cleaving', numberOfAyahs: 19 },
  { number: 83, name: 'Al-Mutaffifin', englishName: 'The Defrauding', numberOfAyahs: 36 },
  { number: 84, name: 'Al-Inshiqaq', englishName: 'The Splitting Open', numberOfAyahs: 25 },
  { number: 85, name: 'Al-Buruj', englishName: 'The Constellations', numberOfAyahs: 22 },
  { number: 86, name: 'At-Tariq', englishName: 'The Nightcomer', numberOfAyahs: 17 },
  { number: 87, name: 'Al-Ala', englishName: 'The Most High', numberOfAyahs: 19 },
  { number: 88, name: 'Al-Ghashiyah', englishName: 'The Overwhelming', numberOfAyahs: 26 },
  { number: 89, name: 'Al-Fajr', englishName: 'The Dawn', numberOfAyahs: 30 },
  { number: 90, name: 'Al-Balad', englishName: 'The City', numberOfAyahs: 20 },
  { number: 91, name: 'Ash-Shams', englishName: 'The Sun', numberOfAyahs: 15 },
  { number: 92, name: 'Al-Layl', englishName: 'The Night', numberOfAyahs: 21 },
  { number: 93, name: 'Ad-Duha', englishName: 'The Morning Hours', numberOfAyahs: 11 },
  { number: 94, name: 'Ash-Sharh', englishName: 'The Relief', numberOfAyahs: 8 },
  { number: 95, name: 'At-Tin', englishName: 'The Fig', numberOfAyahs: 8 },
  { number: 96, name: 'Al-Alaq', englishName: 'The Clot', numberOfAyahs: 19 },
  { number: 97, name: 'Al-Qadr', englishName: 'The Power', numberOfAyahs: 5 },
  { number: 98, name: 'Al-Bayyinah', englishName: 'The Evidence', numberOfAyahs: 8 },
  { number: 99, name: 'Az-Zalzalah', englishName: 'The Earthquake', numberOfAyahs: 8 },
  { number: 100, name: 'Al-Adiyat', englishName: 'The Courser', numberOfAyahs: 11 },
  { number: 101, name: 'Al-Qariah', englishName: 'The Calamity', numberOfAyahs: 11 },
  { number: 102, name: 'At-Takathur', englishName: 'The Rivalry in world increase', numberOfAyahs: 8 },
  { number: 103, name: 'Al-Asr', englishName: 'The Declining Day', numberOfAyahs: 3 },
  { number: 104, name: 'Al-Humazah', englishName: 'The Traducer', numberOfAyahs: 9 },
  { number: 105, name: 'Al-Fil', englishName: 'The Elephant', numberOfAyahs: 5 },
  { number: 106, name: 'Quraysh', englishName: 'Quraysh', numberOfAyahs: 4 },
  { number: 107, name: 'Al-Maun', englishName: 'The Small kindnesses', numberOfAyahs: 7 },
  { number: 108, name: 'Al-Kawthar', englishName: 'The Abundance', numberOfAyahs: 3 },
  { number: 109, name: 'Al-Kafirun', englishName: 'The Disbelievers', numberOfAyahs: 6 },
  { number: 110, name: 'An-Nasr', englishName: 'The Divine Support', numberOfAyahs: 3 },
  { number: 111, name: 'Al-Masad', englishName: 'The Palm Fibre', numberOfAyahs: 5 },
  { number: 112, name: 'Al-Ikhlas', englishName: 'The Sincerity', numberOfAyahs: 4 },
  { number: 113, name: 'Al-Falaq', englishName: 'The Daybreak', numberOfAyahs: 5 },
  { number: 114, name: 'An-Nas', englishName: 'The Mankind', numberOfAyahs: 6 },
];

export const SurahListScreen = ({ navigation }: any) => {
  const [surahs] = useState<Surah[]>(ALL_SURAHS);
  const { selectedReciter } = useQuranStore();

  const handleSelectSurah = (surah: Surah) => {
    console.log(`Selected surah: ${surah.number} - ${surah.name}`);
    navigation.navigate('Player', { surahNumber: surah.number });
  };

  const renderSurah = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      style={styles.surahItem}
      onPress={() => handleSelectSurah(item)}
    >
      <View style={styles.surahNumber}>
        <Text style={styles.surahNumberText}>{item.number}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={styles.surahNameArabic}>{item.name}</Text>
        <Text style={styles.surahNameEnglish}>{item.englishName}</Text>
      </View>
      <Text style={styles.ayahCount}>{item.numberOfAyahs}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Surahs - {getReciterName(selectedReciter)}
      </Text>
      <FlatList
        data={surahs}
        renderItem={renderSurah}
        keyExtractor={(item) => item.number.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 10,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  surahNumberText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  surahInfo: {
    flex: 1,
    marginLeft: 15,
  },
  surahNameArabic: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  surahNameEnglish: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 3,
  },
  ayahCount: {
    color: '#888',
    fontSize: 12,
  },
});
