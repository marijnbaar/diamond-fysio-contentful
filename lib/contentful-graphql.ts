import { GraphQLClient } from 'graphql-request';

const SPACE_ID = process.env.CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.CTF_ENV_ID || process.env.ENV_ID || 'master';
const CDA_TOKEN = process.env.CTF_CDA_TOKEN || process.env.CONTENTFUL_ACCESS_TOKEN;

const endpoint = `https://graphql.contentful.com/content/v1/spaces/${SPACE_ID}/environments/${ENV_ID}`;

export const cfGraphql = new GraphQLClient(endpoint, {
  headers: { Authorization: `Bearer ${CDA_TOKEN}` }
});

const DEFAULT_ALLOWED = ['nl-NL', 'en-US', 'de-DE', 'fr-FR'];
const fromEnv = (process.env.ALLOWED_LOCALES ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
export const ALLOWED_LOCALES = fromEnv.length ? fromEnv : DEFAULT_ALLOWED;

export const MASTER_LOCALE = process.env.MASTER_LOCALE ?? 'nl-NL';

export function normalizeLocale(input?: string | null): string | null {
  if (!input) return null;
  const map: Record<string, string | null> = {
    // Map NL to Dutch default
    nl: 'nl-NL',
    'nl-nl': 'nl-NL',
    en: 'en-US',
    'en-gb': 'en-US',
    de: 'de-DE',
    fr: 'fr-FR'
  };
  const lower = input.toLowerCase();
  const mapped = Object.prototype.hasOwnProperty.call(map, lower) ? map[lower] : input;
  if (mapped == null) return null;
  return ALLOWED_LOCALES.includes(mapped) ? mapped : null;
}

export async function cfRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  return cfGraphql.request<T>(query, variables);
}
