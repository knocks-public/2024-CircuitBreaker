import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Keyboard,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useGenerateProof } from './src/hooks/useGenerateProof';
import { useVerifyAge } from './src/hooks/useVerifyProof';
import { styles } from './src/styles/AppStyles';
import { scan } from './modules/nfc-module';
import { calculateAge } from './src/utils/ageCalculator';

const App = (): JSX.Element => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isVerifier, setIsVerifier] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [pin, setPin] = useState('');
  const { age, setAge, proofResult, handleGenerateProof } = useGenerateProof();
  const { verifyProof, verificationResult } = useVerifyAge();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    await verifyProof(data);
  }

  const handleScan = async () => {
    const result = await scan(pin);
    const age = calculateAge(result);
    handleGenerateProof(age);
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
          { }
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            placeholder="Input your PIN"
            secureTextEntry={true}
            keyboardType="numeric"
          />
          { }
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
