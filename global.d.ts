declare module '@tailwindcss/typography';

declare namespace NodeJS {
  interface ProcessEnv {
    OPENAI_API_KEY?: string;
    OPENAI_TRANSLATE_MODEL?: string;
    SKIP_KV?: string;
    NEXT_PUBLIC_SITE_URL?: string;
    SITE_URL?: string;
    VERCEL_URL?: string;

    // Vercel KV REST envs
    KV_REST_API_URL?: string;
    KV_REST_API_TOKEN?: string;

    // Redis URL fallbacks
    TRANSLATION_STORAGE_REDIS_URL?: string;
    KV_URL?: string;
    REDIS_URL?: string;
    UPSTASH_REDIS_URL?: string;
  }
}
