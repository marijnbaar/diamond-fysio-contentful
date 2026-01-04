const { mdToPdf } = require('md-to-pdf');
const path = require('path');

const args = process.argv.slice(2);
const filename = args[0];

if (!filename) {
  console.error('❌ Geef een bestandsnaam op!');
  console.log('');
  console.log('Gebruik: node generate-any-pdf.js BESTANDSNAAM');
  console.log('');
  console.log('Voorbeelden:');
  console.log('  node generate-any-pdf.js HANDLEIDING-AFSPRAAKLINKS');
  console.log('  node generate-any-pdf.js TEAM-HANDLEIDING');
  console.log('  node generate-any-pdf.js README');
  console.log('');
  console.log('💡 Tip: Laat de .md extensie weg, die wordt automatisch toegevoegd');
  process.exit(1);
}

async function generatePDF() {
  const inputPath = path.join(__dirname, `${filename}.md`);
  const outputPath = path.join(__dirname, `${filename}.pdf`);

  console.log('📄 Generating PDF from markdown...');
  console.log('Input:', inputPath);
  console.log('Output:', outputPath);
  console.log('');

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
      console.log('');
      console.log('💡 Open de PDF met:');
      console.log(`   open "${outputPath}"`);
    }
  } catch (error) {
    console.error('❌ Error generating PDF:', error.message);
    console.log('');
    console.log('Mogelijke oorzaken:');
    console.log('  - Het bestand bestaat niet');
    console.log('  - Ongeldige Markdown syntax');
    console.log('  - pdf-styles.css ontbreekt');
    process.exit(1);
  }
}

generatePDF();
