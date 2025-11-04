# 📝 Handleiding: Team Member Toevoegen aan Website

Deze handleiding legt stap voor stap uit hoe je een nieuwe team member toevoegt aan de website. Na het publiceren wordt automatisch een team member pagina aangemaakt en wordt de persoon toegevoegd aan het team overzicht op de homepage en team pagina.

---

## ✅ Wat gebeurt er automatisch?

Wanneer je een team member publiceert:

1. ✅ **Automatisch een team member pagina** wordt aangemaakt op `/team/[naam-team-member]`
2. ✅ **Team member wordt toegevoegd** aan het team overzicht op de homepage
3. ✅ **Team member wordt toegevoegd** aan het team overzicht op de team pagina
4. ✅ **Link wordt automatisch gezet** tussen de team member en de pagina

---

## 📋 Stap-voor-stap Instructies

### Stap 1: Ga naar Contentful

1. Log in op je Contentful account
2. Klik op **"Content"** in het menu aan de linkerkant
3. Klik op **"Team member"** in de lijst van content types

### Stap 2: Maak een nieuwe Team Member Entry

1. Klik op de knop **"+ Add entry"** (rechtsboven)
2. Selecteer **"Team member"** als content type
3. Je ziet nu een formulier met verschillende velden

### Stap 3: Vul de verplichte velden in

#### ✅ **Name** (Verplicht)

- **Wat is dit?** De volledige naam van de team member
- **Waar komt dit?** Wordt getoond op de team member pagina en in het team overzicht
- **Hoe vul je dit in?**
  - Klik op het veld "Name"
  - Vul de Nederlandse naam in bij "nl-NL" (bijvoorbeeld: "Eva Janssen")
  - Vul de Engelse naam in bij "en-US" (bijvoorbeeld: "Eva Janssen")
- **Tip:** Gebruik de volledige naam zoals je wilt dat deze op de website verschijnt

#### 📸 **Image** (Optioneel maar aanbevolen)

- **Wat is dit?** Een foto van de team member
- **Waar komt dit?** Wordt getoond op de team member pagina en in het team overzicht
- **Hoe vul je dit in?**
  1. Klik op "Add asset" of sleep een afbeelding naar het veld
  2. Upload een foto (formaat: JPG of PNG, aanbevolen: minimaal 400x400 pixels)
  3. Geef de afbeelding een beschrijvende naam (bijvoorbeeld: "eva-janssen-foto")
  4. Vul **Alt text** in voor toegankelijkheid (bijvoorbeeld: "Foto van Eva Janssen, fysiotherapeut")
- **Tip:** Gebruik een professionele foto met goede belichting

#### 💼 **Role** (Optioneel)

- **Wat is dit?** De functie of rol van de team member
- **Waar komt dit?** Wordt getoond onder de naam in het team overzicht
- **Hoe vul je dit in?**
  - Vul in bij "nl-NL" (bijvoorbeeld: "Fysiotherapeut" of "Senior Fysiotherapeut")
  - Vul in bij "en-US" (bijvoorbeeld: "Physiotherapist" of "Senior Physiotherapist")
- **Voorbeelden:**
  - "Fysiotherapeut"
  - "Specialist Sportfysiotherapie"
  - "Dance Medicine Specialist"

#### 📝 **Description Teampage** (Optioneel maar aanbevolen)

- **Wat is dit?** Een uitgebreide beschrijving die getoond wordt op de team member pagina
- **Waar komt dit?** Op de persoonlijke team member pagina (`/team/[naam]`)
- **Hoe vul je dit in?**
  1. Klik op het veld "Description Teampage"
  2. Gebruik de rich text editor om tekst op te maken
  3. Je kunt gebruiken:
     - **Vet** (bold) en _cursief_ (italic)
     - Koppen (Heading 1-6)
     - Lijsten (genummerd of met bullets)
     - Links naar andere pagina's
  4. Schrijf een persoonlijke beschrijving, bijvoorbeeld:

     ```
     Eva is een ervaren fysiotherapeut gespecialiseerd in sportblessures en dansgerelateerde klachten.
     Ze heeft jarenlange ervaring met het behandelen van atleten en dansers.

     Met haar achtergrond in dans en sportfysiotherapie combineert Eva technische kennis met
     praktische ervaring om haar patiënten te helpen hun doelen te bereiken.
     ```
