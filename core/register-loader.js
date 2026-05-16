/**
 * Registra el loader JSX con Node.js.
 * Usar con: node --import mini-ssr/loader app.js
 */
import { register } from 'node:module';

register('./loader.js', import.meta.url);
