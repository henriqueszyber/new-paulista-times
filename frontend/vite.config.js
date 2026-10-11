import { defineConfig } from 'vite';

// O proxy permite chamar /api sem adicionar uma dependência de CORS.
const proxy = { '/api': 'http://127.0.0.1:3001' };
export default defineConfig({ server: { port: 5173, strictPort: true, proxy }, preview: { proxy } });
