import axios from 'axios';

class SindriRepository {
  private API_KEY: string = process.env.EXPO_PUBLIC_SINDRI_API_KEY || '';
  private API_URL: string = `${process.env.EXPO_PUBLIC_SINDRI_API_URL || 'https://sindri.app/api/'}v1`;
  private headersJson = {
    Accept: 'application/json',
    Authorization: `Bearer ${this.API_KEY}`,
  };

  async getRequest(endpoint: string) {
    return axios.get(`${this.API_URL}${endpoint}`, {
      headers: this.headersJson,
    });
  }

  async postRequest(endpoint: string, data: any) {
    return axios.post(`${this.API_URL}${endpoint}`, data, {
      headers: this.headersJson,
    });
  }
}

export default SindriRepository;
