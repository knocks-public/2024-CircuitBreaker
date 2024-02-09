import SindriRepository from '../repository/SindriRepository';
import NoirService from '../service/NoirService';
import SindriService from '../service/SindriService';

jest.mock('../service/NoirService');

describe('SindriService', () => {
  let service: SindriService;
  let mockNoirService: jest.Mocked<NoirService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNoirService = new NoirService() as jest.Mocked<NoirService>;
    service = new SindriService(mockNoirService); // モックインスタンスを注入

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
            data: { status: 'Ready', proof: { proof: 'fetched-proof-string' } },
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

  it('converts hex string to Uint8Array correctly', () => {
    const hexString = 'deadbeef';
    const expectedResult = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
    const result = service.convertProofToUint8Array(hexString);
    expect(result).toEqual(expectedResult);
  });

  it('fetches proof details successfully and returns proof', async () => {
    const proofId = '12345';
    const fetchedProof = await service.fetchProofDetail(proofId);
    expect(fetchedProof).toBe('fetched-proof-string');
  });

  it('throws an error if proof fetching fails', async () => {
    jest
      .spyOn(SindriRepository.prototype, 'pollForStatus')
      .mockRejectedValueOnce(new Error('Proving failed'));
    await expect(service.fetchProofDetail('failed-proof-id')).rejects.toThrow(
      'Proving failed'
    );
  });

  it('should verify proof successfully', async () => {
    const proofId = '12345';
    const mockProof = 'fetched-proof-string';
    const mockProofBytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);

    jest.spyOn(service, 'fetchProofDetail').mockResolvedValue(mockProof);
    jest
      .spyOn(service, 'convertProofToUint8Array')
      .mockReturnValue(mockProofBytes);
    mockNoirService.verifyProof.mockResolvedValue(true);

    const result = await service.verifyProof(proofId);

    expect(service.fetchProofDetail).toHaveBeenCalledWith(proofId);
    expect(service.convertProofToUint8Array).toHaveBeenCalledWith(mockProof);
    expect(mockNoirService.verifyProof).toHaveBeenCalledWith(mockProofBytes);
    expect(result).toBe(true);
  });
});
