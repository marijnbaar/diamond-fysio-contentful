# Diamond Fysio - Contentful CMS

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Installatie

Voor een schone installatie:

```bash
# Verwijder oude installaties (optioneel, voor schone start)
rm -rf node_modules package-lock.json yarn.lock .next

# Installeer dependencies met Yarn
yarn install

# Build het project
yarn build

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📸 Instagram Token Management

De site gebruikt Instagram Graph API v21.0 om Instagram posts op te halen voor de feed. Instagram access tokens verlopen na verloop van tijd en moeten regelmatig worden ververst.

### Automatisch Token Refresh

De applicatie probeert automatisch tokens te verversen wanneer:

- Een API call faalt met status 400 of 401
- De token nog geldig is maar verlopen
- De token succesvol kan worden ververst via de refresh endpoint

**Hoe het werkt:**

1. Bij een failed API call wordt automatisch `refreshAccessToken()` aangeroepen
2. Als de refresh succesvol is, wordt de nieuwe token gebruikt voor een retry
3. De nieuwe token wordt automatisch opgeslagen in Vercel environment variables (als credentials beschikbaar zijn)

### Handmatig Token Beheer

#### Token Synchroniseren (van Vercel naar lokaal)

Haal het Instagram token op uit Vercel en zet het lokaal in je `.env.local`:

```bash
npm run instagram:token:sync
```

**Vereisten:**

- Vercel CLI geïnstalleerd (`npm i -g vercel`)
- Ingelogd in Vercel (`vercel login`)
- Project gelinkt (gebeurt automatisch, of run `vercel link`)

Dit script gebruikt `vercel env pull` om alle environment variables van Vercel te halen en naar `.env.local` te schrijven.

#### Token Verversen

Probeer de huidige token automatisch te verversen:

```bash
npm run instagram:token:refresh
```

Dit script:

1. Haalt de huidige token uit `NEXT_PUBLIC_INSTAGRAM_API_KEY`
2. Probeert de token te verversen via Instagram API
3. Update de nieuwe token in Vercel (als `VERCEL_NEWAUTH_TOKEN` is ingesteld)

#### Token Handmatig Updaten

Als de token volledig ongeldig is en niet kan worden ververst, update deze handmatig:

```bash
npm run instagram:token:update -- --token=<JE_NIEUWE_TOKEN>
```

**Hoe een nieuwe token krijgen:**

1. Ga naar https://developers.facebook.com/apps/
2. Selecteer je Instagram app
3. Ga naar Instagram > Basic Display of Instagram Graph API
4. Genereer een nieuwe long-lived access token
5. Gebruik deze token in het commando hierboven

**Vereisten:**

- `VERCEL_NEWAUTH_TOKEN` environment variable (voor Vercel API access)
- `.vercel/project.json` met project en org IDs (of `VERCEL_PROJECT_ID` + `VERCEL_ORG_ID`)

### Token Refresh API Endpoint

Er is ook een API endpoint beschikbaar voor token refresh:

```
GET/POST /api/refreshToken
Authorization: Bearer <WEBHOOK_SECRET>
```

Dit endpoint roept `manualTokenRefresh()` aan en kan worden gebruikt door webhooks of externe services.

---

## 🌍 Translation Scripts

De applicatie bevat scripts voor het automatisch vertalen van Contentful content van Nederlands (master locale) naar Engels (en-US) en andere talen.

### Basis Gebruik

#### 1. Vertaal Alle Componenten

Vertaal alle content in alle componenten automatisch:

```bash
npm run translate:all
```

**Opties:**

- `--forceOverwrite=same` - Overschrijf alleen als target identiek is aan source
- `--forceOverwrite=all` - Overschrijf altijd, zelfs als target al gevuld is
- `--forcePublish` - Publiceer entries zelfs als er geen updates zijn
- `--repair` - Vul master locale aan vanuit target locale als master leeg is
- `--include=contentType1,contentType2` - Vertaal alleen deze content types (case-insensitive)
- `--exclude=contentType1,contentType2` - Sluit deze content types uit
- `--autoLocalize` - Maak automatisch alle Text/Symbol/RichText velden localizable

**Voorbeeld:**

```bash
npm run translate:all -- --include=aboutpage,info --forcePublish
```

#### 2. Vertaal Specifieke Content Type

Vertaal alle entries van een specifiek content type:

```bash
npm run translate:auto -- --contentType=aboutpage --fields=title,description,subtitle
```

**Opties:**

- `--contentType=<ID>` - **Verplicht**: Content type ID (bijv. `aboutpage`)
- `--fields=<field1,field2>` - Specifieke velden om te vertalen
- `--allFields` - Ontdek automatisch alle localizable text/rich-text velden
- `--forceOverwrite=same|all` - Overschrijf gedrag (zie hierboven)
- `--entryId=<ID>` - Vertaal alleen een specifieke entry
- `--repair` - Vul master locale aan vanuit target

**Voorbeeld:**

```bash
# Vertaal alle velden van aboutpage
npm run translate:auto -- --contentType=aboutpage --allFields

# Vertaal alleen specifieke velden
npm run translate:auto -- --contentType=info --fields=title,description

