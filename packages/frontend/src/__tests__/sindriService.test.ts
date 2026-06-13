import { AxiosResponse } from 'axios';
import { env } from '../config/env';
import SindriRepository from '../repository/SindriRepository';
import SindriService from '../service/SindriService';

const axiosResponse = <T>(data: T): AxiosResponse<T> =>
  ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  }) as AxiosResponse<T>;

describe('SindriService', () => {
  let repository: SindriRepository;
  let service: SindriService;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new SindriRepository();
    service = new SindriService(repository);
  });

  describe('generateProof', () => {
    it('requests a proof for the given age and returns the proof id', async () => {
      const post = jest
        .spyOn(repository, 'postRequest')
        .mockResolvedValue(axiosResponse({ proof_id: '12345' }));

      const proofId = await service.generateProof(20);

      expect(proofId).toBe('12345');
      expect(post).toHaveBeenCalledWith(`/circuit/${env.circuitId}/prove`, {
        proof_input: 'input = 20',
        perform_verify: 'true',
      });
    });

    it('throws when the API does not return a proof id', async () => {
      jest
        .spyOn(repository, 'postRequest')
        .mockResolvedValue(axiosResponse({}));

      await expect(service.generateProof(20)).rejects.toThrow(
        'Failed to generate proof'
      );
    });

    it('throws when the request fails', async () => {
      jest
        .spyOn(repository, 'postRequest')
        .mockRejectedValue(new Error('network down'));

      await expect(service.generateProof(20)).rejects.toThrow(
        'Failed to generate proof'
      );
    });
  });

  describe('pollForStatus', () => {
    it('polls until a terminal status is reached', async () => {
      const get = jest
        .spyOn(repository, 'getRequest')
        .mockResolvedValueOnce(axiosResponse({ status: 'In Progress' }))
        .mockResolvedValueOnce(axiosResponse({ status: 'Ready' }));

      const response = await service.pollForStatus('/proof/1/detail', 5);

      expect(response.data.status).toBe('Ready');
      expect(get).toHaveBeenCalledTimes(2);
    });

    it('throws when polling times out', async () => {
      jest
        .spyOn(repository, 'getRequest')
        .mockResolvedValue(axiosResponse({ status: 'In Progress' }));

      await expect(service.pollForStatus('/proof/1/detail', 2)).rejects.toThrow(
        'Polling timed out after 2 seconds.'
      );
    });
  });

  describe('fetchProofDetail', () => {
    it('returns true when the proof is valid and meets the age requirement', async () => {
      jest.spyOn(repository, 'getRequest').mockResolvedValue(
        axiosResponse({
          status: 'Ready',
          perform_verify: true,
          public: { 'Verifier.toml': 'return = true\n' },
        })
      );

      await expect(service.fetchProofDetail('12345')).resolves.toBe(true);
    });

    it('returns false when the age requirement is not met', async () => {
      jest.spyOn(repository, 'getRequest').mockResolvedValue(
        axiosResponse({
          status: 'Ready',
          perform_verify: true,
          public: { 'Verifier.toml': 'return = false\n' },
        })
      );

      await expect(service.fetchProofDetail('12345')).resolves.toBe(false);
    });

    it('returns false when the verification output is missing', async () => {
      jest
        .spyOn(repository, 'getRequest')
        .mockResolvedValue(
          axiosResponse({ status: 'Ready', perform_verify: true, public: {} })
        );

      await expect(service.fetchProofDetail('12345')).resolves.toBe(false);
    });

    it('throws when proving failed', async () => {
      jest
        .spyOn(repository, 'getRequest')
        .mockResolvedValue(axiosResponse({ status: 'Failed' }));

      await expect(service.fetchProofDetail('12345')).rejects.toThrow(
        'Proving failed'
      );
    });
  });

  describe('verifyProof', () => {
    it('returns the verification result', async () => {
      jest.spyOn(service, 'fetchProofDetail').mockResolvedValue(true);
      await expect(service.verifyProof('12345')).resolves.toBe(true);
    });

    it('returns false when verification throws', async () => {
      jest
        .spyOn(service, 'fetchProofDetail')
        .mockRejectedValue(new Error('Proving failed'));
      await expect(service.verifyProof('12345')).resolves.toBe(false);
    });
  });
});
