import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Song } from '../types';
import { Colors, Spacing } from '../theme';
import { toggleFavorite, createPlaylist, addToPlaylist } from '../store/slices/playlistSlice';
import { RootState } from '../store';

interface Props {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
  onPlayNext?: () => void;
  onAddToQueue?: () => void;
}

function SongOptionsModal({ visible, song, onClose, onPlayNext, onAddToQueue }: Props) {
  const dispatch = useDispatch();
  const { favorites, playlists } = useSelector((s: RootState) => s.playlist);
  const { t } = useTranslation();

  const [displaySong, setDisplaySong] = useState<Song | null>(null);

  const isFav = displaySong ? favorites.includes(displaySong.id) : false;

  // Keep displaySong alive while the modal is closing (native slide-out)
  useEffect(() => {
    if (visible && song) {
      setDisplaySong(song);
    }
  }, [visible, song]);

  const handleToggleFav = () => {
    if (!displaySong) return;
    dispatch(toggleFavorite(displaySong.id));
    onClose();
  };

  const handleAddToPlaylist = () => {
    if (!displaySong) return;
    if (playlists.length === 0) {
      Alert.prompt(
        t('option_new_playlist_title'),
        t('option_new_playlist_prompt'),
        name => {
          if (name) {
            dispatch(createPlaylist({ name }));
          }
        }
      );
    } else {
      // In a full app, show a picker. For now show first playlist option
      Alert.alert(
        t('option_add_playlist'),
        t('option_choose_playlist'),
        [
          ...playlists.map(p => ({
            text: p.name,
            onPress: () => {
              dispatch(addToPlaylist({ playlistId: p.id, songId: displaySong.id }));
              onClose();
            },
          })),
          {
            text: t('option_new_playlist'),
            onPress: () => {
              Alert.prompt(t('option_new_playlist_title'), t('option_new_playlist_name_prompt'), name => {
                if (name) {
                  dispatch(createPlaylist({ name }));
                }
              });
            },
          },
          { text: t('common_cancel'), style: 'cancel' },
        ]
      );
    }
  };

  const options = [
    {
      icon: isFav ? 'heart' : 'heart-outline',
      label: isFav ? t('option_remove_fav') : t('option_add_fav'),
      onPress: handleToggleFav,
      color: isFav ? Colors.heart : Colors.text,
    },
    {
      icon: 'playlist-plus',
      label: t('option_add_playlist'),
      onPress: handleAddToPlaylist,
      color: Colors.text,
    },
    {
      icon: 'skip-next',
      label: t('option_play_next'),
      onPress: () => { onPlayNext?.(); onClose(); },
      color: Colors.text,
    },
    {
      icon: 'playlist-music',
      label: t('option_add_queue'),
      onPress: () => { onAddToQueue?.(); onClose(); },
      color: Colors.text,
    },
  ];

  return (
    <Modal visible={visible && !!displaySong} transparent animationType="slide" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Backdrop */}
        <View style={[StyleSheet.absoluteFill, styles.backdrop]}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
        </View>

        {/* Bottom sheet */}
        {displaySong && (
          <View style={styles.sheet}>
            {/* Drag handle */}
            <View style={styles.handle} />

            {/* Song Info Header */}
            <View style={styles.header}>
              {displaySong.albumArt ? (
                <Image
                  source={{ uri: displaySong.albumArt }}
                  style={styles.headerArt}
                  defaultSource={require('../assets/default_album.png')}
                />
              ) : (
                <View style={[styles.headerArt, styles.headerArtPlaceholder]}>
                  <Icon name="music-note" size={24} color={Colors.textMuted} />
                </View>
              )}
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle} numberOfLines={1}>{displaySong.title}</Text>
                <Text style={styles.headerArtist} numberOfLines={1}>{displaySong.artist}</Text>
              </View>
            </View>
            <View style={styles.divider} />

            {/* Options */}
            {options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={styles.option}
                onPress={opt.onPress}
              >
                <Icon name={opt.icon} size={22} color={opt.color} />
                <Text style={[styles.optionLabel, { color: opt.color }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{t('common_cancel')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

export default memo(SongOptionsModal);

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerArt: {
    width: 52,
    height: 52,
    borderRadius: 6,
    marginRight: Spacing.md,
  },
  headerArtPlaceholder: {
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  headerArtist: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
    marginVertical: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  optionLabel: {
    marginLeft: Spacing.md,
    fontSize: 15,
    color: Colors.text,
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
