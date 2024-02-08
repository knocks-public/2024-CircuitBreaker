// noirService.ts
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir, ProofData } from '@noir-lang/noir_js';
import { CompiledCircuit } from '@noir-lang/types/lib/esm/types';
import circuit from '../../config/inro.json';

class NoirService {
  private circuit: CompiledCircuit;
  private noir: Noir;
  private backend: BarretenbergBackend;

  constructor() {
    this.circuit = circuit as CompiledCircuit;
    // this.backend = new BarretenbergBackend(this.circuit);
    // this.noir = new Noir(this.circuit, this.backend);
  }

  createPublicInput(): Map<number, string> {
    return new Map<number, string>([
      [2, '0x0000000000000000000000000000000000000000000000000000000000000000'],
    ]);
  }

  async verifyProof(proofBytes: Uint8Array): Promise<boolean> {
    const publicInputs = this.createPublicInput();
    const proof: ProofData = {
      proof: proofBytes,
      publicInputs: publicInputs,
    };
    console.log('Proof: ', proof);
    return this.noir.verifyFinalProof(proof);
  }
}

export default NoirService;
