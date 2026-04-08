import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  useActiveTrack,
  State,
  RepeatMode as TPRepeatMode,
} from 'react-native-track-player';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store';
import { toggleFavorite, addToRecentlyPlayed } from '../store/slices/playlistSlice';
import { cycleRepeatMode, toggleShuffle } from '../store/slices/playerSlice';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing } from '../theme';
import { formatDuration } from '../utils/formatters';
import { setRepeatMode as setTPRepeatMode } from '../services/TrackPlayerService';

const { width, height } = Dimensions.get('window');
const ARTWORK_SIZE = width - 48;

// Spotify-inspired palette
const SP = {
  bg1:      '#0D1B2A',
  bg2:      '#1A2A3A',
  green:    '#1DB954',
  white:    '#FFFFFF',
  sub:      'rgba(255,255,255,0.65)',
  muted:    'rgba(255,255,255,0.35)',
  track:    'rgba(255,255,255,0.25)',
  divider:  'rgba(255,255,255,0.12)',
};

export default function NowPlayingScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const track = useActiveTrack();
  const { state } = usePlaybackState();
  const { position, duration } = useProgress(250);
  const { favorites } = useSelector((s: RootState) => s.playlist);
  const { shuffleMode, repeatMode } = useSelector((s: RootState) => s.player);

  const isPlaying = state === State.Playing;
  const isFav = track ? favorites.includes(track.id as string) : false;
  const { t } = useTranslation();

  const handlePlayPause = useCallback(async () => {
    if (isPlaying) await TrackPlayer.pause();
    else await TrackPlayer.play();
  }, [isPlaying]);

  const handlePrev = useCallback(async () => {
    try { await TrackPlayer.skipToPrevious(); }
    catch { await TrackPlayer.seekTo(0); }
  }, []);

  const handleNext = useCallback(async () => {
    try { await TrackPlayer.skipToNext(); }
    catch {}
  }, []);

  const handleSeek = useCallback((value: number) => {
    TrackPlayer.seekTo(value);
  }, []);

  const handleShuffle = useCallback(async () => {
    dispatch(toggleShuffle());
    await TrackPlayer.setShuffleModeEnabled?.(!shuffleMode).catch(() => {});
  }, [shuffleMode, dispatch]);

  const handleRepeat = useCallback(() => {
    const modes = ['none', 'track', 'queue'] as const;
    const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
    dispatch(cycleRepeatMode());
    setTPRepeatMode(next);
  }, [repeatMode, dispatch]);

  const handleFavorite = useCallback(() => {
    if (track) dispatch(toggleFavorite(track.id as string));
  }, [track, dispatch]);

  const repeatIcon = repeatMode === 'track' ? 'repeat-once' : 'repeat';
  const repeatActive = repeatMode !== 'none';

  if (!track) {
    return (
      <LinearGradient colors={[SP.bg1, SP.bg2]} style={[styles.container, styles.center]}>
        <Icon name="music-note-off" size={72} color={SP.muted} />
        <Text style={[styles.sub, { marginTop: 16 }]}>{t('now_playing_nothing')}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.floatClose}>
          <Icon name="chevron-down" size={28} color={SP.white} />
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[SP.bg1, SP.bg2]} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor={SP.bg1} />

        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <Icon name="chevron-down" size={28} color={SP.white} />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={styles.topLabel}>
              {shuffleMode
                ? 'SHUFFLE • ' + (track.artist || '').toUpperCase()
                : ('PLAYING FROM LIBRARY').toUpperCase()}
            </Text>
            <Text style={styles.topArtist} numberOfLines={1}>
              {track.artist || t('common_unknown_artist')}
            </Text>
          </View>

          <TouchableOpacity hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Icon name="dots-vertical" size={24} color={SP.white} />
          </TouchableOpacity>
        </View>

        {/* ── Album Art ── */}
        <View style={styles.artWrapper}>
          {track.artwork ? (
            <Image
              source={{ uri: track.artwork as string }}
              style={styles.artwork}
              defaultSource={require('../assets/default_album.png')}
            />
          ) : (
            <View style={[styles.artwork, styles.artworkFallback]}>
              <Icon name="music-note" size={80} color={SP.muted} />
            </View>
          )}
        </View>

        {/* ── Info + Favorite ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoText}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {track.title || t('common_unknown')}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {track.artist || t('common_unknown_artist')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleFavorite}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={isFav ? styles.favBtnActive : styles.favBtn}
          >
            <Icon
              name={isFav ? 'check-circle' : 'plus-circle-outline'}
              size={32}
              color={isFav ? SP.green : SP.sub}
            />
          </TouchableOpacity>
        </View>

        {/* ── Seek bar ── */}
        <View style={styles.seekWrapper}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 1}
            value={position}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor={SP.white}
            maximumTrackTintColor={SP.track}
            thumbTintColor={SP.white}
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatDuration(position)}</Text>
            <Text style={styles.timeText}>{formatDuration(duration)}</Text>
          </View>
        </View>

        {/* ── Controls ── */}
        <View style={styles.controls}>
          {/* Shuffle */}
          <View style={styles.iconWithDot}>
            <TouchableOpacity
              onPress={handleShuffle}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon
                name="shuffle-variant"
                size={24}
                color={shuffleMode ? SP.green : SP.sub}
              />
            </TouchableOpacity>
            {shuffleMode && <View style={styles.activeDot} />}
          </View>

          {/* Prev */}
          <TouchableOpacity onPress={handlePrev} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="skip-previous" size={38} color={SP.white} />
          </TouchableOpacity>

          {/* Play / Pause */}
          <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause}>
            <Icon
              name={isPlaying ? 'pause' : 'play'}
              size={40}
              color={SP.bg1}
              style={isPlaying ? undefined : { marginLeft: 3 }}
            />
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity onPress={handleNext} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="skip-next" size={38} color={SP.white} />
          </TouchableOpacity>

          {/* Repeat */}
          <View style={styles.iconWithDot}>
            <TouchableOpacity
              onPress={handleRepeat}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon name={repeatIcon} size={24} color={repeatActive ? SP.green : SP.sub} />
            </TouchableOpacity>
            {repeatActive && <View style={styles.activeDot} />}
          </View>
        </View>

        {/* ── Bottom actions ── */}
        <View style={styles.bottomActions}>
          <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Icon name="cast-audio" size={22} color={SP.sub} />
          </TouchableOpacity>
          <View style={styles.bottomCenter} />
          <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Icon name="share-variant-outline" size={22} color={SP.sub} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('NowPlaying' as never)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ marginLeft: Spacing.xl }}
          >
            <Icon name="playlist-play" size={24} color={SP.sub} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatClose: {
    position: 'absolute',
    top: 48,
    left: 20,
  },

  // ── Top bar ──
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  topLabel: {
    color: SP.sub,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  topArtist: {
    color: SP.white,
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Artwork ──
  artWrapper: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 28,
    // Spotify-style subtle raised shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 16,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 8,
  },
  artworkFallback: {
    backgroundColor: '#1E2D3D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Info ──
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  infoText: { flex: 1, marginRight: Spacing.md },
  songTitle: {
    color: SP.white,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  artistName: {
    color: SP.sub,
    fontSize: 15,
    marginTop: 4,
    fontWeight: '500',
  },
  favBtn: {},
  favBtnActive: {},

  // ── Seek ──
  seekWrapper: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
    paddingHorizontal: 4,
  },
  timeText: {
    color: SP.sub,
    fontSize: 12,
    fontWeight: '500',
  },
  sub: {
    color: SP.sub,
    fontSize: 15,
  },

  // ── Controls ──
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  iconWithDot: {
    alignItems: 'center',
    width: 32,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: SP.green,
    marginTop: 3,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: SP.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },

  // ── Bottom actions ──
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  bottomCenter: { flex: 1 },
});

