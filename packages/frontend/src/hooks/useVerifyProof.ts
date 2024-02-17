import { useState } from 'react';
import { Alert } from 'react-native';
import SindriService from '../service/SindriService';

export const useVerifyAge = () => {
  const [isVerifier, setIsVerifier] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string>('');

  const verifyProof = async (proofId: string) => {
    const service = new SindriService();
    try {
      const result = await service.verifyProof(proofId);
      if (result) {
        setVerificationResult(`Adult verification was successful.`);
        setVerificationSuccess(true);
      } else {
        setVerificationResult(`Verification failed.`);
        setVerificationSuccess(false);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during verification.');
      setVerificationSuccess(false);
      setVerificationResult(`Error occurred during verification.`);
    }
  };

  return {
    isVerifier,
    setIsVerifier,
    verifyProof,
    verificationResult,
    verificationSuccess,
  };
};
