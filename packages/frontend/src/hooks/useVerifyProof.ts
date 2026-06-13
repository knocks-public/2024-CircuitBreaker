import { useState } from 'react';
import { Alert } from 'react-native';
import SindriService from '../service/SindriService';
import { logger } from '../utils/logger';

const service = new SindriService();

export const useVerifyAge = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string>('');

  const verifyProof = async (proofId: string): Promise<void> => {
    setIsVerifying(true);
    try {
      const result = await service.verifyProof(proofId);
      if (result) {
        setVerificationResult('Adult verification was successful.');
        setVerificationSuccess(true);
      } else {
        setVerificationResult('Verification failed.');
        setVerificationSuccess(false);
      }
    } catch (error) {
      logger.error('useVerifyAge failed', error);
      Alert.alert('Error', 'An error occurred during verification.');
      setVerificationSuccess(false);
      setVerificationResult('Error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerifying,
    verifyProof,
    verificationResult,
    verificationSuccess,
  };
};
