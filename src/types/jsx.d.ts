import * as React from 'react';

// This file augments the global JSX namespace so that TypeScript is aware of
// intrinsic elements when we are using the automatic React runtime in a
// Next.js 15 project. Remove or tighten these any-types once upstream types
// are fixed.

declare global {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};