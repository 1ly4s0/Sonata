import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store';
import { Song } from '../types';
import { Colors, Spacing } from '../theme';
import SongItem from '../components/SongItem';
import SongOptionsModal from '../components/SongOptionsModal';
import { useTranslation } from 'react-i18next';
import { playSong } from '../services/TrackPlayerService';
import { addToRecentlyPlayed } from '../store/slices/playlistSlice';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { favorites } = useSelector((s: RootState) => s.playlist);
  const { songs } = useSelector((s: RootState) => s.library);
  const { currentTrack } = useSelector((s: RootState) => s.player);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const { t } = useTranslation();

  const favSongs = favorites
    .map(id => songs.find(s => s.id === id))
    .filter(Boolean) as Song[];

  const handlePlay = useCallback(async (song: Song) => {
    const idx = favSongs.indexOf(song);
    await playSong(favSongs, idx >= 0 ? idx : 0);
    dispatch(addToRecentlyPlayed(song.id));
  }, [favSongs, dispatch]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('favorites_title')}</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={favSongs}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SongItem
            song={item}
            isPlaying={currentTrack?.id === item.id}
            onPress={() => handlePlay(item)}
            onOptions={() => { setSelectedSong(item); setShowOptions(true); }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Icon name="heart-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('favorites_empty_title')}</Text>
            <Text style={styles.emptySubtitle}>{t('favorites_empty_subtitle')}</Text>
          </View>
        }
      />
      <SongOptionsModal visible={showOptions} song={selectedSong} onClose={() => setShowOptions(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomColor: Colors.separator, borderBottomWidth: 1,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 8, textAlign: 'center' },
});
