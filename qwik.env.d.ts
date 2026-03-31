// This file can be used to add references for global types like `vite/client`.

// Add global `vite/client` types. For more info, see: https://vitejs.dev/guide/features#client-types
/// <reference types="vite/client" />

// Type declarations for Qwik image optimization (?jsx imports)
declare module '*.png?jsx' {
  const Cmp: import('@builder.io/qwik').FunctionComponent<import('@builder.io/qwik').QwikIntrinsicElements['img']>;
  export default Cmp;
}

declare module '*.jpg?jsx' {
  const Cmp: import('@builder.io/qwik').FunctionComponent<import('@builder.io/qwik').QwikIntrinsicElements['img']>;
  export default Cmp;
}

declare module '*.jpeg?jsx' {
  const Cmp: import('@builder.io/qwik').FunctionComponent<import('@builder.io/qwik').QwikIntrinsicElements['img']>;
  export default Cmp;
}

declare module '*.webp?jsx' {
  const Cmp: import('@builder.io/qwik').FunctionComponent<import('@builder.io/qwik').QwikIntrinsicElements['img']>;
  export default Cmp;
}

declare module '*.svg?jsx' {
  const Cmp: import('@builder.io/qwik').FunctionComponent<import('@builder.io/qwik').QwikIntrinsicElements['img']>;
  export default Cmp;
}

declare module '*?jsx&w=130&h=56' {
  import type { FunctionComponent, Props } from '@builder.io/qwik';
  const val: FunctionComponent<Props<'img'>>;
  export default val;
}

declare module '*?jsx&w=170&h=72' {
  import type { FunctionComponent, Props } from '@builder.io/qwik';
  const val: FunctionComponent<Props<'img'>>;
  export default val;
}