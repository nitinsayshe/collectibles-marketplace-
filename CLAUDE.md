# Collectibles Marketplace — Reference Guide

> This file is the single source of truth for this project. Read it before making any changes.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11 (Node.js, TypeScript, CommonJS) |
| Database | MongoDB via Mongoose |
| Auth | JWT (Passport + @nestjs/jwt), bcrypt |
| Real-time | Socket.io (`/chat` namespace) |
| Frontend | Next.js 14 App Router (TypeScript) |
| Styling | Tailwind CSS v3 |
| Font | Plus Jakarta Sans (via `next/font/google`) |
| State | Zustand with `persist` middleware (localStorage) |
| HTTP client | Axios |

## Ports

| Service | Port |
|---|---|
| Backend API | 3001 |
| Frontend | 3000 |
| MongoDB | 27017 |

## Starting the servers

```bash
# Backend
cd marketplace-backend && npm run start:dev

# Frontend
cd marketplace-frontend && npm run dev
```

---

## Project Structure

```
marketplace/
├── marketplace-backend/     NestJS API
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── auth/            JWT auth (signup, login, me)
│       ├── users/           Profile, password change
│       ├── products/        CRUD + status control
│       ├── contact-requests/ Request → accept → conversation
│       ├── conversations/   Messages + pagination
│       ├── notifications/   Per-user notification feed
│       ├── gateway/         Socket.io chat gateway
│       ├── uploads/         Cloudinary-backed image upload (products, avatars)
│       └── common/          Guards, decorators, pipes, filters
│
└── marketplace-frontend/    Next.js app
    └── src/
        ├── app/
        │   ├── layout.tsx           Root layout (font, globals.css)
        │   ├── globals.css          Body bg (#fafaf8), font-sans
        │   ├── (auth)/              Login, Signup (no navbar)
        │   └── (main)/              All pages with Navbar + Footer
        ├── components/
        │   ├── layout/Navbar.tsx    Dark charcoal navbar
        │   ├── layout/Footer.tsx    Dark charcoal footer
        │   ├── products/ProductCard.tsx
        │   ├── collectors/CollectorCard.tsx
        │   └── ui/                  Button, Input, Spinner
        ├── services/                Axios API calls per domain
        ├── store/auth.store.ts      Zustand auth state
        ├── types/                   TypeScript interfaces
        └── lib/
            ├── api.ts               Axios instance (JWT interceptor)
            └── socket.ts            Socket.io singleton (/chat ns)
```

---

## Theme & Design System

### Colors (Tailwind `primary` = Amber)

| Token | Hex | Usage |
|---|---|---|
| `primary-400` | `#fbbf24` | Hover glows, logo diamond |
| `primary-500` | `#f59e0b` | Buttons, badges, avatar bg |
| `primary-600` | `#d97706` | Button hover, links |
| `primary-700` | `#b45309` | Dark accents |

Full scale defined in `tailwind.config.ts` (50–900).

### Key design decisions

- **Navbar / Footer**: `bg-gray-900` (dark charcoal), light text — consistent dark bookend.
- **Page body bg**: `#fafaf8` (warm off-white, set in `globals.css`).
- **Cards**: `bg-white border border-gray-200 rounded-2xl` — consistent across all pages.
- **Logo mark**: `◆` amber diamond before the word "Collectibles".
- **Auth pages (login/signup)**: Split-screen — dark left panel (brand) + light right panel (form).
- **Status badge colors** (semantic, not primary):
  - For Sale: `bg-green-100 text-green-700`
  - For Trade: `bg-blue-100 text-blue-700`
  - Collection Only: `bg-gray-100 text-gray-600`
  - Hidden: `bg-yellow-100 text-yellow-700`
- **Focus rings**: `ring-primary-500` (amber) via `globals.css`.

### UI Components

| Component | File | Notes |
|---|---|---|
| `Button` | `components/ui/Button.tsx` | variants: primary, secondary, ghost, danger. `loading` prop shows spinner |
| `Input` | `components/ui/Input.tsx` | label + error prop |
| `Spinner` | `components/ui/Spinner.tsx` | size: sm, md, lg |
| `ProductCard` | `components/products/ProductCard.tsx` | `onEdit`, `onToggleHide`, `onDelete` props show owner action bar on hover |

