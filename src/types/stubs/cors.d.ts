declare module 'cors' {
  import { RequestHandler } from 'express';
  interface CorsOptions {
    origin?: string | string[] | boolean | RegExp | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    credentials?: boolean;
    optionsSuccessStatus?: number;
  }
  function cors(options?: CorsOptions): RequestHandler;
  export = cors;
}
