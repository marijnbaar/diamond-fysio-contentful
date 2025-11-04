# Team Member Auto-Page Setup

Dit document legt uit wat er nodig is om automatische team member pagina's werkend te krijgen wanneer een team member wordt aangemaakt in Contentful.

## Overzicht

Wanneer een gebruiker een `TeamMember` entry aanmaakt en publiceert in Contentful, wordt automatisch:

1. Een `Teammemberpage` entry aangemaakt
2. Een slug gegenereerd op basis van de naam (`/team/{naam-slug}`)
3. De pagina gekoppeld aan de team member
4. De pagina automatisch gepubliceerd

## Wat is al geïmplementeerd

### ✅ Code Changes

1. **Webhook Handler** (`pages/api/webhooks/team-member.js`)
   - Ontvangt Contentful webhook events
   - Detecteert wanneer een TeamMember wordt aangemaakt/gepubliceerd
   - Maakt automatisch een `Aboutpage` entry aan met `pageType: 'Teammemberpage'`
   - Genereert slug op basis van naam (`/team/{naam-slug}`)

2. **Routing Updates**
   - `lib/query/pages/allDynamicRoot.js` - `pageType` toegevoegd aan aboutpageCollection query
   - `lib/query/pages/aboutpage.js` - Query uitgebreid met `teamMember` data voor team member pagina's
   - `lib/query/getQuery.js` - Teammemberpage gebruikt Aboutpage query (met filtering)
   - `lib/query/getData.js` - Speciale handling voor team member pagina's met `pageType` filtering
   - `getTypeName` functie aangepast om onderscheid te maken tussen verschillende `pageType` waarden

### ⚠️ Belangrijk: Gebruik van Aboutpage Content Type

Team member pagina's gebruiken het bestaande `Aboutpage` content type met `pageType: 'Teammemberpage'`. Dit betekent:

- ✅ **Geen nieuw content type nodig** - gebruikt bestaande `Aboutpage`
- ✅ **Andere pagina types blijven ongewijzigd** - specialisatie en content pagina's met andere `pageType` waarden worden niet beïnvloed
- ✅ **Filtering op `pageType`** - routing maakt onderscheid tussen verschillende aboutpage types

## Wat nog moet gebeuren in Contentful

### 1. Aboutpage Content Type: `teamMember` veld toevoegen

Het `Aboutpage` content type heeft al:

- ✅ `slug` veld
- ✅ `title` veld
- ✅ `pageType` veld
- ✅ `components` veld

**Je moet toevoegen:**

