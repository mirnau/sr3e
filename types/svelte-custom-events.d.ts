import 'svelte/elements';

declare module 'svelte/elements' {
   interface DOMAttributes<T extends EventTarget> {
      // Svelte 5 event-attribute style
      onpackeryreflow?: (event: CustomEvent<void>) => void;

      // Optional: if you still use legacy syntax somewhere
      'on:packeryreflow'?: (event: CustomEvent<void>) => void;
   }
}
