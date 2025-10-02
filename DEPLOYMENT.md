# Guía de Deployment a Vercel

Esta guía explica cómo desplegar la aplicación Nivexa en Vercel.

## 📋 Pre-requisitos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Supabase](https://supabase.com)
- Repositorio Git (GitHub, GitLab, o Bitbucket)
- Base de datos Supabase configurada con el schema inicial

## 🚀 Configuración Inicial

### 1. Preparar el Repositorio

Asegúrate de que tu código esté en un repositorio Git:

```bash
# Si aún no has inicializado git
git init
git add .
git commit -m "Initial commit"

# Conectar con GitHub/GitLab/Bitbucket
git remote add origin <tu-repositorio-url>
git push -u origin main
```

### 2. Configurar Variables de Entorno en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Settings** → **API**
3. Copia los siguientes valores:
   - **Project URL**: Tu `VITE_SUPABASE_URL`
   - **anon/public key**: Tu `VITE_SUPABASE_ANON_KEY`

## 🎯 Deployment en Vercel

### Método 1: Deployment desde Dashboard (Recomendado)

1. **Importar Proyecto**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Click en **"Add New..."** → **"Project"**
   - Selecciona tu repositorio Git
   - Click en **"Import"**

2. **Configurar el Proyecto**

   Vercel detectará automáticamente Vite, pero verifica:

   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raíz del proyecto)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Configurar Variables de Entorno**

   En la sección **Environment Variables**, añade:

   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

   **Importante**:
   - Asegúrate de que las variables empiecen con `VITE_` (requerido por Vite)
   - Añade estas variables para **Production**, **Preview**, y **Development**

4. **Deploy**
   - Click en **"Deploy"**
   - Espera a que termine el build (2-4 minutos típicamente)
   - Una vez completado, tendrás una URL como `https://tu-proyecto.vercel.app`

### Método 2: Deployment desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Seguir los prompts:
# - Set up and deploy? Yes
# - Which scope? (selecciona tu cuenta)
# - Link to existing project? No
# - What's your project's name? nivexa
# - In which directory is your code located? ./
# - Override settings? No
```

Luego configura las variables de entorno:

```bash
# Añadir variables de entorno
vercel env add VITE_SUPABASE_URL
# Pega tu URL cuando se solicite

vercel env add VITE_SUPABASE_ANON_KEY
# Pega tu anon key cuando se solicite

# Redeploy con las nuevas variables
vercel --prod
```

## 🔒 Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave pública (anon) de Supabase | `eyJhbGc...` |

**Nota de Seguridad**:
- La `ANON_KEY` es segura para el frontend (se usa con RLS)
- **NUNCA** expongas el `SERVICE_ROLE_KEY` en variables de frontend

## 🌐 Configuración de Dominio Personalizado (Opcional)

### Añadir Dominio Personalizado

1. En el Dashboard de Vercel, ve a tu proyecto
2. Click en **"Settings"** → **"Domains"**
3. Añade tu dominio (ej: `nivexa.com`)
4. Configura los DNS según las instrucciones:

   **Para dominio raíz (nivexa.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **Para subdominio (www.nivexa.com):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

5. Espera a que se verifique (puede tomar hasta 48 horas)

### Configurar Supabase para Dominio Personalizado

Si usas un dominio personalizado, actualiza las URLs permitidas en Supabase:

1. Ve a **Authentication** → **URL Configuration**
2. Añade tu dominio a **Site URL**: `https://tu-dominio.com`
3. Añade a **Redirect URLs**:
   ```
   https://tu-dominio.com
   https://tu-dominio.com/**
   https://www.tu-dominio.com
   https://www.tu-dominio.com/**
   ```

## 🔄 Deployments Automáticos

Vercel configura automáticamente CI/CD:

- **Push a `main`**: Deploy a producción
- **Pull Request**: Deploy de preview automático
- **Otras ramas**: Deployments de preview opcionales

### Configurar Rama de Producción

1. **Settings** → **Git**
2. En **Production Branch**, selecciona tu rama principal (usualmente `main`)
3. Configura **Deploy Hooks** si necesitas triggers externos

## 🛠️ Configuración Avanzada

### Headers de Seguridad

