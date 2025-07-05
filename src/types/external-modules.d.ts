declare module '@openai/agents/realtime' {
  export interface RealtimeAgentOptions {
    name: string;
    voice?: string;
    instructions?: string;
    handoffs?: any[];
    tools?: any[];
    handoffDescription?: string;
  }

  export class RealtimeAgent {
    name: string;
    voice?: string;
    instructions: string;
    handoffs: RealtimeAgent[];
    tools: any[];
    handoffDescription?: string;
    constructor(opts: RealtimeAgentOptions);
  }

  // Minimal stub for the helper exported by the library
  export function tool(definition: any): any;
}

declare module 'next/navigation' {
  // These are loose typings just to satisfy the compiler within this project.
  // For full types, install the `@types/next` package once it is available for Next 15.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function useRouter(): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function useSearchParams(): any;
}

declare module 'uuid' {
  // We only use v4 in this project
  export function v4(options?: any): string;
}

declare module 'next/image' {
  import * as React from 'react';
  const Image: React.ComponentType<any>;
  export default Image;
}