---

## API Routes

All routes prefixed `/api`. Responses wrapped: `{ success: true, data: ... }` or `{ success: false, message, statusCode }`.

### Auth — `/api/auth`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | No | `{ username, email, password, displayName? }` → `{ access_token, user }` |
| POST | `/auth/login` | No | `{ email, password }` → `{ access_token, user }` |
| POST | `/auth/logout` | No | Stateless — client drops token |
| GET | `/auth/me` | JWT | Returns current user |

### Users — `/api/users`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/users` | No | All public collectors |
| GET | `/users/profile` | JWT | Current user's full profile |
| PATCH | `/users/profile` | JWT | Update `displayName, bio, avatarUrl, isProfilePublic, city, whatsapp, instagram, phone` |
| PATCH | `/users/change-password` | JWT | `{ currentPassword, newPassword }` |
| GET | `/users/:id` | No | Public profile by MongoDB `_id` |

### Products — `/api/products`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/products` | No | All non-hidden products. Query: `?search=&category=&status=&owner=` |
| GET | `/products/my` | JWT | Owner's products including hidden |
| POST | `/products` | JWT | Create product |
| GET | `/products/:id` | No | Single product (hidden → 404 for non-owners) |
| PATCH | `/products/:id` | JWT | Update any field (owner only) |
| DELETE | `/products/:id` | JWT | Delete (owner only) |

**Product statuses**: `for_sale`, `for_trade`, `collection_only`, `hidden`  
**Product conditions**: `new`, `like_new`, `good`, `fair`, `poor`

### Contact Requests — `/api/contact-requests`

All routes require JWT.

| Method | Route | Description |
|---|---|---|
| POST | `/contact-requests` | Send request `{ recipientId, message? }` |
| GET | `/contact-requests/incoming` | Requests received (pending) |
| GET | `/contact-requests/outgoing` | Requests sent |
| GET | `/contact-requests/contacts` | All accepted contacts |
| GET | `/contact-requests/status/:userId` | `{ status: 'none'|'pending'|'accepted', isSender? }` |
| PATCH | `/contact-requests/:id/accept` | Accept → creates Conversation |
| PATCH | `/contact-requests/:id/reject` | Reject |

### Conversations — `/api/conversations`

All routes require JWT.

| Method | Route | Description |
|---|---|---|
| GET | `/conversations` | All conversations for current user |
| GET | `/conversations/unread-count` | Count of unread messages |
| GET | `/conversations/:id/messages` | Paginated messages. Query: `?page=1&limit=30` |
| POST | `/conversations/:id/messages` | Send REST message (also use Socket.io) |

### Notifications — `/api/notifications`

All routes require JWT.

| Method | Route | Description |
|---|---|---|
| GET | `/notifications` | All notifications for user |
| GET | `/notifications/unread-count` | Unread count |
| PATCH | `/notifications/:id/read` | Mark one as read |
| PATCH | `/notifications/read-all` | Mark all as read |

### Uploads — `/api/uploads`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/uploads` | JWT | Multipart `file` (+ optional `previousUrl` to delete the old image) → uploads to Cloudinary, returns `{ url, publicId }`. Used for product images and avatars. |

### Socket.io — `/chat` namespace

| Event (emit) | Payload | Description |
|---|---|---|
| `join-conversation` | `{ conversationId }` | Join a conversation room |
| `leave-conversation` | `{ conversationId }` | Leave a conversation room |
| `send-message` | `{ conversationId, content }` | Send a real-time message |

| Event (listen) | Payload | Description |
|---|---|---|
| `new-message` | Message object | New message received in joined room |

Auth: JWT token passed in `auth: { token }` on socket connect. Socket auto-joins `user:{userId}` room for DMs.

---

## Frontend Routes

