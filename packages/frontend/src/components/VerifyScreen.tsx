import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { useVerifyAge } from '../hooks/useVerifyProof';
import { logger } from '../utils/logger';
import { styles } from '../styles/AppStyles';

const VerifyScreen = (): JSX.Element => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const { verifyProof, verificationResult, verificationSuccess, isVerifying } =
    useVerifyAge();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        logger.error('Failed to request camera permission', error);
        setHasPermission(false);
      }
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    await verifyProof(data);
  };

  const handleScanAgain = () => {
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.statusText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.permissionText}>
          Camera access is required to scan the verification QR code. Please
          enable camera permission for Inro in your device settings.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {scanned ? (
        <>
          {isVerifying ? (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.statusText}>Verifying proof...</Text>
            </View>
          ) : (
            <Text
              style={
                verificationSuccess ? styles.successMessage : styles.failMessage
              }
            >
              Verification Result: {verificationResult}
            </Text>
          )}
        </>
      ) : (
        <Camera
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
      )}
      <Button
        title={'Scan again'}
        onPress={handleScanAgain}
        disabled={isVerifying}
      />
    </View>
  );
};

export default VerifyScreen;
