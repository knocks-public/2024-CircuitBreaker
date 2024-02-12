import ExpoModulesCore
import CoreNFC

public class NfcModule: Module {
  var session: NfcSession?
  var semaphore: DispatchSemaphore?
  public func definition() -> ModuleDefinition {
    Name("NfcModule")

    AsyncFunction("scan") { (promise: Promise) in
        session?.startSession()
        DispatchQueue.global(qos: .background).async {
            self.semaphore?.wait()
            promise.resolve(self.session?.message)
        }
    }

    OnCreate {
        semaphore = DispatchSemaphore(value: 0)
        session = NfcSession(semaphore: semaphore!)
    }
  }
}

class NfcSession: NSObject, NFCTagReaderSessionDelegate {
    var session: NFCTagReaderSession?
    let semaphore: DispatchSemaphore
    var message: String?

    init (semaphore: DispatchSemaphore) {
        self.semaphore = semaphore
    }

    func tagReaderSessionDidBecomeActive(_ session: NFCTagReaderSession) {
        print("tagReaderSessionDidBecomeActive")
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didInvalidateWithError error: Error) {
        print("Error: \(error.localizedDescription)")
        self.semaphore.signal()
        self.session = nil
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didDetect tags: [NFCTag]) {
        let tag = tags.first!
        session.connect(to: tag) { error in
            if nil != error {
                session.invalidate(errorMessage: "Error!")
                self.semaphore.signal()
                return
            }
            guard case .feliCa(let feliCaTag) = tag else {
                session.invalidate(errorMessage: "This is not FeliCa!")
                self.semaphore.signal()
                return
            }
            let idm = feliCaTag.currentIDm.map { String(format: "%.2hhx", $0) }.joined()
            self.message = idm
            session.alertMessage = "Success!"
            session.invalidate()
            self.semaphore.signal()
        }
    }

    func startSession() {
        self.session = NFCTagReaderSession(pollingOption: [.iso14443, .iso15693, .iso18092], delegate: self, queue: nil)
        session?.alertMessage = "交通系ICカードをかざしてください"
        session?.begin()
    }
}
