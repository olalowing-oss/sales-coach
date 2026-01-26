/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AZURE_SPEECH_KEY: string;
  readonly VITE_AZURE_SPEECH_REGION: string;
  readonly VITE_AZURE_OPENAI_ENDPOINT: string;
  readonly VITE_AZURE_OPENAI_KEY: string;
  readonly VITE_AZURE_OPENAI_DEPLOYMENT: string;
  readonly VITE_AZURE_SEARCH_ENDPOINT: string;
  readonly VITE_AZURE_SEARCH_KEY: string;
  readonly VITE_AZURE_SEARCH_INDEX: string;
  readonly VITE_DEMO_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
