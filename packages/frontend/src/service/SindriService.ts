import SindriRepository from '../repository/SindriRepository';
import { hexStringToUint8Array } from '../utils/bytesStringParser';
import NoirService from './NoirService';

class SindriService {
  private static readonly POLL_TIMEOUT_SECONDS = 20 * 60;
  private static readonly POLL_INTERVAL_MS = 1000;
  private static readonly DEFAULT_CIRCUIT_ID = 'e98c114f-6b0d-4fe0-9379-4ee91a1c6963';
  private repository: SindriRepository;
  private noirService: NoirService;
  private circuitId: string;

  constructor(noirService?: NoirService) {
    this.repository = new SindriRepository();
    this.noirService = noirService || new NoirService();
    this.circuitId = process.env.EXPO_PUBLIC_CIRCUIT_ID || SindriService.DEFAULT_CIRCUIT_ID;
  }
  async pollForStatus(endpoint: string, timeout: number = SindriService.POLL_TIMEOUT_SECONDS) {
    for (let i = 0; i < timeout; i++) {
      const response = await this.repository.getRequest(endpoint);
      const status = response.data.status;
      if (['Ready', 'Failed'].includes(status)) {
        console.log(`Poll exited after ${i} seconds with status: ${status}`);
        return response;
      }
      await new Promise((resolve) => setTimeout(resolve, SindriService.POLL_INTERVAL_MS));
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
      const proofId = proveResponse.data.proof_id;
      console.log(`Proof ID: ${proofId}`);
      return proofId;
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : 'An unknown error occurred.'
      );
      throw new Error('Failed to generate proof');
    }
  }

  async fetchProofDetail(proofId: string): Promise<any> {
    console.log('Request the proof detail from Sindri API...');
    const endpoint = `/proof/${proofId}/detail`;
    const proofDetailResponse = await this.repository.pollForStatus(endpoint);
    const proofDetailStatus = proofDetailResponse.data.status;
    if (proofDetailStatus === 'Failed') {
      throw new Error('Proving failed');
    }
    console.log(`proofDetail: ${JSON.stringify(proofDetailResponse.data)}`);
    const proof = proofDetailResponse.data.proof.proof;
    return proof;
  }

  convertProofToUint8Array(proof: string) {
    const result = hexStringToUint8Array(proof);
    console.log(`Proof: ${result}`);
    return result;
  }

  async verifyProof(proofId: string): Promise<boolean> {
    const proofDetail = await this.fetchProofDetail(proofId);
    const proofBytes = this.convertProofToUint8Array(proofDetail);

    try {
      return await this.noirService.verifyProof(proofBytes);
    } catch (error) {
      console.error('Proof verification failed', error);
      return false;
    }
  }
}

export default SindriService;
