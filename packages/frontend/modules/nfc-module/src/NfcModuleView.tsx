import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { NfcModuleViewProps } from './NfcModule.types';

const NativeView: React.ComponentType<NfcModuleViewProps> =
  requireNativeViewManager('NfcModule');

export default function NfcModuleView(props: NfcModuleViewProps) {
  return <NativeView {...props} />;
}
