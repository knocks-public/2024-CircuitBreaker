export function hexStringToUint8Array(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    throw new Error('Invalid hexadecimal string.');
  }

  const bytes = new Uint8Array(hexString.length / 2);

  for (let i = 0, j = 0; i < hexString.length; i += 2, j++) {
    bytes[j] = parseInt(hexString.substring(i, i + 2), 16);
  }

  return bytes;
}
