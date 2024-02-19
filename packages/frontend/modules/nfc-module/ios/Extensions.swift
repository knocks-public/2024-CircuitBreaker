import Foundation

public extension Date {
    func toString(dateStyle: DateFormatter.Style = .full, timeStyle: DateFormatter.Style = .none) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = dateStyle
        formatter.timeZone = TimeZone(identifier: "Asia/Tokyo")
        formatter.timeStyle = timeStyle
        return formatter.string(from: self)
    }
}

public extension Optional where Wrapped == Date {
    func toString(dateStyle: DateFormatter.Style = .full, timeStyle: DateFormatter.Style = .none) -> String? {
        return self?.toString(dateStyle: dateStyle, timeStyle: timeStyle)
    }
}

public extension UInt8 {
    func toString() -> String {
        var str = String(self, radix: 16).uppercased()
        if str.count == 1 {
            str = "0" + str
        }
        return str
    }

    func toHexString() -> String {
        var str = self.toString()
        str = "0x\(str)"
        return str
    }
}

public extension Optional where Wrapped == UInt8 {
    func toHexString() -> String? {
        return self?.toHexString()
    }
}

internal extension UInt8 {
    var data: Data {
        var int8 = self
        return Data(bytes: &int8, count: MemoryLayout<UInt8>.size)
    }
}

public extension UInt16 {
    var data: Data {
        var int16 = self
        return Data(bytes: &int16, count: MemoryLayout<UInt16>.size)
    }

    var uint8: [UInt8] {
        return [UInt8(self >> 8), UInt8(self & 0x00ff)]
    }

    func toHexString() -> String {
        let bytes = self.uint8
        return "0x" + bytes[0].toString() + bytes[1].toString()
    }
}

public extension String {
    var bytes: [UInt8] {
        var i = self.startIndex
        return (0..<self.count/2).compactMap { _ in
            defer { i = self.index(i, offsetBy: 2) }
            return UInt8(self[i...index(after: i)], radix: 16)
        }
    }
    var hexData: Data {
        return Data(self.bytes)
    }
}

public extension Array {
    func split(count: Int) -> [[Element]] {
        var s: [[Element]] = []
        var i = 0
        while i < self.count {
            var a: [Element] = []
            var j = 0
            while j < count {
                if i < self.count {
                    a.append(self[i])
                }
                i += 1
                j += 1
            }
            s.append(a)
        }
        return s
    }
}

public extension Data {
    var hexString: String {
        return self.map { String(format: "%.2hhx", $0) }.joined()
    }

    func toIntReversed(_ startIndex: Int, _ endIndex: Int) -> Int {
        var s = 0

        for (n, i) in (startIndex...endIndex).enumerated() {
            s += Int(self[i]) << (n * 8)
        }

        return s
    }
}

public enum ISO7816Status {
    public static func localizedString(forStatusCode sw1: UInt8, _ sw2: UInt8) -> String {
        let statusCode = (sw1, sw2)
        switch statusCode {
        case (0x90, 0x00):
            return "Operation completed successfully"
        case (0x62, 0x00):
            return "No information given"
        case (0x62, 0x81):
            return "Part of returned data may be corrupted"
        case (0x62, 0x82):
            return "End of file/record reached before reading Le bytes or unsuccessful search"
        case (0x62, 0x83):
            return "Selected file deactivated"
        case (0x62, 0x84):
            return "File control information not formatted according to specification"
        case (0x62, 0x85):
            return "Selected file in termination state"
        case (0x62, 0x86):
            return "No input data available from a sensor on the card"
        case (0x62, 0x87):
            return "At least one of the reference records was deactivated"
        case (0x63, 0x00):
            return "Verification failed"
        case (0x63, 0x81):
            return "File filled up by the last write"
        case (0x63, 0xC0):
            return "Verification failed (0 attempts remaining)"
        case (0x63, 0xC1):
            return "Verification failed (1 attempt remaining)"
        case (0x63, 0xC2):
            return "Verification failed (2 attempts remaining)"
        case (0x63, 0xC3):
            return "Verification failed (3 attempts remaining)"
        case (0x63, 0xC4):
            return "Verification failed (4 attempts remaining)"
        case (0x63, 0xC5):
            return "Verification failed (5 attempts remaining)"
        case (0x63, 0xC6):
            return "Verification failed (6 attempts remaining)"
        case (0x63, 0xC7):
            return "Verification failed (7 attempts remaining)"
        case (0x63, 0xC8):
            return "Verification failed (8 attempts remaining)"
        case (0x63, 0xC9):
            return "Verification failed (9 attempts remaining)"
        case (0x63, 0xCA):
            return "Verification failed (10 attempts remaining)"
        case (0x63, 0xCB):
            return "Verification failed (11 attempts remaining)"
        case (0x63, 0xCC):
            return "Verification failed (12 attempts remaining)"
        case (0x63, 0xCD):
            return "Verification failed (13 attempts remaining)"
        case (0x63, 0xCE):
            return "Verification failed (14 attempts remaining)"
        case (0x63, 0xCF):
            return "Verification failed (15 attempts remaining)"
        case (0x64, 0x00):
            return "File control information with incorrect values"
        case (0x65, 0x81):
            return "Memory failure"
        case (0x67, 0x00):
            return "Wrong length, no further information"
        case (0x68, 0x81):
            return "Logical channel not supported"
        case (0x68, 0x82):
            return "Secure messaging not supported"
        case (0x69, 0x81):
            return "Command incompatible with file structure"
        case (0x69, 0x82):
            return "Security status not satisfied"
        case (0x69, 0x84):
            return "Referenced data invalidated"
        case (0x69, 0x85):
            return "Conditions of use not satisfied"
        case (0x69, 0x86):
            return "No current EF"
        case (0x6A, 0x80):
            return "Incorrect parameters in the data field"
        case (0x6A, 0x81):
            return "Function not supported"
        case (0x6A, 0x82):
            return "File not found"
        case (0x6A, 0x83):
            return "Record not found"
        case (0x6A, 0x84):
            return "Insufficient memory space in the file"
        case (0x6A, 0x85):
            return "Lc inconsistent with TLV structure"
        case (0x6A, 0x86):
            return "Incorrect parameters P1-P2"
        case (0x6A, 0x87):
            return "Lc inconsistent with P1-P2"
        case (0x6A, 0x88):
            return "Referenced data not found"
        case (0x6B, 0x00):
            return "Reference point in the file uncorrected"
        case (0x6D, 0x00):
            return "Instruction code not supported or invalid"
        case (0x6E, 0x00):
            return "Class not supported"
        case (0x6F, 0x00):
            return "No precise diagnosis"
        default:
            return "Unknown status code sw1: \(sw1.toHexString()), sw2: \(sw2.toHexString())"
        }
    }
}
