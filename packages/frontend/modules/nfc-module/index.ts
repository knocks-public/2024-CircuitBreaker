import NfcModule from './src/NfcModule';

export async function scan(): Promise<string> {
  return await NfcModule.scan();
}