# Vertaal één specifieke entry
npm run translate:auto -- --contentType=teamMember --entryId=abc123 --allFields
```

#### 3. Vertaal Componenten van een Specifieke Pagina

Vertaal alle componenten die gekoppeld zijn aan een specifieke pagina:

```bash
npm run translate:page -- --pageType=Aboutpage --slug=/about
```

**Opties:**

- `--pageType=<Type>` - **Verplicht**: Page type (bijv. `Aboutpage`, `Homepage`)
- `--slug=<slug>` - **Verplicht**: Slug van de pagina (bijv. `/about`)
- `--forceOverwrite=same|all` - Overschrijf gedrag
- `--forcePublish` - Publiceer entries
- `--repair` - Repair mode

**Voorbeeld:**

```bash
npm run translate:page -- --pageType=Aboutpage --slug=/about --forcePublish
```

#### 4. Vertaal Alle Pagina's van een Type

Vertaal alle pagina's van een bepaald type en hun componenten:

```bash
npm run translate:pages -- --pageType=specialisation
```

**Opties:**

- `--pageType=<ID>` - **Verplicht**: Content type ID (bijv. `specialisation`)
- `--forceOverwrite=same|all` - Overschrijf gedrag
- `--forcePublish` - Publiceer entries
- `--repair` - Repair mode

**Voorbeeld:**

```bash
npm run translate:pages -- --pageType=specialisation --forcePublish
```

### Contentful Setup Scripts

#### Locale Beheer

Maak een nieuwe locale in Contentful:

```bash
npm run cf:locale:ensure
```

Stel de default locale in:

```bash
npm run cf:locale:set-default
```

#### Velden Localizable Maken

Maak velden van een content type localizable:

```bash
npm run cf:fields:localize -- --contentType=aboutpage --fields=title,description
```

Maak automatisch alle text/rich-text velden localizable voor alle content types:

```bash
npm run cf:fields:localize:all
```

### Hoe Vertaling Werkt

1. **Brongegevens**: Scripts lezen Nederlandse content (master locale: `nl-NL`) uit Contentful
2. **Vertaling**: Tekst wordt vertaald via `/api/translate/batch` endpoint (gebruikt OpenAI met KV caching)
3. **Opslag**: Vertaalde content wordt direct geschreven naar Contentful in de target locale (`en-US`)
4. **Publicatie**: Entries worden automatisch gepubliceerd (tenzij `PUBLISH_AFTER_UPDATE=false`)

**Caching:**

- Vertalingen worden gecached in Vercel KV voor 30 dagen
- Identieke teksten worden niet opnieuw vertaald
- Dit maakt batch vertaling veel sneller

**Skippen:**

- Entries die al vertaalde content hebben worden overgeslagen (tenzij `--forceOverwrite` is gebruikt)
- Archived entries worden altijd overgeslagen
- Velden met alleen URLs, hex colors, of zeer korte teksten worden overgeslagen

### Environment Variables

Vereiste environment variables voor vertaling scripts:

```bash
# Contentful
CONTENTFUL_SPACE_ID=<space-id>
CONTENTFUL_ACCESS_TOKEN=<cda-token>
CMAACCESSTOKEN=<management-token>
ENV_ID=master  # of je environment naam

# Locales
MASTER_LOCALE=nl-NL
ALLOWED_LOCALES=nl-NL,en-US

# Publishing
PUBLISH_AFTER_UPDATE=true  # default: true

# Translation API
NEXT_PUBLIC_SITE_URL=https://jouw-site.nl  # voor local development: http://localhost:3000
OPENAI_API_KEY=<openai-key>  # voor vertaling

# Vercel (voor Instagram token updates)
VERCEL_NEWAUTH_TOKEN=<vercel-api-token>
VERCEL_PROJECT_ID=<project-id>  # optioneel, kan uit .vercel/project.json komen
VERCEL_ORG_ID=<org-id>  # optioneel, kan uit .vercel/project.json komen
```

---

## 📁 Project Structure

```
.
├── components/          # React componenten
├── lib/
│   ├── contentful.js    # Contentful Apollo client (voor pages)
│   ├── contentful.ts    # Contentful GraphQL client (voor scripts)
│   ├── query/           # GraphQL queries voor Contentful
│   └── ...
├── pages/
│   ├── api/            # API routes (translate, fetchPosts, etc.)
│   └── ...             # Next.js pages
├── scripts/            # Translation en management scripts
└── public/            # Static assets
```

---

## 🔧 Development

### Node Version

Het project gebruikt Node.js 20. Zorg dat je de juiste versie hebt:

```bash
nvm use  # gebruikt .nvmrc
```

### API Routes

[API routes](https://nextjs.org/docs/api-routes/introduction) zijn beschikbaar op:

- `/api/translate/batch` - Batch translation (KV cached, gebruikt door translation scripts)
- `/api/fetchPosts` - Instagram posts ophalen
- `/api/refreshToken` - Instagram token refresh

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Contentful Management API](https://www.contentful.com/developers/docs/references/content-management-api/)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)

---

## 🚀 Deploy on Vercel

De gemakkelijkste manier om deze Next.js app te deployen is via [Vercel Platform](https://vercel.com/new).

Voor deployment:

1. Zorg dat alle environment variables zijn ingesteld in Vercel
2. Connect je GitHub repository
3. Vercel detecteert automatisch Next.js en configureert de build
