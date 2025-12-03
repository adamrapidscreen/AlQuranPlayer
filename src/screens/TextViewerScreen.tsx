import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AyahWithTranslation } from '../types/index';

export const TextViewerScreen = ({ route, navigation }: any) => {
  const { surahNumber, ayahs } = route.params as {
    surahNumber: number;
    ayahs: AyahWithTranslation[];
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Surah {surahNumber}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {ayahs.map((ayah, index) => (
          <View key={index} style={styles.ayahContainer}>
            <Text style={styles.arabicText}>{ayah.text}</Text>
            <Text style={styles.verseNumber}>({ayah.numberInSurah})</Text>
            <Text style={styles.englishText}>{ayah.englishText}</Text>
            <View style={styles.divider} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    width: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  ayahContainer: {
    marginBottom: 24,
  },
  arabicText: {
    fontSize: 20,
    color: '#fff',
    lineHeight: 36,
    marginBottom: 8,
    textAlign: 'right',
    fontWeight: '600',
    fontFamily: 'Amiri-Regular',
  },
  verseNumber: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 12,
    fontWeight: '500',
  },
  englishText: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: 'Lato-Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginTop: 16,
  },
});
