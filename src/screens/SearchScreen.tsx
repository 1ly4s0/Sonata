import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
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
import { logPlaySong, logSearch, logScreen } from '../services/analytics';
import {
  addToRecentlyPlayed,
  addRecentQuery,
  removeRecentQuery,
  clearRecentQueries,
} from '../store/slices/playlistSlice';

export default function SearchScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { songs, artists, albums } = useSelector((s: RootState) => s.library);
  const { currentTrack } = useSelector((s: RootState) => s.player);
  const { recentlyPlayed, recentQueries } = useSelector((s: RootState) => s.playlist);

  const [query, setQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const { t } = useTranslation();

  // Recently played songs (up to 10)
  const recentSongs = useMemo(
    () => recentlyPlayed.slice(0, 10).map(id => songs.find(s => s.id === id)).filter(Boolean) as Song[],
    [recentlyPlayed, songs]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return songs.filter(
      s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q)
    );
  }, [query, songs]);

  const handlePlay = useCallback(
    async (song: Song, pool?: Song[]) => {
      const list = pool ?? (results.length > 0 ? results : songs);
      const idx = list.indexOf(song);
      await playSong(list, idx >= 0 ? idx : 0);
      dispatch(addToRecentlyPlayed(song.id));
      if (query.trim()) {
        dispatch(addRecentQuery(query.trim()));
        logSearch(query.trim()).catch(() => {});
      }
      logPlaySong(song.title, song.artist).catch(() => {});
    },
    [results, songs, query, dispatch]
  );

  const handleQueryChipPress = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const hasRecentData = recentQueries.length > 0 || recentSongs.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('search_title')}</Text>
      </View>
      <View style={styles.searchBox}>
        <Icon name="magnify" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.input}
          placeholder={t('search_placeholder')}
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => {
            if (query.trim()) dispatch(addRecentQuery(query.trim()));
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Icon name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Empty query: show recent panel ── */}
      {query.trim() === '' ? (
        !hasRecentData ? (
          <View style={styles.center}>
            <Icon name="magnify" size={64} color={Colors.textMuted} />
            <Text style={styles.hintText}>{t('search_hint')}</Text>
          </View>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Recent search queries */}
            {recentQueries.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>{t('search_recent_queries')}</Text>
                  <TouchableOpacity onPress={() => dispatch(clearRecentQueries())}>
                    <Text style={styles.clearAll}>{t('search_clear_all')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.queryChipRow}>
                  {recentQueries.map(q => (
                    <TouchableOpacity
                      key={q}
                      style={styles.queryChip}
                      onPress={() => handleQueryChipPress(q)}
                    >
                      <Icon name="history" size={14} color={Colors.textSecondary} style={styles.chipIcon} />
                      <Text style={styles.queryChipText} numberOfLines={1}>{q}</Text>
                      <TouchableOpacity
                        onPress={() => dispatch(removeRecentQuery(q))}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.chipClose}
                      >
                        <Icon name="close" size={13} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Recently played songs */}
            {recentSongs.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>{t('search_recent_songs')}</Text>
                </View>
                {recentSongs.map(item => (
                  <SongItem
                    key={item.id}
                    song={item}
                    isPlaying={currentTrack?.id === item.id}
                    onPress={() => handlePlay(item, recentSongs)}
                    onOptions={() => { setSelectedSong(item); setShowOptions(true); }}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        )
      ) : results.length === 0 ? (
        /* ── No results ── */
        <View style={styles.center}>
          <Icon name="music-note-off" size={48} color={Colors.textMuted} />
          <Text style={styles.hintText}>{t('search_no_results', { query })}</Text>
        </View>
      ) : (
        /* ── Results list ── */
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <SongItem
              song={item}
              isPlaying={currentTrack?.id === item.id}
              onPress={() => handlePlay(item)}
              onOptions={() => {
                setSelectedSong(item);
                setShowOptions(true);
              }}
            />
          )}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <SongOptionsModal
        visible={showOptions}
        song={selectedSong}
        onClose={() => setShowOptions(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  // Recent panel
  section: {
    marginTop: 8,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  clearAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  queryChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: 8,
    paddingBottom: 8,
  },
  queryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    maxWidth: 200,
  },
  chipIcon: {
    marginRight: 5,
  },
  queryChipText: {
    fontSize: 14,
    color: Colors.text,
    flexShrink: 1,
    fontWeight: '500',
  },
  chipClose: {
    marginLeft: 6,
  },
});
