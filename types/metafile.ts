export interface Metadata {
  inputs: {
    [path: string]: {
      bytes: number;
      imports: {
        path: string;
        kind: string;
      }[];
    };
  };
  outputs: {
    [path: string]: {
      bytes: number;
      inputs: {
        [path: string]: {
          bytesInOutput: number;
        };
      };
      imports: {
        path: string;
        kind: string;
      }[];
      exports: string[];
      entryPoint?: string;
    };
  };
}
