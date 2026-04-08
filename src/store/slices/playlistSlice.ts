import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Playlist } from '../../types';
import {
  savePlaylists,
  saveFavorites,
  saveRecentlyPlayed,
  saveRecentQueries,
} from '../../utils/storage';

interface PlaylistState {
  playlists: Playlist[];
  favorites: string[];
  recentlyPlayed: string[];
  recentQueries: string[];
}

const initialState: PlaylistState = {
  playlists: [],
  favorites: [],
  recentlyPlayed: [],
  recentQueries: [],
};

const MAX_RECENT = 50;

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    loadPersistedData(
      state,
      action: PayloadAction<{
        playlists: Playlist[];
        favorites: string[];
        recentlyPlayed: string[];
        recentQueries?: string[];
      }>
    ) {
      state.playlists = action.payload.playlists;
      state.favorites = action.payload.favorites;
      state.recentlyPlayed = action.payload.recentlyPlayed;
      if (action.payload.recentQueries) {
        state.recentQueries = action.payload.recentQueries;
      }
    },
    createPlaylist(state, action: PayloadAction<{ name: string }>) {
      const playlist: Playlist = {
        id: Date.now().toString(),
        name: action.payload.name,
        songIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      state.playlists.push(playlist);
      savePlaylists(state.playlists);
    },
    deletePlaylist(state, action: PayloadAction<string>) {
      state.playlists = state.playlists.filter(p => p.id !== action.payload);
      savePlaylists(state.playlists);
    },
    renamePlaylist(
      state,
      action: PayloadAction<{ id: string; name: string }>
    ) {
      const playlist = state.playlists.find(p => p.id === action.payload.id);
      if (playlist) {
        playlist.name = action.payload.name;
        playlist.updatedAt = Date.now();
      }
      savePlaylists(state.playlists);
    },
    addToPlaylist(
      state,
      action: PayloadAction<{ playlistId: string; songId: string }>
    ) {
      const playlist = state.playlists.find(
        p => p.id === action.payload.playlistId
      );
      if (playlist && !playlist.songIds.includes(action.payload.songId)) {
        playlist.songIds.push(action.payload.songId);
        playlist.updatedAt = Date.now();
      }
      savePlaylists(state.playlists);
    },
    removeFromPlaylist(
      state,
      action: PayloadAction<{ playlistId: string; songId: string }>
    ) {
      const playlist = state.playlists.find(
        p => p.id === action.payload.playlistId
      );
      if (playlist) {
        playlist.songIds = playlist.songIds.filter(
          id => id !== action.payload.songId
        );
        playlist.updatedAt = Date.now();
      }
      savePlaylists(state.playlists);
    },
    toggleFavorite(state, action: PayloadAction<string>) {
      const idx = state.favorites.indexOf(action.payload);
      if (idx >= 0) {
        state.favorites.splice(idx, 1);
      } else {
        state.favorites.unshift(action.payload);
      }
      saveFavorites(state.favorites);
    },
    addToRecentlyPlayed(state, action: PayloadAction<string>) {
      state.recentlyPlayed = state.recentlyPlayed.filter(
        id => id !== action.payload
      );
      state.recentlyPlayed.unshift(action.payload);
      if (state.recentlyPlayed.length > MAX_RECENT) {
        state.recentlyPlayed = state.recentlyPlayed.slice(0, MAX_RECENT);
      }
      saveRecentlyPlayed(state.recentlyPlayed);
    },
    clearRecentlyPlayed(state) {
      state.recentlyPlayed = [];
      saveRecentlyPlayed([]);
    },
    addRecentQuery(state, action: PayloadAction<string>) {
      const q = action.payload.trim();
      if (!q) return;
      state.recentQueries = state.recentQueries.filter(s => s.toLowerCase() !== q.toLowerCase());
      state.recentQueries.unshift(q);
      if (state.recentQueries.length > 10) {
        state.recentQueries = state.recentQueries.slice(0, 10);
      }
      saveRecentQueries(state.recentQueries);
    },
    removeRecentQuery(state, action: PayloadAction<string>) {
      state.recentQueries = state.recentQueries.filter(s => s !== action.payload);
      saveRecentQueries(state.recentQueries);
    },
    clearRecentQueries(state) {
      state.recentQueries = [];
      saveRecentQueries([]);
    },
  },
});

export const {
  loadPersistedData,
  createPlaylist,
  deletePlaylist,
  renamePlaylist,
  addToPlaylist,
  removeFromPlaylist,
  toggleFavorite,
  addToRecentlyPlayed,
  clearRecentlyPlayed,
  addRecentQuery,
  removeRecentQuery,
  clearRecentQueries,
} = playlistSlice.actions;

export default playlistSlice.reducer;
