# Stap-voor-stap Test Guide: Team Member Auto-Page

Deze guide neemt je door het hele testproces om te verifiëren dat automatische team member pagina's werken.

## Voorbereiding

### ✅ Stap 1: Verifieer Code

Controleer of alle code files aanwezig zijn:

```bash
# Webhook handler
ls pages/api/webhooks/team-member.js

# Routing updates
ls lib/query/pages/teammemberpage.js
ls lib/query/pages/allDynamicRoot.js
ls lib/query/getQuery.js

# Check getData.js heeft Teammemberpage handling
grep -n "Teammemberpage" lib/query/getData.js
```

### ✅ Stap 2: Check Environment Variables

Maak een `.env.local` file aan (als die er nog niet is) met:

```bash
# Contentful
CTF_SPACE_ID=jouw-space-id
CTF_ENV_ID=master
CTF_MANAGEMENT_TOKEN=jouw-management-token
# OF gebruik:
CMAACCESSTOKEN=jouw-management-token

# Webhook Security
WEBHOOK_SECRET=jouw-random-secret-string
```

**Tip:** Genereer een random secret:

```bash
openssl rand -base64 32
```

### ✅ Stap 3: Verifieer Contentful Setup

#### 3a. Check of Teammemberpage Content Type bestaat

1. Ga naar Contentful → Content model
2. Zoek naar `teammemberpage` (of `Team Member Page`)
3. **Als het niet bestaat:**
   - Maak nieuw content type aan
   - Naam: `Team Member Page`
   - API ID: `teammemberpage`
   - Voeg deze velden toe:
     - `slug` (Short text, Required, Unique, Localized)
     - `title` (Short text, Required, Localized)
     - `teamMember` (Reference → `teamMember`, Required, 1 entry)
     - `components` (Reference, Optional, Multiple entries)

#### 3b. Check of TeamMember Content Type bestaat

1. Ga naar Contentful → Content model
2. Verifieer dat `teamMember` content type bestaat
3. Check dat deze velden bestaan:
   - `name` (verplicht voor slug generatie)
   - `role`, `descriptionTeampage`, etc.

## Local Development Testing

### 🔧 Stap 4: Start Development Server

```bash
# Installeer dependencies als nodig
yarn install

# Start dev server
yarn dev
```

Server draait op `http://localhost:3000`

### 🔧 Stap 5: Expose Local Server (voor webhook testing)

Contentful moet je local server kunnen bereiken. Gebruik **ngrok** of **Cloudflare Tunnel**:

#### Optie A: ngrok

```bash
# Installeer ngrok (als nog niet gedaan)
# macOS: brew install ngrok
# Of download van https://ngrok.com

# Start ngrok tunnel
ngrok http 3000
```

Je krijgt een URL zoals: `https://abc123.ngrok.io`

#### Optie B: Cloudflare Tunnel

```bash
# Installeer cloudflared
brew install cloudflare/cloudflare/cloudflared

# Start tunnel
cloudflared tunnel --url http://localhost:3000
```

### 🔧 Stap 6: Configureer Webhook in Contentful

1. Ga naar Contentful → Settings → Webhooks
2. Klik "Add webhook"
3. Configureer:
   - **Name**: `Team Member Auto-Page (Local)`
   - **URL**: `https://jouw-ngrok-url.ngrok.io/api/webhooks/team-member`
   - **HTTP Basic username**: (laat leeg)
   - **HTTP Basic password**: (laat leeg)
   - **Custom headers**:
     - Name: `Authorization`
     - Value: `Bearer {jouw-WEBHOOK_SECRET}`
   - **Triggers**:
     - ✅ Entry.create
     - ✅ Entry.publish
   - **Filters**:
     - Content type: `teamMember`
4. Klik "Save"

**Test de webhook:**

- Klik op "Test" in de webhook settings
- Kies "Entry.publish"
- Content Type: `teamMember`
- Kies een bestaande team member entry

### 🧪 Stap 7: Test Webhook Manueel (optioneel)

Je kunt de webhook ook manueel testen met curl:

```bash
curl -X POST http://localhost:3000/api/webhooks/team-member \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer jouw-WEBHOOK_SECRET" \
  -H "X-Contentful-Topic: ContentManagement.Entry.publish" \
  -d '{
    "sys": {
      "id": "test-entry-id",
      "contentType": {
        "sys": {
          "id": "teamMember"
        }
      }
    },
    "fields": {
      "name": {
        "nl-NL": "Test Persoon"
      }
    }
  }'
```

