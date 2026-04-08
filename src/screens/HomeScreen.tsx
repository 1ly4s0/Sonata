import React, { useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  StatusBar,
  SectionList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { scanLibrary, addSongsFromPicker } from '../store/slices/librarySlice';
import { addToRecentlyPlayed, loadPersistedData } from '../store/slices/playlistSlice';
import { Song, LibraryTab } from '../types';
import { Colors, Spacing } from '../theme';
import SongItem from '../components/SongItem';
import SongOptionsModal from '../components/SongOptionsModal';
import { useTranslation } from 'react-i18next';
import { playSong } from '../services/TrackPlayerService';
import { pickAudioFiles } from '../services/MediaScanner';
import { logPlaySong, logShuffle, logScreen } from '../services/analytics';
import {
  loadPlaylists,
  loadFavorites,
  loadRecentlyPlayed,
  loadRecentQueries,
  loadLibraryFilters,
  saveLibraryFilters,
  loadCompactView,
  saveCompactView,
  SortMode,
  FilterMode,
} from '../utils/storage';
import { MINI_PLAYER_HEIGHT } from '../components/MiniPlayer';
import Tooltip from '../components/Tooltip';
import TrackPlayer from 'react-native-track-player';

type Section = {
  title: string;
  data: Song[];
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { songs, artists, albums, folders, loading } = useSelector(
    (s: RootState) => s.library
  );
  const { favorites } = useSelector((s: RootState) => s.playlist);
  const { currentTrack } = useSelector((s: RootState) => s.player);

  const [tab, setTab] = useState<LibraryTab>('song');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('title_asc');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [compact, setCompact] = useState(false);
  const [cardsCollapsed, setCardsCollapsed] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    logScreen('Home').catch(() => {});
    loadPersisted();
    requestPermissionAndScan();
    // 30% chance to display a random contextual tooltip after 2s
    if (Math.random() < 0.3) {
      const tips = ['tooltip_shuffle', 'tooltip_sort'];
      const pick = tips[Math.floor(Math.random() * tips.length)];
      const timer = setTimeout(() => setActiveTooltip(pick), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const loadPersisted = async () => {
    const [playlists, favs, recent, filters, queries, savedCompact] = await Promise.all([
      loadPlaylists(),
      loadFavorites(),
      loadRecentlyPlayed(),
      loadLibraryFilters(),
      loadRecentQueries(),
      loadCompactView(),
    ]);
    dispatch(
      loadPersistedData({ playlists, favorites: favs, recentlyPlayed: recent, recentQueries: queries })
    );
    setSortMode(filters.sort);
    setFilterMode(filters.filter);
    setCompact(savedCompact);
    const collapsed = await AsyncStorage.getItem('@sonata/cards_collapsed');
    if (collapsed === '1') setCardsCollapsed(true);
  };

  const requestPermissionAndScan = async () => {
    if (Platform.OS !== 'android') return;
    try {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          {
            title: t('perm_title'),
            message: t('perm_msg'),
            buttonPositive: t('perm_allow'),
            buttonNegative: t('perm_deny'),
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          dispatch(scanLibrary());
        }
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: t('perm_title'),
            message: t('perm_msg'),
            buttonPositive: t('perm_allow'),
            buttonNegative: t('perm_deny'),
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          dispatch(scanLibrary());
        }
      }
    } catch (e) {
      console.error('Permission error:', e);
    }
  };

  const handlePlaySong = useCallback(
    async (song: Song, songList: Song[]) => {
      const idx = songList.findIndex(s => s.id === song.id);
      await playSong(songList, idx >= 0 ? idx : 0);
      dispatch(addToRecentlyPlayed(song.id));
      logPlaySong(song.title, song.artist).catch(() => {});
    },
    [dispatch]
  );

  const handleShuffle = useCallback(async () => {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    await playSong(shuffled, 0);
    logShuffle().catch(() => {});
  }, [songs]);

  const updateSort = useCallback((s: SortMode) => {
    setSortMode(s);
    saveLibraryFilters({ sort: s, filter: filterMode });
  }, [filterMode]);

  const updateFilter = useCallback((f: FilterMode) => {
    setFilterMode(f);
    saveLibraryFilters({ sort: sortMode, filter: f });
  }, [sortMode]);

  const handleImport = useCallback(async () => {
    try {
      const picked = await pickAudioFiles();
      if (picked.length > 0) {
        dispatch(addSongsFromPicker(picked));
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }, [dispatch]);

  // Apply filter + sort to produce the displayed song list
  const displayedSongs = useMemo(() => {
    let list = [...songs];

    // Filter
    if (filterMode === 'favorites') {
      list = list.filter(s => favorites.includes(s.id));
    }

    // Sort
    switch (sortMode) {
      case 'title_asc':
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'artist':
        list.sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));
        break;
      case 'album':
        list.sort((a, b) => a.album.localeCompare(b.album) || a.title.localeCompare(b.title));
        break;
      case 'recent':
        list.sort((a, b) => ((b.dateAdded ?? 0) - (a.dateAdded ?? 0)));
        break;
      case 'duration':
        list.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        break;
    }
    return list;
  }, [songs, sortMode, filterMode, favorites]);

  const songSections: Section[] = useMemo(() => {
    // Only group A-Z for alphabetical sort
    if (sortMode !== 'title_asc' && sortMode !== 'title_desc') {
      return [{ title: '', data: displayedSongs }];
    }
    const groups: Record<string, Song[]> = {};
    displayedSongs.forEach(s => {
      const letter = /[A-Z]/i.test(s.title[0])
        ? s.title[0].toUpperCase()
        : '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(s);
    });
    const sorted = Object.keys(groups).sort();
    if (sortMode === 'title_desc') sorted.reverse();
    return sorted.map(k => ({ title: k, data: groups[k] }));
  }, [displayedSongs, sortMode]);

  const renderSectionHeader = ({ section }: { section: Section }) => {
    if (!section.title) return null;
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
      </View>
    );
  };

  const renderSong = ({ item }: { item: Song }) => (
    <SongItem
      song={item}
      isPlaying={currentTrack?.id === item.id}
      onPress={() => handlePlaySong(item, displayedSongs)}
      onOptions={() => {
        setSelectedSong(item);
        setShowOptions(true);
      }}
      compact={compact}
    />
  );

  const renderArtist = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigation.navigate('ArtistDetail', { artistId: item.id })}
    >
      <View style={styles.listItemIcon}>
        <Icon name="account-music" size={24} color={Colors.textSecondary} />
      </View>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
        <Text style={styles.listItemSub}>{t('home_songs_count', { count: item.songCount })}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  const renderAlbum = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigation.navigate('AlbumDetail', { albumId: item.id })}
    >
      <View style={styles.listItemIcon}>
        <Icon name="album" size={24} color={Colors.textSecondary} />
      </View>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
        <Text style={styles.listItemSub}>{item.artist} • {t('home_songs_count', { count: item.songCount })}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  const renderFolder = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigation.navigate('FolderDetail', { folderId: item.id })}
    >
      <View style={styles.listItemIcon}>
        <Icon name="folder-music" size={24} color={Colors.textSecondary} />
      </View>
      <View style={styles.listItemInfo}>
        <Text style={styles.listItemTitle}>{item.name}</Text>
        <Text style={styles.listItemSub}>{t('home_songs_count', { count: item.songCount })}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('home_title')}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('About')}
            style={styles.headerIcon}
          >
            <Icon name="information-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={styles.headerIcon}
          >
            <Icon name="magnify" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('NowPlaying')}
            style={styles.headerIcon}
          >
            <Icon name="playlist-play" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category buttons */}
      {!cardsCollapsed && (
        <View style={styles.categoryRow}>
          <TouchableOpacity
            style={styles.categoryBtn}
            onPress={() => navigation.navigate('Favorites')}
          >
            <LinearGradient
              colors={[Colors.favStart, Colors.favEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryGradient}
            >
              <Icon name="heart" size={26} color="#fff" />
              <Text style={styles.categoryLabel}>{t('home_category_favorites')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryBtn}
            onPress={() => navigation.navigate('Playlists')}
          >
            <LinearGradient
              colors={[Colors.playlistStart, Colors.playlistEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryGradient}
            >
              <Icon name="playlist-play" size={26} color="#fff" />
              <Text style={styles.categoryLabel}>{t('home_category_playlist')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryBtn}
            onPress={() => navigation.navigate('RecentlyPlayed')}
          >
            <LinearGradient
              colors={[Colors.recentStart, Colors.recentEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryGradient}
            >
              <Icon name="history" size={26} color="#fff" />
              <Text style={styles.categoryLabel}>{t('home_category_recent')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* All section header */}
      <View style={styles.allHeader}>
        <Text style={styles.allHeaderText}>{t('home_all')}</Text>
        <View style={styles.allHeaderRight}>
          <TouchableOpacity
            onPress={() => {
              const next = !cardsCollapsed;
              setCardsCollapsed(next);
              AsyncStorage.setItem('@sonata/cards_collapsed', next ? '1' : '0');
            }}
            style={styles.collapseBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon
              name={cardsCollapsed ? 'chevron-down' : 'chevron-up'}
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleImport} style={styles.importRow}>
            <Text style={styles.importText}>{t('home_import')}</Text>
            <Icon name="chevron-right" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['song', 'artist', 'album', 'folder'] as LibraryTab[]).map(tabKey => (
          <TouchableOpacity
            key={tabKey}
            style={[styles.tabItem, tab === tabKey && styles.tabItemActive]}
            onPress={() => setTab(tabKey)}
          >
            <Text
              style={[styles.tabText, tab === tabKey && styles.tabTextActive]}
            >
              {t(`home_tab_${tabKey}`)}
            </Text>
            {tab === tabKey && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('home_scanning')}</Text>
        </View>
      ) : songs.length === 0 && tab === 'song' ? (
        <View style={styles.center}>
          <Icon name="music-note-off" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>{t('home_empty_title')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('home_empty_subtitle')}
          </Text>
          <TouchableOpacity style={styles.scanBtn} onPress={requestPermissionAndScan}>
            <Text style={styles.scanBtnText}>{t('home_scan_btn')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {tab === 'song' && (
            <>
              {/* Shuffle */}
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={styles.shuffleRow}
                  onPress={handleShuffle}
                >
                  <View style={styles.shufflePlayBtn}>
                    <Icon name="play" size={14} color="#fff" />
                  </View>
                  <Text style={styles.shuffleText}>{t('home_shuffle')}</Text>
                  <View style={styles.flex} />
                  <Text style={styles.countText}>{t('home_songs_count', { count: displayedSongs.length })}</Text>
                </TouchableOpacity>
                <Tooltip
                  text={t(activeTooltip ?? 'tooltip_shuffle')}
                  visible={activeTooltip !== null}
                  onDismiss={() => setActiveTooltip(null)}
                  position="bottom"
                />
              </View>

              {/* Filter / Sort chips + density toggle */}
              <View style={styles.filterRow}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterScroll}
                  contentContainerStyle={styles.filterContent}
                >
                {([
                  { key: 'title_asc', label: t('filter_az') },
                  { key: 'title_desc', label: t('filter_za') },
                  { key: 'artist', label: t('filter_artist') },
                  { key: 'album', label: t('filter_album') },
                  { key: 'recent', label: t('filter_recent'), icon: 'clock-outline' },
                  { key: 'duration', label: t('filter_duration'), icon: 'timer-outline' },
                ] as { key: SortMode; label: string; icon?: string }[]).map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.chip, sortMode === opt.key && styles.chipActive]}
                    onPress={() => updateSort(opt.key)}
                  >
                    {opt.icon && (
                      <Icon
                        name={opt.icon}
                        size={13}
                        color={sortMode === opt.key ? '#fff' : Colors.icon}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text style={[styles.chipText, sortMode === opt.key && styles.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <View style={styles.chipDivider} />
                <TouchableOpacity
                  style={[styles.chip, filterMode === 'favorites' && styles.chipActive]}
                  onPress={() => updateFilter(filterMode === 'favorites' ? 'all' : 'favorites')}
                >
                  <Icon
                    name="heart"
                    size={13}
                    color={filterMode === 'favorites' ? '#fff' : Colors.icon}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.chipText, filterMode === 'favorites' && styles.chipTextActive]}>
                    {t('filter_favorites')}
                  </Text>
                </TouchableOpacity>
                </ScrollView>
                <TouchableOpacity
                  style={styles.densityBtn}
                  onPress={() => {
                    const next = !compact;
                    setCompact(next);
                    saveCompactView(next);
                  }}
                >
                  <Icon
                    name={compact ? 'view-sequential-outline' : 'view-compact-outline'}
                    size={18}
                    color={compact ? Colors.primary : Colors.icon}
                  />
                </TouchableOpacity>
              </View>

              <SectionList
                sections={songSections}
                keyExtractor={item => item.id}
                renderItem={renderSong}
                renderSectionHeader={renderSectionHeader}
                stickySectionHeadersEnabled={sortMode === 'title_asc' || sortMode === 'title_desc'}
                contentContainerStyle={{ paddingBottom: MINI_PLAYER_HEIGHT + 24 }}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
          {tab === 'artist' && (
            <FlatList
              data={artists}
              keyExtractor={item => item.id}
              renderItem={renderArtist}
              contentContainerStyle={{ paddingBottom: MINI_PLAYER_HEIGHT + 24 }}
              showsVerticalScrollIndicator={false}
            />
          )}
          {tab === 'album' && (
            <FlatList
              data={albums}
              keyExtractor={item => item.id}
              renderItem={renderAlbum}
              contentContainerStyle={{ paddingBottom: MINI_PLAYER_HEIGHT + 24 }}
              showsVerticalScrollIndicator={false}
            />
          )}
          {tab === 'folder' && (
            <FlatList
              data={folders}
              keyExtractor={item => item.id}
              renderItem={renderFolder}
              contentContainerStyle={{ paddingBottom: MINI_PLAYER_HEIGHT + 24 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
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
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginLeft: Spacing.md },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 10,
  },
  categoryBtn: {
    flex: 1,
  },
  categoryGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  allHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginTop: 4,
  },
  allHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapseBtn: {
    padding: 2,
  },
  allHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  importRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  importText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    borderBottomColor: Colors.separator,
    borderBottomWidth: 1,
  },
  tabItem: {
    paddingVertical: 10,
    marginRight: 20,
    position: 'relative',
  },
  tabItemActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.tabInactive,
  },
  tabTextActive: {
    color: Colors.tabActive,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.tabActive,
    borderRadius: 1,
  },
  shuffleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderBottomColor: Colors.separator,
    borderBottomWidth: 1,
  },
  shufflePlayBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  shuffleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  countText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: Colors.separator,
    borderBottomWidth: 1,
    backgroundColor: Colors.background,
  },
  filterScroll: {
    height: 56,
    backgroundColor: Colors.background,
    flex: 1,
  },
  densityBtn: {
    width: 44,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: Colors.separator,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  chipDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.separator,
    marginHorizontal: 2,
  },
  sectionHeader: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
    borderBottomColor: Colors.separator,
    borderBottomWidth: 1,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomColor: Colors.separator,
    borderBottomWidth: 1,
  },
  listItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  listItemInfo: { flex: 1 },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  listItemSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  scanBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  scanBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
