import { useState } from 'react';
import SindriService from '../service/sindriService';

const messages = {
  success: 'Your age has been verified successfully.',
  failure: 'Failed to verify your age.',
};

const service = new SindriService();

export const useGenerateProof = () => {
  const [age, setAge] = useState<string>('');
  const [proofResult, setProofResult] = useState<string>('');

  const handleGenerateProof = async () => {
    try {
      await service.generateProof(parseInt(age, 10));
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
