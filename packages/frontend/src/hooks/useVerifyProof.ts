import { useState } from 'react';
import SindriService from '../service/sindriService';

const messages = {
  success: 'succeeded',
  failure: 'failed',
};

const service = new SindriService();

export const useVerifyProof = () => {
  const [proofId, setProofId] = useState<string>('');
  const [verifyResult, setVerifyResult] = useState<string>('');

  const handleVerifyProof = async () => {
    try {
      await service.verifyProof(proofId);
      setVerifyResult(messages.success);
    } catch (error) {
      setVerifyResult(messages.failure);
    }
  };

  return {
    proofId,
    setProofId,
    verifyResult,
    handleVerifyProof,
  };
};
