import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { configure, renderPage } from 'mini-ssr';
import RootLayout from './src/layout.jsx';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

configure({
  layout: RootLayout,
  componentsDirs: [
    path.join(ROOT, 'src/components'),
    path.join(ROOT, 'src/pages'),
  ],
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/js', express.static(path.join(ROOT, 'public/js')));
app.use('/css', express.static(path.join(ROOT, 'public/css')));
app.use('/public', express.static(path.join(ROOT, 'public')));

app.get('/', async (req, res) => {
  const { default: Home } = await import('./src/pages/Home.jsx');
  res.send(renderPage(Home, {}, { title: 'Mini SSR' }));
});

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
