# SEO Pulse — Dashboard gratuito para País Lector

Dashboard ligero que conecta directo con GSC y GA4 via OAuth2.
Sin backend. Sin base de datos. Solo tu browser hablando con Google.

## Deploy en Vercel (gratis)

```bash
cd seo-pulse
npx vercel --prod
```

## Setup de Google Cloud (una sola vez)

### 1. Crear proyecto en Google Cloud Console
- Ve a https://console.cloud.google.com
- Crea un proyecto nuevo o usa uno existente

### 2. Habilitar APIs
- Busca y habilita: **Search Console API**
- Busca y habilita: **Google Analytics Data API**

### 3. Crear credenciales OAuth
- Ve a APIs & Services > Credentials
- Click "Create Credentials" > "OAuth 2.0 Client ID"
- Application type: **Web application**
- Authorized JavaScript origins: `https://tu-app.vercel.app`
- Authorized redirect URIs: `https://tu-app.vercel.app`
- Copia el **Client ID**

### 4. Configurar en la app
- Abre tu app desplegada
- Pega el Client ID
- Site URL: `https://paislector.com/` (exacto como aparece en GSC)
- GA4 Property ID: `properties/XXXXXXXX` (lo encuentras en GA4 > Admin > Property Details)

## Qué muestra

- **Clicks e impresiones** con cambio vs periodo anterior
- **CTR y posición promedio**
- **Top 25 queries** por clicks
- **Quick wins**: keywords en posición 4-20 con >50 impresiones (oportunidades de optimización)
- **Top pages** por clicks
- **GA4 top pages** por sessions con engagement rate

## Costo total: $0

- Google Cloud APIs: gratis (cuota generosa para uso personal)
- Vercel: gratis (hobby plan)
- No hay backend ni base de datos
- Token OAuth se guarda en localStorage, expira en 1 hora
