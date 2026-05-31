# Graph Report - .  (2026-05-31)

## Corpus Check
- Corpus is ~5,575 words - fits in a single context window. You may not need a graph.

## Summary
- 183 nodes · 237 edges · 13 communities (11 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 15 edges
2. `useClipboardStore` - 11 edges
3. `ClipboardItem` - 6 edges
4. `getSocket()` - 5 edges
5. `start()` - 4 edges
6. `startCleanupJob()` - 4 edges
7. `getSession()` - 4 edges
8. `scripts` - 4 edges
9. `initDB()` - 3 edges
10. `touchSession()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `getSocket()` --calls--> `io`  [INFERRED]
  frontend/src/lib/socket.ts → backend/src/index.js
- `Clipboard App Overview` --references--> `Docker Compose Services`  [INFERRED]
  README.md → docker-compose.yml
- `Home()` --calls--> `useClipboardStore`  [EXTRACTED]
  frontend/src/app/page.tsx → frontend/src/store/useClipboardStore.ts
- `ClipboardFeed()` --calls--> `useClipboardStore`  [EXTRACTED]
  frontend/src/components/ClipboardFeed.tsx → frontend/src/store/useClipboardStore.ts
- `Props` --references--> `ClipboardItem`  [EXTRACTED]
  frontend/src/components/ClipboardItemCard.tsx → frontend/src/types/index.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Clipboard App Stack** — readme_clipboard_app, docker-compose_backend_service, docker-compose_frontend_service [INFERRED 0.75]

## Communities (13 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (17): Home(), ClipboardFeed(), Props, ConnectionPanel(), ALLOWED_TYPES, ImageUploader(), TextInput(), API_URL (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (22): ALLOWED_TYPES, crypto, fs, multer, path, storage, upload, UPLOADS_DIR (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (22): dependencies, next, qrcode.react, react, react-dom, socket.io-client, zustand, devDependencies (+14 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (17): { createSession, getSession, touchSession }, express, { getClipboardHistory }, router, { v4: uuidv4 }, createSession(), getSession(), { Pool } (+9 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (20): author, dependencies, bullmq, cors, dotenv, express, ioredis, multer (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (19): { scheduleCleanupSweep }, startCleanupJob(), initDB(), scheduleCleanupSweep(), startWorkers(), app, cors, express (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (9): { bullmqRedis }, cleanupWorker, connectionOpts, fs, imageWorker, path, sharp, UPLOADS_DIR (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.50
Nodes (4): Backend Service (docker-compose), Frontend Service (docker-compose), Docker Compose Services, Clipboard App Overview

## Knowledge Gaps
- **110 isolated node(s):** `name`, `version`, `main`, `test`, `keywords` (+105 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `io` connect `Community 0` to `Community 5`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **What connects `name`, `version`, `main` to the rest of the system?**
  _110 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08923076923076922 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.12987012987012986 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._