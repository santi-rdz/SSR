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

## Instalacion en un proyecto nuevo

```bash
mkdir mi-proyecto && cd mi-proyecto
pnpm init
pnpm add github:santi-rdz/SSR
npx mini-ssr init
```

El CLI te pregunta si quieres instalar las dependencias (react, express, esbuild, tailwindcss). Di `s` y listo.

Despues:

```bash
pnpm build
pnpm start        # → http://localhost:3000
```

## Que genera `mini-ssr init`

```
mi-proyecto/
├── src/
│   ├── layout.jsx         # HTML base (como Next.js)
│   ├── input.css          # Tailwind entry
│   ├── pages/             # Server components
│   │   └── Home.jsx
│   └── components/        # Server o client components
│       └── Counter.jsx
│
├── server.js              # Tu servidor (el unico archivo que editas)
└── package.json           # Scripts ya configurados
```

`server.js` es el unico archivo que modificas para agregar rutas y logica.

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

**2.** Agregar la ruta en `server.js`:

```js
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
pnpm build  →  mini-ssr build (oculto, no hay build.js en tu proyecto)
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
