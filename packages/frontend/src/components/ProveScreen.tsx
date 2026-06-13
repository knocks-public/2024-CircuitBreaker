import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { scan } from '../../modules/nfc-module';
import { useGenerateProof } from '../hooks/useGenerateProof';
import { styles } from '../styles/AppStyles';
import { calculateAge } from '../utils/ageCalculator';

const PIN_LENGTH = 4;

const ProveScreen = (): JSX.Element => {
  const pinInputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const { handleGenerateProof, proofResult, isGenerating, error, reset } =
    useGenerateProof();

  const isPinComplete = pin.every((digit) => digit !== '');
  const isBusy = isScanning || isGenerating;

  const handleScan = async () => {
    if (!isPinComplete || isBusy) {
      return;
    }
    Keyboard.dismiss();
    setScanError(null);
    reset();
    setIsScanning(true);
    try {
      const birthDate = await scan(pin.join(''));
      const age = calculateAge(birthDate);
      if (Number.isNaN(age)) {
        setScanError('Could not read a valid date of birth from the card.');
        return;
      }
      await handleGenerateProof(age);
    } catch {
      setScanError('Failed to read the card. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handlePinChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    if (digit !== '' && index < PIN_LENGTH - 1) {
      pinInputRefs[index + 1].current?.focus();
    } else if (digit === '' && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    }
  };

  return (
    <View style={styles.container} onTouchStart={() => Keyboard.dismiss()}>
      <Text>Enter the pin code</Text>
      <View style={styles.pinContainer}>
        {Array.from({ length: PIN_LENGTH }).map((_, index) => (
          <TextInput
            ref={pinInputRefs[index]}
            key={index}
            style={styles.pinInputBox}
            value={pin[index] || ''}
            onChangeText={(text) => handlePinChange(text, index)}
            maxLength={1}
            keyboardType="numeric"
            secureTextEntry={true}
            editable={!isBusy}
          />
        ))}
      </View>
      <TouchableOpacity
        onPress={handleScan}
        style={[
          styles.button,
          (!isPinComplete || isBusy) && styles.buttonDisabled,
        ]}
        disabled={!isPinComplete || isBusy}
      >
        <Text style={styles.buttonText}>Start Scan Your ID</Text>
      </TouchableOpacity>

      {isBusy && (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.statusText}>
            {isScanning
              ? 'Reading your card...'
              : 'Generating proof. This can take a little while...'}
          </Text>
        </View>
      )}

      {(scanError || error) && !isBusy && (
        <Text style={styles.errorText}>{scanError ?? error}</Text>
      )}

      {proofResult && proofResult !== '' && !isBusy && (
        <View style={styles.qrCodeContainer}>
          <Text>Show this QR code to the verifier</Text>
          <QRCode value={proofResult} size={200} />
        </View>
      )}
    </View>
  );
};

export default ProveScreen;
