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

  async pollForStatus(endpoint, timeout = 20 * 60) {
    for (let i = 0; i < timeout; i++) {
      const response = await axios.get(`${this.API_URL}${endpoint}`, {
        headers: this.headersJson,
        validateStatus: (status) => status === 200,
      });

      const status = response.data.status;
      if (['Ready', 'Failed'].includes(status)) {
        console.log(`Poll exited after ${i} seconds with status: ${status}`);
        return response;
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    throw new Error(`Polling timed out after ${timeout} seconds.`);
  }
}

export default SindriRepository;
