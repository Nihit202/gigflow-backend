declare module 'compression' {
  import { RequestHandler } from 'express';
  interface CompressionOptions {
    threshold?: number | string;
    level?: number;
    filter?: (req: import('express').Request, res: import('express').Response) => boolean;
  }
  function compression(options?: CompressionOptions): RequestHandler;
  export = compression;
}
