import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Keyboard,
  Switch,
  Text,
  TextInput, // 追加
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useGenerateProof } from './src/hooks/useGenerateProof';
import { useVerifyAge } from './src/hooks/useVerifyProof';
import { styles } from './src/styles/AppStyles';
import { scan } from './modules/nfc-module';

const App = (): JSX.Element => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isVerifier, setIsVerifier] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [pin, setPin] = useState(''); // 暗証番号の状態を追加
  const { age, setAge, proofResult, handleGenerateProof } = useGenerateProof();
  const { verifyProof, verificationResult } = useVerifyAge();
  const [birthdate, setBirthdate] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleScan = async () => {
    // 暗証番号をNFCスキャン関数に渡す
    const result = await scan(pin); // `scan`関数を修正して暗証番号を受け取れるようにする必要があります
    setAge(result); // ここで年齢をセットしていますが、実際には生年月日が返ってくると想定しています
    setBirthdate(result); // 追加: 生年月日をセット
    handleGenerateProof();
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    await verifyProof(data);
  };

  return (
    <View style={styles.container} onTouchStart={() => Keyboard.dismiss()}>
      <Switch onValueChange={(newValue) => {
        setIsVerifier(newValue);
        setScanned(false);
      }} value={isVerifier} />
      {isVerifier ? (
        <>
          {scanned ? (
            <>
              <Text>Verification Result: {verificationResult}</Text>
            </>
          ) : (
            <Camera
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={styles.camera}
            />
          )}
          <Button title={'Scan again'} onPress={() => setScanned(false)} />
        </>
      ) : (
        <>
          {/* 暗証番号入力フィールドを追加 */}
          <TextInput
            style={styles.input} // スタイルは適宜定義または修正する
            value={pin}
            onChangeText={setPin}
            placeholder="暗証番号を入力"
            secureTextEntry={true} // 入力をマスクする
            keyboardType="numeric" // 数字キーボードを使用
          />
          {/* 生年月日を表示するTextコンポーネントを追加 */}
          <Text style={{ margin: 10 }}>生年月日: {birthdate}</Text>
          <Button title="Scan NFC" onPress={handleScan} />
          {proofResult && proofResult !== '' && (
            <View style={styles.qrCodeContainer}>
              <Text>Proof ID:</Text>
              <QRCode value={proofResult} size={200} />
            </View>
          )}
        </>
      )}
      <StatusBar style="auto" />
    </View>
  );
};

export default App;
