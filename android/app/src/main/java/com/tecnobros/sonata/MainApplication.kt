package com.tecnobros.sonata

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

    private var openFileUri: String? = null

    fun setOpenFileUri(uri: String) {
        openFileUri = uri
    }

    fun getOpenFileUri(): String? {
        val uri = openFileUri
        openFileUri = null
        return uri
    }

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    add(MediaScannerPackage())
                    add(OpenFilePackage())
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = false

            override val isHermesEnabled: Boolean = true
        }

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, false)
    }
}


