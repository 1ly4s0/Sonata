import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode,
} from 'react-native-track-player';
import { store } from '../store';
import { setIsSetup } from '../store/slices/playerSlice';

let isSetupComplete = false;

export async function setupPlayer(): Promise<boolean> {
  if (isSetupComplete) return true;
  try {
    await TrackPlayer.setupPlayer({
      maxCacheSize: 1024 * 5,
    });

    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
      ],
      progressUpdateEventThrottle: 1000,
    });

    isSetupComplete = true;
    store.dispatch(setIsSetup(true));
    return true;
  } catch (e) {
    console.error('TrackPlayer setup error:', e);
    return false;
  }
}

export async function playSong(
  songs: Array<{
    id: string;
    title: string;
    artist: string;
    album: string;
    albumArt?: string;
    duration: number;
    path: string;
  }>,
  startIndex: number = 0
): Promise<void> {
  await TrackPlayer.reset();

  const tracks = songs.map(song => ({
    id: song.id,
    url: song.path,
    title: song.title,
    artist: song.artist,
    album: song.album,
    artwork: song.albumArt,
    duration: song.duration,
  }));

  await TrackPlayer.add(tracks);
  await TrackPlayer.skip(startIndex);
  await TrackPlayer.play();
}

export async function togglePlayPause(): Promise<void> {
  const state = await TrackPlayer.getPlaybackState();
  // @ts-ignore
  if (state.state === 'playing') {
    await TrackPlayer.pause();
  } else {
    await TrackPlayer.play();
  }
}

export async function setRepeatMode(mode: 'none' | 'track' | 'queue'): Promise<void> {
  const modeMap = {
    none: RepeatMode.Off,
    track: RepeatMode.Track,
    queue: RepeatMode.Queue,
  };
  await TrackPlayer.setRepeatMode(modeMap[mode]);
}
