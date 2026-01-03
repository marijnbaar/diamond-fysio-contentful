# Handleiding: Afspraaklinks Beheren in Contentful

Stap voor stap uitleg voor het toevoegen, wijzigen en beheren van therapeuten en hun afspraaklinks in Contentful.

---

## Inhoudsopgave

1. [Wat zijn afspraaklinks?](#wat-zijn-afspraaklinks)
2. [Type afspraaklinks](#type-afspraaklinks)
3. [Nieuwe therapeut toevoegen](#nieuwe-therapeut-toevoegen)
4. [Afspraaklink wijzigen](#afspraaklink-wijzigen)
5. [Therapeut verwijderen](#therapeut-verwijderen)
6. [Veelgestelde vragen](#veelgestelde-vragen)

---

## Wat zijn afspraaklinks?

Op de pagina **/afspraak-maken** kunnen bezoekers een afspraak maken. Elke therapeut heeft een afspraaklink waarmee bezoekers:

- Online een afspraak inplannen (via Smartfile of ander systeem)
- Een email sturen om een afspraak te maken

Alle therapeuten en links worden beheerd in Contentful, zonder dat je code hoeft aan te passen.

---

## Type afspraaklinks

Je kunt kiezen uit 3 types:

### 1. Smartfile (Online afspraken)

Voor therapeuten die online afspraken accepteren.

- Bezoekers worden doorgestuurd naar Smartfile
- Kunnen direct een tijdslot kiezen
- Werkt met een Smartfile URL

**Voorbeeld:**

```
https://web.smartfile.nl/booking/practise/5d83a01c-3db0-434a-b943-aa6da65e3b49/public_therapists?reset=true
```

**Op de website:**

- Verschijnt in het bovenste blok
- Heeft een extern link icoontje
- Link opent in nieuw tabblad

---

### 2. Email (Afspraak via email)

Voor therapeuten die afspraken via email regelen.

- Email programma opent automatisch bij klik
- Werkt met een email adres

**Voorbeeld:**

```
tonwillemsen@me.com
```

**Op de website:**

- Verschijnt in het onderste blok
- Opent email programma met adres ingevuld

---

### 3. None (Geen online afspraken)

Voor therapeuten die (tijdelijk) geen online afspraken accepteren.

- Therapeut wordt niet getoond op de afspraak pagina
- Gebruik dit bij vakantie, wachtlijst, of uitdienst

---

## Nieuwe therapeut toevoegen

### Stap 1: Log in op Contentful

1. Ga naar [app.contentful.com](https://app.contentful.com)
2. Log in en selecteer **Diamond Fysio** space

### Stap 2: Maak TeamMember aan

1. Klik op **Content** (links)
2. Klik op **Add entry** (rechtsboven)
3. Selecteer **TeamMember**

### Stap 3: Vul gegevens in

**Verplichte velden:**

- **Name**: Volledige naam (bijv. `Maria van den Berg`)
- **Job Title**: Functie (bijv. `Fysiotherapeut`)
- **Slug**: URL-vriendelijke naam (wordt automatisch gegenereerd)

**Afspraak gegevens:**

- **Booking Type**: Kies `smartfile`, `email` of `none`
- **Booking Link**:
  - Bij smartfile: Plak de Smartfile URL
  - Bij email: Vul het email adres in
  - Bij none: Laat leeg

**Optioneel:**

- Image, Description, Bio, Specialisations

### Stap 4: Smartfile link

Voor de meeste therapeuten gebruik je de standaard link:

```
https://web.smartfile.nl/booking/practise/5d83a01c-3db0-434a-b943-aa6da65e3b49/public_therapists?reset=true
```

Sommige therapeuten hebben een persoonlijke link:

```
https://web.smartfile.nl/booking/practise/5d83a01c-3db0-434a-b943-aa6da65e3b49/public_therapists/benjamin-soerel/services/fysiotherapie-1e-consult-intake-60min
```

### Stap 5: Publish

1. Klik rechtsboven op **Publish**
2. Therapeut is aangemaakt maar nog niet zichtbaar op website

### Stap 6: Voeg toe aan afspraak pagina

1. Ga naar **Content**
2. Zoek **"Maak een afspraak"** (of zoek: `AppointmentCardOverview`)
3. Open de entry
4. Scroll naar veld **Therapists**
5. Klik **Add existing entry**
6. Selecteer de nieuwe therapeut
7. Klik **Publish changes**

### Stap 7: Verifieer

1. Ga naar `diamondfysio.nl/afspraak-maken`
2. Wacht 1-2 minuten (cache)
3. Refresh pagina (Cmd+Shift+R of Ctrl+Shift+R)
4. Therapeut is nu zichtbaar

---

## Afspraaklink wijzigen

### Wanneer?

- Nieuw email adres
- Smartfile link gewijzigd
- Wisselen tussen email en Smartfile
- Tijdelijk verbergen (vakantie)

### Stappen

1. Log in op Contentful
2. Ga naar **Content** → **TeamMember**
3. Zoek en open de therapeut
4. Wijzig **Booking Type** en/of **Booking Link**
5. Klik **Publish changes**
6. Wacht 1-2 minuten en refresh website

---

## Therapeut verwijderen

### Optie A: Tijdelijk verbergen

Voor vakantie, wachtlijst, etc.

1. Open therapeut in Contentful
2. Wijzig **Booking Type** naar `none`
3. Klik **Publish**

Data blijft bewaard en kan later weer geactiveerd worden.

### Optie B: Van afspraak pagina halen

Voor therapeuten die niet meer werken bij Diamond Fysio.

1. Ga naar **Content** → **"Maak een afspraak"**
2. Open de entry
3. Scroll naar **Therapists**
4. Klik **X** naast de therapeut
5. Klik **Publish changes**

Therapeut bestaat nog in Contentful maar is niet zichtbaar op website.

### Optie C: Volledig verwijderen

**Waarschuwing:** Kan niet ongedaan worden gemaakt.

1. Ga naar **Content** → **TeamMember**
2. Open de therapeut
3. Klik **Unpublish**
4. Klik **Delete**
5. Bevestig

Alle data (foto, bio, specialisaties) wordt permanent verwijderd.

---

## Veelgestelde vragen

### Hoeveel therapeuten kunnen er getoond worden?

Maximaal 30 therapeuten.

### Waarom zie ik wijzigingen niet direct?

De website gebruikt een cache. Wijzigingen zijn zichtbaar binnen 1-2 minuten.

**Direct zien:**

- Hard refresh: Cmd+Shift+R (Mac) of Ctrl+Shift+R (Windows)
- Of wacht 1-2 minuten

### Kan ik meerdere email adressen opgeven?

Nee, één email adres per therapeut. Kies het primaire adres voor afspraken.

### Wat is het verschil tussen Smartfile en email?

| Smartfile                         | Email                        |
| --------------------------------- | ---------------------------- |
| Online afspraken direct inplannen | Afspraak aanvragen via email |
| Bezoekers zien tijdslots          | Therapeut reageert handmatig |
| Automatische bevestiging          | Handmatige bevestiging       |
| Vereist Smartfile account         | Alleen email nodig           |
| Bovenste blok op website          | Onderste blok op website     |

### Kan ik de volgorde wijzigen?

Ja, in het **Therapists** veld kun je therapeuten slepen om de volgorde te wijzigen. Smartfile therapeuten worden automatisch verdeeld over 3 kolommen.

### Hoe krijg ik een Smartfile link?

Gebruik de standaard link (zie Stap 4) of gebruik een persoonlijke link aan de therapeut als deze er één heeft.

### Wat gebeurt er bij volledig verwijderen?

- Therapeut verdwijnt van afspraak pagina
- Therapeut verdwijnt van team overzicht
- Alle data (foto, bio, specialisaties) is weg
- **Kan niet ongedaan worden**

**Tip:** Gebruik `Booking Type: none` om te verbergen zonder data te verliezen.

### Kan ik andere booking systemen gebruiken?

Ja. Naast Smartfile kun je elk systeem gebruiken met een directe URL:

1. Kies **Booking Type: smartfile**
2. Plak de URL (bijv. Calendly, Spotmedics)
3. Bezoekers worden doorgestuurd

**Voorbeeld met Calendly:**

```
Booking Type: smartfile
Booking Link: https://calendly.com/therapeut-naam/afspraak
```

### Hoe test ik een Smartfile link?

1. Kopieer de URL
2. Plak in nieuwe browser tab
3. Check of de booking pagina laadt

### Kan ik een therapeut tijdelijk verbergen?

Ja. Wijzig **Booking Type** naar `none`:

- Niet zichtbaar op website
- Data blijft bewaard
- Later weer activeren mogelijk

---

**Laatste update:** 3 januari 2026
