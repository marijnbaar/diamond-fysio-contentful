# Booking Links Setup voor Diamond Fysio

Deze handleiding legt uit hoe je de booking links voor therapeuten kunt beheren via Contentful in plaats van in de code.

## 📋 Overzicht

De booking functionaliteit is nu **volledig beheerbaar via Contentful**. Dit betekent dat je:

- ✅ Booking links kunt toevoegen/wijzigen zonder code aanpassingen
- ✅ Nieuwe therapeuten kunt toevoegen via Contentful
- ✅ Therapeuten kunt verwijderen zonder deployment
- ✅ Verschillende booking types kunt ondersteunen (Smartfile, Email)

## 🏗️ Structuur

### Content Types in Contentful

#### TeamMember (aangepast)

Nieuwe velden toegevoegd:

- **bookingLink** (Text): De URL voor Smartfile booking of email adres
- **bookingType** (Text, dropdown): Type booking systeem
  - `smartfile` - Voor online afspraken via Smartfile
  - `email` - Voor afspraken via email
  - `none` - Geen online afspraken mogelijk

#### AppointmentCardOverview (aangepast)

Nieuw veld toegevoegd:

- **therapists** (References, many): Lijst van TeamMember entries die getoond moeten worden op de afspraak pagina

## 🚀 Installatie & Setup

### Stap 1: Content Types voorbereiden

Run het setup script om de nieuwe velden toe te voegen aan je Contentful content types:

```bash
node scripts/setup-booking-fields.js
```

Dit script:

- ✅ Voegt `bookingLink` en `bookingType` toe aan TeamMember
- ✅ Voegt `therapists` reference veld toe aan AppointmentCardOverview
- ✅ Publiceert de aangepaste content types

### Stap 2: Data importeren

Run het import script om de huidige therapeuten data te importeren:

```bash
node scripts/import-therapists-data.js
```

Dit script:

- ✅ Zoekt bestaande TeamMember entries op naam
- ✅ Voegt booking links en types toe
- ✅ Linkt alle therapeuten aan de AppointmentCardOverview
- ✅ Publiceert alle wijzigingen

### Stap 3: Verifieer in Contentful

1. Log in op [Contentful](https://app.contentful.com)
2. Ga naar **Content** → **TeamMember**
3. Check of de therapeuten de nieuwe velden hebben:
   - Booking Link
   - Booking Type
4. Ga naar **Content** → **AppointmentCardOverview**
5. Check of de therapeuten gelinkt zijn in het **Therapists** veld

### Stap 4: Test lokaal

```bash
npm run dev
```

Ga naar `/afspraak-maken` en verifieer dat:

- ✅ Alle therapeuten worden getoond
- ✅ De booking links werken
- ✅ Smartfile en email therapeuten correct worden weergegeven

### Stap 5: Deploy

```bash
git add .
git commit -m "feat: migrate booking links to Contentful"
git push
```

## 📝 Therapeuten beheren in Contentful

### Een nieuwe therapeut toevoegen

1. Ga naar **Content** → **TeamMember**
2. Klik **Add entry**
3. Vul de velden in:
   - Name: De naam van de therapeut
   - Booking Link: De Smartfile URL of email adres
   - Booking Type: Kies `smartfile` of `email`
4. **Publish** de entry
5. Ga naar **Content** → **AppointmentCardOverview** → "Maak een afspraak"
6. Scroll naar **Therapists** veld
7. Klik **Add existing entry** en selecteer de nieuwe therapeut
8. **Publish** de wijzigingen

### Een booking link aanpassen

1. Ga naar **Content** → **TeamMember**
2. Zoek de therapeut
3. Wijzig het **Booking Link** veld
4. **Publish** de wijzigingen
5. De nieuwe link is meteen zichtbaar op de website (na cache refresh)

### Een therapeut verwijderen van de afspraak pagina

1. Ga naar **Content** → **AppointmentCardOverview** → "Maak een afspraak"
2. Scroll naar **Therapists** veld
3. Verwijder de therapeut uit de lijst
4. **Publish** de wijzigingen

## 🔧 Booking Types

### Smartfile

Voor therapeuten waarbij online afspraken mogelijk zijn via Smartfile:

```
Booking Type: smartfile
Booking Link: https://web.smartfile.nl/booking/practise/[UUID]/public_therapists/[THERAPIST-ID]
```

**Voorbeeld:**

```
https://web.smartfile.nl/booking/practise/5d83a01c-3db0-434a-b943-aa6da65e3b49/public_therapists?reset=true
```

### Email

Voor therapeuten waarbij afspraken via email moeten:

```
Booking Type: email
Booking Link: therapeut@email.com
```

**Voorbeeld:**

```
tonwillemsen@me.com
```

### None

Voor therapeuten die (tijdelijk) geen online afspraken accepteren:

```
Booking Type: none
Booking Link: [leeg laten]
```

## 📊 Huidige Therapeuten Data

### Smartfile Therapeuten

- Iva Lešić
- Laszlo Gèleng
- Menno de Vries
- Regi Severins
- Robin Rosa Pennings
- Rutger Klauwers
- Benjamin Soerel (custom Smartfile link)

### Email Therapeuten

- Ton Willemsen - tonwillemsen@me.com
- Lidia Bernabei - info@mymedidiet.com
- Niels - info@osteopathie-tuijl.nl
- Leila - leilaspilates@gmail.com

## ⚙️ Technische Details

### GraphQL Queries

De volgende queries zijn aangepast:

- `lib/query/fragments/teamMember.js` - TeamMember fragment
- `lib/query/components/teammember.js` - TeamMember query
- `lib/query/components/componentsList.js` - AppointmentCardOverview in component list

### React Component

`components/Appointment.jsx` gebruikt nu:

- `therapistsCollection` prop van Contentful
- Dynamische filtering op `bookingType`
- Automatische verdeling over 3 kolommen

### Data Flow

```
Contentful
  ↓
GraphQL Query (appointmentCardOverview)
  ↓
therapistsCollection { name, bookingLink, bookingType }
  ↓
Appointment Component
  ↓
Filter & Render (Smartfile | Email)
```

## 🆘 Troubleshooting

### "Entry not found" bij import

**Probleem:** Therapeut bestaat niet in Contentful
**Oplossing:** Maak eerst de TeamMember entry aan in Contentful

### Velden niet zichtbaar in Contentful UI

**Probleem:** Content types niet gepubliceerd
**Oplossing:** Run `node scripts/setup-booking-fields.js` opnieuw

### Therapeuten niet zichtbaar op website

**Probleem:** Niet gelinkt in AppointmentCardOverview
**Oplossing:** Check of therapeuten toegevoegd zijn aan het **Therapists** veld

### Cache issues

**Probleem:** Wijzigingen niet zichtbaar
**Oplossing:**

- Wacht 1 minuut (ISR revalidation)
- Of: force refresh in browser (Cmd+Shift+R / Ctrl+Shift+R)
- Of: herstart dev server

## 🔄 Migratie van oude naar nieuwe systeem

Het oude systeem had **hardcoded arrays** in de code:

```javascript
// OUD (in code)
const smartfileColumns = [
  [{ name: 'Iva Lešić', link: '...' }]
  // etc
];
```

Het nieuwe systeem haalt alles uit **Contentful**:

```javascript
// NIEUW (uit Contentful)
const therapists = therapistsCollection?.items || [];
const smartfileTherapists = therapists.filter((t) => t.bookingType === 'smartfile');
```

## 📧 Support

Voor vragen of problemen:

- Check deze README
- Bekijk de scripts in `scripts/` folder
- Contact: marijn.baar@gmail.com
