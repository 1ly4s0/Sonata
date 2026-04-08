import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  usePlaybackState,
  useActiveTrack,
  State,
} from 'react-native-track-player';
import TrackPlayer from 'react-native-track-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../theme';

export const TAB_BAR_HEIGHT = 60;
export const MINI_PLAYER_HEIGHT = 68;
const MINI_MARGIN = 8;

export default function MiniPlayer() {
  const navigation = useNavigation<any>();
  const playbackState = usePlaybackState();
  const activeTrack = useActiveTrack();
  const insets = useSafeAreaInsets();

  const isPlaying = playbackState.state === State.Playing;

  // Position: above tab bar, accounting for device bottom inset
  const bottomPos = TAB_BAR_HEIGHT + insets.bottom + MINI_MARGIN;

  // Slide-up animation when track appears / disappears
  const slideY = useSharedValue(MINI_PLAYER_HEIGHT + 40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (activeTrack) {
      slideY.value = withSpring(0, { damping: 20, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 220 });
    } else {
      slideY.value = withTiming(MINI_PLAYER_HEIGHT + 40, { duration: 240 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!activeTrack]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
    opacity: opacity.value,
  }));

  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, [isPlaying]);

  const handleSkipNext = useCallback(async () => {
    await TrackPlayer.skipToNext();
  }, []);

  const handleOpen = useCallback(() => {
    navigation.navigate('NowPlaying');
  }, [navigation]);

  return (
    <Animated.View style={[styles.container, { bottom: bottomPos }, animStyle]}>
      <TouchableOpacity
        style={styles.inner}
        onPress={handleOpen}
        activeOpacity={0.92}
      >
        <View style={styles.artWrapper}>
          {activeTrack?.artwork ? (
            <Image
              source={{ uri: activeTrack.artwork as string }}
              style={styles.artwork}
              defaultSource={require('../assets/default_album.png')}
            />
          ) : (
            <View style={styles.artworkPlaceholder}>
              <Icon name="music-note" size={22} color={Colors.textMuted} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {activeTrack?.title || 'Unknown'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {activeTrack?.artist || 'Unknown Artist'}
          </Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePlayPause}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color={Colors.miniPlayerText}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSkipNext}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.nextBtn}
          >
            <Icon name="skip-next" size={28} color={Colors.miniPlayerText} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: MINI_MARGIN,
    right: MINI_MARGIN,
    borderRadius: 14,
    backgroundColor: Colors.miniPlayer,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: MINI_PLAYER_HEIGHT,
  },
  artWrapper: {
    marginRight: Spacing.sm,
  },
  artwork: {
    width: 46,
    height: 46,
    borderRadius: 8,
  },
  artworkPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    color: Colors.miniPlayerText,
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: Colors.miniPlayerTextSub,
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextBtn: {
    marginLeft: Spacing.md,
  },
});
