import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuranStore } from '../store/quranStore';
import { Surah } from '../types/index';
import { getReciterName } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../constants/theme';

// All 114 surahs of the Quran
const ALL_SURAHS: Surah[] = [
  { number: 1, name: 'الفاتحة', englishName: 'The Opening', numberOfAyahs: 7 },
  { number: 2, name: 'البقرة', englishName: 'The Cow', numberOfAyahs: 286 },
  { number: 3, name: 'آل عمران', englishName: 'The Family of Imran', numberOfAyahs: 200 },
  { number: 4, name: 'النساء', englishName: 'The Women', numberOfAyahs: 176 },
  { number: 5, name: 'المائدة', englishName: 'The Table', numberOfAyahs: 120 },
  { number: 6, name: 'الأنعام', englishName: 'The Cattle', numberOfAyahs: 165 },
  { number: 7, name: 'الأعراف', englishName: 'The Heights', numberOfAyahs: 206 },
  { number: 8, name: 'الأنفال', englishName: 'The Spoils of War', numberOfAyahs: 75 },
  { number: 9, name: 'التوبة', englishName: 'The Repentance', numberOfAyahs: 129 },
  { number: 10, name: 'يونس', englishName: 'Jonah', numberOfAyahs: 109 },
  { number: 11, name: 'هود', englishName: 'Hud', numberOfAyahs: 123 },
  { number: 12, name: 'يوسف', englishName: 'Joseph', numberOfAyahs: 111 },
  { number: 13, name: 'الرعد', englishName: 'The Thunder', numberOfAyahs: 43 },
  { number: 14, name: 'إبراهيم', englishName: 'Abraham', numberOfAyahs: 52 },
  { number: 15, name: 'الحجر', englishName: 'The Rocky Tract', numberOfAyahs: 99 },
  { number: 16, name: 'النحل', englishName: 'The Bee', numberOfAyahs: 128 },
  { number: 17, name: 'الإسراء', englishName: 'The Night Journey', numberOfAyahs: 111 },
  { number: 18, name: 'الكهف', englishName: 'The Cave', numberOfAyahs: 110 },
  { number: 19, name: 'مريم', englishName: 'Mary', numberOfAyahs: 98 },
  { number: 20, name: 'طه', englishName: 'Ta-Ha', numberOfAyahs: 135 },
  { number: 21, name: 'الأنبياء', englishName: 'The Prophets', numberOfAyahs: 112 },
  { number: 22, name: 'الحج', englishName: 'The Pilgrimage', numberOfAyahs: 78 },
  { number: 23, name: 'المؤمنون', englishName: 'The Believers', numberOfAyahs: 118 },
  { number: 24, name: 'النور', englishName: 'The Light', numberOfAyahs: 64 },
  { number: 25, name: 'الفرقان', englishName: 'The Criterion', numberOfAyahs: 77 },
  { number: 26, name: 'الشعراء', englishName: 'The Poets', numberOfAyahs: 227 },
  { number: 27, name: 'النمل', englishName: 'The Ant', numberOfAyahs: 93 },
  { number: 28, name: 'القصص', englishName: 'The Stories', numberOfAyahs: 88 },
  { number: 29, name: 'العنكبوت', englishName: 'The Spider', numberOfAyahs: 69 },
  { number: 30, name: 'الروم', englishName: 'The Romans', numberOfAyahs: 60 },
  { number: 31, name: 'لقمان', englishName: 'Luqman', numberOfAyahs: 34 },
  { number: 32, name: 'السجدة', englishName: 'The Prostration', numberOfAyahs: 30 },
  { number: 33, name: 'الأحزاب', englishName: 'The Clans', numberOfAyahs: 73 },
  { number: 34, name: 'سبأ', englishName: 'Sheba', numberOfAyahs: 54 },
  { number: 35, name: 'فاطر', englishName: 'The Originator', numberOfAyahs: 45 },
  { number: 36, name: 'يس', englishName: 'Ya-Sin', numberOfAyahs: 83 },
  { number: 37, name: 'الصافات', englishName: 'Those Ranged in Rows', numberOfAyahs: 182 },
  { number: 38, name: 'ص', englishName: 'Sad', numberOfAyahs: 88 },
  { number: 39, name: 'الزمر', englishName: 'The Groups', numberOfAyahs: 75 },
  { number: 40, name: 'غافر', englishName: 'The Forgiver', numberOfAyahs: 85 },
  { number: 41, name: 'فصلت', englishName: 'Explained in Detail', numberOfAyahs: 54 },
  { number: 42, name: 'الشورى', englishName: 'The Consultation', numberOfAyahs: 53 },
  { number: 43, name: 'الزخرف', englishName: 'The Gold', numberOfAyahs: 89 },
  { number: 44, name: 'الدخان', englishName: 'The Smoke', numberOfAyahs: 59 },
  { number: 45, name: 'الجاثية', englishName: 'The Crouching', numberOfAyahs: 37 },
  { number: 46, name: 'الأحقاف', englishName: 'The Wind-Curved Sandhills', numberOfAyahs: 35 },
  { number: 47, name: 'محمد', englishName: 'Muhammad', numberOfAyahs: 38 },
  { number: 48, name: 'الفتح', englishName: 'The Victory', numberOfAyahs: 29 },
  { number: 49, name: 'الحجرات', englishName: 'The Rooms', numberOfAyahs: 18 },
  { number: 50, name: 'ق', englishName: 'Qaf', numberOfAyahs: 45 },
  { number: 51, name: 'الذاريات', englishName: 'The Winnowing Winds', numberOfAyahs: 60 },
  { number: 52, name: 'الطور', englishName: 'The Mount', numberOfAyahs: 49 },
  { number: 53, name: 'النجم', englishName: 'The Star', numberOfAyahs: 62 },
  { number: 54, name: 'القمر', englishName: 'The Moon', numberOfAyahs: 55 },
  { number: 55, name: 'الرحمن', englishName: 'The Beneficent', numberOfAyahs: 78 },
  { number: 56, name: 'الواقعة', englishName: 'The Event', numberOfAyahs: 96 },
  { number: 57, name: 'الحديد', englishName: 'The Iron', numberOfAyahs: 29 },
  { number: 58, name: 'المجادلة', englishName: 'The Pleading Woman', numberOfAyahs: 22 },
  { number: 59, name: 'الحشر', englishName: 'The Exile', numberOfAyahs: 24 },
  { number: 60, name: 'الممتحنة', englishName: 'She That is to be Examined', numberOfAyahs: 13 },
  { number: 61, name: 'الصف', englishName: 'The Ranks', numberOfAyahs: 14 },
  { number: 62, name: 'الجمعة', englishName: 'Friday', numberOfAyahs: 11 },
  { number: 63, name: 'المنافقون', englishName: 'The Hypocrites', numberOfAyahs: 11 },
  { number: 64, name: 'التغابن', englishName: 'The Mutual Disillusion', numberOfAyahs: 18 },
  { number: 65, name: 'الطلاق', englishName: 'The Divorce', numberOfAyahs: 12 },
  { number: 66, name: 'التحريم', englishName: 'The Prohibition', numberOfAyahs: 12 },
  { number: 67, name: 'الملك', englishName: 'The Sovereignty', numberOfAyahs: 30 },
  { number: 68, name: 'القلم', englishName: 'The Pen', numberOfAyahs: 52 },
  { number: 69, name: 'الحاقة', englishName: 'The Reality', numberOfAyahs: 52 },
  { number: 70, name: 'المعارج', englishName: 'The Ascending Stairways', numberOfAyahs: 44 },
  { number: 71, name: 'نوح', englishName: 'Noah', numberOfAyahs: 28 },
  { number: 72, name: 'الجن', englishName: 'The Jinn', numberOfAyahs: 28 },
  { number: 73, name: 'المزمل', englishName: 'The Enshrouded One', numberOfAyahs: 20 },
  { number: 74, name: 'المدثر', englishName: 'The Cloaked One', numberOfAyahs: 56 },
  { number: 75, name: 'القيامة', englishName: 'The Resurrection', numberOfAyahs: 40 },
  { number: 76, name: 'الإنسان', englishName: 'The Man', numberOfAyahs: 31 },
  { number: 77, name: 'المرسلات', englishName: 'The Emissaries', numberOfAyahs: 50 },
  { number: 78, name: 'النبأ', englishName: 'The Tidings', numberOfAyahs: 40 },
  { number: 79, name: 'النازعات', englishName: 'Those Who Drag Forth', numberOfAyahs: 46 },
  { number: 80, name: 'عبس', englishName: 'He Frowned', numberOfAyahs: 42 },
  { number: 81, name: 'التكوير', englishName: 'The Overthrowing', numberOfAyahs: 29 },
  { number: 82, name: 'الانفطار', englishName: 'The Cleaving', numberOfAyahs: 19 },
  { number: 83, name: 'المطففين', englishName: 'The Defrauding', numberOfAyahs: 36 },
  { number: 84, name: 'الانشقاق', englishName: 'The Splitting Open', numberOfAyahs: 25 },
  { number: 85, name: 'البروج', englishName: 'The Constellations', numberOfAyahs: 22 },
  { number: 86, name: 'الطارق', englishName: 'The Nightcomer', numberOfAyahs: 17 },
  { number: 87, name: 'الأعلى', englishName: 'The Most High', numberOfAyahs: 19 },
  { number: 88, name: 'الغاشية', englishName: 'The Overwhelming', numberOfAyahs: 26 },
  { number: 89, name: 'الفجر', englishName: 'The Dawn', numberOfAyahs: 30 },
  { number: 90, name: 'البلد', englishName: 'The City', numberOfAyahs: 20 },
  { number: 91, name: 'الشمس', englishName: 'The Sun', numberOfAyahs: 15 },
  { number: 92, name: 'الليل', englishName: 'The Night', numberOfAyahs: 21 },
  { number: 93, name: 'الضحى', englishName: 'The Morning Hours', numberOfAyahs: 11 },
  { number: 94, name: 'الشرح', englishName: 'The Relief', numberOfAyahs: 8 },
  { number: 95, name: 'التين', englishName: 'The Fig', numberOfAyahs: 8 },
  { number: 96, name: 'العلق', englishName: 'The Clot', numberOfAyahs: 19 },
  { number: 97, name: 'القدر', englishName: 'The Power', numberOfAyahs: 5 },
  { number: 98, name: 'البينة', englishName: 'The Evidence', numberOfAyahs: 8 },
  { number: 99, name: 'الزلزلة', englishName: 'The Earthquake', numberOfAyahs: 8 },
  { number: 100, name: 'العاديات', englishName: 'The Courser', numberOfAyahs: 11 },
  { number: 101, name: 'القارعة', englishName: 'The Calamity', numberOfAyahs: 11 },
  { number: 102, name: 'التكاثر', englishName: 'The Rivalry in world increase', numberOfAyahs: 8 },
  { number: 103, name: 'العصر', englishName: 'The Declining Day', numberOfAyahs: 3 },
  { number: 104, name: 'الهمزة', englishName: 'The Traducer', numberOfAyahs: 9 },
  { number: 105, name: 'الفيل', englishName: 'The Elephant', numberOfAyahs: 5 },
  { number: 106, name: 'قريش', englishName: 'Quraysh', numberOfAyahs: 4 },
  { number: 107, name: 'الماعون', englishName: 'The Small kindnesses', numberOfAyahs: 7 },
  { number: 108, name: 'الكوثر', englishName: 'The Abundance', numberOfAyahs: 3 },
  { number: 109, name: 'الكافرون', englishName: 'The Disbelievers', numberOfAyahs: 6 },
  { number: 110, name: 'النصر', englishName: 'The Divine Support', numberOfAyahs: 3 },
  { number: 111, name: 'المسد', englishName: 'The Palm Fibre', numberOfAyahs: 5 },
  { number: 112, name: 'الإخلاص', englishName: 'The Sincerity', numberOfAyahs: 4 },
  { number: 113, name: 'الفلق', englishName: 'The Daybreak', numberOfAyahs: 5 },
  { number: 114, name: 'الناس', englishName: 'The Mankind', numberOfAyahs: 6 },
];

