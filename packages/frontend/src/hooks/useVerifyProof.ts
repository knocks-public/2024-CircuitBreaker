import { useState } from 'react';
import { Alert } from 'react-native';
import SindriService from '../service/sindriService';

export const useVerifyAge = () => {
  const [isVerifier, setIsVerifier] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(
    null
  );

  const verifyProof = async (proofId: string) => {
    const service = new SindriService();
    try {
      const result = await service.verifyProof(proofId);
      if (result) {
        setVerificationResult('Adult verification was successful.');
      } else {
        setVerificationResult('Verification failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during verification.');
    }
  };

  return { isVerifier, setIsVerifier, verifyProof, verificationResult };
};
