import { AxiosResponse } from 'axios';
import { env } from '../config/env';
import SindriRepository from '../repository/SindriRepository';
import { logger } from '../utils/logger';

/** Terminal states reported by the Sindri proving/verification pipeline. */
const TERMINAL_STATUSES: readonly string[] = ['Ready', 'Failed'];

interface ProofDetailData {
  status?: string;
  perform_verify?: boolean | string;
  public?: Record<string, string>;
}

class SindriService {
  private static readonly POLL_TIMEOUT_SECONDS = 20 * 60;
  private static readonly POLL_INTERVAL_MS = 1000;
  private readonly repository: SindriRepository;
  private readonly circuitId: string;

  constructor(repository: SindriRepository = new SindriRepository()) {
    this.repository = repository;
    this.circuitId = env.circuitId;
  }

  /**
   * Repeatedly polls `endpoint` until the response reaches a terminal status
   * (`Ready` or `Failed`) or the timeout elapses.
   */
  async pollForStatus(
    endpoint: string,
    timeout: number = SindriService.POLL_TIMEOUT_SECONDS
  ): Promise<AxiosResponse> {
    for (let i = 0; i < timeout; i++) {
      const response = await this.repository.getRequest(endpoint);
      const status = response.data?.status;
      if (typeof status === 'string' && TERMINAL_STATUSES.includes(status)) {
        logger.debug(`Poll exited after ${i} seconds with status: ${status}`);
        return response;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, SindriService.POLL_INTERVAL_MS)
      );
    }
    throw new Error(`Polling timed out after ${timeout} seconds.`);
  }

  /**
   * Requests a proof for the given age `input` and returns the proof id.
   * The raw input is deliberately never logged: it is the user's age, which
   * must not leak into diagnostics.
   */
  async generateProof(input: number): Promise<string> {
    try {
      logger.debug(
        `Requesting proof from Sindri API (circuit ${this.circuitId})`
      );
      const proofInput = {
        proof_input: `input = ${input}`,
        perform_verify: 'true',
      };
      const endpoint = `/circuit/${this.circuitId}/prove`;

      const proveResponse = await this.repository.postRequest(
        endpoint,
        proofInput
      );
      const proofId = proveResponse.data?.proof_id;
      if (!proofId) {
        throw new Error('Sindri API did not return a proof id');
      }
      logger.debug(`Proof requested: ${proofId}`);
      return proofId;
    } catch (error) {
      logger.error(
        'Failed to generate proof:',
        error instanceof Error ? error.message : 'unknown error'
      );
      throw new Error('Failed to generate proof');
    }
  }

  /**
   * Fetches a proof's detail, waiting for it to finish proving, and returns
   * whether it both proved successfully and satisfies the age predicate.
   */
  async fetchProofDetail(proofId: string): Promise<boolean> {
    logger.debug('Requesting proof detail from Sindri API...');
    const endpoint = `/proof/${proofId}/detail`;
    const response = await this.pollForStatus(endpoint);
    const data: ProofDetailData = response.data ?? {};

    if (data.status === 'Failed') {
      throw new Error('Proving failed');
    }

    const ageVerificationStatus = data.public?.['Verifier.toml'];
    if (typeof ageVerificationStatus !== 'string') {
      logger.warn('Proof detail is missing the verification output');
      return false;
    }

    const meetsAgeRequirement = ageVerificationStatus.includes('true');
    const proofWasVerified = Boolean(data.perform_verify);
    return meetsAgeRequirement && proofWasVerified;
  }

  async verifyProof(proofId: string): Promise<boolean> {
    try {
      return await this.fetchProofDetail(proofId);
    } catch (error) {
      logger.error('Proof verification failed', error);
      return false;
    }
  }
}

export default SindriService;
