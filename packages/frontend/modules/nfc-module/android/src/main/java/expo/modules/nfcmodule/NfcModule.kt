package expo.modules.nfcmodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import android.nfc.NfcAdapter
import android.nfc.Tag

class NfcReaderCallback(private val promise: Promise) : NfcAdapter.ReaderCallback {
  override fun onTagDiscovered(tag: Tag?) {
    val idmString = tag?.id?.joinToString("") { "%02x".format(it) }
    promise.resolve(idmString)
  }
}

class NfcModule : Module() {
  var nfcAdapter: NfcAdapter? = null
  override fun definition() = ModuleDefinition {
    Name("NfcModule")

    AsyncFunction("scan") { promise: Promise ->
      nfcAdapter?.enableReaderMode(
          appContext.currentActivity,
          NfcReaderCallback(promise),
          NfcAdapter.FLAG_READER_NFC_F,
          null
      )
    }

    OnCreate {
      nfcAdapter = NfcAdapter.getDefaultAdapter(appContext.reactContext)
    }
  }
}
