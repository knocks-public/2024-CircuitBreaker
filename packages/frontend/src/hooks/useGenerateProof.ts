import { useState } from 'react';
import SindriService from '../service/SindriService';
import { logger } from '../utils/logger';

const service = new SindriService();

export const useGenerateProof = () => {
  const [proofResult, setProofResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateProof = async (age: number): Promise<void> => {
    setIsGenerating(true);
    setError(null);
    setProofResult(null);
    try {
      const result = await service.generateProof(age);
      setProofResult(result);
    } catch (err) {
      logger.error('useGenerateProof failed', err);
      setError('Could not generate the proof. Please try again.');
      setProofResult(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = (): void => {
    setProofResult(null);
    setError(null);
  };

  return {
    proofResult,
    isGenerating,
    error,
    handleGenerateProof,
    reset,
  };
};
