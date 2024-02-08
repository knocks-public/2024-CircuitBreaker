import { useState } from 'react';
import SindriService from '../service/SindriService';

const service = new SindriService();

export const useGenerateProof = () => {
  const [age, setAge] = useState<string>('');
  const [proofResult, setProof] = useState<string | null>(null); // 状態の初期化

  const handleGenerateProof = async () => {
    try {
      const result = await service.generateProof(parseInt(age, 10));
      setProof(result);
    } catch (error) {
      console.error(error);
      setProof(null);
    }
  };

  return {
    age,
    setAge,
    proofResult,
    handleGenerateProof,
  };
};
