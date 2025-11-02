import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvSet, kvMGet } from '../../../../lib/kv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BatchRequestBody {
  texts: string[];
  lang: string;
}

function normalizeText(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

function toBase64(input: string): string {
  return Buffer.from(input, 'utf-8').toString('base64');
}

async function translateManyWithOpenAI(texts: string[], targetLang: string): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const model = process.env.OPENAI_TRANSLATE_MODEL || 'gpt-4o-mini';

  const system =
    'You are a professional translator. Translate each item to the requested target language while preserving meaning and formatting. Return ONLY valid JSON of the form {"items": ["...", "..."]} with the same length and order as the input. Do not add extra fields. Preserve markdown and placeholders like {variable} and HTML, translating only human-readable text.';

  const user = JSON.stringify({ targetLanguage: targetLang, items: texts });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} ${errorText}`);
  }

  const json = (await response.json()) as any;
  const content: string | undefined = json?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') throw new Error('OpenAI response missing content');

  try {
    const parsed = JSON.parse(content);
    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length !== texts.length) {
      throw new Error('Invalid JSON shape from OpenAI');
    }
    return parsed.items.map((s: any) => (typeof s === 'string' ? s.trim() : ''));
  } catch (e) {
    throw new Error('Failed to parse OpenAI JSON response');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<BatchRequestBody>;
    const lang = typeof body?.lang === 'string' ? body.lang : '';
    const texts = Array.isArray(body?.texts) ? (body!.texts as string[]) : [];

    if (!lang || texts.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: texts[], lang' },
        { status: 400 }
      );
    }

    if (lang.toLowerCase() === 'nl') {
      return NextResponse.json({ items: texts });
    }

    const skipKv = process.env.NODE_ENV === 'development' && process.env.SKIP_KV === '1';

    const normalized = texts.map((t) => normalizeText(String(t ?? '')));

    // Map unique normalized text to index set
    const uniqueList: string[] = [];
    const indexOf: Record<string, number> = {};
    normalized.forEach((t) => {
      if (indexOf[t] === undefined) {
        indexOf[t] = uniqueList.length;
        uniqueList.push(t);
      }
    });

    const resultsMap = new Map<string, string>();

    // KV check (batch)
    if (!skipKv) {
      try {
        const keys = uniqueList.map((t) => toBase64(`t:${lang}:${t}`));
        const cachedVals = await kvMGet(keys);
        for (let i = 0; i < uniqueList.length; i++) {
          const cached = cachedVals[i];
          if (typeof cached === 'string' && cached.length > 0) {
            resultsMap.set(uniqueList[i], cached);
          }
        }
      } catch (e) {
        console.error('[translate-batch] KV mget failed', { error: (e as Error).message });
      }
    }

    // Compute misses
    const misses = uniqueList.filter((t) => !resultsMap.has(t));

    if (misses.length > 0) {
      try {
        const translated = await translateManyWithOpenAI(misses, lang);
        // store and populate map
        for (let i = 0; i < misses.length; i++) {
          const src = misses[i];
          const out = translated[i] ?? '';
          resultsMap.set(src, out);
          if (!skipKv) {
            try {
              const key = toBase64(`t:${lang}:${src}`);
              await kvSet(key, out, { ex: 60 * 60 * 24 * 30 });
            } catch (e) {
              console.error('[translate-batch] KV set failed', { error: (e as Error).message });
            }
          }
        }
      } catch (e) {
        console.error('[translate-batch] OpenAI failed', { error: (e as Error).message });
        // On failure, fall back to original texts
        const items = texts;
        return NextResponse.json({ items });
      }
    }

    // Build output in original order
    const items = normalized.map((t, i) => resultsMap.get(t) ?? texts[i] ?? '');
    return NextResponse.json({ items });
  } catch (e) {
    console.error('[translate-batch] Unhandled error', { error: (e as Error).message });
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
