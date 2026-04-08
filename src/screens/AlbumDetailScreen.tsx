import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
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

export default function AlbumDetailScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const route = useRoute<any>();
  const { albumId } = route.params;
  const { albums } = useSelector((s: RootState) => s.library);
  const { currentTrack } = useSelector((s: RootState) => s.player);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const { t } = useTranslation();

  const album = albums.find(a => a.id === albumId);

  const handlePlay = useCallback(async (song: Song) => {
    if (!album) return;
    const idx = album.songs.indexOf(song);
    await playSong(album.songs, idx >= 0 ? idx : 0);
    dispatch(addToRecentlyPlayed(song.id));
  }, [album, dispatch]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{album?.name || t('common_album_fallback')}</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={album?.songs || []}
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
});
