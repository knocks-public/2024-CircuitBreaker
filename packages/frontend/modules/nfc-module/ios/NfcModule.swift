import ExpoModulesCore
import CoreNFC
import Foundation

public class NfcModule: Module {
    var session: NfcSession?
    var semaphore: DispatchSemaphore?
    var birthdate: String?
    public func definition() -> ModuleDefinition {
        Name("NfcModule")

        AsyncFunction("scan") { (pin: String, promise: Promise) in
            self.session?.pin1 = pin
            self.session?.startSession()
            DispatchQueue.global(qos: .background).async {
                self.semaphore?.wait()
                promise.resolve(self.session?.message)
            }
        }

        Function("setPin") { (pin: String) in
            self.session?.pin1 = pin
        }
        Function("getBirthdate") { (promise: Promise) in
            if let birthdate = self.birthdate {
                promise.resolve(birthdate)
            } else {
                promise.reject("Error", "Birthdate not available.")
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
    var pin1: String = ""
    var birthdate: String?

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

            guard case NFCTag.iso7816(let mynumberCardTag) = tag else {
                session.invalidate(errorMessage: "ISO 7816 準拠ではない")
                return
            }

            session.alertMessage = "Reading... MyNumber Card"


            /// SELECT FILE: 券面入力補助AP (DF)
            let profileAID: [UInt8] = [0xD3, 0x92, 0x10, 0x00, 0x31, 0x00, 0x01, 0x01, 0x04, 0x08]
            let apdu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x04, p2Parameter: 0x0C, data: Data(profileAID), expectedResponseLength: -1)
            mynumberCardTag.sendCommand(apdu: apdu) { (responseData, sw1, sw2, error) in

                if let error = error {
                    session.invalidate(errorMessage: error.localizedDescription)
                    return
                }

                ///  SELECT FILE: 券面入力補助用PIN (EF)
                let profilePinEFID: [UInt8] = [0x00, 0x11]
                let selectProfilePinAPDU = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x02, p2Parameter: 0x0C, data: Data(profilePinEFID), expectedResponseLength: -1)

                mynumberCardTag.sendCommand(apdu: selectProfilePinAPDU) { (responseData, sw1, sw2, error) in
                    if let error = error {
                        // エラー処理
                        session.invalidate(errorMessage: error.localizedDescription)
                        return
                    }

                    // APDUコマンドが成功したかどうかをチェック
                    if sw1 == 0x90 && sw2 == 0x00 {
                        // コマンド成功
                        print("券面入力補助用PINの選択成功")

                    } else {
                        // コマンド失敗
                        session.invalidate(errorMessage: "券面入力補助用PINの選択失敗: ステータスコード \(sw1), \(sw2)")
                    }
                }

                // VERIFY: 券面入力補助用PIN (パスワード)
                self.verifyPin(pin: self.pin1, for: mynumberCardTag)

            }
        }
    }

    func startSession() {
        self.session = NFCTagReaderSession(pollingOption: .iso14443 , delegate: self)
        session?.alertMessage = "Touch your MyNumber Card to the iPhone"
        session?.begin()
    }

    /// VERIFY: 券面入力補助用PIN (パスワード)
    func verifyPin(pin: String, for tag: NFCISO7816Tag) {
        // PINをData型に変換します。ここでは、PINがASCII文字列であると仮定しています。
        guard let pinData = pin.data(using: .ascii) else {
            print("PINのデータ変換に失敗")
            return
        }

        // VERIFYコマンドのAPDUを作成します。
        // P1=0x00, P2=0x80（PINを指定するためのパラメータ）を設定します。
        let verifyApdu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0x20, p1Parameter: 0x00, p2Parameter: 0x80, data: pinData, expectedResponseLength: -1)

        // APDUコマンドをカードに送信します。
        tag.sendCommand(apdu: verifyApdu) { (responseData, sw1, sw2, error) in
            if let error = error {
                // エラー処理
                print("PIN検証の送信エラー: \(error.localizedDescription)")
                return
            }

            // コマンドの実行結果をチェックします。
            if sw1 == 0x90 && sw2 == 0x00 {
                // PIN検証成功
                print("PIN検証成功")
                self.selectBaseFourInfo(for: tag)
            } else {
                // PIN検証失敗
                print("PIN検証失敗: ステータスコード \(sw1), \(sw2)")
                // ここに失敗時の処理を記述します。
            }
        }
    }

    /// SELECT FILE: 基本4情報 (EF)
    func selectBaseFourInfo(for tag: NFCISO7816Tag) {
        let baseFourInfoEFID: [UInt8] = [0x00, 0x02]
        let selectBaseFourInfoAPDU = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x02, p2Parameter: 0x0C, data: Data(baseFourInfoEFID), expectedResponseLength: -1)

        tag.sendCommand(apdu: selectBaseFourInfoAPDU) { (responseData, sw1, sw2, error) in
            if let error = error {
                // エラー処理
                print("基本4情報の選択エラー: \(error.localizedDescription)")
                return
            }

            // APDUコマンドが成功したかどうかをチェック
            if sw1 == 0x90 && sw2 == 0x00 {
                // コマンド成功
                print("基本4情報の選択成功")
                // 成功した場合の処理をここに記述します。例えば、基本4情報の読み取りなど
                // READ BINARY: 基本4情報の読み取り
                self.readBaseFourInfo(for: tag)
            } else {
                // コマンド失敗
                print("基本4情報の選択失敗: ステータスコード \(sw1), \(sw2)")
            }
        }
    }

    /// READ BINARY: 基本4情報の読み取り後のデータ解析
    func readBaseFourInfo(for tag: NFCISO7816Tag) {
        let readBinaryAPDU = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xB0, p1Parameter: 0x00, p2Parameter: 0x00, data: Data(), expectedResponseLength: 256)

        tag.sendCommand(apdu: readBinaryAPDU) { (responseData, sw1, sw2, error) in
            if let error = error {
                print("基本4情報の読み取りエラー: \(error.localizedDescription)")
                return
            }

            if sw1 == 0x90 && sw2 == 0x00 {
                print("基本4情報の読み取り成功")
                print("データ: \(responseData)")
                self.printData(responseData, isPrintData: true, sw1, sw2)
                let NAME_SEGMENT_START = 9
                let ADDRESS_SEGMENT_START = 11
                let BIRTHDATE_SEGMENT_START = 13
                let GENDER_SEGMENT_START = 15
                // データ解析
                let name = self.parseData(responseData, segmentStart: Int(responseData[NAME_SEGMENT_START]) )
                let address = self.parseData(responseData, segmentStart: Int(responseData[ADDRESS_SEGMENT_START]))
                let birthdate = self.parseData(responseData, segmentStart: Int(responseData[BIRTHDATE_SEGMENT_START]) )
                let gender = self.parseData(responseData, segmentStart: Int(responseData[GENDER_SEGMENT_START]))

                // 結果の表示
                print("名前: \(name)")
                print("住所: \(address)")
                print("生年月日: \(birthdate)")
                print("性別: \(gender)")
                self.message = birthdate
                // 読み取りセッションを正常に終了させる
                self.session?.alertMessage = "Scan Completed!"
                self.session?.invalidate()
                // 非同期処理待機中の他の処理に対して通知を行う
                self.semaphore.signal()
            } else {
                print("基本4情報の読み取り失敗: ステータスコード \(sw1), \(sw2)")
            }
        }
    }

    /// データ解析の補助関数
    func parseData(_ data: Data, segmentStart: Int) -> String {
        let responseData = [UInt8](data)
        print("responseData: \(responseData)")
        let attrLengthIndex = segmentStart + 2
        print("attrLengthIndex: \(attrLengthIndex)")
        guard attrLengthIndex < data.count else {
            print("データ解析エラー: 属性の長さの取得に失敗しました。")
            return ""
        }
        let attrLength = Int(data[attrLengthIndex])
        print("attrLength: \(attrLength)")
        let attrStart = attrLengthIndex + 1
        let attrEnd = attrStart + attrLength
        print("attrStart: \(attrStart), attrEnd: \(attrEnd)")

        guard attrStart < data.count, attrEnd <= data.count, attrLength > 0 else {
            print("データ解析エラー: 属性データの取得に失敗しました。")
            print("attrStart: \(attrStart), attrEnd: \(attrEnd), attrLength: \(attrLength)")
            return ""
        }
        let attrData = data[attrStart..<attrEnd]
        print("attrData: \(attrData)")
        print("attrData: \(attrData as NSData)")
        print("attrData as string: \(String(data: attrData, encoding: .utf8) ?? "")")
        return String(data: attrData, encoding: .utf8) ?? ""
    }

    func printData(_ responseData: Data, isPrintData: Bool = false, _ sw1: UInt8, _ sw2: UInt8) {
            let responseData = [UInt8](responseData)
            let responseString = responseData.map({ (byte) -> String in
                return byte.toHexString()
            })

            if isPrintData {
                print("responseCount: \(responseString.count), response: \(responseString), sw1: \(sw1.toHexString()), sw2: \(sw2.toHexString()), ステータス: \(ISO7816Status.localizedString(forStatusCode: sw1, sw2))")
            } else {
                print("responseCount: \(responseString.count), sw1: \(sw1.toHexString()), sw2: \(sw2.toHexString()), ステータス: \(ISO7816Status.localizedString(forStatusCode: sw1, sw2))")
            }
        }
}
