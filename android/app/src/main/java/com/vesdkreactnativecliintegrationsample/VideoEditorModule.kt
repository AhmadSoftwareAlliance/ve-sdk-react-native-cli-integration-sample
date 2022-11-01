package com.vesdkreactnativecliintegrationsample

import android.app.Activity
import android.content.Intent
import android.content.res.AssetManager
import android.net.Uri
import android.util.Log
import androidx.core.content.FileProvider
import com.banuba.sdk.cameraui.data.PipConfig
import com.banuba.sdk.core.data.TrackData
import com.banuba.sdk.export.data.ExportResult
import com.banuba.sdk.export.utils.EXTRA_EXPORTED_SUCCESS
import com.banuba.sdk.ve.flow.VideoCreationActivity
import com.facebook.react.bridge.*
import com.google.android.exoplayer2.upstream.cache.CacheDataSink
import java.io.*
import java.util.*

class VideoEditorModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val TAG = "VideoEditorModule"

        private const val EXPORT_REQUEST_CODE = 1111
        private const val E_ACTIVITY_DOES_NOT_EXIST = "E_ACTIVITY_DOES_NOT_EXIST"
        private const val E_VIDEO_EDITOR_CANCELLED = "E_VIDEO_EDITOR_CANCELLED"
        private const val E_EXPORTED_VIDEO_NOT_FOUND = "E_EXPORTED_VIDEO_NOT_FOUND"
    }

    private var exportResultPromise: Promise? = null

    private val videoEditorResultListener = object : ActivityEventListener {
        override fun onActivityResult(
            activity: Activity?,
            requestCode: Int,
            resultCode: Int,
            data: Intent?
        ) {
            if (requestCode == EXPORT_REQUEST_CODE) {
                when {
                    resultCode == Activity.RESULT_OK -> {
                        val exportResult = data?.getParcelableExtra<ExportResult.Success>(
                            EXTRA_EXPORTED_SUCCESS
                        )
                        val exportedVideos = exportResult?.videoList ?: emptyList()
                        val resultUri = exportedVideos.firstOrNull()?.sourceUri

                        if (resultUri == null) {
                            exportResultPromise?.reject(
                                E_EXPORTED_VIDEO_NOT_FOUND,
                                "Exported video is null"
                            )
                        } else {
                            exportResultPromise?.resolve(resultUri.toString())
                            /*
                                NOT REQUIRED FOR INTEGRATION
                                Added for playing exported video file.
                            */
                            activity?.let { demoPlayExportedVideo(it, resultUri) }
                        }
                    }
                    requestCode == Activity.RESULT_CANCELED -> {
                        exportResultPromise?.reject(
                            E_VIDEO_EDITOR_CANCELLED,
                            "Video editor export was cancelled"
                        )
                    }
                }
                exportResultPromise = null
            }
        }

        override fun onNewIntent(intent: Intent?) {}
    }


    init {
        reactApplicationContext.addActivityEventListener(videoEditorResultListener)
    }

    override fun getName(): String = "VideoEditorModule"

    /**
     * Open Video Editor SDK
     */
    @ReactMethod
    fun openVideoEditor(inputPromise: Promise) {
        val hostActivity = currentActivity
        if (hostActivity == null) {
            inputPromise.reject(
                E_ACTIVITY_DOES_NOT_EXIST,
                "Host activity to open Video Editor does not exist!"
            )
            return
        } else {
            this.exportResultPromise = inputPromise
            val intent = VideoCreationActivity.startFromCamera(
                hostActivity,
                // set PiP video configuration
                PipConfig(
                    video = Uri.EMPTY,
                    openPipSettings = false
                ),
                // setup data that will be acceptable during export flow
                null,
                // set TrackData object if you open VideoCreationActivity with preselected music track
                null
            )
            hostActivity.startActivityForResult(intent, EXPORT_REQUEST_CODE)
        }
    }

    /**
     * Applies selected audio on custom Audio Browser in Video Editor SDK.
     *
     * This implementation demonstrates how to play audio stored in Android assets in Video Editor SDK.
     *
     * Since audio browsing and downloading logic can be implemented using React Native on JS side
     * you can pass specific audio params in this method to build TrackData
     * and use it in "AudioBrowserActivity.applyAudioTrack".
     */
    @ReactMethod
    fun applyAudioTrack(inputPromise: Promise) {
        val hostActivity = currentActivity

        // Check if host Activity is a your specific Android Activity responsible for
        // passing audio to Video Editor SDK i.e. AudioBrowserActivity.
        if (hostActivity is AudioBrowserActivity) {
            // Sample audio file used to demonstrate how to pass and play audio file
            // in Video Editor SDK
            val sampleAudioFileName = "sample_audio.mp3"
            val filesStorage: File = hostActivity.applicationContext.filesDir
            val assets: AssetManager = hostActivity.applicationContext.assets

            val audioTrack: TrackData? = try {
                // Video Editor SDK can play ONLY audio file stored on device.
                // Make sure that you store audio file on a device before trying to play it.
                val sampleAudioFile = prepareAudioFile(assets, filesStorage, sampleAudioFileName)

                // TrackData is required in Video Editor SDK for playing audio.
                TrackData(
                    UUID.randomUUID(),
                    "Set title",
                    Uri.fromFile(sampleAudioFile),
                    "Set artist"
                )
            } catch (e: IOException) {
                Log.w(TAG, "Cannot prepare sample audio file", e)
                // You can pass null as TrackData to cancel playing last used audio in Video Editor SDK
                null
            }

            Log.d(TAG, "Apply audio track = $audioTrack")
            hostActivity.applyAudioTrack(audioTrack)
        }
    }

    /**
     * Utils methods used to prepare sample audio track for playing in Video Editor SDK.
     * NOT REQUIRED IN YOUR APP.
     */
    @Throws(IOException::class)
    private fun prepareAudioFile(
        assets: AssetManager,
        filesStorage: File,
        audioFileName: String
    ): File {
        val sampleAudioFile = File(filesStorage, audioFileName)

        var outputStream: OutputStream? = null
        try {
            assets.open(audioFileName).use { inputStream ->
                outputStream = FileOutputStream(sampleAudioFile)
                val size = copyStream(inputStream, requireNotNull(outputStream))
                Log.d(TAG, "Audio file has been copied. Size = $size")
            }
        } catch (e: IOException) {
            throw e
        } finally {
            outputStream?.flush()
            outputStream?.close()
        }

        return sampleAudioFile
    }

    @Throws(IOException::class)
    private fun copyStream(
        inStream: InputStream,
        outStream: OutputStream
    ): Long {
        var size = 0L
        val buffer = ByteArray(CacheDataSink.DEFAULT_BUFFER_SIZE)
        var bytes = inStream.read(buffer)
        while (bytes >= 0) {
            outStream.write(buffer, 0, bytes)
            size += bytes.toLong()
            bytes = inStream.read(buffer)
        }
        return size
    }

    /*
    NOT REQUIRED FOR INTEGRATION
    Added for playing exported video file.
    */
    private fun demoPlayExportedVideo(
        activity: Activity,
        videoUri: Uri
    ) {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            val uri = FileProvider.getUriForFile(
                activity.applicationContext,
                "${activity.packageName}.provider",
                File(videoUri.encodedPath)
            )
            setDataAndType(uri, "video/mp4")
        }
        activity.startActivity(intent)
    }
}