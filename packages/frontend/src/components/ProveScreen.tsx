import React, { useRef, useState } from 'react';
import {
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

const ProveScreen = (): JSX.Element => {
  const pinInputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const [pin, setPin] = useState(['', '', '', '']);
  const { handleGenerateProof, proofResult } = useGenerateProof();

  const handleScan = async () => {
    const result = await scan(pin.join(''));
    const age = calculateAge(result);
    handleGenerateProof(age);
  };

  const handlePinChange = (text: string, index: number) => {
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
      <Text>Input your pin code</Text>
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
      <TouchableOpacity onPress={handleScan} style={styles.button}>
        <Text style={styles.buttonText}>Scan NFC</Text>
      </TouchableOpacity>
      {proofResult && proofResult !== '' && (
        <View style={styles.qrCodeContainer}>
          <Text>Proof ID:</Text>
          <QRCode value={proofResult} size={200} />
        </View>
      )}
    </View>
  );
};

export default ProveScreen;
