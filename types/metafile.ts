export interface MetadataOutput {
  bytes: number;
  inputs: {
    [path: string]: {
      bytesInOutput: number;
    };
  };
  imports: {
    path: string;
    kind: string;
    external?: boolean;
  }[];
  exports: string[];
  entryPoint?: string;
  cssBundle?: string;
}

export interface Metadata {
  inputs: {
    [path: string]: {
      bytes: number;
      imports: {
        path: string;
        kind: string;
        external?: boolean;
        original?: string;
        with?: Record<string, string>;
      }[];
      format?: string;
      with?: Record<string, string>;
    };
  };
  outputs: {
    [path: string]: MetadataOutput;
  };
}
