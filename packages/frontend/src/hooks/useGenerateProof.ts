import { useState } from 'react';
import SindriService from '../service/SindriService';

const service = new SindriService();

export const useGenerateProof = () => {
  const [age, setAge] = useState<number>(0);
  const [proofResult, setProof] = useState<string | null>(null);

  const handleGenerateProof = async (age) => {
    try {
      const result = await service.generateProof(age);
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