| Route | File | Notes |
|---|---|---|
| `/` | `(main)/page.tsx` | Home — hero (guest) + product grid |
| `/login` | `(auth)/login/page.tsx` | Split-screen auth page |
| `/signup` | `(auth)/signup/page.tsx` | Split-screen auth page |
| `/products` | `(main)/products/page.tsx` | Browse with search + category filter |
| `/products/:id` | `(main)/products/[id]/page.tsx` | Product detail + Contact Collector button |
| `/my-collection` | `(main)/my-collection/page.tsx` | Owner's products; edit/hide/delete on hover |
| `/my-collection/add` | `(main)/my-collection/add/page.tsx` | Add product form |
| `/my-collection/:id/edit` | `(main)/my-collection/[id]/edit/page.tsx` | Edit product form (pre-filled) |
| `/collectors` | `(main)/collectors/page.tsx` | Collector directory |
| `/collectors/:id` | `(main)/collectors/[id]/page.tsx` | Public collector profile + their items |
| `/profile` | `(main)/profile/page.tsx` | Edit own profile (3 tabs: Profile, Contact Info, Password) |
| `/contact-requests` | `(main)/contact-requests/page.tsx` | Accept/reject incoming requests |
| `/messages` | `(main)/messages/page.tsx` | Conversation list |
| `/messages/:id` | `(main)/messages/[id]/page.tsx` | Real-time chat |
| `/about` | `(main)/about/page.tsx` | About Us |
| `/contact` | `(main)/contact/page.tsx` | Contact Us form |
| `/faq` | `(main)/faq/page.tsx` | FAQ accordion |
| `/terms` | `(main)/terms/page.tsx` | Terms & Conditions |
| `/privacy` | `(main)/privacy/page.tsx` | Privacy Policy |

---

## Key Patterns & Conventions

### Authentication flow
1. Login/Signup → backend returns `{ access_token, user }`.
2. Frontend stores both in Zustand (`auth.store.ts`) with `persist` → localStorage.
3. `lib/api.ts` Axios interceptor attaches `Authorization: Bearer <token>` on every request.
4. 401 response → interceptor calls `logout()` and redirects to `/login`.

### Hydration-safe pattern (Zustand + SSR)
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
const loggedIn = mounted && isAuthenticated();
// Render auth-conditional UI only when `loggedIn` is used
```

### Response envelope
Every backend response is wrapped by `ResponseInterceptor`:
```json
{ "success": true, "data": <payload> }
```
Frontend services unwrap: `const { data } = await api.get(...); return data.data;`

### Owner actions on ProductCard
Pass callbacks to show the action bar:
```tsx
<ProductCard
  product={p}
  onEdit={(id) => router.push(`/my-collection/${id}/edit`)}
  onToggleHide={(id, status) => { /* call update API */ }}
  onDelete={(id) => { /* call remove API */ }}
/>
```
Without callbacks, the card is read-only (no action bar shown).

### Contact request → chat flow
```
POST /contact-requests → pending
PATCH /contact-requests/:id/accept → creates Conversation
GET /conversations → list with conversation ID
Socket.io join-conversation + send-message / new-message
```

### Product visibility
- `hidden` status → excluded from `GET /products` (public) but included in `GET /products/my`.
- `GET /products/:id` returns 404 for hidden products unless the requester is the owner.

---

## MongoDB Schemas (key fields)

### User
`username, email, password (bcrypt, select:false), displayName, bio, avatarUrl, role (user|super_admin), isEmailVerified, isActive, isProfilePublic, city, whatsapp, instagram, phone, createdAt, updatedAt`

### Product
`owner (ref: User), title, description, category, brand, condition (enum), askingPrice, status (enum), imageUrl, createdAt, updatedAt`

### ContactRequest
`sender (ref: User), recipient (ref: User), message, status (pending|accepted|rejected)`

### Conversation
`participants [ref: User], lastMessage, lastMessageAt`

### Message
`conversation (ref), sender (ref: User), content, readBy [ref: User], createdAt`

### Notification
`recipient (ref: User), type, title, body, link, isRead, createdAt`

---

## Environment Variables

### Backend (`marketplace-backend/.env`)
```
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/marketplace
JWT_SECRET=<min 64 chars random>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=<from cloudinary.com/console>
CLOUDINARY_API_KEY=<from cloudinary.com/console>
CLOUDINARY_API_SECRET=<from cloudinary.com/console>
```

### Frontend (`marketplace-frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## Deployment

