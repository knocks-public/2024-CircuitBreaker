import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to NfcModule.web.ts
// and on native platforms to NfcModule.ts
import NfcModule from './src/NfcModule';
import NfcModuleView from './src/NfcModuleView';
import { ChangeEventPayload, NfcModuleViewProps } from './src/NfcModule.types';

export async function scan(): Promise<string> {
  return await NfcModule.scan();
}

// Get the native constant value.
export const PI = NfcModule.PI;

export function hello(): string {
  return NfcModule.hello();
}

export async function setValueAsync(value: string) {
  return await NfcModule.setValueAsync(value);
}

const emitter = new EventEmitter(NfcModule ?? NativeModulesProxy.NfcModule);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { NfcModuleView, NfcModuleViewProps, ChangeEventPayload };
