# PDF Generatie uit Markdown

Deze instructies leggen uit hoe je professionele PDF bestanden kunt genereren uit Markdown documenten in dit project.

## Benodigdheden

Het project heeft al alle benodigde dependencies:

- `md-to-pdf` package (dev dependency)
- `pdf-styles.css` voor styling
- `generate-pdf.js` script voor generatie

## Stap voor stap: PDF maken van bestaand Markdown bestand

### 1. Maak of bewerk je Markdown bestand

Bijvoorbeeld: `HANDLEIDING-AFSPRAAKLINKS.md`

### 2. Run het generator script

```bash
node generate-pdf.js
```

Dit genereert automatisch: `HANDLEIDING-AFSPRAAKLINKS.pdf`

## Stap voor stap: PDF maken van een NIEUW document

### 1. Maak je Markdown bestand

Maak een nieuw `.md` bestand in de root van het project:

```bash
touch NIEUWE-HANDLEIDING.md
```

### 2. Schrijf je content in Markdown

Gebruik standaard Markdown syntax:

- `#` voor H1
- `##` voor H2
- `###` voor H3
- Tabellen, lijsten, code blocks, etc.

### 3. Pas het generator script aan

Open `generate-pdf.js` en wijzig de input/output paden:

```javascript
const inputPath = path.join(__dirname, 'NIEUWE-HANDLEIDING.md');
const outputPath = path.join(__dirname, 'NIEUWE-HANDLEIDING.pdf');
```

### 4. Genereer de PDF

```bash
node generate-pdf.js
```

## Styling aanpassen

De PDF styling staat in `pdf-styles.css`. Je kunt hier aanpassen:

- **Kleuren**: H1, H2, H3 headers (Diamond Fysio kleuren: teal/cyan)
- **Fonts**: Font families en groottes
- **Spacing**: Marges, padding
- **Tabellen**: Border colors, header achtergrond
- **Code blocks**: Achtergrondkleur, padding

### Voorbeeld: Kleur wijzigen

```css
h1 {
  color: #0ea5e9; /* Wijzig naar jouw gewenste kleur */
  border-bottom: 3px solid #0ea5e9;
}
```

## Geavanceerd: Genereer meerdere PDFs automatisch

### Optie 1: Maak een nieuw script per document

Kopieer `generate-pdf.js` naar bijvoorbeeld `generate-pdf-teamhandleiding.js` en pas de paden aan.

### Optie 2: Maak een universeel script

Maak `generate-any-pdf.js`:

```javascript
const { mdToPdf } = require('md-to-pdf');
const path = require('path');

const args = process.argv.slice(2);
const filename = args[0];

if (!filename) {
  console.error('❌ Geef een bestandsnaam op!');
  console.log('Gebruik: node generate-any-pdf.js BESTANDSNAAM');
  console.log('Voorbeeld: node generate-any-pdf.js HANDLEIDING-AFSPRAAKLINKS');
  process.exit(1);
}

async function generatePDF() {
  const inputPath = path.join(__dirname, `${filename}.md`);
  const outputPath = path.join(__dirname, `${filename}.pdf`);

  console.log('📄 Generating PDF from markdown...');
  console.log('Input:', inputPath);
  console.log('Output:', outputPath);

  try {
    const pdf = await mdToPdf(
      { path: inputPath },
      {
        dest: outputPath,
        pdf_options: {
          format: 'A4',
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          },
          printBackground: true
        },
        stylesheet: path.join(__dirname, 'pdf-styles.css')
      }
    );

    if (pdf) {
      console.log('✅ PDF successfully generated!');
      console.log('📁 Location:', outputPath);
    }
  } catch (error) {
    console.error('❌ Error generating PDF:', error.message);
    process.exit(1);
  }
}

generatePDF();
```

Dan kun je gebruiken:

```bash
node generate-any-pdf.js HANDLEIDING-AFSPRAAKLINKS
node generate-any-pdf.js TEAM-HANDLEIDING
node generate-any-pdf.js CONTENTFUL-GUIDE
```

## PDF Opties

Je kunt verschillende PDF opties instellen in het generator script:

### Formaat

```javascript
pdf_options: {
  format: 'A4',  // Of: 'Letter', 'Legal', 'A3', 'A5'
}
```

### Marges

```javascript
margin: {
  top: '20mm',
  right: '15mm',
  bottom: '20mm',
  left: '15mm',
}
```

### Header en Footer (optioneel)

```javascript
pdf_options: {
  displayHeaderFooter: true,
  headerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%;">Diamond Fysio - Handleiding</div>',
  footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
}
```

## Markdown Tips voor Mooie PDFs

### 1. Gebruik heading hiërarchie

```markdown
# Hoofdtitel (H1) - Eén keer per document

## Sectie (H2) - Hoofdsecties

### Subsectie (H3) - Details
```

### 2. Tabellen voor data overzichten

```markdown
| Kolom 1 | Kolom 2 | Kolom 3 |
| ------- | ------- | ------- |
| Data 1  | Data 2  | Data 3  |
```

### 3. Code blocks voor voorbeelden

```markdown
\`\`\`javascript
const code = 'hier';
\`\`\`
```

### 4. Emoji's voor visuele interesse

```markdown
✅ Voordeel
❌ Nadeel
📄 Document
🎯 Belangrijk
```

### 5. Horizontale lijnen voor scheiding

```markdown
---
```

## Troubleshooting

### "Cannot find module 'md-to-pdf'"

Installeer de dependencies:

```bash
bun install
# of
npm install
```

### "ENOENT: no such file"

Check of het markdown bestand bestaat en of het pad correct is in het generator script.

### PDF ziet er niet uit zoals verwacht

1. Check of `pdf-styles.css` bestaat
2. Valideer je Markdown syntax
3. Test met een simpel Markdown bestand eerst

### Lange tabellen of code blocks worden afgesneden

Voeg toe aan `pdf-styles.css`:

```css
table,
pre {
  page-break-inside: avoid;
}
```

## NPM Script (optioneel)

Voeg toe aan `package.json`:

```json
"scripts": {
  "pdf": "node generate-pdf.js",
  "pdf:any": "node generate-any-pdf.js"
}
```

Dan kun je gebruiken:

```bash
bun run pdf
bun run pdf:any HANDLEIDING-AFSPRAAKLINKS
```

## Voorbeelden

Zie de volgende bestanden in het project:

- `HANDLEIDING-AFSPRAAKLINKS.md` → `HANDLEIDING-AFSPRAAKLINKS.pdf`
- `generate-pdf.js` - Generator script
- `pdf-styles.css` - Styling

## Meer informatie

- [md-to-pdf documentatie](https://www.npmjs.com/package/md-to-pdf)
- [Puppeteer PDF opties](https://pptr.dev/api/puppeteer.pdfoptions)
- [Markdown syntax guide](https://www.markdownguide.org/)
