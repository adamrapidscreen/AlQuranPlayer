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
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={surahs}
          renderItem={renderSurah}
          keyExtractor={(item) => item.number.toString()}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 15,
  },
  loader: {
    marginTop: 50,
  },
  list: {
    flex: 1,
  },
  surahItem: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  surahNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  surahNumberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  surahInfo: {
    flex: 1,
  },
  surahNameArabic: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  surahNameEnglish: {
    color: '#ccc',
    fontSize: 14,
  },
  ayahCount: {
    color: '#888',
    fontSize: 12,
  },
});
