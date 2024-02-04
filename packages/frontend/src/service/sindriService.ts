import SindriRepository from '../repository/sindriRepository';
import Config from 'react-native-config';

class SindriService {
  private repository: SindriRepository;
  private circuitId: string =
    Config.CIRCUIT_ID || 'e98c114f-6b0d-4fe0-9379-4ee91a1c6963';

  constructor() {
    this.repository = new SindriRepository();
  }
  async pollForStatus(endpoint: string, timeout: number = 20 * 60) {
    for (let i = 0; i < timeout; i++) {
      const response = await this.repository.getRequest(endpoint);
      const status = response.data.status;
      if (['Ready', 'Failed'].includes(status)) {
        console.log(`Poll exited after ${i} seconds with status: ${status}`);
        return response;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    throw new Error(`Polling timed out after ${timeout} seconds.`);
  }

  async generateProof(input: number) {
    try {
      console.log(`Circuit ID: ${this.circuitId}`);
      console.log('Proving circuit...');
      const proofInput = { proof_input: `input = ${input}` };
      const endpoint = `/circuit/${this.circuitId}/prove`;

      const proveResponse = await this.repository.postRequest(
        endpoint,
        proofInput
      );
      const proofId: string = proveResponse.data.proof_id;
      console.log(`Proof ID: ${proofId}`);

      const proofDetailResponse = await this.pollForStatus(
        `/proof/${proofId}/detail`
      );
      if (proofDetailResponse.data.status === 'Failed') {
        throw new Error('Proving failed');
      }

      console.log(proofDetailResponse.data);
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : 'An unknown error occurred.'
      );
    }
  }
}

export default new SindriService();
