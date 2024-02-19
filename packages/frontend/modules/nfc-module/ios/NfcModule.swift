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
                session.invalidate(errorMessage: "Not compliant with ISO 7816")
                return
            }

            session.alertMessage = "Reading... MyNumber Card"

            /// SELECT FILE: Assistance application for visual impairment (DF)
            let profileAID: [UInt8] = [0xD3, 0x92, 0x10, 0x00, 0x31, 0x00, 0x01, 0x01, 0x04, 0x08]
            let apdu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x04, p2Parameter: 0x0C, data: Data(profileAID), expectedResponseLength: -1)
            mynumberCardTag.sendCommand(apdu: apdu) { (responseData, sw1, sw2, error) in

                if let error = error {
                    session.invalidate(errorMessage: error.localizedDescription)
                    return
                }

                ///  SELECT FILE: PIN for visual assistance (EF)
                let profilePinEFID: [UInt8] = [0x00, 0x11]
                let selectProfilePinAPDU = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x02, p2Parameter: 0x0C, data: Data(profilePinEFID), expectedResponseLength: -1)

                mynumberCardTag.sendCommand(apdu: selectProfilePinAPDU) { (responseData, sw1, sw2, error) in
                    if let error = error {
                        session.invalidate(errorMessage: error.localizedDescription)
                        return
                    }

                    if sw1 == 0x90 && sw2 == 0x00 {
                        print("Successfully selected PIN for visual assistance")

                    } else {
                        session.invalidate(errorMessage: "Failed to select PIN for visual assistance: Status code \(sw1), \(sw2)")
                    }
                }

                // VERIFY: PIN for visual assistance (password)
                self.verifyPin(pin: self.pin1, for: mynumberCardTag)

            }
        }
    }

    func startSession() {
        self.session = NFCTagReaderSession(pollingOption: .iso14443 , delegate: self)
        session?.alertMessage = "Touch your MyNumber Card to the iPhone"
        session?.begin()
    }

    /// VERIFY: PIN for visual assistance (password)
    func verifyPin(pin: String, for tag: NFCISO7816Tag) {
        guard let pinData = pin.data(using: .ascii) else {
            print("Failed to convert PIN data")
            return
        }

        let verifyApdu = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0x20, p1Parameter: 0x00, p2Parameter: 0x80, data: pinData, expectedResponseLength: -1)

        tag.sendCommand(apdu: verifyApdu) { (responseData, sw1, sw2, error) in
            if let error = error {
                print("Error sending PIN verification: \(error.localizedDescription)")
                return
            }

            if sw1 == 0x90 && sw2 == 0x00 {
                print("PIN verification successful")
                self.selectBaseFourInfo(for: tag)
            } else {
                print("PIN verification failed: Status code \(sw1), \(sw2)")
            }
        }
    }

    /// SELECT FILE: Basic four information (EF)
    func selectBaseFourInfo(for tag: NFCISO7816Tag) {
        let baseFourInfoEFID: [UInt8] = [0x00, 0x02]
        let selectBaseFourInfoAPDU = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xA4, p1Parameter: 0x02, p2Parameter: 0x0C, data: Data(baseFourInfoEFID), expectedResponseLength: -1)

        tag.sendCommand(apdu: selectBaseFourInfoAPDU) { (responseData, sw1, sw2, error) in
            if let error = error {
                print("Error selecting basic four information: \(error.localizedDescription)")
                return
            }

            if sw1 == 0x90 && sw2 == 0x00 {
                print("Successfully selected basic four information")
                self.readBaseFourInfo(for: tag)
            } else {
                print("Failed to select basic four information: Status code \(sw1), \(sw2)")
            }
        }
    }

    /// READ BINARY: Reading and analyzing the basic four information
    func readBaseFourInfo(for tag: NFCISO7816Tag) {
        let readBinaryAPDU = NFCISO7816APDU(instructionClass: 0x00, instructionCode: 0xB0, p1Parameter: 0x00, p2Parameter: 0x00, data: Data(), expectedResponseLength: 256)

        tag.sendCommand(apdu: readBinaryAPDU) { (responseData, sw1, sw2, error) in
            if let error = error {
                print("Error reading basic four information: \(error.localizedDescription)")
                return
            }

            if sw1 == 0x90 && sw2 == 0x00 {
                print("Successfully read basic four information")
                print("Data: \(responseData)")
                let NAME_SEGMENT_START = 9
                let ADDRESS_SEGMENT_START = 11
                let BIRTHDATE_SEGMENT_START = 13
                let GENDER_SEGMENT_START = 15
                let name = self.parseData(responseData, segmentStart: Int(responseData[NAME_SEGMENT_START]) )
                let address = self.parseData(responseData, segmentStart: Int(responseData[ADDRESS_SEGMENT_START]))
                let birthdate = self.parseData(responseData, segmentStart: Int(responseData[BIRTHDATE_SEGMENT_START]) )
                let gender = self.parseData(responseData, segmentStart: Int(responseData[GENDER_SEGMENT_START]))

                print("Name: \(name)")
                print("Address: \(address)")
                print("Birthdate: \(birthdate)")
                print("Gender: \(gender)")
                self.message = birthdate
                self.session?.alertMessage = "Scan Completed!"
                self.session?.invalidate()
                self.semaphore.signal()
            } else {
                print("Failed to read basic four information: Status code \(sw1), \(sw2)")
            }
        }
    }

    /// Helper function for data analysis
    func parseData(_ data: Data, segmentStart: Int) -> String {
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

    func printData(_ responseData: Data, isPrintData: Bool = false, _ sw1: UInt8, _ sw2: UInt8) {
        let responseData = [UInt8](responseData)
        let responseString = responseData.map({ (byte) -> String in
            return byte.toHexString()
        })

        if isPrintData {
            print("Response count: \(responseString.count), response: \(responseString), sw1: \(sw1.toHexString()), sw2: \(sw2.toHexString()), Status: \(ISO7816Status.localizedString(forStatusCode: sw1, sw2))")
        } else {
            print("Response count: \(responseString.count), sw1: \(sw1.toHexString()), sw2: \(sw2.toHexString()), Status: \(ISO7816Status.localizedString(forStatusCode: sw1, sw2))")
        }
    }
}
