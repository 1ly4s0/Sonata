import { NativeModules } from 'react-native';
import { Song } from '../types';

const { MediaScanner } = NativeModules;

export async function scanDeviceLibrary(): Promise<Song[]> {
  if (!MediaScanner) {
    throw new Error('MediaScanner module not found');
  }
  const songs: Song[] = await MediaScanner.getAllTracks();
  return songs;
}

/** Stub: manual file import is not available in this build. Returns empty array. */
export async function pickAudioFiles(): Promise<Song[]> {
  return [];
}

export function songToTrack(song: Song) {
  return {
    id: song.id,
    url: song.path,
    title: song.title,
    artist: song.artist,
    album: song.album,
    artwork: song.albumArt,
    duration: song.duration,
  };
}
