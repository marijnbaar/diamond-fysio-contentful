# Bun Package Manager Setup

Dit project gebruikt **Bun** als package manager in plaats van npm of yarn.

## Installatie

Als je Bun nog niet hebt geïnstalleerd:

### macOS/Linux

```bash
curl -fsSL https://bun.sh/install | bash
```

### Windows (via PowerShell)

```powershell
irm bun.sh/install.ps1 | iex
```

### Alternatief: via Homebrew (macOS)

```bash
brew install oven-sh/bun/bun
```

## Project Setup

Na het installeren van Bun:

```bash
bun install
```

Dit maakt een `bun.lockb` bestand aan (de lock file van Bun).

## Veelgebruikte Commando's

### Dependencies installeren

```bash
bun install
```

### Development server starten

```bash
bun run dev
```

### Build maken

```bash
bun run build
```

### Production server starten

```bash
bun run start
```

### Linting

```bash
bun run lint
```

### Tests draaien

```bash
bun run test:cache
bun run test:kv
```

## Scripts uitvoeren

Bun kan TypeScript en JavaScript direct uitvoeren zonder transpilatie:

```bash
# TypeScript scripts
bun scripts/auto-translate-and-import.ts

# CommonJS scripts
bun scripts/setup-booking-fields.cjs

# ESM scripts
bun tests/cache.test.mjs
```

## Dependencies toevoegen/verwijderen

### Dependency toevoegen

```bash
bun add <package-name>
```

### Dev dependency toevoegen

```bash
bun add -d <package-name>
```

### Dependency verwijderen

```bash
bun remove <package-name>
```

## bunx - Package Executor

`bunx` is het equivalent van `npx`:

```bash
bunx husky
bunx eslint
```

## Waarom Bun?

- **Snel**: Tot 20x sneller dan npm/yarn bij installeren
- **All-in-one**: Runtime, bundler, test runner en package manager
- **TypeScript native**: Geen extra configuratie nodig
- **Drop-in replacement**: Werkt met bestaande Node.js projecten
- **Kleinere lock files**: `bun.lockb` is binair en compacter

## Migratie van yarn/npm

Dit project is gemigreerd van yarn/npm naar Bun:

- ❌ `package-lock.json` (npm) - verwijderd
- ❌ `yarn.lock` (yarn) - verwijderd
- ❌ `.yarnrc.yml` (yarn config) - verwijderd
- ✅ `bun.lockb` (bun) - nieuw

Alle scripts in `package.json` zijn bijgewerkt om `bun` te gebruiken in plaats van `npm`/`yarn`/`node`.

## Compatibiliteit

Bun is compatibel met Node.js packages en gebruikt dezelfde `node_modules` structuur. De meeste npm packages werken out-of-the-box.

## Troubleshooting

### Bun versie checken

```bash
bun --version
```

### Cache leegmaken

```bash
bun pm cache rm
```

### Clean install

```bash
bun run clean:install
```

Dit verwijdert `node_modules`, `bun.lockb` en `.next`, en doet een fresh install.

## Documentatie

Volledige Bun documentatie: https://bun.sh/docs
