const { mdToPdf } = require('md-to-pdf');
const path = require('path');

async function generatePDF() {
  const inputPath = path.join(__dirname, 'HANDLEIDING-AFSPRAAKLINKS.md');
  const outputPath = path.join(__dirname, 'HANDLEIDING-AFSPRAAKLINKS.pdf');

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
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  }
}

generatePDF();
