# mini-ssr

Framework SSR minimalista para React. Renderiza en el servidor, hidrata solo lo necesario en el cliente.

## Como funciona

```
          GET /pagina
               │
               ▼
┌──────────────────────────────┐
│         Node.js              │
│                              │
│   Page.jsx ──► renderToString()
│                    │         │
│                    ▼         │
│              HTML completo   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         Browser              │
│                              │
│   Recibe HTML listo          │
│   Hidrata solo 'use client'  │
└──────────────────────────────┘
```

## Instalacion

```bash
pnpm install
pnpm build
pnpm start        # → http://localhost:3000
```

## Estructura

```
├── core/                  # Framework
│   ├── loader.js          # Node entiende .jsx
│   ├── renderer.jsx       # React → HTML
│   ├── bundler.js         # esbuild para client components
│   └── scanner.js         # Detecta 'use client'
│
├── src/
│   ├── layout.jsx         # HTML base (como Next.js)
│   ├── pages/             # Server components
│   └── components/        # Server o client components
│
├── server.js
└── build.js
```

## Server vs Client components

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Sin 'use client'              Con 'use client'     │
│                                                     │
│  ┌─────────────────┐          ┌─────────────────┐   │
│  │ Server Component│          │Client Component │   │
│  │                 │          │                 │   │
│  │  Renderiza en   │          │  Renderiza en   │   │
│  │  Node.js        │          │  Node.js        │   │
│  │       │         │          │       │         │   │
│  │       ▼         │          │       ▼         │   │
│  │  HTML estatico  │          │  HTML + hydrate │   │
│  │                 │          │       │         │   │
│  │  JS: 0 bytes    │          │       ▼         │   │
│  │                 │          │  Interactivo    │   │
│  └─────────────────┘          └─────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Agregar una pagina

**1.** Crear el componente:

```jsx
// src/pages/About.jsx
export default function About() {
  return <h1>Acerca de</h1>;
}
```

**2.** Agregar la ruta:

```js
// server.js
app.get('/about', async (req, res) => {
  const { default: About } = await import('./src/pages/About.jsx');
  res.send(renderPage(About, {}, { title: 'About' }));
});
```

## Crear un client component

```jsx
// src/components/Toggle.jsx
'use client';
import { useState } from 'react';

export default function Toggle() {
  const [on, setOn] = useState(false);
  return (
    <div data-hydrate="Toggle" data-props="{}">
      <button onClick={() => setOn(!on)}>{on ? 'ON' : 'OFF'}</button>
    </div>
  );
}
```

Despues de agregar client components, correr `pnpm build`.

## Build

```
pnpm build
    │
    ├──► Scanner busca 'use client' en src/
    │
    ├──► esbuild genera bundles ──► public/js/
    │
    └──► Tailwind compila CSS ──► public/css/
```

## Scripts

```
pnpm build    Bundlea client components + Tailwind
pnpm dev      Build + servidor con --watch
pnpm start    Solo el servidor
```

## Stack

Node.js, Express, React 19, esbuild, Tailwind v4
