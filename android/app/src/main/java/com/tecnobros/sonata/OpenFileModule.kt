package com.tecnobros.sonata

import com.facebook.react.bridge.*

class OpenFileModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "OpenFile"

    @ReactMethod
    fun getOpenFileUri(promise: Promise) {
        val app = reactContext.applicationContext as? MainApplication
        val uri = app?.getOpenFileUri()
        if (uri != null) {
            promise.resolve(uri)
        } else {
            promise.resolve(null)
        }
    }
}


