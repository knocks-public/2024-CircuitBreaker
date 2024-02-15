import NfcModule from './src/NfcModule';

export async function scan(pin: string): Promise<string> {
  try {
    const result = await NfcModule.scan(pin);
    console.log('NFC scan result:', result);
    return result;
  } catch (error) {
    throw new Error('NFC scan failed');
  }
}
