declare module '@tailwindcss/typography';

declare namespace NodeJS {
  interface ProcessEnv {
    OPENAI_API_KEY?: string;
    OPENAI_TRANSLATE_MODEL?: string;
    NEXT_PUBLIC_SITE_URL?: string;
    SITE_URL?: string;
    VERCEL_URL?: string;
  }
}
