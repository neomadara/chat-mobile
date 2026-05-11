# chat-shared

Librería de código compartido para la aplicación de chat multiplataforma. Contiene componentes, hooks, servicios y utilidades consumidos por `chat-web` y `chat-mobile` mediante `git subtree`.

## Estructura del proyecto

```
chat-shared/
├── components/
│   └── chat/
│       ├── MemoizedMessageGroup.js
│       └── MessageSimple.js
├── hooks/
│   └── chat/
│       ├── useChatMessages.js
│       ├── useChatRooms.js
│       └── useSendMessage.js
├── services/
│   └── chatService.js
└── lib/
    └── supabase.js
```

## Configuración

Copia `.env-example` a `.env` y completa los valores:

```bash
cp .env-example .env
```

| Variable           | Descripción                        |
|--------------------|------------------------------------|
| `SUPABASE_URL`     | URL del proyecto en Supabase       |
| `SUPABASE_ANON_KEY`| Clave anónima pública de Supabase  |

## Flujo de trabajo (git subtree)

### 1. Publicar cambios desde chat-shared

```bash
cd chat-shared
# ... editas archivos ...
git add .
git commit -m "feat: update chatService"
git push origin main
```

### 2. Actualizar chat-web

```bash
cd ../chat-web
git subtree pull --prefix=src/shared https://github.com/TU_USUARIO/chat-shared.git main --squash
```

### 3. Actualizar chat-mobile

```bash
cd ../chat-mobile
git subtree pull --prefix=src/shared https://github.com/TU_USUARIO/chat-shared.git main --squash
```
