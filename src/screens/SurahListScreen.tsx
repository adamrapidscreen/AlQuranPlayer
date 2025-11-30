import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useQuranStore } from '../store/quranStore';
import { Surah } from '../types/index';
import { getReciterName } from '../utils/constants';

const MOCK_SURAHS: Surah[] = Array.from({ length: 114 }, (_, i) => ({
  number: i + 1,
  name: `Surah ${i + 1}`,
  englishName: `Surah Name ${i + 1}`,
  numberOfAyahs: Math.floor(Math.random() * 200) + 3,
}));

export const SurahListScreen = ({ navigation }: any) => {
  const [surahs, setSurahs] = useState<Surah[]>(MOCK_SURAHS);
  const [loading, setLoading] = useState(false);
  const { selectedReciter } = useQuranStore();

  useEffect(() => {
    console.log(`SurahListScreen loaded with reciter: ${selectedReciter}`);
  }, [selectedReciter]);

  const handleSelectSurah = (surah: Surah) => {
    console.log(`Selected surah: ${surah.number}`);
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
      <Text style={styles.ayahCount}>{item.numberOfAyahs} Ayahs</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Surahs - {getReciterName(selectedReciter)}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={surahs}
          renderItem={renderSurah}
          keyExtractor={(item) => item.number.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingTop: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
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
