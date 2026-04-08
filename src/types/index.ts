export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
  duration: number; // in seconds
  path: string;     // file:// URI
  folder: string;
  displayName?: string;
  dateAdded?: number; // unix timestamp in seconds (from MediaStore)
}

export interface Artist {
  id: string;
  name: string;
  songCount: number;
  songs: Song[];
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  albumArt?: string;
  songCount: number;
  songs: Song[];
}

export interface Folder {
  id: string;
  name: string;
  path: string;
  songCount: number;
  songs: Song[];
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
  updatedAt: number;
  coverArt?: string;
}

export type RepeatMode = 'none' | 'track' | 'queue';

export type SortBy = 'title' | 'artist' | 'album' | 'duration';

export type LibraryTab = 'song' | 'artist' | 'album' | 'folder';

export interface RootStackParamList {
  MainTabs: undefined;
  NowPlaying: undefined;
  PlaylistDetail: { playlistId: string };
  Favorites: undefined;
  RecentlyPlayed: undefined;
  ArtistDetail: { artistId: string };
  AlbumDetail: { albumId: string };
  FolderDetail: { folderId: string };
  Import: undefined;
  About: undefined;
  Terms: undefined;
}
