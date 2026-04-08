import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist, Song } from '../types';

const KEYS = {
  PLAYLISTS: '@sonata/playlists',
  FAVORITES: '@sonata/favorites',
  RECENTLY_PLAYED: '@sonata/recently_played',
  RECENT_QUERIES: '@sonata/recent_queries',
  QUEUE: '@sonata/queue',
  QUEUE_INDEX: '@sonata/queue_index',
  SHUFFLE: '@sonata/shuffle',
  REPEAT: '@sonata/repeat',
  LAST_SCAN: '@sonata/last_scan',
  LIBRARY_FILTERS: '@sonata/library_filters',
  COMPACT_VIEW: '@sonata/compact_view',
};

export type SortMode = 'title_asc' | 'title_desc' | 'artist' | 'album' | 'recent' | 'duration';
export type FilterMode = 'all' | 'favorites';

export interface LibraryFilters {
  sort: SortMode;
  filter: FilterMode;
}

const DEFAULT_FILTERS: LibraryFilters = { sort: 'title_asc', filter: 'all' };

export async function saveLibraryFilters(filters: LibraryFilters): Promise<void> {
  await AsyncStorage.setItem(KEYS.LIBRARY_FILTERS, JSON.stringify(filters));
}

export async function loadLibraryFilters(): Promise<LibraryFilters> {
  const data = await AsyncStorage.getItem(KEYS.LIBRARY_FILTERS);
  return data ? JSON.parse(data) : DEFAULT_FILTERS;
}

export async function saveCompactView(compact: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.COMPACT_VIEW, compact ? '1' : '0');
}

export async function loadCompactView(): Promise<boolean> {
  const data = await AsyncStorage.getItem(KEYS.COMPACT_VIEW);
  return data === '1';
}

export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
}

export async function loadPlaylists(): Promise<Playlist[]> {
  const data = await AsyncStorage.getItem(KEYS.PLAYLISTS);
  return data ? JSON.parse(data) : [];
}

export async function saveFavorites(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(ids));
}

export async function loadFavorites(): Promise<string[]> {
  const data = await AsyncStorage.getItem(KEYS.FAVORITES);
  return data ? JSON.parse(data) : [];
}

export async function saveRecentlyPlayed(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.RECENTLY_PLAYED, JSON.stringify(ids));
}

export async function loadRecentlyPlayed(): Promise<string[]> {
  const data = await AsyncStorage.getItem(KEYS.RECENTLY_PLAYED);
  return data ? JSON.parse(data) : [];
}

export async function saveRecentQueries(queries: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.RECENT_QUERIES, JSON.stringify(queries));
}

export async function loadRecentQueries(): Promise<string[]> {
  const data = await AsyncStorage.getItem(KEYS.RECENT_QUERIES);
  return data ? JSON.parse(data) : [];
}

export async function saveQueue(queue: Song[], index: number): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.QUEUE, JSON.stringify(queue)],
    [KEYS.QUEUE_INDEX, String(index)],
  ]);
}

export async function loadQueue(): Promise<{ queue: Song[]; index: number }> {
  const [queueData, indexData] = await AsyncStorage.multiGet([KEYS.QUEUE, KEYS.QUEUE_INDEX]);
  return {
    queue: queueData[1] ? JSON.parse(queueData[1]) : [],
    index: indexData[1] ? parseInt(indexData[1]) : 0,
  };
}

export async function saveLastScan(timestamp: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.LAST_SCAN, String(timestamp));
}

export async function loadLastScan(): Promise<number> {
  const data = await AsyncStorage.getItem(KEYS.LAST_SCAN);
  return data ? parseInt(data) : 0;
}
