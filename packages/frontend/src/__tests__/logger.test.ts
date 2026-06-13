import { logger } from '../utils/logger';

describe('logger', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('always emits warnings and errors', () => {
    const warn = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const error = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    logger.warn('a warning');
    logger.error('an error');

    expect(warn).toHaveBeenCalledWith('a warning');
    expect(error).toHaveBeenCalledWith('an error');
  });

  it('exposes debug and info methods', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
  });
});
