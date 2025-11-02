import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="nl">
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover"
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Manrope:wght@200;300;400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                    try { document.body.classList.add('dark'); } catch {}
                  } else {
                    document.documentElement.classList.remove('dark');
                    try { document.body.classList.remove('dark'); } catch {}
                  }
                } catch (e) {}
              })();
            `
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
