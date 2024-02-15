import NfcModule from './src/NfcModule';

export async function scan(pin: string): Promise<string> {
  try {
    const result = await NfcModule.scan(pin);
    return result;
  } catch (error) {
    throw new Error('NFC scan failed');
  }
}
