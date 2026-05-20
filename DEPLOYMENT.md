# 🚀 TaskFlow Production Deployment Guide

This guide provides step-by-step instructions to deploy the **TaskFlow AI-Powered Collaborative Platform** to production.

---

## 📐 Architecture Overview

To support TaskFlow's advanced real-time features (WebSockets/Socket.IO), the project is split into a production-ready architecture:

```
                  ┌──────────────────────┐
                  │   React / Vite       │
                  │   (Vercel / GitHub)  │
                  └──────────┬───────────┘
                             │
            HTTPS API &      │
            WS Connections   │
                             ▼
                  ┌──────────────────────┐
                  │   Node.js / Express  │
                  │   (Render / Railway) │
                  └──────────┬───────────┘
                             │
                             │ Prisma Client
                             ▼
                  ┌──────────────────────┐
                  │   PostgreSQL / SQLite│
                  │   (Neon / Supabase)  │
                  └──────────────────────┘
```

* **Frontend**: Hosted on **Vercel** or **GitHub Pages** (fast static file delivery).
* **Backend**: Hosted on **Render** or **Railway** (persistent node server required for WebSockets/Socket.IO).
* **Database**: **PostgreSQL** hosted on **Neon** or **Supabase** (highly recommended for serverless/ephemeral backends), or SQLite (if running on a VPS or persistent disk).

---

## 📦 Step 1: Prepare Your Database (Recommended)

Since the backend container on platforms like Render is ephemeral (it resets on new deployments or idle sleep), using local SQLite (`dev.db`) will lose your tasks and users. We highly recommend using a free PostgreSQL database:

1. **Get a Database Connection String**:
   - Go to [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com) and create a free PostgreSQL database.
   - Copy the PostgreSQL connection string. It will look like:
     `postgresql://username:password@ep-name.region.pooler.neon.tech/neondb?sslmode=require`

2. **Configure Prisma**:
   - Open `backend/prisma/schema.prisma`.
   - Change the provider from `"sqlite"` to `"postgresql"`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
   *(Note: If you want to keep SQLite for initial testing, you can skip this step and use `file:./dev.db` as the connection string).*

---

## 🖥️ Step 2: Deploy the Backend (Render or Railway)

### Option A: Deploy on Render (Free & Easy)

1. Create a free account on [Render.com](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `taskflow-backend`
   - **Root Directory**: `backend`
   - **Language**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Advanced** to add **Environment Variables**:
   - `JWT_SECRET`: Generate a secure random string (e.g. `your-super-secret-key-9988`)
   - `DATABASE_URL`: Paste your database connection string (e.g. Neon connection string or `file:./dev.db`)
   - `PORT`: `3001`
6. Click **Create Web Service**. Render will build and deploy your backend. Copy your live backend URL (e.g., `https://taskflow-backend.onrender.com`).

---

## 🎨 Step 3: Deploy the Frontend (Vercel)

Vercel is the ultimate hosting provider for Vite + React applications.

1. Go to [Vercel.com](https://vercel.com) and sign in.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
5. Click **Environment Variables** and add:
   - **Key**: `VITE_API_URL`
   - **Value**: Your live backend URL with `/api` appended (e.g., `https://taskflow-backend.onrender.com/api`)
   *(Note: The Socket.IO configuration is designed to automatically extract the root domain from this variable!)*
6. Click **Deploy**. Vercel will build and launch your beautiful UI.

---

## 🐙 Step 4: Deploy the Frontend (GitHub Pages)

If you prefer to host your frontend entirely on GitHub Pages:

1. In `frontend/vite.config.ts`, add the `base` property if your site is hosted at `username.github.io/repo-name`:
   ```typescript
   export default defineConfig({
     base: '/repo-name/', // Leave as '/' if using a custom domain
     plugins: [react(), tailwindcss()],
   })
   ```
2. Build the project locally or via GitHub Actions:
   ```bash
   cd frontend
   npm run build
   ```
3. Deploy the generated `dist/` directory to the `gh-pages` branch. You can use the `gh-pages` npm package:
   ```bash
   npm install -g gh-pages
   gh-pages -d dist
   ```
4. Set `VITE_API_URL` on your hosting page or compile with the environment variable set:
   ```bash
   VITE_API_URL=https://your-backend.onrender.com/api npm run build
   ```

---

## 🛠️ Step 5: Post-Deployment Database Sync

Once your database is live, you must push your database schema so Prisma knows what tables to query:

* **If using SQLite locally on a persistent server**:
  It will automatically create the database file on first request.
  
* **If using PostgreSQL/Neon**:
  In your local backend terminal, run the following command pointing to your live production database to seed/sync the schema:
  ```bash
  DATABASE_URL="your-production-database-url" npx prisma db push
  ```

---

## ✅ Production Readiness Verification

Our codebase is fully updated and robust:
1. **Dynamic URLs**: The frontend automatically resolves API and WebSockets using the single `VITE_API_URL` environment variable.
2. **TypeScript Integrity**: The strict unused imports and components errors have been resolved, guaranteeing `npm run build` compiles with `0 errors`.
3. **Optimized Compilation**: TypeScript configurations are customized to handle production pipelines smoothly.