- **Tip:** Schrijf in de eerste persoon of derde persoon, maar wees consistent

#### 🏠 **Omschrijving werktijden** (Description Homepage) (Optioneel)

- **Wat is dit?** Een korte beschrijving die getoond wordt in het team overzicht op de homepage
- **Waar komt dit?** Op de homepage in het team overzicht
- **Hoe vul je dit in?**
  - Gebruik de rich text editor
  - Houd het kort (1-2 zinnen)
  - Bijvoorbeeld: "Gespecialiseerd in sportblessures en dansgerelateerde klachten."

#### 📧 **Email Address** (Optioneel)

- **Wat is dit?** Het e-mailadres van de team member
- **Waar komt dit?** Op de team member pagina bij contact informatie
- **Hoe vul je dit in?**
  - Vul het e-mailadres in (bijvoorbeeld: "eva@diamondfysio.nl")
  - Zorg dat het e-mailadres correct is

#### 📞 **Phone number** (Optioneel)

- **Wat is dit?** Het telefoonnummer van de team member
- **Waar komt dit?** Op de team member pagina bij contact informatie
- **Hoe vul je dit in?**
  - Vul het telefoonnummer in (bijvoorbeeld: "+31 20 123 4567")
  - Gebruik het internationale formaat

#### 🌐 **Website** (Optioneel)

- **Wat is dit?** Een persoonlijke website of profiel pagina
- **Waar komt dit?** Op de team member pagina bij contact informatie
- **Hoe vul je dit in?**
  - Vul een volledige URL in (bijvoorbeeld: "https://www.linkedin.com/in/eva-janssen")

#### 💼 **LinkedIn url** (Optioneel)

- **Wat is dit?** De LinkedIn profiel URL
- **Waar komt dit?** Op de team member pagina, vaak als link naast contact informatie
- **Hoe vul je dit in?**
  - Vul de volledige LinkedIn URL in (bijvoorbeeld: "https://www.linkedin.com/in/eva-janssen")

#### 📍 **Location** (Optioneel)

- **Wat is dit?** De locatie waar de team member werkt
- **Waar komt dit?** Op de team member pagina bij contact informatie
- **Hoe vul je dit in?**
  - Bijvoorbeeld: "Amsterdam Centrum" of "Amsterdam Zuid"

#### 💬 **Quote** (Optioneel)

- **Wat is dit?** Een citaat of uitspraak van de team member
- **Waar komt dit?** Op de team member pagina, vaak prominent getoond
- **Hoe vul je dit in?**
  - Bijvoorbeeld: "Ik geloof dat beweging de sleutel is tot een gezond leven."
  - Houd het kort en inspirerend

#### 🏷️ **Specialisation tags** (Optioneel)

- **Wat is dit?** Tags die aangeven waar de team member zich in specialiseert
- **Waar komt dit?** Op de team member pagina, vaak als badges of tags
- **Hoe vul je dit in?**
  1. Klik op "Add entry"
  2. Selecteer bestaande specialisatie tags of maak nieuwe aan
  3. Voorbeelden: "Sportfysiotherapie", "Dance Medicine", "Rugklachten"
- **Tip:** Gebruik bestaande tags waar mogelijk voor consistentie

#### 📝 **Contact** (Optioneel)

- **Wat is dit?** Extra contactinformatie in rich text formaat
- **Waar komt dit?** Op de team member pagina bij contact informatie
- **Hoe vul je dit in?**
  - Gebruik de rich text editor
  - Bijvoorbeeld: openingstijden, extra contactgegevens, of instructies voor afspraken maken

#### 🔗 **Link** (Wordt automatisch ingevuld)

- **Wat is dit?** Een link naar de team member pagina
- **Hoe werkt dit?** Dit wordt automatisch ingevuld wanneer je de team member publiceert
- **Je hoeft hier niets in te vullen!**

---

## 🚀 Stap 4: Publiceer de Team Member

1. Klik op de knop **"Publish"** (rechtsboven)
2. Je krijgt een bevestiging - klik op **"Publish"** om te bevestigen
3. **Wacht even** - de website heeft een paar seconden nodig om alles te verwerken

