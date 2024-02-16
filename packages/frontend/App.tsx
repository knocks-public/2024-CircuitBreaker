import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Keyboard,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { scan } from './modules/nfc-module';
import { useGenerateProof } from './src/hooks/useGenerateProof';
import { useVerifyAge } from './src/hooks/useVerifyProof';
import { styles } from './src/styles/AppStyles';
import { calculateAge } from './src/utils/ageCalculator';

const App = (): JSX.Element => {
  const pinInputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isVerifier, setIsVerifier] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
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
  };

  const handleScan = async () => {
    const result = await scan(pin.join(''));
    const age = calculateAge(result);
    handleGenerateProof(age);
  };

  const handlePinChange = (text, index) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    if (text !== '' && index < 3) {
      pinInputRefs[index + 1].current?.focus();
    } else if (text === '' && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    }
  };

  return (
    <View style={styles.container} onTouchStart={() => Keyboard.dismiss()}>
      <StatusBar style="auto" />
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Proof</Text>
        <Switch
          onValueChange={(newValue) => {
            setIsVerifier(newValue);
            setScanned(false);
          }}
          value={isVerifier}
          style={styles.switch}
        />
        <Text style={styles.switchLabel}>Verify</Text>
      </View>
      {isVerifier ? (
        <>
          {scanned ? (
            <>
              <Text style={styles.verificationResult}>
                Verification Result: {verificationResult}
              </Text>
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
          {}
          <View style={styles.pinContainer}>
            {Array.from({ length: 4 }).map((_, index) => (
              <TextInput
                ref={pinInputRefs[index]}
                key={index}
                style={styles.pinInputBox}
                value={pin[index] || ''}
                onChangeText={(text) => handlePinChange(text, index)}
                maxLength={1}
                keyboardType="numeric"
                secureTextEntry={true}
              />
            ))}
          </View>
          {}
          <TouchableOpacity onPress={handleScan} style={styles.button}>
            <Text style={styles.buttonText}>Scan NFC</Text>
          </TouchableOpacity>
          {proofResult && proofResult !== '' && (
            <View style={styles.qrCodeContainer}>
              <Text>Proof ID:</Text>
              <QRCode value={proofResult} size={200} />
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default App;
