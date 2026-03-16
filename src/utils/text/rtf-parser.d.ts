declare module 'rtf-parser' {
  interface RtfBlock {
    value?: string;
  }

  interface RtfDocument {
    content: RtfBlock[];
  }

  function string(
    input: string,
    callback: (err: Error | null, doc: RtfDocument) => void,
  ): void;
}
