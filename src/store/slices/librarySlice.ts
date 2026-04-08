import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Song, Artist, Album, Folder } from '../../types';
import { NativeModules } from 'react-native';

const { MediaScanner } = NativeModules;

interface LibraryState {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  folders: Folder[];
  loading: boolean;
  error: string | null;
  lastScan: number;
}

const initialState: LibraryState = {
  songs: [],
  artists: [],
  albums: [],
  folders: [],
  loading: false,
  error: null,
  lastScan: 0,
};

function buildArtists(songs: Song[]): Artist[] {
  const map = new Map<string, Artist>();
  songs.forEach(song => {
    const key = song.artist.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: song.artist,
        songCount: 0,
        songs: [],
      });
    }
    const a = map.get(key)!;
    a.songs.push(song);
    a.songCount++;
  });
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function buildAlbums(songs: Song[]): Album[] {
  const map = new Map<string, Album>();
  songs.forEach(song => {
    const key = `${song.album.toLowerCase()}||${song.artist.toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: song.album,
        artist: song.artist,
        albumArt: song.albumArt,
        songCount: 0,
        songs: [],
      });
    }
    const a = map.get(key)!;
    a.songs.push(song);
    a.songCount++;
    if (!a.albumArt && song.albumArt) a.albumArt = song.albumArt;
  });
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function buildFolders(songs: Song[]): Folder[] {
  const map = new Map<string, Folder>();
  songs.forEach(song => {
    const folderPath = song.folder || song.path.replace(/\/[^/]+$/, '');
    const folderName = folderPath.split('/').pop() || folderPath;
    const key = folderPath;
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: folderName,
        path: folderPath,
        songCount: 0,
        songs: [],
      });
    }
    const f = map.get(key)!;
    f.songs.push(song);
    f.songCount++;
  });
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export const scanLibrary = createAsyncThunk(
  'library/scan',
  async (_, { rejectWithValue }) => {
    try {
      if (!MediaScanner) {
        throw new Error('MediaScanner native module not available');
      }
      const songs: Song[] = await MediaScanner.getAllTracks();
      return songs;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Scan failed');
    }
  }
);

export const addSongsFromPicker = createAsyncThunk(
  'library/addFromPicker',
  async (songs: Song[], { getState, rejectWithValue }) => {
    try {
      const state = (getState() as any).library as LibraryState;
      const existingIds = new Set(state.songs.map(s => s.id));
      const newSongs = songs.filter(s => !existingIds.has(s.id));
      return [...state.songs, ...newSongs];
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    clearLibrary(state) {
      state.songs = [];
      state.artists = [];
      state.albums = [];
      state.folders = [];
      state.error = null;
    },
    setSongs(state, action: PayloadAction<Song[]>) {
      state.songs = action.payload;
      state.artists = buildArtists(action.payload);
      state.albums = buildAlbums(action.payload);
      state.folders = buildFolders(action.payload);
      state.lastScan = Date.now();
    },
  },
  extraReducers: builder => {
    builder
      .addCase(scanLibrary.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scanLibrary.fulfilled, (state, action) => {
        state.loading = false;
        state.songs = action.payload;
        state.artists = buildArtists(action.payload);
        state.albums = buildAlbums(action.payload);
        state.folders = buildFolders(action.payload);
        state.lastScan = Date.now();
      })
      .addCase(scanLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addSongsFromPicker.fulfilled, (state, action) => {
        state.songs = action.payload;
        state.artists = buildArtists(action.payload);
        state.albums = buildAlbums(action.payload);
        state.folders = buildFolders(action.payload);
      });
  },
});

export const { clearLibrary, setSongs } = librarySlice.actions;
export default librarySlice.reducer;
