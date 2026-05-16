export default function RootLayout({ children, title, clientScripts = [] }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'mini-ssr'}</title>
        <link rel="stylesheet" href="/css/styles.css" />
      </head>
      <body className="antialiased">
        <div id="root">{children}</div>
        {clientScripts.map((src) => (
          <script key={src} type="module" src={src}></script>
        ))}
      </body>
    </html>
  );
}