Check de terminal output voor logs.

### 🧪 Stap 8: Test Volledige Flow

#### 8a. Maak Test TeamMember Entry

1. Ga naar Contentful → Content
2. Klik "Add entry" → Kies `Team Member`
3. Vul in:
   - **Name**: `Jan Jansen` (of een andere testnaam)
   - **Role**: `Fysiotherapeut`
   - Vul andere velden in (optioneel)
4. **SAVE** (nog niet publiceren!)
5. Check terminal - je zou **geen** webhook moeten zien (omdat het nog niet gepubliceerd is)

#### 8b. Publiceer Entry (dit triggert webhook)

1. In de TeamMember entry, klik **Publish**
2. **Direct daarna:**
   - Check terminal logs - je zou moeten zien:
     ```
     🚀 Team member webhook ontvangen voor: Jan Jansen
     ✨ Nieuwe Teammemberpage aanmaken met slug: /team/jan-jansen
     ✅ Teammemberpage aangemaakt: {entry-id}
     📢 Teammemberpage gepubliceerd: {entry-id}
     ```
   - Check Contentful → Content → Je zou een nieuwe `Teammemberpage` entry moeten zien

#### 8c. Verifieer Teammemberpage Entry

1. Ga naar Contentful → Content → `Teammemberpage`
2. Open de nieuwe entry
3. Check:
   - ✅ `slug` = `/team/jan-jansen` (of je testnaam)
   - ✅ `title` = `Jan Jansen`
   - ✅ `teamMember` = linkt naar je TeamMember entry
4. Check dat de entry **Published** status heeft

#### 8d. Test Page Rendering

1. Open browser: `http://localhost:3000/team/jan-jansen`
2. **Verwacht resultaat:**
   - ✅ Pagina laadt zonder errors
   - ✅ Team member informatie wordt getoond
   - ✅ Navigation en footer zijn aanwezig
   - ✅ Geen 404 error

**Als 404:**

- Check terminal voor GraphQL errors
- Check of slug exact overeenkomt
- Check of entry gepubliceerd is

#### 8e. Test Slug Generatie

Test verschillende namen om slug generatie te verifiëren:

| Input Name             | Verwachte Slug               |
| ---------------------- | ---------------------------- |
| `Jan Jansen`           | `/team/jan-jansen`           |
| `Marieke van der Berg` | `/team/marieke-van-der-berg` |
| `Dr. Erik de Vries`    | `/team/dr-erik-de-vries`     |
| `José García`          | `/team/jose-garcia`          |

**Test dit:**

1. Maak TeamMember entries met verschillende namen
2. Publiceer ze
3. Check of slugs correct zijn gegenereerd
4. Test of alle pagina's bereikbaar zijn

### 🧪 Stap 9: Test Update Flow

Test wat er gebeurt wanneer je een bestaande TeamMember update:

1. Open een bestaande TeamMember entry
2. Verander de naam (bijv. `Jan Jansen` → `Jan Jansen-de Vries`)
3. Publiceer
4. Check:
   - ✅ Webhook wordt getriggerd
   - ✅ Bestaande Teammemberpage wordt geüpdatet (niet duplicate gemaakt)
   - ✅ Slug wordt geüpdatet naar nieuwe naam

### 🧪 Stap 10: Test Team Overview Collectie

Verifieer dat team members in de collectie overview verschijnen:

1. Ga naar homepage of team pagina
2. Zoek naar `TeamOverview` component
3. **Als team members al in collectie staan:**
   - Check of nieuwe team members automatisch verschijnen
4. **Als team members via reference worden opgehaald:**
   - Check GraphQL query: `teamMemberCollection` in `specialisationHomeOverview.js`
   - Nieuwe team members zouden automatisch moeten verschijnen als ze:
     - Gepubliceerd zijn
     - Gekoppeld zijn aan de TeamOverview component

## Production Testing

### 🚀 Stap 11: Deploy naar Production

```bash
# Build check
yarn build

# Deploy (afhankelijk van je setup)
vercel --prod
# of
git push origin main  # als je CI/CD hebt
```

### 🚀 Stap 12: Configureer Production Webhook

