import SindriService from '../service/sindriService';
import SindriRepository from '../repository/sindriRepository';

describe('SindriService', () => {
  let service: SindriService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(SindriRepository.prototype, 'postRequest')
      .mockImplementation(() =>
        Promise.resolve({ data: { proof_id: '12345' } })
      );
    jest
      .spyOn(SindriRepository.prototype, 'getRequest')
      .mockImplementation(() => Promise.resolve({ data: { status: 'Ready' } }));
    service = new SindriService();
  });

  it('should generate proof successfully', async () => {
    const input = 20;
    await service.generateProof(input);
    expect(SindriRepository.prototype.postRequest).toHaveBeenCalledWith(
      `/circuit/e98c114f-6b0d-4fe0-9379-4ee91a1c6963/prove`,
      { proof_input: `input = ${input}` }
    );
  });

  it('should handle polling for status correctly', async () => {
    const endpoint = '/proof/12345/detail';
    const response = await service.pollForStatus(endpoint, 10);
    expect(response.data.status).toBe('Ready');
  });
});
