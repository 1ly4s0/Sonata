package com.tecnobros.sonata

import android.content.ContentUris
import android.database.Cursor
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import com.facebook.react.bridge.*

class MediaScannerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "MediaScanner"

    @ReactMethod
    fun getAllTracks(promise: Promise) {
        try {
            val songs = mutableListOf<WritableMap>()

            val uri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                MediaStore.Audio.Media.getContentUri(MediaStore.VOLUME_EXTERNAL)
            } else {
                MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
            }

            val projection = arrayOf(
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.ALBUM,
                MediaStore.Audio.Media.ALBUM_ID,
                MediaStore.Audio.Media.DURATION,
                MediaStore.Audio.Media.DATA,
                MediaStore.Audio.Media.DISPLAY_NAME,
                MediaStore.Audio.Media.IS_MUSIC,
                MediaStore.Audio.Media.DATE_ADDED
            )

            val selection = "${MediaStore.Audio.Media.IS_MUSIC} != 0 AND ${MediaStore.Audio.Media.DURATION} > 5000"
            val sortOrder = "${MediaStore.Audio.Media.TITLE} ASC"

            val cursor: Cursor? = reactContext.contentResolver.query(
                uri, projection, selection, null, sortOrder
            )

            cursor?.use { c ->
                val idIdx = c.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                val titleIdx = c.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
                val artistIdx = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
                val albumIdx = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM)
                val albumIdIdx = c.getColumnIndexOrThrow(MediaStore.Audio.Media.ALBUM_ID)
                val durationIdx = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)
                val dataIdx = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DATA)
                val displayNameIdx = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DISPLAY_NAME)
                val dateAddedIdx = c.getColumnIndexOrThrow(MediaStore.Audio.Media.DATE_ADDED)

                while (c.moveToNext()) {
                    val id = c.getLong(idIdx)
                    val title = c.getString(titleIdx) ?: "Unknown"
                    val artist = c.getString(artistIdx) ?: "Unknown Artist"
                    val album = c.getString(albumIdx) ?: "Unknown Album"
                    val albumId = c.getLong(albumIdIdx)
                    val duration = c.getLong(durationIdx)
                    val path = c.getString(dataIdx) ?: continue
                    val displayName = c.getString(displayNameIdx) ?: ""
                    val dateAdded = c.getLong(dateAddedIdx)

                    // Album art URI via ContentUris
                    val albumArtUri = ContentUris.withAppendedId(
                        Uri.parse("content://media/external/audio/albumart"),
                        albumId
                    ).toString()

                    // Derive folder from path
                    val folder = path.substringBeforeLast("/")

                    val song = WritableNativeMap().apply {
                        putString("id", id.toString())
                        putString("title", title)
                        putString("artist", artist)
                        putString("album", album)
                        putString("albumArt", albumArtUri)
                        putDouble("duration", duration.toDouble() / 1000.0)
                        putString("path", "file://$path")
                        putString("folder", folder)
                        putString("displayName", displayName)
                        putDouble("dateAdded", dateAdded.toDouble())
                    }
                    songs.add(song)
                }
            }

            val result = WritableNativeArray()
            songs.forEach { result.pushMap(it) }
            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("SCAN_ERROR", e.message ?: "Unknown error", e)
        }
    }
}


