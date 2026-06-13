import axios, { AxiosResponse } from 'axios';
import { env, SINDRI_API_BASE_URL } from '../config/env';

/**
 * Thin HTTP layer over the Sindri REST API. It only knows how to issue
 * authenticated requests; orchestration such as polling for a terminal status
 * lives in {@link SindriService}.
 */
class SindriRepository {
  private readonly baseUrl: string = SINDRI_API_BASE_URL;
  private readonly headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${env.sindriApiKey}`,
  };

  async getRequest(endpoint: string): Promise<AxiosResponse> {
    return axios.get(`${this.baseUrl}${endpoint}`, {
      headers: this.headers,
    });
  }

  async postRequest(endpoint: string, data: unknown): Promise<AxiosResponse> {
    return axios.post(`${this.baseUrl}${endpoint}`, data, {
      headers: this.headers,
    });
  }
}

export default SindriRepository;
