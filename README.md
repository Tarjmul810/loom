# Loomy — AI Screen Recorder

A Loom-inspired screen recording app with AI-powered transcription. Record your screen, get automatic transcripts, and share your recordings.

Built as an internship project.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo |
| Frontend | Next.js 15 (App Router) |
| Auth | Clerk |
| Database | Neon (PostgreSQL) + Prisma |
| Storage | Cloudflare R2 |
| Transcription | Groq Whisper |
| Styling | Tailwind CSS |

---

## Project Structure

```
loomy/
├── apps/
│   └── web/                    # Next.js app
│       └── src/app/
│           ├── api/
│           │   ├── upload/
│           │   │   └── presigned-url/  # Generate R2 upload URLs
│           │   └── videos/
│           │       ├── route.ts        # GET all, POST create
│           │       └── [id]/
│           │           └── route.ts    # GET single video
│           ├── dashboard/      # Video list page
│           ├── record/         # Recording page
│           └── video/[id]/     # Video playback page
├── packages/
│   ├── db/                     # Prisma client + schema
│   ├── storage/                # Cloudflare R2 client
│   └── transcription/          # Groq transcription logic
```

---

## How It Works

### Recording Pipeline
1. User clicks **Start Recording** → browser captures screen + microphone via `getDisplayMedia` + `getUserMedia`
2. `MediaRecorder` collects video chunks in memory
3. User clicks **Stop Recording** → chunks assembled into a `Blob`
4. Browser requests a presigned URL from `POST /api/upload/presigned-url`
5. Browser uploads `Blob` directly to Cloudflare R2 via `HTTP PUT` — server never touches the bytes
6. Browser calls `POST /api/videos` → saves video metadata to Neon DB with status `processing`

### Transcription Pipeline
1. After DB record is created, `transcribeVideo()` fires in the background (fire and forget)
2. Downloads video from R2 using `GetObjectCommand`
3. Sends audio to Groq Whisper (`whisper-large-v3`)
4. On success → saves transcript text to DB, updates status to `ready`
5. On failure → updates status to `failed`

### Playback
1. `GET /api/videos/[id]` fetches video record from DB scoped to authenticated user
2. Generates a presigned read URL from R2 (valid 1 hour)
3. Frontend renders `<video src={presignedUrl} />`  with transcript below

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Accounts: Clerk, Neon, Cloudflare R2, Groq

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/loomy.git
cd loomy
pnpm install
```

### 2. Set up environment variables

Create `.env` in the root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Neon DB
DATABASE_URL=

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Groq
GROQ_API_KEY=
```

### 3. Set up the database

```bash
cd packages/db
npx prisma migrate dev
npx prisma generate
```

### 4. Configure Cloudflare R2 CORS

In your R2 bucket settings, add this CORS policy:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

### 5. Run the app

```bash
pnpm dev
```

App runs at `http://localhost:3000`

---

## Database Schema

```prisma
model Video {
  id         String      @id @default(cuid())
  userId     String
  title      String
  r2Key      String
  status     VideoStatus @default(processing)
  duration   Int?
  views      Int         @default(0)
  transcript Json?
  summary    String?
  chapters   Json?
  createdAt  DateTime    @default(now())
  comments   Comment[]
}

model Comment {
  id        String   @id @default(cuid())
  videoId   String
  userId    String
  text      String
  timestamp Int
  createdAt DateTime @default(now())
  video     Video    @relation(fields: [videoId], references: [id])
}

enum VideoStatus {
  processing
  ready
  failed
}
```

---

## Key Design Decisions

**Direct browser-to-R2 upload** — Video bytes never pass through the server. The API only generates a presigned URL. This avoids Next.js body size limits and keeps the server lightweight.

**Fire-and-forget transcription** — Transcription is triggered after DB record creation without `await`. The API responds immediately while transcription runs in the background.

**Scoped DB queries** — Every video query filters by both `id` and `userId` to prevent unauthorized access across users.

**Separate packages for storage and transcription** — R2 client lives in `packages/storage`, Groq logic in `packages/transcription`. Swapping providers only requires changes in one place.

---

## Features

- Screen + microphone recording via browser APIs
- Direct upload to Cloudflare R2 via presigned URLs
- Automatic AI transcription via Groq Whisper
- Video playback with secure presigned read URLs
- Dashboard with search and recording stats
- Protected routes via Clerk auth

---

## Future Improvements

- Background job queue (Inngest / BullMQ) for reliable transcription
- Video thumbnails
- Shareable public links
- AI-generated summaries and chapters
- Comments with timestamp references
