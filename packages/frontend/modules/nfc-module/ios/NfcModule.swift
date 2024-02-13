import ExpoModulesCore
import CoreNFC

public class NfcModule: Module {
    var session: NfcSession?
    var semaphore: DispatchSemaphore?
    public func definition() -> ModuleDefinition {
        Name("NfcModule")

        AsyncFunction("scan") { (promise: Promise) in
            self.session?.startSession()
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
    // 暗証番号1 と 暗証番号2 をここに追加
    var pin1 = "" // 暗証番号1
    var pin2 = "" // 暗証番号2

    init(semaphore: DispatchSemaphore) {
        self.semaphore = semaphore
    }

    func tagReaderSessionDidBecomeActive(_ session: NFCTagReaderSession) {
        print("tagReaderSessionDidBecomeActive")
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didInvalidateWithError error: Error) {
        let readerError = error as! NFCReaderError
        print(readerError.code, readerError.localizedDescription)
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didDetect tags: [NFCTag]) {
        print("tagReaderSession(_:didDetect:)")

        let tag = tags.first!
        session.connect(to: tag) { (error) in
            if let error = error {
                session.invalidate(errorMessage: error.localizedDescription)
                return
            }

            guard case NFCTag.iso7816(let driversLicenseCardTag) = tag else {
                session.invalidate(errorMessage: "ISO 7816 準拠ではない")
                return
            }

            session.alertMessage = "運転免許証を読み取っています…"

            /// MF を選択
            let adpu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x00, p2Parameter: 0x00, data: Data([]), expectedResponseLength: -1)
            driversLicenseCardTag.sendCommand(apdu: adpu) { (responseData, sw1, sw2, error) in

                if let error = error {
                    session.invalidate(errorMessage: error.localizedDescription)
                    return
                }

                if sw1 != 0x90 {
                    session.invalidate(errorMessage: "MF の選択でエラー: ステータス \(sw1), \(sw2)")
                    return
                }

                /// IEF01 を選択
                let adpu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x02, p2Parameter: 0x0C, data: Data([0x00, 0x01]), expectedResponseLength: -1)
                driversLicenseCardTag.sendCommand(apdu: adpu) { (responseData, sw1, sw2, error) in

                    if let error = error {
                        session.invalidate(errorMessage: error.localizedDescription)
                        return
                    }

                    if sw1 != 0x90 {
                        session.invalidate(errorMessage: "IEF01 の選択でエラー: ステータス \(sw1), \(sw2)")
                        return
                    }

                    /// 照合
                    let adpu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0x20, p1Parameter: 0x00, p2Parameter: 0x80, data: Data(self.pin1.convertToJISX0201()), expectedResponseLength: -1)
                    driversLicenseCardTag.sendCommand(apdu: adpu) { (responseData, sw1, sw2, error) in

                        if let error = error {
                            session.invalidate(errorMessage: error.localizedDescription)
                            return
                        }

                        if sw1 != 0x90 {
                            if sw1 == 0x63 {
                                if sw2 == 0x00 {
                                    session.invalidate(errorMessage: "暗証番号1の照合でエラー: 照合の不一致である")
                                } else {
                                    let remaining = sw2 - 0xC0
                                    session.invalidate(errorMessage: "暗証番号1の照合でエラー: 照合の不一致である 残り試行回数: \(remaining)")
                                }
                            } else {
                                session.invalidate(errorMessage: "暗証番号1の照合でエラー: ステータス \(sw1), \(sw2)")
                            }
                            return
                        }

                        /// IEF02 を選択
                        let adpu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x02, p2Parameter: 0x0C, data: Data([0x00, 0x02]), expectedResponseLength: -1)
                        driversLicenseCardTag.sendCommand(apdu: adpu) { (responseData, sw1, sw2, error) in

                            if let error = error {
                                session.invalidate(errorMessage: error.localizedDescription)
                                return
                            }

                            if sw1 != 0x90 {
                                session.invalidate(errorMessage: "IEF02 の選択でエラー: ステータス \(sw1), \(sw2)")
                                return
                            }

                            /// 照合
                            let adpu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0x20, p1Parameter: 0x00, p2Parameter: 0x80, data: Data(self.pin2.convertToJISX0201()), expectedResponseLength: -1)
                            driversLicenseCardTag.sendCommand(apdu: adpu) { (responseData, sw1, sw2, error) in

                                if let error = error {
                                    session.invalidate(errorMessage: error.localizedDescription)
                                    return
                                }

                                if sw1 != 0x90 {
                                    if sw1 == 0x63 {
                                        if sw2 == 0x00 {
                                            session.invalidate(errorMessage: "暗証番号2の照合でエラー: 照合の不一致である")
                                        } else {
                                            let remaining = sw2 - 0xC0
                                            session.invalidate(errorMessage: "暗証番号2の照合でエラー: 照合の不一致である 残り試行回数: \(remaining)")
                                        }
                                    } else {
                                        session.invalidate(errorMessage: "暗証番号2の照合でエラー: ステータス \(sw1), \(sw2)")
                                    }
                                    return
                                }

                                /// DF1 を選択
                                let adpu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x04, p2Parameter: 0x0C, data: Data([0xA0, 0x00, 0x00, 0x02, 0x31, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), expectedResponseLength: -1)
                                driversLicenseCardTag.sendCommand(apdu: adpu) { (responseData, sw1, sw2, error) in

                                    if let error = error {
                                        session.invalidate(errorMessage: error.localizedDescription)
                                        return
                                    }

                                    if sw1 != 0x90 {
                                        session.invalidate(errorMessage: "DF1 の選択でエラー: ステータス \(sw1), \(sw2)")
                                        return
                                    }

                                    /// EF02 を選択
                                    let adpu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x02, p2Parameter: 0x0C, data: Data([0x00, 0x02]), expectedResponseLength: -1)
                                    driversLicenseCardTag.sendCommand(apdu: adpu) { (responseData, sw1, sw2, error) in

                                        if let error = error {
                                            session.invalidate(errorMessage: error.localizedDescription)
                                            return
                                        }

                                        if sw1 != 0x90 {
                                            session.invalidate(errorMessage: "DF1/EF02 の選択でエラー: ステータス \(sw1), \(sw2)")
                                            return
                                        }

                                        /// バイナリを読み取る
                                        let adpu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xB0, p1Parameter: 0x00, p2Parameter: 0x00, data: Data([]), expectedResponseLength: 82)
                                        driversLicenseCardTag.sendCommand(apdu: adpu) { (responseData, sw1, sw2, error) in

                                            if let error = error {
                                                session.invalidate(errorMessage: error.localizedDescription)
                                                return
                                            }

                                            if sw1 != 0x90 {
                                                session.invalidate(errorMessage: "バイナリの読み取りでエラー: ステータス \(sw1), \(sw2)")
                                                return
                                            }

                                            /// TLV フィールド
                                            let tag = responseData[0]
                                            let length = Int(responseData[1])
                                            let value = responseData[2..<responseData.count].map { $0 }

                                            let registeredDomicileData = stride(from: 0, to: length, by: 2).map { (i) -> Data in
                                                var bytes = (UInt16(value[i + 1]) << 8) + UInt16(value[i])
                                                return Data(bytes: &bytes, count: MemoryLayout<UInt16>.size)
                                            }

                                            let registeredDomicile = String(jisX0208Data: registeredDomicileData)
                                            print(registeredDomicile)

                                            session.alertMessage = "完了"
                                            session.invalidate()
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    func startSession() {
        self.session = NFCTagReaderSession(pollingOption: .iso14443 , delegate: self)
        session?.alertMessage = "交通系ICカードをかざしてください"
        session?.begin()
    }
}
