import { useState } from 'react';
import { Alert } from 'react-native';
import SindriService from '../service/SindriService';

export const useVerifyAge = () => {
  const [isVerifier, setIsVerifier] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string>('');

  const verifyProof = async (proofId: string) => {
    const service = new SindriService();
    try {
      const result = await service.verifyProof(proofId);
      if (result) {
        setVerificationResult(
          `Proof ID: ${proofId}\nResult: Adult verification was successful.`
        );
      } else {
        setVerificationResult(
          `Proof ID: ${proofId}\nResult: Verification failed.`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during verification.');
      setVerificationResult(`Error occurred during verification.`);
    }
  };

  return { isVerifier, setIsVerifier, verifyProof, verificationResult };
};
