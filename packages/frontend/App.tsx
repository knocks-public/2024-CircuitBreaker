import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Keyboard,
  Switch,
  Text,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useGenerateProof } from './src/hooks/useGenerateProof';
import { useVerifyAge } from './src/hooks/useVerifyProof';
import { styles } from './src/styles/AppStyles';
import { scan } from './modules/nfc-module'; // NFCモジュールのインポート

const App = (): JSX.Element => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isVerifier, setIsVerifier] = useState(false);
  const [scanned, setScanned] = useState(false);
  const { age, setAge, proofResult, handleGenerateProof } = useGenerateProof();
  const { verifyProof, verificationResult } = useVerifyAge();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // NFCスキャンの結果を扱う関数
  const handleScan = async () => {
    const result = await scan(); // NFCスキャン実行
    setAge(result); // スキャン結果を年齢として設定
    handleGenerateProof(); // 年齢検証の証明を生成
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
          {/* NFCスキャンボタンを追加 */}
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
