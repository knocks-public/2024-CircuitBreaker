import ExpoModulesCore
import CoreNFC
import Foundation

public class NfcModule: Module {
    var session: NfcSession?
    var semaphore: DispatchSemaphore?

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

    init(semaphore: DispatchSemaphore) {
        self.semaphore = semaphore
    }

    func tagReaderSessionDidBecomeActive(_ session: NFCTagReaderSession) {
        print("tagReaderSessionDidBecomeActive")
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didInvalidateWithError error: Error) {
        if let readerError = error as? NFCReaderError {
            print(readerError.code, readerError.localizedDescription)
        }
    }

    func tagReaderSession(_ session: NFCTagReaderSession, didDetect tags: [NFCTag]) {
        guard let tag = tags.first else { return }
        
        session.connect(to: tag) { (error) in
            if let error = error {
                session.invalidate(errorMessage: error.localizedDescription)
                return
            }

            guard case NFCTag.iso7816(let mynumberCardTag) = tag else {
                session.invalidate(errorMessage: "Not compliant with ISO 7816")
                return
            }

            session.alertMessage = "Reading... MyNumber Card"

            self.sendCommand(mynumberCardTag, apdu: self.selectApdu(with: [0xD3, 0x92, 0x10, 0x00, 0x31, 0x00, 0x01, 0x01, 0x04, 0x08])) { (responseData, sw1, sw2) in
                self.sendCommand(mynumberCardTag, apdu: self.selectApdu(with: [0x00, 0x11])) { (responseData, sw1, sw2) in
                    if sw1 == 0x90 && sw2 == 0x00 {
                        self.verifyPin(pin: self.pin1, for: mynumberCardTag)
                    } else {
                        session.invalidate(errorMessage: "Failed to select PIN for visual assistance: Status code \(sw1), \(sw2)")
                    }
                }
            }
        }
    }

    func startSession() {
        self.session = NFCTagReaderSession(pollingOption: .iso14443, delegate: self)
        session?.alertMessage = "Touch your MyNumber Card to the iPhone"
        session?.begin()
    }

    private func verifyPin(pin: String, for tag: NFCISO7816Tag) {
        guard let pinData = pin.data(using: .ascii) else {
            print("Failed to convert PIN data")
            return
        }

        let verifyApdu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0x20, p1Parameter: 0x00, p2Parameter: 0x80, data: pinData, expectedResponseLength: -1)
        sendCommand(tag, apdu: verifyApdu) { (responseData, sw1, sw2) in
            if sw1 == 0x90 && sw2 == 0x00 {
                self.selectBaseFourInfo(for: tag)
            } else {
                print("PIN verification failed: Status code \(sw1), \(sw2)")
            }
        }
    }

    private func selectBaseFourInfo(for tag: NFCISO7816Tag) {
        let baseFourInfoApdu = selectApdu(with: [0x00, 0x02])
        sendCommand(tag, apdu: baseFourInfoApdu) { (responseData, sw1, sw2) in
            if sw1 == 0x90 && sw2 == 0x00 {
                self.readBaseFourInfo(for: tag)
            } else {
                print("Failed to select basic four information: Status code \(sw1), \(sw2)")
            }
        }
    }

    private func readBaseFourInfo(for tag: NFCISO7816Tag) {
        let readBinaryApdu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xB0, p1Parameter: 0x00, p2Parameter: 0x00, data: Data(), expectedResponseLength: 256)
        sendCommand(tag, apdu: readBinaryApdu) { (responseData, sw1, sw2) in
            if sw1 == 0x90 && sw2 == 0x00 {
                self.handleReadResponse(responseData)
            } else {
                print("Failed to read basic four information: Status code \(sw1), \(sw2)")
            }
        }
    }

    private func handleReadResponse(_ data: Data) {
        print("Successfully read basic four information")
        print("Data: \(data)")
        let name = parseData(data, segmentStart: 9)
        let address = parseData(data, segmentStart: 11)
        let birthdate = parseData(data, segmentStart: 13)
        let gender = parseData(data, segmentStart: 15)

        print("Name: \(name)")
        print("Address: \(address)")
        print("Birthdate: \(birthdate)")
        print("Gender: \(gender)")
        
        self.message = birthdate
        self.session?.alertMessage = "Scan Completed!"
        self.session?.invalidate()
        self.semaphore.signal()
    }

    private func sendCommand(_ tag: NFCISO7816Tag, apdu: NFCISO7816APDU, completion: @escaping (Data, UInt8, UInt8) -> Void) {
        tag.sendCommand(apdu: apdu) { (responseData, sw1, sw2, error) in
            if let error = error {
                print("Error sending APDU: \(error.localizedDescription)")
                return
            }
            completion(responseData, sw1, sw2)
        }
    }

    private func selectApdu(with data: [UInt8]) -> NFCISO7816APDU {
        return NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x04, p2Parameter: 0x0C, data: Data(data), expectedResponseLength: -1)
    }

    private func parseData(_ data: Data, segmentStart: Int) -> String {
        let responseData = [UInt8](data)
        let attrLengthIndex = segmentStart + 2
        guard attrLengthIndex < data.count else {
            print("Error parsing data: Failed to obtain attribute length.")
            return ""
        }
        let attrLength = Int(data[attrLengthIndex])
        let attrStart = attrLengthIndex + 1
        let attrEnd = attrStart + attrLength

        guard attrStart < data.count, attrEnd <= data.count, attrLength > 0 else {
            print("Error parsing data: Failed to retrieve attribute data.")
            return ""
        }
        let attrData = data[attrStart..<attrEnd]
        return String(data: attrData, encoding: .utf8) ?? ""
    }
}