- **`teamMember`** (Reference, one entry, **optional** - alleen voor team member pagina's)
  - Link naar een `TeamMember` entry
  - Dit veld is alleen gevuld voor entries met `pageType: 'Teammemberpage'`

**Belangrijk:** Andere `Aboutpage` entries (specialisatie, content pagina's) hebben dit veld leeg - dat is prima!

### 2. Contentful Webhook configureren

In je Contentful space settings, configureer een webhook die naar je endpoint wijst:

#### Webhook URL:

```
https://jouw-domein.nl/api/webhooks/team-member
```

Of voor development:

```
http://localhost:3000/api/webhooks/team-member
```

#### Webhook Settings:

- **Name**: `Team Member Auto-Page`
- **URL**: (zie boven)
- **HTTP Basic Auth**: Optioneel, maar aanbevolen
- **Events**:
  - ✅ `Entry.create`
  - ✅ `Entry.publish`
  - ❌ Entry.update (niet nodig, wordt al afgehandeld via publish)
  - ❌ Entry.delete (optioneel, voor cleanup)
- **Filters**:
  ```
  Content Type ID: teamMember
  ```

#### Security:

1. Stel een `WEBHOOK_SECRET` environment variable in
2. Configureer in Contentful webhook settings:
   - **Authorization Header**: `Bearer {WEBHOOK_SECRET}`
   - Of gebruik HTTP Basic Auth

### 3. Environment Variables

Zorg dat de volgende environment variables zijn ingesteld:

```bash
# Contentful Management API (voor webhook)
CTF_MANAGEMENT_TOKEN=<jouw-management-token>
# of
CMAACCESSTOKEN=<jouw-management-token>

# Contentful Space & Environment
CTF_SPACE_ID=<space-id>
CTF_ENV_ID=master  # of je environment naam

# Webhook Security
WEBHOOK_SECRET=<random-secret-string>
```

## Hoe het werkt

### Flow:

1. **Contentful → Webhook**
   - Gebruiker maakt TeamMember entry aan en publiceert
   - Contentful verstuurt webhook naar `/api/webhooks/team-member`

2. **Webhook Handler**
   - Verifieert webhook authenticatie
   - Checkt of het een TeamMember entry is
   - Genereert slug op basis van naam: `/team/{naam-slug}`
   - Checkt of er al een Teammemberpage bestaat
   - Maakt nieuwe Teammemberpage entry aan of update bestaande
   - Publiceert de pagina automatisch

3. **Page Rendering**
   - Wanneer een gebruiker `/team/{naam-slug}` bezoekt
   - Next.js route handler zoekt de Teammemberpage entry
   - Haalt de gekoppelde TeamMember data op
   - Rendert de Teammemberpage component met alle data

## Team Member Collection Overview

De team member collection overview op de homepage en team pagina werkt automatisch via GraphQL queries. Wanneer een nieuwe TeamMember wordt aangemaakt en gekoppeld aan een `TeamOverview` component, verschijnt deze automatisch in de collectie.

### Automatische toevoeging aan collecties

Als je wilt dat nieuwe team members automatisch worden toegevoegd aan specifieke `TeamOverview` collecties, kun je dit uitbreiden in de webhook handler (zie commentaar in code).

## Testen

### 1. Local Development

1. Start je development server:

   ```bash
   yarn dev
   ```

2. Gebruik een tool zoals [ngrok](https://ngrok.com/) om je local server exposed te maken:

   ```bash
   ngrok http 3000
   ```

3. Configureer de webhook in Contentful met de ngrok URL

4. Maak een test TeamMember entry aan in Contentful

5. Publiceer de entry

6. Check de logs in je terminal om te zien of de webhook werd ontvangen

### 2. Production

1. Deploy je code naar productie

2. Configureer de webhook in Contentful met je productie URL

3. Test met een nieuwe TeamMember entry

## Troubleshooting

### Webhook wordt niet ontvangen

- Check of de webhook URL correct is geconfigureerd
- Check Contentful webhook logs voor delivery status
- Check of `WEBHOOK_SECRET` correct is ingesteld
- Check server logs voor errors

### Teammemberpage wordt niet aangemaakt

- Check of het `Teammemberpage` content type bestaat
- Check of de velden `slug`, `title`, en `teamMember` bestaan
- Check webhook handler logs voor errors
- Check of de Management API token correct is ingesteld

### Pagina is niet bereikbaar

- Check of de slug correct is gegenereerd
- Check of de pagina is gepubliceerd
- Check of de routing queries correct zijn (allDynamicRoot bevat teammemberpageCollection)
- Check GraphQL queries voor errors

### Team members verschijnen niet in collectie

- Check of de TeamMember entry is gepubliceerd
- Check of de TeamMember is gekoppeld aan de TeamOverview component
- Check GraphQL queries voor de TeamOverview

## Contentful Schema Requirements

### Aboutpage Content Type - teamMember veld toevoegen

Het `Aboutpage` content type moet een **optioneel** `teamMember` reference veld hebben:

```json
{
  "id": "teamMember",
  "name": "Team Member",
  "type": "Link",
  "required": false,
  "linkType": "Entry",
  "validations": [
    {
      "linkContentType": ["teamMember"]
    }
  ]
}
```

**Let op:**

- Dit veld is **optioneel** (required: false)
- Alleen entries met `pageType: 'Teammemberpage'` gebruiken dit veld
- Andere aboutpage entries (specialisatie, content) hebben dit veld leeg

## Samenvatting

✅ **Code is klaar** - Alle benodigde code is geïmplementeerd

⚠️ **Contentful Setup nodig:**

1. Maak `Teammemberpage` content type aan
2. Configureer webhook in Contentful
3. Stel environment variables in
4. Test de flow

🎉 **Resultaat:**

- Automatische pagina creatie bij TeamMember aanmaak
- Automatische slug generatie
- Team members verschijnen automatisch in collecties (via bestaande GraphQL queries)
