// import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
// import { Noir, ProofData } from '@noir-lang/noir_js';
// import { CompiledCircuit } from '@noir-lang/types/lib/esm/types';
import SindriRepository from '../repository/sindriRepository';
import { hexStringToUint8Array } from '../utils/bytesStringParser';

// const circuit: CompiledCircuit = require('../../../circuit/target/inro.json');

class SindriService {
  private repository: SindriRepository;
  private circuitId: string =
    process.env.EXPO_PUBLIC_CIRCUIT_ID ||
    'e98c114f-6b0d-4fe0-9379-4ee91a1c6963';

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

    this.convertProofToUint8Array(proofDetail);

    return true;
    // const backend = new BarretenbergBackend(circuit as CompiledCircuit);
    // const noir = new Noir(circuit as CompiledCircuit, backend);

    // const proof: ProofData = {
    //   proof: proofBytes,
    //   publicInputs: new Map<number, string>([
    //     [
    //       2,
    //       '0x0000000000000000000000000000000000000000000000000000000000000000',
    //     ],
    //   ]),
    // };

    // const verification = await noir.verifyFinalProof(proof);

    // if (verification) {
    //   console.log('Proof verified successfully');
    // } else {
    //   console.error('Proof verification failed');
    // }
  }
}

export default SindriService;
