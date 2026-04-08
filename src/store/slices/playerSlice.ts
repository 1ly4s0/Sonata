import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Song, RepeatMode } from '../../types';

interface PlayerState {
  currentTrack: Song | null;
  isPlaying: boolean;
  queue: Song[];
  queueIndex: number;
  shuffleMode: boolean;
  repeatMode: RepeatMode;
  position: number;
  duration: number;
  isSetup: boolean;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  queue: [],
  queueIndex: 0,
  shuffleMode: false,
  repeatMode: 'none',
  position: 0,
  duration: 0,
  isSetup: false,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack(state, action: PayloadAction<Song | null>) {
      state.currentTrack = action.payload;
    },
    setIsPlaying(state, action: PayloadAction<boolean>) {
      state.isPlaying = action.payload;
    },
    setQueue(state, action: PayloadAction<{ queue: Song[]; index: number }>) {
      state.queue = action.payload.queue;
      state.queueIndex = action.payload.index;
      state.currentTrack = action.payload.queue[action.payload.index] || null;
    },
    setQueueIndex(state, action: PayloadAction<number>) {
      state.queueIndex = action.payload;
      state.currentTrack = state.queue[action.payload] || null;
    },
    toggleShuffle(state) {
      state.shuffleMode = !state.shuffleMode;
    },
    setRepeatMode(state, action: PayloadAction<RepeatMode>) {
      state.repeatMode = action.payload;
    },
    cycleRepeatMode(state) {
      const modes: RepeatMode[] = ['none', 'queue', 'track'];
      const current = modes.indexOf(state.repeatMode);
      state.repeatMode = modes[(current + 1) % modes.length];
    },
    setPosition(state, action: PayloadAction<number>) {
      state.position = action.payload;
    },
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
    },
    setIsSetup(state, action: PayloadAction<boolean>) {
      state.isSetup = action.payload;
    },
  },
});

export const {
  setCurrentTrack,
  setIsPlaying,
  setQueue,
  setQueueIndex,
  toggleShuffle,
  setRepeatMode,
  cycleRepeatMode,
  setPosition,
  setDuration,
  setIsSetup,
} = playerSlice.actions;

export default playerSlice.reducer;
