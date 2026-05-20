# Clip

Real-time cross-device clipboard. Share text and images between any devices instantly — no login, no account required.

## Features

- Create or join a session with a code or QR scan
- Share text and images in real time across devices
- QR code generated on session creation for instant mobile join
- Images auto-expire after 10 minutes; history capped at 10 items
- Works on any device on the same network or over the internet

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand, Socket.IO client |
| Backend | Node.js, Express, Socket.IO, BullMQ |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| Image processing | Sharp, Multer |

## Running with Docker (recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Start

```bash
docker compose up -d --build
```

App is available at **http://localhost:3000**.

To stop:

```bash
docker compose down
```

## Running without Docker

### Prerequisites
- Node.js ≥ 18
- PostgreSQL 16 running on `localhost:5432`
- Redis 7 running on `localhost:6379`

### Backend

```bash
cd backend
npm install
npm run dev
```

Runs on **http://localhost:3001**.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on **http://localhost:3000**.

## LAN / Mobile access

1. Find your machine's local IP (run `ipconfig` on Windows, `ifconfig` on Mac/Linux)
2. Open `http://<your-LAN-IP>:3000` on your desktop browser
3. Create a session — a QR code appears
4. Scan it with your phone — it joins the session automatically

Both devices must be on the same Wi-Fi network.

## Deploying to AWS EC2

### 1. Launch EC2

- **AMI**: Ubuntu 24.04 LTS
- **Instance type**: `t3.small` or larger
- **Storage**: 20 GB
- **Security group inbound rules**:

| Port | Source |
|------|--------|
| 22 | Your IP |
| 80 | 0.0.0.0/0 |
| 443 | 0.0.0.0/0 |
| 3000 | 0.0.0.0/0 |
| 3001 | 0.0.0.0/0 |

### 2. Install dependencies

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker ubuntu
newgrp docker
```

### 3. Upload and configure

```bash
git clone <your-repo> clip
cd clip
```

Edit `docker-compose.yml` — set your EC2 public IP as build args for the frontend:

```yaml
frontend:
  build:
    context: ./frontend
    args:
      NEXT_PUBLIC_API_URL: http://<EC2-PUBLIC-IP>:3001
      NEXT_PUBLIC_WS_URL: http://<EC2-PUBLIC-IP>:3001
```

### 4. Start

```bash
docker compose up -d --build
```

Access at `http://<EC2-PUBLIC-IP>:3000`.

## Environment variables

### Backend (`docker-compose.yml` → `backend.environment`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Backend port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `REDIS_URL` | — | Redis connection string |
| `MAX_FILE_SIZE_MB` | `5` | Max image upload size |
| `IMAGE_EXPIRY_MINUTES` | `10` | How long images are kept |
| `MAX_HISTORY_ITEMS` | `10` | Max clipboard items per session |

### Frontend (build args)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | dynamic | Backend API URL (set for production) |
| `NEXT_PUBLIC_WS_URL` | dynamic | Backend WebSocket URL (set for production) |

When these are not set, the frontend derives the backend URL from `window.location.hostname` automatically (works for both localhost and LAN access).

## Project structure

```
backend/
  src/
    index.js              # Entry point
    routes/
      session.js          # Session create/get
      upload.js           # Image upload
    services/
      db.js               # PostgreSQL queries
      redis.js            # Clipboard history (Redis)
      queue.js            # BullMQ queue setup
      worker.js           # Image processing & cleanup workers
      cleanup.js          # Scheduled cleanup sweep
    socket/
      handler.js          # Socket.IO events
    middleware/
      upload.js           # Multer config

frontend/
  src/
    app/                  # Next.js App Router
    components/           # UI components
    lib/
      api.ts              # REST client
      socket.ts           # Socket.IO client
    store/
      useClipboardStore.ts # Zustand state
    types/
      index.ts
2. Click **Create Session** — a QR code appears
3. Scan the QR code on your phone (or open the link on another device/tab)
4. Both devices are now connected — share text and images in real-time

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/clip` | PostgreSQL connection |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `MAX_FILE_SIZE_MB` | `5` | Max upload size |
| `IMAGE_EXPIRY_MINUTES` | `10` | Auto-delete images after |
| `MAX_HISTORY_ITEMS` | `10` | Clipboard history limit |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Backend API URL |
| `NEXT_PUBLIC_WS_URL` | `http://localhost:3001` | WebSocket URL |

## Features

- **Device pairing** via QR code or link — no auth needed
- **Real-time text sync** via WebSocket
- **Image sharing** via upload, drag & drop, or paste (Ctrl+V)
- **Clipboard history** — last 10 items stored in Redis
- **Auto-cleanup** — uploaded images expire after 10 minutes
- **Session isolation** — each session is its own Socket.IO room

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/session` | Create a new session |
| `GET` | `/session/:id` | Get session + clipboard history |
| `POST` | `/upload-image` | Upload image (multipart/form-data: `image` file + `sessionId`) |
| `GET` | `/health` | Health check |

## Socket Events

| Event | Direction | Payload |
|---|---|---|
| `join-session` | Client → Server | `{ sessionId }` |
| `clipboard-update` | Client → Server | `{ text }` |
| `receive-clipboard` | Server → Client | `{ type, content, timestamp }` |
| `image-received` | Server → Client | `{ type, imageUrl, imageId, timestamp }` |
| `device-count` | Server → Client | `{ count }` |
