import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, Button } from 'react-native';
import { useGenerateProof } from './src/hooks/useGenerateProof';
import { styles } from './src/styles/AppStyles';

export default function App(): JSX.Element {
  const { age, setAge, proofResult, handleGenerateProof } = useGenerateProof();

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <Button title="Verify Age" onPress={handleGenerateProof} />
      {proofResult ? <Text>{proofResult}</Text> : null}
      <StatusBar style="auto" />
    </View>
  );
}
