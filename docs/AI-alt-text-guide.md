# AI Alt-Text Generatie Handleiding

## Overzicht

Dit script gebruikt **OpenAI Vision API (GPT-4o)** om automatisch beschrijvende alt-teksten te genereren voor alle afbeeldingen in Contentful.

## Vereisten

### 1. Environment Variables

Zorg dat deze variabelen in je `.env.local` staan:

```bash
# Contentful
CONTENTFUL_SPACE_ID=<space-id>
CMAACCESSTOKEN=<management-token>
ENV_ID=master  # of je environment naam

# OpenAI (vereist!)
OPENAI_API_KEY=<your-openai-api-key>
```

### 2. OpenAI API Key

1. Ga naar https://platform.openai.com/api-keys
2. Maak een nieuwe API key aan
3. Voeg toe aan `.env.local`: `OPENAI_API_KEY=sk-...`

**Let op:** OpenAI Vision API kost geld per request (~$0.01-0.03 per afbeelding).

## Gebruik

### Basis Commando's

#### 1. Test Run (Geen Updates)

```bash
yarn alt:generate:test
# of
tsx scripts/generate-alt-texts.ts --dryRun
```

Test het script zonder wijzigingen in Contentful.

#### 2. Genereer voor Alle Afbeeldingen Zonder Alt-Text

```bash
yarn alt:generate
# of
tsx scripts/generate-alt-texts.ts
```

Genereert alleen alt-teksten voor afbeeldingen die nog geen description hebben.

#### 3. Overschrijf Alle Bestaande Alt-Teksten

```bash
yarn alt:generate:all
# of
tsx scripts/generate-alt-texts.ts --force
```

⚠️ **Waarschuwing:** Dit overschrijft alle bestaande descriptions!

### Geavanceerde Opties

#### Specifieke Asset

```bash
tsx scripts/generate-alt-texts.ts --assetId=<asset-id>
```

#### Limiteer Aantal Assets (voor testing)

```bash
tsx scripts/generate-alt-texts.ts --max=10
```

#### Andere Locale

```bash
tsx scripts/generate-alt-texts.ts --locale=en-US
```

#### Combinaties

```bash
# Test met 5 assets
tsx scripts/generate-alt-texts.ts --dryRun --max=5

# Overschrijf 10 assets
tsx scripts/generate-alt-texts.ts --force --max=10
```

## Hoe Het Werkt

### 1. Asset Detectie

- Haalt alle image assets op uit Contentful
- Filtert assets zonder description (tenzij `--force`)
- Houdt rekening met locale (standaard: `nl-NL`)

### 2. AI Generatie

- Gebruikt **GPT-4o Vision API** om de afbeelding te analyseren
- Genereert context-aware alt-teksten volgens SEO best practices
- Probeert context te vinden uit entries die de asset gebruiken

### 3. Contentful Update

- Update het `description` veld van de asset
- Publiceert automatisch de asset
- Werkt voor alle locales

## Voorbeelden van Genereerde Alt-Teksten

### Hero Afbeeldingen

```
"Fysiotherapeut helpt patiënt met rugklachten in moderne praktijkruimte bij Diamond Fysio Amsterdam"
```

### Team Foto's

```
"Portret van Jan Jansen, fysiotherapeut gespecialiseerd in sportfysiotherapie bij Diamond Fysio"
```

### Behandelafbeeldingen

```
"Fysiotherapeut begeleidt patiënt bij knieblessure revalidatie in behandelruimte"
```

### Logo's

```
"Diamond Fysio Amsterdam logo"
```

## Tips & Best Practices

### 1. Start Met Test Run

```bash
yarn alt:generate:test --max=5
```

Controleer eerst of de gegenereerde teksten goed zijn.

### 2. Batch Processing

Het script verwerkt assets één voor één met 1 seconde delay tussen requests. Voor veel assets kan dit even duren.

### 3. Kosten Management

- **Test eerst:** Gebruik `--max=10` om kosten te beperken
- **Bekijk kwaliteit:** Controleer enkele resultaten voordat je alles genereert
- **Selectief:** Gebruik `--assetId` voor specifieke assets

### 4. Review & Aanpassen

Na AI generatie kun je in Contentful:

- Handmatig descriptions aanpassen indien nodig
- Beschrijvingen verbeteren met meer context
- Vertalen naar andere locales

## Troubleshooting

### "OPENAI_API_KEY is not set"

- Controleer `.env.local`
- Herstart terminal/dev server na toevoegen

### "Asset not found"

- Controleer asset ID in Contentful
- Zorg dat asset bestaat en image type is

### Rate Limiting

- Het script heeft al 1 seconde delay tussen requests
- Bij veel assets kan dit lang duren (maar voorkomt rate limits)

### Slechte Alt-Teksten

- AI is niet perfect - review belangrijke afbeeldingen handmatig
- Gebruik context parameters voor betere resultaten
- Verbeter handmatig in Contentful indien nodig

## Kosten Schatting

OpenAI Vision API (GPT-4o):

- **Input:** ~$0.01-0.02 per afbeelding
- **Output:** ~$0.01 per alt-tekst

**Voorbeeld:**

- 50 afbeeldingen: ~$0.50-1.50
- 200 afbeeldingen: ~$2.00-6.00

## Volgende Stappen

1. **Test Run:** `yarn alt:generate:test --max=5`
2. **Review Resultaten:** Check Contentful
3. **Kleine Batch:** `yarn alt:generate --max=20`
4. **Alles:** `yarn alt:generate` (of `--force` voor alles)

## Integratie Met Vertaling

Na het genereren van NL alt-teksten, kun je ze vertalen:

```bash
# Genereer NL alt-teksten
yarn alt:generate

# Vertaal naar EN (indien description field localizable is)
# (Dit vereist mogelijk aanpassing van translate scripts)
```

---

**Vragen?** Check de logs tijdens het runnen van het script voor details.
