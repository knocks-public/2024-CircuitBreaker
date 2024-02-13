import Foundation

extension String {

    func convertToJISX0201() -> [UInt8] {
        if self.count != 4 {
            fatalError("暗証番号が4ケタではない")
        }

        let pinStringArray = Array(self)

        let pinSet = Set(pinStringArray)
        let enterableNumberSet: Set<String.Element> = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*"]
        if !pinSet.isSubset(of: enterableNumberSet) {
            fatalError("暗証番号で使用できない文字が含まれている")
        }

        let pin = pinStringArray.map { (c) -> UInt8 in
            self.encodeToJISX0201(c)
        }

        return pin
    }

    func encodeToJISX0201(_ c: Character) -> UInt8 {
        switch c {
        case "0":
            return 0x30
        case "1":
            return 0x31
        case "2":
            return 0x32
        case "3":
            return 0x33
        case "4":
            return 0x34
        case "5":
            return 0x35
        case "6":
            return 0x36
        case "7":
            return 0x37
        case "8":
            return 0x38
        case "9":
            return 0x39
        case "*":
            return 0x2A
        default:
            fatalError()
        }
    }

    init(jisX0208Data: [Data]) {
        guard let path = Bundle.main.path(forResource: "JIS0208", ofType: "TXT") else {
            fatalError("JIS0208.TXT が見つかりません")
        }

        let contents = try! String(contentsOfFile: path, encoding: .utf8)
        let tableStrings = contents.components(separatedBy: .newlines)
        var tableJISX0208ToUnicode: [Data : Data] = [:]
        for row in tableStrings {
            if row.first != "#" {
                let col = row.components(separatedBy: .whitespaces)
                if col.count > 2 {
                    let col1 = col[1].hexData
                    let col2 = col[2].hexData
                    tableJISX0208ToUnicode[col1] = col2
                }
            }
        }

        var string = ""
        for data in jisX0208Data {
            if let unicodeData = tableJISX0208ToUnicode[data], let s = String(data: unicodeData, encoding: .unicode) {
                string += s
            } else {
                switch data {
                case Data([0xFF, 0xF1]):
                    string += "(外字1)"
                case Data([0xFF, 0xF2]):
                    string += "(外字2)"
                case Data([0xFF, 0xF3]):
                    string += "(外字3)"
                case Data([0xFF, 0xF4]):
                    string += "(外字4)"
                case Data([0xFF, 0xF5]):
                    string += "(外字5)"
                case Data([0xFF, 0xF6]):
                    string += "(外字6)"
                case Data([0xFF, 0xF7]):
                    string += "(外字7)"
                case Data([0xFF, 0xFA]):
                    string += "(欠字)"
                default:
                    string += "(未定義)"
                }
            }
        }

        self = string
    }

    // 参考: https://gist.github.com/eligoptimove/09ee57ac2e0c5d7889f761f40c73e9a6
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
