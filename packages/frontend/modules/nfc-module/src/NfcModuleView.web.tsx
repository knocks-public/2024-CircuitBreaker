import * as React from 'react';

import { NfcModuleViewProps } from './NfcModule.types';

export default function NfcModuleView(props: NfcModuleViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