Managed PaaS split: **Vercel** (frontend) + **Render** (backend) + **MongoDB Atlas** (database) + **Cloudinary** (image storage). No servers to patch, HTTPS included, free tiers available for dev/staging. This section is the full runbook — accounts needed, exact steps, and the real failures hit while setting this up (kept so the fix isn't re-discovered from scratch next time).

### Architecture

```
Browser ──▶ Vercel (Next.js, marketplace-frontend/)
              │  NEXT_PUBLIC_API_URL / NEXT_PUBLIC_SOCKET_URL
              ▼
            Render (NestJS, marketplace-backend/) ──▶ MongoDB Atlas
              │
              └─▶ Cloudinary (product/avatar image storage + CDN)

GitHub (nitinsayshe/collectibles-marketplace-, branch `main`)
   │             │
   └─autoDeploy─▶ Render        └─autoDeploy─▶ Vercel
```

### Accounts needed

| Service | Used for | Plan used |
|---|---|---|
| [GitHub](https://github.com) | Source repo both Render and Vercel deploy from | Free |
| [Render](https://render.com) | Hosts the NestJS API | Free web service |
| [Vercel](https://vercel.com) | Hosts the Next.js frontend | Free (Hobby) |
| [MongoDB Atlas](https://mongodb.com/cloud/atlas) | Database | Free M0 cluster |
| [Cloudinary](https://cloudinary.com) | Product/avatar image storage + CDN | Free tier |

### 1. Push the repo to GitHub

No `gh` CLI or stored GitHub credentials were available in this environment, so the repo was wired up manually:

1. `git init` at the repo root, add a root [`.gitignore`](../.gitignore) (covers `.claude/settings.local.json` and OS cruft — each app's own `.gitignore` already covers `node_modules/`, `.env`, build output).
2. Generate a dedicated SSH key for GitHub push access (skip if you already have one registered):
   ```
   ssh-keygen -t ed25519 -C "<your-email>" -f ~/.ssh/id_ed25519_github -N ""
   ```
   Add a `Host github.com` entry to `~/.ssh/config` pointing at that key, then paste the `.pub` key contents into **GitHub → Settings → SSH and GPG keys → New SSH key**.
3. Create an **empty** repo on [github.com/new](https://github.com/new) (no README/.gitignore/license — this repo already has a first commit).
4. `git remote add origin git@github.com:<user>/<repo>.git` → `git push -u origin main`.

Current repo: `git@github.com:nitinsayshe/collectibles-marketplace-.git`, branch `main`.

### 2. MongoDB Atlas

1. Create a free M0 cluster.
2. **Database Access** → add a database user. Click **Autogenerate Secure Password** rather than typing your own — it avoids special characters that need URL-encoding in the connection string.
3. **Network Access** → allow `0.0.0.0/0` (or Render's static outbound IPs if on a paid Render plan).
4. **Database → Connect → Drivers** → copy the `mongodb+srv://...` string. This becomes `MONGODB_URI`.

> **Hit this error:** `MongoServerError: bad auth : authentication failed` on Render startup. Cause: the connection string still had the literal `<password>` placeholder from Atlas's template (or a password containing unencoded special characters like `@ : / ? #`). Fix: regenerate a clean alphanumeric password in Atlas, re-copy the full connection string with it already substituted in, and paste that into `MONGODB_URI`.

### 3. Cloudinary

Sign up free → Dashboard directly shows `Cloud name`, `API Key`, `API Secret`. No OAuth, no consent screen, no per-user connection flow — one set of app-wide credentials is enough (this replaced an earlier Google Drive–based approach, which required per-user OAuth consent and was a much worse fit for app-level image storage).

### 4. Render (backend)

1. **New → Blueprint** → select the repo. Render reads [`render.yaml`](../render.yaml) at the repo root and provisions the `marketplace-backend` web service (`rootDir: marketplace-backend`).
2. `JWT_SECRET` is auto-generated by the blueprint (`generateValue: true`). Fill in the rest manually in the Render dashboard (marked `sync: false` in the blueprint):

   | Env var | Value |
   |---|---|
   | `MONGODB_URI` | From step 2 |
   | `FRONTEND_URL` | The Vercel URL from step 5 (placeholder until it exists, update after) |
   | `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | From step 3 |

3. A portable [`Dockerfile`](../marketplace-backend/Dockerfile) also exists in `marketplace-backend/` for providers that deploy via container (e.g. Railway) instead of Render's native Node buildpack.

> **Hit this error:** build failed with `sh: 1: nest: not found`. Cause: `@nestjs/cli` (which provides the `nest build` command) is a devDependency, and Render skips installing devDependencies when `NODE_ENV=production` is set — which the blueprint sets for runtime. Fix: `render.yaml`'s `buildCommand` explicitly forces them in: `npm ci --include=dev && npm run build`. `NODE_ENV=production` still applies at runtime (`npm run start`), just not during the build step.

### 5. Vercel (frontend)

1. **New Project** → import the repo → set **Root Directory** to `marketplace-frontend` (critical — the repo has both apps at the top level).
2. Framework Preset should auto-detect as **Next.js** once Root Directory is set correctly.
3. Env vars:
   ```
   NEXT_PUBLIC_API_URL=https://<render-backend-url>/api
   NEXT_PUBLIC_SOCKET_URL=https://<render-backend-url>
   ```
4. Deploy.

> **Hit this error:** build failed with `No entrypoint found. Searched for: src/main.{js,ts,...}, src/app.{...}, src/index.{...}, src/server.{...}` (and the same without `src/`). This is Vercel's generic Node.js fallback builder — it only runs when Vercel fails to detect Next.js as the framework and falls back to hunting for a conventional server entry file (which a Next.js App Router project doesn't have; `src/app/` is a routing folder, not an entry file). Fix: **Settings → General** → re-confirm/re-save **Root Directory = `marketplace-frontend`**, and explicitly set **Framework Preset = Next.js** if it shows "Other" — then redeploy.

### 6. Wire frontend and backend together

1. Once Render has a URL (e.g. `https://marketplace-backend-xxxx.onrender.com`), set it as `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_SOCKET_URL` on Vercel (redeploy if changed after initial deploy).
2. Once Vercel has a URL (e.g. `https://collectibles-marketplace.vercel.app`), set it as `FRONTEND_URL` on Render (redeploy). This is what both REST CORS ([main.ts](../marketplace-backend/src/main.ts)) and Socket.io CORS ([chat.gateway.ts](../marketplace-backend/src/gateway/chat.gateway.ts)) check against — a mismatch here shows up as CORS errors in the browser console, not a clear server-side error.

### Ongoing deploys

Both `render.yaml` (`autoDeploy: true`) and Vercel (default behavior) redeploy automatically on every `git push` to `main`. No manual redeploy step needed for routine code changes — only env var changes typically require an explicit redeploy trigger.

### Troubleshooting quick reference

| Symptom | Cause | Fix |
|---|---|---|
| Render build: `sh: 1: nest: not found` | `NODE_ENV=production` makes `npm ci` skip devDependencies (`@nestjs/cli`) | `buildCommand: npm ci --include=dev && npm run build` |
| Vercel build: `No entrypoint found...` | Root Directory not set to `marketplace-frontend`, or Framework Preset stuck on "Other" | Settings → General → set Root Directory + Framework Preset to Next.js, redeploy |
| Render runtime: `MongoServerError: bad auth` | Literal `<password>` left in `MONGODB_URI`, or unencoded special characters in the password | Regenerate a clean alphanumeric Atlas password, use the freshly-copied connection string |
| Frontend request fails / generic "failed" toast, browser console shows a CORS error | `FRONTEND_URL` on Render doesn't exactly match the live Vercel URL | Update `FRONTEND_URL` on Render, redeploy |
| `No open ports detected` in Render logs right after a Mongo connection failure | Nest never finishes bootstrapping (crashes retrying the DB connection) before binding the port | Not a separate bug — fix the underlying DB connection error above |

### Notes

- Render's free web service tier spins down after inactivity (cold start on next request); fine for staging, consider a paid plan for production traffic.
- Socket.io and REST CORS both key off the single `FRONTEND_URL` env var — if you ever serve the frontend from multiple domains (e.g. `www.` + apex), that CORS config will need to accept a list instead of one origin.

---

## Planned / Not Yet Built

- Email verification flow (token exists in schema, endpoint not wired)
- Password reset via email
- Admin dashboard (`role: super_admin` exists, no UI)
- Mark as Sold product status
- Search on collectors page
- Notification UI (bell counter in navbar, backend is ready)
- SEO / meta tags per page
