import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store';
import { Playlist } from '../types';
import { Colors, Spacing } from '../theme';
import { useTranslation } from 'react-i18next';
import {
  createPlaylist,
  deletePlaylist,
} from '../store/slices/playlistSlice';

export default function PlaylistsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { playlists } = useSelector((s: RootState) => s.playlist);
  const { songs } = useSelector((s: RootState) => s.library);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const { t } = useTranslation();

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return;
    dispatch(createPlaylist({ name: newName.trim() }));
    setNewName('');
    setShowCreate(false);
  }, [newName, dispatch]);

  const handleDelete = useCallback(
    (playlist: Playlist) => {
      Alert.alert(t('playlists_delete_title'), t('playlists_delete_msg', { name: playlist.name }), [
        { text: t('common_cancel'), style: 'cancel' },
        {
          text: t('common_delete'),
          style: 'destructive',
          onPress: () => dispatch(deletePlaylist(playlist.id)),
        },
      ]);
    },
    [dispatch]
  );

  const renderPlaylist = ({ item }: { item: Playlist }) => {
    const songCount = item.songIds.length;
    return (
      <TouchableOpacity
        style={styles.playlistItem}
        onPress={() =>
          navigation.navigate('PlaylistDetail', { playlistId: item.id })
        }
      >
        <View style={styles.coverPlaceholder}>
          <Icon name="playlist-music" size={28} color={Colors.textSecondary} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSub}>{t('playlists_songs_count', { count: songCount })}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="dots-vertical" size={22} color={Colors.icon} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('playlists_title')}</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.addBtn}>
          <Icon name="plus" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {playlists.length === 0 ? (
        <View style={styles.center}>
          <Icon name="playlist-music-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>{t('playlists_empty_title')}</Text>
          <Text style={styles.emptySubtitle}>{t('playlists_empty_subtitle')}</Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={item => item.id}
          renderItem={renderPlaylist}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Create Playlist Modal */}
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('playlists_new_title')}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={t('playlists_name_placeholder')}
              placeholderTextColor={Colors.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setNewName(''); setShowCreate(false); }}
              >
                <Text style={styles.modalCancelText}>{t('common_cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateBtn}
                onPress={handleCreate}
              >
                <Text style={styles.modalCreateText}>{t('playlists_create')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: Colors.text },
  addBtn: { padding: 4 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 8 },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomColor: Colors.separator,
    borderBottomWidth: 1,
  },
  coverPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  itemSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: Spacing.xl,
    width: '85%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.separator,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 16,
  },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancelBtn: { padding: 8 },
  modalCancelText: { color: Colors.textSecondary, fontSize: 15 },
  modalCreateBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCreateText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
