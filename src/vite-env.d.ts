/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRIORITY_USER: string;
  readonly VITE_PRIORITY_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
