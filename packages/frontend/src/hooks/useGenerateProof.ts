import { useState } from 'react';
import { generateProof } from '../sindri';

// メッセージの定義を英語のみに変更
const messages = {
  success: 'Your age has been verified successfully.',
  failure: 'Failed to verify your age.',
};

export const useGenerateProof = () => {
  const [age, setAge] = useState<string>('');
  const [proofResult, setProofResult] = useState<string>('');

  const handleGenerateProof = async () => {
    try {
      await generateProof(parseInt(age, 10));
      setProofResult(messages.success);
    } catch (error) {
      setProofResult(messages.failure);
    }
  };

  return {
    age,
    setAge,
    proofResult,
    handleGenerateProof,
  };
};
