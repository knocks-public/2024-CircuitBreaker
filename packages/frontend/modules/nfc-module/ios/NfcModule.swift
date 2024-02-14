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
    var pin1 = "" // 暗証番号1

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

            session.alertMessage = "マイナンバーカードを読み取っています…"

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
        session?.alertMessage = "マイナンバーカードの上に iPhone の上部を載せてください"
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
                let NAME_SEGMENT_START = 9
                let ADDRESS_SEGMENT_START = 11
                let BIRTHDATE_SEGMENT_START = 13
                let GENDER_SEGMENT_START = 15
                // データ解析
                let name = self.parseData(responseData, segmentStart: NAME_SEGMENT_START)
                let address = self.parseData(responseData, segmentStart: ADDRESS_SEGMENT_START)
                let birthdate = self.parseData(responseData, segmentStart: BIRTHDATE_SEGMENT_START)
                let gender = self.parseData(responseData, segmentStart: GENDER_SEGMENT_START)

                // 結果の表示
                print("名前: \(name)")
                print("住所: \(address)")
                print("生年月日: \(birthdate)")
                print("性別: \(gender)")
            } else {
                print("基本4情報の読み取り失敗: ステータスコード \(sw1), \(sw2)")
            }
        }
    }

    /// データ解析の補助関数
    func parseData(_ data: Data, segmentStart: Int) -> String {
        // セグメントの開始位置から属性の長さを取得
        let attrLengthIndex = segmentStart + 2
        guard attrLengthIndex < data.count else {
            return ""
        }
        let attrLength = Int(data[attrLengthIndex])
        let attrStart = attrLengthIndex + 1
        let attrEnd = attrStart + attrLength

        // 実際の属性データを取り出し
        guard attrStart < data.count, attrEnd <= data.count, attrLength > 0 else {
            return ""
        }
        let attrData = data[attrStart..<attrEnd]
        return String(data: attrData, encoding: .utf8) ?? ""
    }

}
