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
    `PlayerScreen opened for surah ${surahNumber} with ${selectedReciter}`
  );

  return (
    <View style={styles.container}>
      <Text style={styles.surahTitle}>Surah {surahNumber}</Text>
      <Text style={styles.reciter}>
        Reciter: {getReciterName(selectedReciter)}
      </Text>

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
          onPress={() => {
            setIsPlaying(!isPlaying);
            console.log(isPlaying ? 'Paused' : 'Playing');
          }}
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
    marginBottom: 5,
  },
  reciter: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 20,
  },
  textArea: {
    flex: 1,
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  arabicText: {
    fontSize: 20,
    color: '#fff',
    lineHeight: 32,
    marginBottom: 15,
    textAlign: 'right',
  },
  englishText: {
    fontSize: 14,
    color: '#bbb',
    lineHeight: 22,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 50,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
