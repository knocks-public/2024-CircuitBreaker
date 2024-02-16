import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { useVerifyAge } from '../hooks/useVerifyProof';
import { styles } from '../styles/AppStyles';

const VerifyScreen = (): JSX.Element => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
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

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {scanned ? (
        <Text style={styles.verificationResult}>
          Verification Result: {verificationResult}
        </Text>
      ) : (
        <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
      )}
      <Button title={'Scan again'} onPress={() => setScanned(false)} />
    </View>
  );
};

export default VerifyScreen;
