import axios from 'axios';
import { SINDRI_API_BASE_URL, env } from '../config/env';
import SindriRepository from '../repository/SindriRepository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SindriRepository', () => {
  let repo: SindriRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new SindriRepository();
  });

  it('should make a GET request with correct endpoint and headers', async () => {
    const endpoint = '/test';
    await repo.getRequest(endpoint);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${SINDRI_API_BASE_URL}${endpoint}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${env.sindriApiKey}`,
        },
      }
    );
  });

  it('should make a POST request with correct endpoint, data and headers', async () => {
    const endpoint = '/test';
    const data = { test: 'test' };
    await repo.postRequest(endpoint, data);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${SINDRI_API_BASE_URL}${endpoint}`,
      data,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${env.sindriApiKey}`,
        },
      }
    );
  });
});
