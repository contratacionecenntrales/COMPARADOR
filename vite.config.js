import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, el frontend (Vite) y la API (PHP) corren en servidores
// distintos. Este proxy reenvía /api/* al servidor PHP local, para que el
// código de la app pueda usar siempre rutas relativas ("/api/...") igual
// que en producción (mismo dominio en Hostalia). Arranca el PHP local con:
//   php -S localhost:8080 -t api
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
        // El servidor PHP local se levanta con `php -S localhost:8080 -t api`,
        // es decir, su raíz YA es la carpeta api/. Quitamos el prefijo /api
        // para que /api/tarifas.php llegue como /tarifas.php.
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
