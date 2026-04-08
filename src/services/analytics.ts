import analytics from '@react-native-firebase/analytics';

// ─── Screen Tracking ──────────────────────────────────────────────────────────
export async function logScreen(screenName: string) {
  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenName,
  });
}

// ─── Playback ─────────────────────────────────────────────────────────────────
export async function logPlaySong(title: string, artist: string) {
  await analytics().logEvent('play_song', { song_title: title, artist });
}

// ─── Search ───────────────────────────────────────────────────────────────────
export async function logSearch(query: string) {
  await analytics().logSearch({ search_term: query });
}

// ─── Social / Interactions ────────────────────────────────────────────────────
export async function logAddFavorite(title: string, artist: string) {
  await analytics().logEvent('add_to_favorites', { song_title: title, artist });
}

export async function logCreatePlaylist(name: string) {
  await analytics().logEvent('playlist_created', { playlist_name: name });
}

export async function logAddToPlaylist(playlistName: string, title: string) {
  await analytics().logEvent('add_to_playlist', { playlist_name: playlistName, song_title: title });
}

// ─── Onboarding / Terms ───────────────────────────────────────────────────────
export async function logOnboardingComplete() {
  await analytics().logEvent('onboarding_complete', {});
}

export async function logTermsAccepted() {
  await analytics().logEvent('terms_accepted', {});
}

// ─── Import ───────────────────────────────────────────────────────────────────
export async function logImport(songCount: number) {
  await analytics().logEvent('library_import', { song_count: songCount });
}

// ─── Shuffle ──────────────────────────────────────────────────────────────────
export async function logShuffle() {
  await analytics().logEvent('shuffle_all', {});
}
