import SindriRepository from '../repository/SindriRepository';
import SindriService from '../service/SindriService';

describe('SindriService', () => {
  let service: SindriService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SindriService();

    jest
      .spyOn(SindriRepository.prototype, 'postRequest')
      .mockImplementation((endpoint) => {
        if (endpoint.includes('/prove')) {
          return Promise.resolve({
            data: { proof_id: '12345', perform_verify: 'true' },
          });
        }
        return Promise.reject(new Error('Endpoint not mocked'));
      });

    jest
      .spyOn(SindriRepository.prototype, 'getRequest')
      .mockImplementation((endpoint) => {
        if (endpoint.includes('/detail')) {
          return Promise.resolve({
            data: {
              status: 'Ready',
              proof: {
                proof: 'fetched-proof-string',
              },
              public: {
                'Verifier.toml': 'return = true\n',
              },
            },
          });
        }
        return Promise.reject(new Error('Endpoint not mocked'));
      });

    jest
      .spyOn(SindriRepository.prototype, 'pollForStatus')
      .mockImplementation((endpoint) => {
        if (endpoint.includes('/detail')) {
          return Promise.resolve({
            data: {
              status: 'Ready',
              proof: {
                proof: 'fetched-proof-string',
              },
              public: {
                'Verifier.toml': 'return = false\n',
              },
            },
          });
        }
        return Promise.reject(new Error('Endpoint not mocked'));
      });
  });

  it('should generate proof successfully', async () => {
    const input = 20;
    await service.generateProof(input);
    expect(SindriRepository.prototype.postRequest).toHaveBeenCalledWith(
      `/circuit/e98c114f-6b0d-4fe0-9379-4ee91a1c6963/prove`,
      { proof_input: `input = ${input}`, perform_verify: 'true' }
    );
  });

  it('should handle polling for status correctly', async () => {
    const endpoint = '/proof/12345/detail';
    const response = await service.pollForStatus(endpoint, 10);
    expect(response.data.status).toBe('Ready');
  });

  it('returns true for a successful verification', async () => {
    const proofId = '12345';
    jest
      .spyOn(SindriRepository.prototype, 'pollForStatus')
      .mockResolvedValueOnce({
        data: {
          status: 'Ready',
          public: { 'Verifier.toml': 'return = true\n' },
          perform_verify: true,
        },
      });

    const isVerified = await service.fetchProofDetail(proofId);
    expect(isVerified).toBe(true);
  });

  it('returns false for a failed verification', async () => {
    const proofId = '67890';
    const isVerified = await service.fetchProofDetail(proofId);
    expect(isVerified).toBe(false);
  });

  it('throws an error if proof fetching fails', async () => {
    const proofId = 'failed-proof-id';
    jest
      .spyOn(SindriRepository.prototype, 'pollForStatus')
      .mockRejectedValueOnce(new Error('Proving failed'));

    await expect(service.fetchProofDetail(proofId)).rejects.toThrow(
      'Proving failed'
    );
  });

  it('should verify proof successfully when verification result is true', async () => {
    const proofId = '12345';
    jest.spyOn(service, 'fetchProofDetail').mockResolvedValue(true);
    const result = await service.verifyProof(proofId);
    expect(service.fetchProofDetail).toHaveBeenCalledWith(proofId);
    expect(result).toBe(true);
  });

  it('should not verify proof successfully when verification result is false', async () => {
    const proofId = '67890';
    jest.spyOn(service, 'fetchProofDetail').mockResolvedValue(false);
    const result = await service.verifyProof(proofId);
    expect(service.fetchProofDetail).toHaveBeenCalledWith(proofId);
    expect(result).toBe(false);
  });

  it('should return false when proof fetching fails', async () => {
    const proofId = 'failed-proof-id';
    jest
      .spyOn(service, 'fetchProofDetail')
      .mockRejectedValue(new Error('Proving failed'));
    const result = await service.verifyProof(proofId);
    expect(result).toBe(false);
  });
});
