/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRIORITY_USER: string;
  readonly VITE_PRIORITY_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.json' {
  const value: unknown;
  export default value;
}
