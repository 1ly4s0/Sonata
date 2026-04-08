import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Song } from '../types';
import { Colors, Spacing } from '../theme';
import { formatDuration } from '../utils/formatters';

interface Props {
  song: Song;
  isPlaying?: boolean;
  onPress: () => void;
  onOptions: () => void;
  compact?: boolean;
}

function SongItem({ song, isPlaying, onPress, onOptions, compact }: Props) {
  return (
    <TouchableOpacity style={[styles.container, compact && styles.containerCompact]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.artWrapper}>
        {song.albumArt ? (
          <Image
            source={{ uri: song.albumArt }}
            style={compact ? styles.artworkCompact : styles.artwork}
            defaultSource={require('../assets/default_album.png')}
          />
        ) : (
          <View style={compact ? [styles.artworkPlaceholder, styles.artworkCompact] : styles.artworkPlaceholder}>
            <Icon name="music-box" size={compact ? 16 : 20} color={Colors.textMuted} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text
          style={[compact ? styles.titleCompact : styles.title, isPlaying && styles.titlePlaying]}
          numberOfLines={1}
        >
          {song.title}
        </Text>
        <Text
          style={[compact ? styles.subtitleCompact : styles.subtitle, isPlaying && styles.subtitlePlaying]}
          numberOfLines={1}
        >
          {song.artist}{song.album !== 'Unknown Album' ? ` • ${song.album}` : ''}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onOptions}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={styles.optionsBtn}
      >
        <Icon name="dots-vertical" size={20} color={Colors.icon} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default memo(SongItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    backgroundColor: Colors.background,
  },
  containerCompact: {
    paddingVertical: 4,
  },
  artWrapper: {
    marginRight: Spacing.md,
  },
  artwork: {
    width: 46,
    height: 46,
    borderRadius: 4,
  },
  artworkCompact: {
    width: 34,
    height: 34,
    borderRadius: 3,
  },
  artworkPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 4,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  titleCompact: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
  },
  titlePlaying: {
    color: Colors.playing,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  subtitleCompact: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  subtitlePlaying: {
    color: Colors.playing,
  },
  optionsBtn: {
    paddingHorizontal: Spacing.xs,
  },
});
