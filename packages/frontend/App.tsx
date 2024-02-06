import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Button, Keyboard, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useGenerateProof } from './src/hooks/useGenerateProof';
import { styles } from './src/styles/AppStyles';

const App = (): JSX.Element => {
  const { age, setAge, proofResult, handleGenerateProof } = useGenerateProof();
  const hideKeyboard = () => {
    Keyboard.dismiss();
  };
  return (
    <View style={styles.container} onTouchStart={hideKeyboard}>
      <TextInput
        style={styles.input}
        placeholder="Enter your age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <Button title="Verify Age" onPress={handleGenerateProof} />
      {proofResult && proofResult !== '' && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text>Proof ID:</Text>
          <QRCode value={proofResult} size={200} />
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
};

export default App;