El archivo `vercel.json` ya incluye headers de seguridad:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Cache de Assets

Los assets estáticos (`/assets/*`) están configurados con:
```
Cache-Control: public, max-age=31536000, immutable
```

### SPA Routing

El archivo `vercel.json` incluye rewrites para que todas las rutas sirvan `index.html`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 🐛 Troubleshooting

### Error: "Build failed"

**Problema**: El build falla en Vercel pero funciona localmente.

**Soluciones**:

1. **Verificar TypeScript**: Ejecuta localmente `npm run build`
   ```bash
   npm run build
   # Si falla, corrige los errores de TypeScript
   ```

2. **Verificar Node Version**: Asegúrate de usar Node 18+
   ```json
   // Añade a package.json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

3. **Verificar Dependencies**: Limpia e instala dependencias
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### Error: "404 on page refresh"

**Problema**: Las rutas funcionan al navegar pero 404 al refrescar.

**Solución**: Verifica que `vercel.json` tenga los rewrites configurados (ya incluido).

### Error: "Supabase connection failed"

**Problema**: La app no se conecta a Supabase.

**Soluciones**:

1. **Verificar Variables de Entorno**:
   ```bash
   vercel env ls
   # Debe mostrar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
   ```

2. **Verificar que empiecen con VITE_**: Las variables deben tener el prefijo `VITE_` para ser accesibles en el frontend.

3. **Redeploy después de añadir variables**:
   ```bash
   vercel --prod
   ```

4. **Verificar CORS en Supabase**: Añade tu dominio de Vercel a las URLs permitidas.

### Error: "Path aliases not working"

**Problema**: Imports como `@/components` fallan en producción.

**Solución**: El `vite.config.ts` ya tiene los aliases configurados. Verifica que `tsconfig.json` también los tenga:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@core/*": ["./src/core/*"]
    }
  }
}
```

### Error: "Environment variables not updating"

**Problema**: Cambios en variables de entorno no se reflejan.

**Solución**:
```bash
# Las variables solo se incluyen en build time
# Después de cambiarlas, redeploy:
vercel --prod
```

### Error: "Build takes too long / times out"

**Problema**: El build excede el límite de tiempo.

**Soluciones**:

1. **Usar build optimizado**:
   ```json
   // En vercel.json, cambia buildCommand a:
   "buildCommand": "npm run build:fast"
   ```

2. **Reducir bundle size**: Analiza y optimiza imports.

3. **Upgrade Vercel plan**: Los planes gratuitos tienen límites de tiempo.

## 📊 Monitoreo y Analytics

### Vercel Analytics

1. Ve a tu proyecto en Vercel
2. Click en **"Analytics"**
3. Habilita **Web Analytics** (gratis)
4. Obtendrás métricas de:
   - Page views
   - Performance (Core Web Vitals)
   - Top pages
   - Referrers

### Vercel Speed Insights

1. Instala el paquete:
   ```bash
   npm install @vercel/speed-insights
   ```

2. Añade a tu app:
   ```typescript
   // src/main.tsx
   import { SpeedInsights } from '@vercel/speed-insights/react';

   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <App />
       <SpeedInsights />
     </React.StrictMode>
   );
   ```

3. Redeploy

## 🔐 Mejores Prácticas de Seguridad

1. **Variables de Entorno**:
   - Usa `VITE_` solo para valores públicos
   - Nunca expongas API keys privadas
   - Usa Supabase RLS para seguridad de datos

2. **Headers de Seguridad**: Ya configurados en `vercel.json`

3. **HTTPS**: Vercel proporciona SSL automático

4. **Supabase RLS**: Asegúrate de tener Row Level Security habilitado

5. **Auth Redirects**: Configura URLs de redirect solo para dominios conocidos

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Vite para Producción](https://vitejs.dev/guide/build.html)
- [Documentación de Supabase](https://supabase.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## 🆘 Soporte

Si encuentras problemas:

1. **Revisa los logs**: Vercel Dashboard → Deployments → Click en tu deployment → Logs
2. **Vercel Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
3. **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)

---

**Última actualización**: 2025
**Stack**: React 19 + Vite 7 + TypeScript + Supabase