1. Ga naar Contentful → Webhooks
2. Maak nieuwe webhook (of update bestaande):
   - **Name**: `Team Member Auto-Page (Production)`
   - **URL**: `https://jouw-productie-domein.nl/api/webhooks/team-member`
   - **Authorization**: `Bearer {WEBHOOK_SECRET}` (zelfde secret als in production env vars)
   - **Triggers**: `Entry.create`, `Entry.publish`
   - **Filters**: Content type `teamMember`
3. Test met Test button

### 🚀 Stap 13: Verifieer Production Environment Variables

In je production environment (Vercel/Netlify/etc.):

- ✅ `CTF_SPACE_ID`
- ✅ `CTF_ENV_ID`
- ✅ `CTF_MANAGEMENT_TOKEN` of `CMAACCESSTOKEN`
- ✅ `WEBHOOK_SECRET` (moet hetzelfde zijn als in webhook config)

### 🚀 Stap 14: Test in Production

1. Maak nieuwe TeamMember entry in Contentful
2. Publiceer
3. Check:
   - ✅ Teammemberpage wordt aangemaakt (in Contentful)
   - ✅ Pagina is bereikbaar: `https://jouw-domein.nl/team/{naam}`
   - ✅ Check production logs voor webhook events

## Debugging

### Probleem: Webhook wordt niet ontvangen

**Check:**

```bash
# 1. Check of server draait
curl http://localhost:3000/api/webhooks/team-member

# 2. Check ngrok tunnel
curl https://jouw-ngrok-url.ngrok.io/api/webhooks/team-member

# 3. Check Contentful webhook logs
# Ga naar Contentful → Webhooks → Click webhook → View logs
```

**Mogelijke oorzaken:**

- ❌ Server draait niet
- ❌ ngrok tunnel is down
- ❌ Webhook URL is incorrect
- ❌ Authorization header is incorrect

### Probleem: Teammemberpage wordt niet aangemaakt

**Check terminal logs voor:**

```
❌ Error in team member webhook: ...
```

**Veelvoorkomende errors:**

- `Content type not found` → Teammemberpage content type bestaat niet
- `Validation error` → Velden ontbreken of zijn verkeerd geconfigureerd
- `Unauthorized` → Management token is incorrect

**Check:**

```bash
# Test management API access
node -e "
const { createClient } = require('contentful-management');
const client = createClient({ accessToken: process.env.CTF_MANAGEMENT_TOKEN });
client.getSpace(process.env.CTF_SPACE_ID).then(s => s.getEnvironment('master'))
  .then(e => e.getContentTypes()).then(ct => console.log(ct.items.map(c => c.sys.id)))
  .catch(e => console.error('Error:', e.message));
"
```

### Probleem: Pagina geeft 404

**Check:**

1. Is Teammemberpage entry gepubliceerd?
2. Klopt de slug exact? (case-sensitive!)
3. Check GraphQL query:
   ```bash
   # In browser console op localhost:3000
   # Of check terminal voor GraphQL errors
   ```

**Debug GraphQL:**

- Check `lib/query/pages/allDynamicRoot.js` - bevat `teammemberpageCollection`?
- Check `lib/query/getQuery.js` - heeft `Teammemberpage` case?
- Check `lib/query/getData.js` - heeft speciale Teammemberpage handling?

### Probleem: Team members verschijnen niet in collectie

**Dit werkt automatisch via bestaande queries**, maar check:

1. Is TeamMember entry gepubliceerd?
2. Is TeamMember gekoppeld aan TeamOverview component?
3. Check GraphQL query in `specialisationHomeOverview.js`:
   ```graphql
   teamMemberCollection(locale: $locale) {
     items {
       ...teamMember
     }
   }
   ```

## Success Checklist

- ✅ Webhook wordt ontvangen wanneer TeamMember wordt gepubliceerd
- ✅ Teammemberpage entry wordt automatisch aangemaakt
- ✅ Slug wordt correct gegenereerd (`/team/{naam-slug}`)
- ✅ Teammemberpage wordt automatisch gepubliceerd
- ✅ Pagina is bereikbaar via `/team/{naam-slug}`
- ✅ Team member data wordt correct getoond
- ✅ Update van naam werkt (slug wordt geüpdatet)
- ✅ Geen duplicate pagina's worden aangemaakt
- ✅ Team members verschijnen in TeamOverview collecties

## Next Steps

Als alles werkt:

1. ✅ Documenteer eventuele custom configuraties
2. ✅ Monitor webhook logs in Contentful
3. ✅ Zet up alerting voor webhook failures (optioneel)
4. ✅ Train team members op hoe ze nieuwe team members moeten aanmaken
