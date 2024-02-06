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
        setVerificationResult('成人確認ができました。');
      } else {
        setVerificationResult('検証に失敗しました。');
      }
    } catch (error) {
      Alert.alert('エラー', '検証中にエラーが発生しました。');
    }
  };

  return { isVerifier, setIsVerifier, verifyProof, verificationResult };
};
