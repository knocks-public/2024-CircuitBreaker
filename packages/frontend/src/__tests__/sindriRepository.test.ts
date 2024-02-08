import axios from 'axios';
import Config from 'react-native-config';
import SindriRepository from '../repository/SindriRepository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SindriRepository', () => {
  let repo: SindriRepository;

  beforeEach(() => {
    repo = new SindriRepository();
  });

  it('should make a GET request with correct endpoint and headers', async () => {
    const endpoint = '/test';
    await repo.getRequest(endpoint);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${Config.SINDRI_API_URL || 'https://sindri.app/api/'}v1${endpoint}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Config.SINDRI_API_KEY || ''}`,
        },
      }
    );
  });

  it('should make a POST request with correct endpoint, data and headers', async () => {
    const endpoint = '/test';
    const data = { test: 'test' };
    await repo.postRequest(endpoint, data);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${Config.SINDRI_API_URL || 'https://sindri.app/api/'}v1${endpoint}`,
      data,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${Config.SINDRI_API_KEY || ''}`,
        },
      }
    );
  });
});
