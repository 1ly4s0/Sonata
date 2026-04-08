import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootState } from '../store';
import { Song } from '../types';
import { Colors, Spacing } from '../theme';
import SongItem from '../components/SongItem';
import SongOptionsModal from '../components/SongOptionsModal';
import { useTranslation } from 'react-i18next';
import { playSong } from '../services/TrackPlayerService';
import { addToRecentlyPlayed } from '../store/slices/playlistSlice';

export default function PlaylistDetailScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const route = useRoute<any>();
  const { playlistId } = route.params;
  const { playlists } = useSelector((s: RootState) => s.playlist);
  const { songs } = useSelector((s: RootState) => s.library);
  const { currentTrack } = useSelector((s: RootState) => s.player);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const { t } = useTranslation();

  const playlist = playlists.find(p => p.id === playlistId);
  const playlistSongs = playlist
    ? playlist.songIds.map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[]
    : [];

  const handlePlay = useCallback(async (song: Song) => {
    const idx = playlistSongs.indexOf(song);
    await playSong(playlistSongs, idx >= 0 ? idx : 0);
    dispatch(addToRecentlyPlayed(song.id));
    navigation.navigate('NowPlaying');
  }, [playlistSongs, dispatch, navigation]);

  if (!playlist) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={{ color: Colors.text, padding: 20 }}>{t('playlist_not_found')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{playlist.name}</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={playlistSongs}
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
            <Icon name="playlist-music-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{t('playlist_empty')}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomColor: Colors.separator,
    borderBottomWidth: 1,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, marginTop: 12 },
});
