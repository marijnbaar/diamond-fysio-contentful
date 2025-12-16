# Contentful Setup: Team Member Auto-Page

## Stap 1: Voeg `teamMember` veld toe aan Aboutpage Content Type

### In Contentful:

1. Ga naar **Content model** → **Aboutpage**
2. Klik op **Add field**
3. Configureer het veld:
   - **Field name**: `Team Member`
   - **Field ID**: `teamMember`
   - **Type**: **Reference** → **One entry**
   - **Allowed entry types**: Selecteer `TeamMember`
   - **Required**: ❌ **NO** (unchecked - dit veld is optioneel)
   - **Localized**: ✅ **YES** (als je meerdere talen gebruikt)
4. Klik **Create**
5. Klik **Save** om het content type op te slaan

**Waarom dit veld?**

- Dit veld wordt gebruikt om de TeamMember entry te linken aan de Aboutpage entry
- Alleen Aboutpage entries met `pageType: 'Teammemberpage'` hebben dit veld gevuld
- Andere Aboutpage entries (specialisatie, content) hebben dit veld leeg - dat is prima!

---

## Stap 2: Team Members in Team Overview Collectie

### Het probleem:

Team members verschijnen **niet automatisch** in de team overview collectie op de `/team` pagina. Ze moeten handmatig worden toegevoegd aan de `TeamOverview` component.

### Hoe het werkt:

De team pagina gebruikt een `TeamOverview` component (of `SpecialisationHomeOverview` met `overviewType: 'TeamOverview'`) die een `teamMemberCollection` heeft. Deze collectie moet handmatig worden gevuld in Contentful.

### Oplossing:

#### Optie A: Handmatig toevoegen (nu)

1. Ga naar Contentful → **Content**
2. Zoek de **TeamOverview** component (of de pagina component die de team lijst toont)
3. Open de entry
4. Ga naar het `teamMemberCollection` veld
5. Klik **Add entry** en selecteer je nieuwe TeamMember entry
6. **Save** en **Publish**

#### Optie B: Automatisch toevoegen (via webhook - optioneel)

Als je wilt dat nieuwe team members automatisch worden toegevoegd aan de TeamOverview collectie, kunnen we de webhook uitbreiden. Dit vereist:

- De ID van de TeamOverview entry waar nieuwe members aan toegevoegd moeten worden
- Aanpassing van de webhook code

**Let op:**

- De TeamMember entry moet wel **gepubliceerd** zijn om te verschijnen
- De `link` veld in TeamMember moet naar de Aboutpage verwijzen (dit wordt automatisch gedaan door de webhook)

---

## Stap 3: Verifieer Team Member Link

Elke TeamMember entry heeft een `link` veld die naar de Aboutpage moet verwijzen. Dit wordt automatisch gedaan door de webhook, maar check:

1. Ga naar Contentful → **Content** → **Team Member**
2. Open je nieuwe TeamMember entry
3. Check het **Link** veld:
   - Moet verwijzen naar de Aboutpage entry met `pageType: 'Teammemberpage'`
   - De slug moet `/team/{naam-slug}` zijn
4. Als dit leeg is, selecteer handmatig de juiste Aboutpage entry

---

## Samenvatting: Wat moet je doen?

### ✅ Direct nodig:

1. **Voeg `teamMember` veld toe** aan Aboutpage content type (zie Stap 1 hierboven)

### ✅ Voor team overzicht te laten werken:

2. **Voeg team members handmatig toe** aan TeamOverview component in Contentful
   - Of: vraag om automatische toevoeging via webhook (zie Optie B)

### ✅ Webhook setup:

3. Configureer de webhook in Contentful (zie `TEAM-MEMBER-AUTO-PAGE-SETUP.md`)

---

## Test Checklist

Na het toevoegen van het `teamMember` veld:

- [ ] Aboutpage content type heeft `teamMember` veld
- [ ] Maak een test TeamMember entry aan
- [ ] Publiceer de TeamMember entry
- [ ] Check of Aboutpage entry wordt aangemaakt met `pageType: 'Teammemberpage'`
- [ ] Check of de Aboutpage entry het `teamMember` veld heeft gevuld
- [ ] Check of `/team/{naam}` pagina werkt
- [ ] Voeg TeamMember handmatig toe aan TeamOverview collectie
- [ ] Check of team member verschijnt op `/team` pagina
