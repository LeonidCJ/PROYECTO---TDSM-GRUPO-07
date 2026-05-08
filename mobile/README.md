# CystoAI Mobile (Expo)

App móvil del proyecto **CystoAI**. Esta app usa **Expo + Expo Router** y se comunica con el backend Django.

## Requisitos

- Node.js LTS
- npm
- Android Studio (si usarás emulador)
- Expo Go en el emulador o dispositivo

## Instalación

```bash
npm install
```

## Variables de entorno

Crea un archivo `.env` en esta carpeta basado en `.env.example`.

### Emulador Android (recomendado)

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```

### Dispositivo físico

Usa la IP LAN de tu PC (por ejemplo `http://192.168.1.100:8000`).

## Levantar el backend (resumen)

En la carpeta `backend`:

```bash
docker compose up --build
```

Si usas emulador Android, agrega `10.0.2.2` en `DJANGO_ALLOWED_HOSTS` del backend.

## Ejecutar la app

```bash
npm run android
```
