# chat-mobile

Version mobile del sistema de mensajeria en tiempo real. Implementada con React Native + Expo.

## Stack

- React Native + Expo
- TanStack Query (gestion de estado y cache)
- Supabase JS (base de datos y autenticacion)
- Expo Router (navegacion)
- React Navigation Stack

## Requisitos

- Node.js 18+
- Expo CLI
- Android Studio o Xcode para emuladores
- Cuenta en Supabase con el proyecto configurado

## Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/chat-mobile.git
cd chat-mobile

# Instalar dependencias
npm install

# Configurar variables de entorno
cp src/shared/.env-example .env
# Editar .env con tus valores de Supabase
```

## Variables de entorno

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Ejecutar en desarrollo

```bash
npm start

# Android
npm run android

# iOS
npm run ios
```

## Estructura

```text
src/
├── app/
│   ├── _layout.tsx          # Layout raiz con auth y providers
│   └── index.tsx            # Pantalla principal
├── Navigation/
│   └── MessagesStack.tsx    # Stack navigator
├── screens/app/Chat/
│   ├── chatScreen.tsx       # Lista de conversaciones
│   ├── ChatRoomScreen.tsx   # Chat individual con realtime
│   └── components/
│       └── InputChatBox.tsx # Input de mensajes
└── shared/                  # Codigo compartido (git subtree de chat-shared)
    ├── lib/
    ├── services/
    ├── hooks/
    └── components/
```

## Sincronizar shared layer

Si aun no tienes configurado el remote de shared:

```bash
git remote add shared https://github.com/TU_USUARIO/chat-shared.git
```

Traer cambios de chat-shared a chat-mobile:

```bash
git subtree pull --prefix=src/shared shared main --squash
```

Empujar cambios desde chat-mobile hacia chat-shared:

```bash
git subtree push --prefix=src/shared shared main
```

## Flujo alternativo de sincronizacion (URL directa)

Si editaste shared desde otro repositorio (por ejemplo chat-web), puedes publicar y sincronizar con URL directa:

```bash
# Desde el repo donde editaste src/shared
git add .
git commit -m "feat: update shared layer"
git subtree push --prefix=src/shared https://github.com/TU_USUARIO/chat-shared.git main

# Luego, desde chat-mobile
git subtree pull --prefix=src/shared https://github.com/TU_USUARIO/chat-shared.git main --squash
```

## Funcionalidades

- Login con email y password
- Lista de conversaciones con busqueda y filtros (Todos / Sin leer / Leidos)
- Pull-to-refresh en lista de conversaciones
- Mensajes en tiempo real via Supabase Realtime
- Mensajes agrupados por fecha con separadores
- Burbujas estilo WhatsApp (propios a la derecha, recibidos a la izquierda)
- Scroll infinito hacia arriba para cargar mensajes historicos
- Eliminar mensajes (long press)
- Optimizado con FlatList (initialNumToRender, maxToRenderPerBatch, windowSize)
- Compatible con iOS y Android