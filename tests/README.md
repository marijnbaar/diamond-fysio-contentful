# Tests

Deze folder bevat test scripts voor verschillende onderdelen van de applicatie.

## Cache Tests

Test de Vercel KV (Redis) cache functionaliteit.

### cache.test.mjs

Test de cache wrapper functies (`cacheData` en `getCachedData`).

**Run via yarn (aanbevolen):**

```bash
yarn test:cache
```

**Run direct:**

```bash
node --env-file=.env.local tests/cache.test.mjs
```

**Test:**

- Write/read operaties
- Data integriteit
- Cache expiration (TTL)
- Cache miss handling
- Complexe objecten

### kv-direct.test.mjs

Test de directe Vercel KV client zonder wrappers.

**Run via yarn (aanbevolen):**

```bash
yarn test:kv
```

**Run direct:**

```bash
node --env-file=.env.local tests/kv-direct.test.mjs
```

**Test:**

- Directe KV set/get operaties
- Expiration
- JSON serialization
- Verschillende data types

## Waarom .mjs?

Deze test files gebruiken de `.mjs` extensie (Module JavaScript) omdat:

- De lib files ES module syntax gebruiken (`import/export`)
- Dit is de eenvoudigste manier om ES modules te gebruiken zonder de hele codebase aan te passen
- `.mjs` files worden door Node.js automatisch als ES modules behandeld
- Alternatief zou zijn om `"type": "module"` toe te voegen aan package.json, maar dat vereist aanpassingen in de hele codebase

## Environment Variables

Alle tests hebben toegang nodig tot de environment variables in `.env.local`:

- `STORAGE_KV_REST_API_URL`
- `STORAGE_KV_REST_API_TOKEN`

Deze worden automatisch geladen via `--env-file=.env.local` in de test scripts.
