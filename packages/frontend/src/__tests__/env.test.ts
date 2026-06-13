import { SINDRI_API_BASE_URL, env, isSindriConfigured } from '../config/env';

describe('env config', () => {
  it('derives the v1 base url from the api url', () => {
    expect(SINDRI_API_BASE_URL).toBe(`${env.sindriApiUrl}v1`);
  });

  it('falls back to a default circuit id', () => {
    expect(env.circuitId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('reports configuration state based on the api key', () => {
    expect(isSindriConfigured()).toBe(env.sindriApiKey.length > 0);
  });
});
