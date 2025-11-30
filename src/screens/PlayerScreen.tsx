import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useQuranStore } from '../store/quranStore';
import { getReciterName } from '../utils/constants';

export const PlayerScreen = ({ route, navigation }: any) => {
  const { surahNumber } = route.params;
  const { selectedReciter } = useQuranStore();
  const [isPlaying, setIsPlaying] = useState(false);

  console.log(
    `PlayerScreen opened for surah ${surahNumber} with reciter ${selectedReciter}`
  );

  const reciterName = getReciterName(selectedReciter);

  return (
    <View style={styles.container}>
      <Text style={styles.surahTitle}>Surah {surahNumber}</Text>
      <Text style={styles.reciter}>Reciter: {reciterName}</Text>

      <ScrollView style={styles.textArea}>
        <Text style={styles.arabicText}>
          بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِيمِ
        </Text>
        <Text style={styles.englishText}>
          In the name of Allah, the Most Gracious, the Most Merciful.
        </Text>
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  surahTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  reciter: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  textArea: {
    flex: 1,
    marginVertical: 20,
  },
  arabicText: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'right',
    marginBottom: 20,
    lineHeight: 40,
  },
  englishText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 24,
  },
  controls: {
    paddingVertical: 20,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
