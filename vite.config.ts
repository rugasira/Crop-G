import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

// In local dev, serve the same /api routes that Vercel runs in production.
function claudeApiDev(): Plugin {
  return {
    name: 'claude-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const route = req.url?.split('?')[0];
        if (req.method !== 'POST' || (route !== '/api/diagnose' && route !== '/api/chat')) return next();
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const { diagnose, chat, toHttpError } = await server.ssrLoadModule('/server/claude.ts');
        res.setHeader('Content-Type', 'application/json');
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
          const out = route === '/api/diagnose' ? await diagnose(body) : await chat(body);
          res.end(JSON.stringify(out));
        } catch (err) {
          const e = toHttpError(err);
          res.statusCode = e.status;
          res.end(JSON.stringify({ message: e.message }));
        }
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  // Make ANTHROPIC_API_KEY from .env.local visible to the dev API (server-side only, never bundled).
  if (env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY;
  return {
    plugins: [
      react(),
      claudeApiDev(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
        manifest: {
          name: 'CropGenius',
          short_name: 'CropGenius',
          description: 'AI-powered crop disease detection for farmers.',
          theme_color: '#ffffff',
          icons: [
            {
              src: '/logo.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/logo.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