export const SurahListScreen = ({ navigation }: any) => {
  const [surahs] = useState<Surah[]>(ALL_SURAHS);
  const { selectedReciter } = useQuranStore();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleSelectSurah = (surah: Surah) => {
    navigation.navigate('Player', { surahNumber: surah.number });
  };

  const renderSurah = ({ item }: { item: Surah }) => (
    <>
      <TouchableOpacity
        style={styles.surahItem}
        onPress={() => handleSelectSurah(item)}
        activeOpacity={0.7}
      >
        <View style={styles.surahNumber}>
          <Text style={styles.surahNumberText}>{item.number}</Text>
        </View>
        <View style={styles.surahInfo}>
          <Text style={styles.surahNameArabic}>{item.name}</Text>
          <Text style={styles.surahNameEnglish}>{item.englishName}</Text>
        </View>
        <Text style={styles.ayahCount}>{item.numberOfAyahs} verses</Text>
      </TouchableOpacity>
      <View style={styles.separator} />
    </>
  );

  return (
    <LinearGradient colors={[colors.Background, colors.Background]} style={styles.container}>
      <Text style={styles.header}>Surahs - {getReciterName(selectedReciter)}</Text>
      <FlatList
        data={surahs}
        renderItem={renderSurah}
        keyExtractor={(item) => item.number.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: 20,
    },
    header: {
      fontSize: 20,
      fontFamily: 'Amiri-Bold',
      color: colors.Primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      marginTop: 8,
      textAlign: 'center',
      transform: [{ translateY: 4 }],
    },
    surahItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      position: 'relative',
      backgroundColor: 'transparent',
    },
    surahNumber: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'transparent',
      borderWidth: 1.25,
      borderColor: colors.Primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    surahNumberText: {
      color: colors.TextPrimary,
      fontFamily: 'Lato-Regular',
      fontWeight: '700',
      fontSize: 14,
    },
    surahInfo: {
      flex: 1,
      marginLeft: 15,
    },
    surahNameArabic: {
      color: colors.Secondary,
      fontSize: 26,
      fontFamily: 'Amiri-Bold',
    },
    surahNameEnglish: {
      color: colors.TextPrimary,
      fontSize: 15,
      marginTop: 4,
      fontFamily: 'Lato-Regular',
      fontWeight: '700',
    },
    ayahCount: {
      color: colors.Primary,
      fontSize: 12,
      fontFamily: 'Lato-Regular',
      marginRight: 5,
    },
    separator: {
      height: 1,
      backgroundColor: colors.Border,
      marginHorizontal: 20,
    },
  });
