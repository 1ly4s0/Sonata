export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const totalSecs = Math.floor(seconds);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatLongDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const totalSecs = Math.floor(seconds);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function groupByLetter(songs: Array<{ title: string }>): Record<string, typeof songs> {
  const groups: Record<string, typeof songs> = {};
  songs.forEach(song => {
    const first = song.title.charAt(0).toUpperCase();
    const key = /[A-Z]/.test(first) ? first : '#';
    if (!groups[key]) groups[key] = [];
    groups[key].push(song);
  });
  return groups;
}

export function formatCount(count: number, singular: string, plural?: string): string {
  const label = count === 1 ? singular : (plural || `${singular}s`);
  return `${count} ${label}`;
}