---

## ✅ Stap 5: Controleer of alles werkt

Na het publiceren kun je controleren of alles correct werkt:

1. **Ga naar de website** en check het team overzicht op de homepage
   - Je nieuwe team member zou hier moeten verschijnen

2. **Ga naar de team pagina** (`/team`)
   - Je nieuwe team member zou hier ook moeten verschijnen

3. **Klik op de team member** om naar hun persoonlijke pagina te gaan
   - De pagina zou automatisch moeten zijn aangemaakt op `/team/[naam-team-member]`
   - Controleer of alle informatie correct wordt weergegeven

---

## 🔍 Troubleshooting

### ❌ Team member verschijnt niet in het overzicht

**Mogelijke oorzaken:**

- De team member is niet gepubliceerd (check de status in Contentful)
- De naam is niet ingevuld (verplicht veld)
- Er is een fout opgetreden tijdens het publiceren

**Oplossing:**

1. Check of de team member entry de status "Published" heeft
2. Check of het "Name" veld is ingevuld
3. Wacht 1-2 minuten en refresh de pagina
4. Als het nog steeds niet werkt, neem contact op met de webdeveloper

### ❌ Team member pagina bestaat niet

**Mogelijke oorzaken:**

- De webhook heeft een fout gegeven
- De naam bevat speciale tekens die niet in een URL passen

**Oplossing:**

1. Check of de team member entry is gepubliceerd
2. Check of het "Name" veld is ingevuld
3. De pagina wordt automatisch aangemaakt - wacht even en refresh
4. Als het na 5 minuten nog steeds niet werkt, neem contact op met de webdeveloper

### ❌ Foto wordt niet getoond

**Mogelijke oorzaken:**

- De afbeelding is niet gepubliceerd
- De afbeelding is te groot of heeft een verkeerd formaat

**Oplossing:**

1. Check of de afbeelding (asset) de status "Published" heeft
2. Upload de afbeelding opnieuw als JPG of PNG
3. Zorg dat de afbeelding niet groter is dan 10MB

### ❌ Informatie wordt niet correct weergegeven

**Mogelijke oorzaken:**

- De locale (nl-NL of en-US) is niet correct ingevuld
- De rich text formatting is niet correct

**Oplossing:**

1. Check of je de juiste locale hebt ingevuld (nl-NL voor Nederlands, en-US voor Engels)
2. Check of de rich text correct is opgemaakt
3. Sla de entry opnieuw op en publiceer opnieuw

---

## 💡 Tips & Best Practices

### ✅ Do's

- **Vul altijd de naam in** - dit is verplicht
- **Gebruik een professionele foto** - dit maakt de website er beter uit
- **Schrijf unieke beschrijvingen** - vermijd copy-paste van andere team members
- **Check spelling en grammatica** - laat iemand anders even overlezen
- **Publiceer de afbeelding eerst** - voordat je de team member publiceert
- **Test beide talen** - zorg dat zowel Nederlands als Engels correct zijn

### ❌ Don'ts

- **Gebruik geen placeholder tekst** - zoals "Lorem ipsum" of "Test"
- **Upload geen te grote afbeeldingen** - dit maakt de website langzaam
- **Gebruik geen speciale tekens in de naam** - zoals emoji's of ongebruikelijke symbolen
- **Laat geen verplichte velden leeg** - dit kan fouten veroorzaken
- **Publiceer niet zonder te controleren** - check eerst of alles klopt

---

## 📞 Hulp nodig?

Als je problemen hebt of vragen, neem contact op met:

- **Webdeveloper** voor technische problemen
- **Content Manager** voor vragen over hoe informatie moet worden ingevuld

---

## 📚 Gerelateerde Documenten

- [Contentful Setup Steps](./CONTENTFUL-SETUP-STEPS.md) - Voor developers
- [Testing Guide](./TESTING-GUIDE.md) - Voor developers
- [Team Member Auto Page Setup](./TEAM-MEMBER-AUTO-PAGE-SETUP.md) - Voor developers

---

**Laatste update:** November 2025  
**Versie:** 1.0
