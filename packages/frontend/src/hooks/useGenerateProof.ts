import { useState } from 'react';
import SindriService from '../service/SindriService';

const service = new SindriService();

export const useGenerateProof = () => {
  // const [age, setAge] = useState<number>(0); // 数値型で年齢を管理
  const [age, setAge] = useState<string>('');
  const [proofResult, setProof] = useState<string | null>(null);

  const handleGenerateProof = async (age) => {
    try {
      // const result = await service.generateProof(age); // ageは既に数値型
      console.log('age:', age);
      console.log(setAge);
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
