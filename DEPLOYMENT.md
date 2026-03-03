# Football Team Manager - Deployment Guide

## Overview
Deploy the app with:
- **Supabase**: Backend (PostgreSQL database + Authentication)
- **Vercel**: Frontend hosting
- **GitHub**: Version control & CI/CD

---

## Prerequisites
- GitHub account
- Supabase account (free tier works)
- Vercel account (free tier works)
- Node.js 18+ installed locally
- Git installed locally

---

## Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `football-team-manager`
3. Set to **Private** or **Public**
4. Click **Create repository**
5. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/football-team-manager.git`)

---

## Step 2: Set Up Supabase Project

### 2.1 Create Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Enter:
   - Name: `football-team-manager`
   - Database Password: (save this somewhere safe!)
   - Region: Choose closest to your users
4. Click **Create new project** (takes ~2 minutes)

### 2.2 Get API Keys
1. Go to **Settings** → **API**
2. Copy and save these values:
   - `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - `anon public` key (starts with `eyJ...`)

### 2.3 Create Database Tables
1. Go to **SQL Editor** in Supabase
2. Click **New query**
3. Paste and run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('admin', 'manager', 'player')),
  player_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  position_preferences JSONB DEFAULT '[]',
  skill_ratings JSONB DEFAULT '{}',
  manager_preference JSONB DEFAULT '{}',
  fut_attributes JSONB DEFAULT '{"PAC": 50, "SHO": 50, "PAS": 50, "DRI": 50, "DEF": 50, "PHY": 50}',
  player_image TEXT,
  image_zoom DECIMAL DEFAULT 1,
  image_pos_x INTEGER DEFAULT 50,
  image_pos_y INTEGER DEFAULT 30,
  discord_name TEXT,
  gaming_id TEXT,
  unavailable BOOLEAN DEFAULT FALSE,
  removed_from_roster BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update profiles.player_id foreign key
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_player 
FOREIGN KEY (player_id) REFERENCES public.players(id);

-- Formations table
CREATE TABLE public.formations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slots JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table (trainings & matches)
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('training', 'competitive')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT,
  attendees UUID[] DEFAULT '{}',
  confirmed_attendees UUID[] DEFAULT '{}',
  formation_id UUID REFERENCES public.formations(id),
  confirmed_lineup JSONB,
  game_completed BOOLEAN DEFAULT FALSE,
  match_confirmed BOOLEAN DEFAULT FALSE,
  match_result JSONB,
  performance_scores JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Players policies
CREATE POLICY "Anyone can view players" ON public.players
  FOR SELECT USING (true);

CREATE POLICY "Admins and managers can insert players" ON public.players
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update any player" ON public.players
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
    OR user_id = auth.uid()
  );

-- Formations policies
CREATE POLICY "Anyone can view formations" ON public.formations
  FOR SELECT USING (true);

CREATE POLICY "Admins and managers can manage formations" ON public.formations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Events policies
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins and managers can manage events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Players can update event attendance" ON public.events
  FOR UPDATE USING (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'player')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default formations
INSERT INTO public.formations (name, slots) VALUES
('4-3-3', '[
  {"id":"s1","posType":"GK","label":"GK","x":50,"y":88},
  {"id":"s2","posType":"LB","label":"LB","x":12,"y":70},
  {"id":"s3","posType":"CB","label":"CB","x":35,"y":70},
  {"id":"s4","posType":"CB","label":"CB","x":65,"y":70},
  {"id":"s5","posType":"RB","label":"RB","x":88,"y":70},
  {"id":"s6","posType":"CM","label":"CM","x":22,"y":50},
  {"id":"s7","posType":"CM","label":"CM","x":50,"y":52},
  {"id":"s8","posType":"CM","label":"CM","x":78,"y":50},
  {"id":"s9","posType":"LW","label":"LW","x":14,"y":25},
  {"id":"s10","posType":"ST","label":"ST","x":50,"y":15},
  {"id":"s11","posType":"RW","label":"RW","x":86,"y":25}
]'),
('4-4-2', '[
  {"id":"s1","posType":"GK","label":"GK","x":50,"y":88},
  {"id":"s2","posType":"LB","label":"LB","x":12,"y":70},
  {"id":"s3","posType":"CB","label":"CB","x":35,"y":70},
  {"id":"s4","posType":"CB","label":"CB","x":65,"y":70},
  {"id":"s5","posType":"RB","label":"RB","x":88,"y":70},
  {"id":"s6","posType":"LM","label":"LM","x":12,"y":50},
  {"id":"s7","posType":"CM","label":"CM","x":37,"y":50},
  {"id":"s8","posType":"CM","label":"CM","x":63,"y":50},
  {"id":"s9","posType":"RM","label":"RM","x":88,"y":50},
  {"id":"s10","posType":"ST","label":"ST","x":35,"y":20},
  {"id":"s11","posType":"ST","label":"ST","x":65,"y":20}
]'),
('4-2-3-1', '[
  {"id":"s1","posType":"GK","label":"GK","x":50,"y":88},
  {"id":"s2","posType":"LB","label":"LB","x":12,"y":70},
  {"id":"s3","posType":"CB","label":"CB","x":35,"y":70},
  {"id":"s4","posType":"CB","label":"CB","x":65,"y":70},
  {"id":"s5","posType":"RB","label":"RB","x":88,"y":70},
  {"id":"s6","posType":"CDM","label":"CDM","x":35,"y":54},
  {"id":"s7","posType":"CDM","label":"CDM","x":65,"y":54},
  {"id":"s8","posType":"LW","label":"LW","x":14,"y":34},
  {"id":"s9","posType":"CAM","label":"CAM","x":50,"y":32},
  {"id":"s10","posType":"RW","label":"RW","x":86,"y":34},
  {"id":"s11","posType":"ST","label":"ST","x":50,"y":13}
]');
```

4. Click **Run** to execute

### 2.4 Enable Email Authentication
1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Go to **Authentication** → **Settings**
4. Under "Email Auth", you can disable "Confirm email" for easier testing

---

## Step 3: Set Up Local Project

### 3.1 Create Project Structure
Open terminal and run:

```bash
# Create project directory
mkdir football-team-manager
cd football-team-manager

# Initialize npm project
npm init -y

# Install dependencies
npm install react react-dom react-router-dom @supabase/supabase-js

# Install dev dependencies
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer
```

### 3.2 Initialize Tailwind CSS
```bash
npx tailwindcss init -p
```

### 3.3 Create Project Files
Create the following file structure:
```
football-team-manager/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── (component files)
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   └── (page files)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.local
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## Step 4: Create Configuration Files

### 4.1 vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
})
```

### 4.2 tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': '#0c1220',
        'app-card': '#131e30',
        'app-border': '#1e2e45',
        'app-accent': '#4ade80',
      },
      fontFamily: {
        'barlow': ['Barlow', 'sans-serif'],
        'barlow-condensed': ['Barlow Condensed', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
```

### 4.3 index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@300;400;500;600&display=swap" rel="stylesheet">
    <title>Football Team Manager</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 4.4 .env.local (DO NOT COMMIT THIS FILE!)
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4.5 .gitignore
```
# Dependencies
node_modules/

# Build
dist/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store

# Logs
*.log
```

### 4.6 src/lib/supabase.js
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 4.7 src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Barlow', sans-serif;
  background: #0c1220;
  color: #e8edf5;
}

::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: #0c1220;
}

::-webkit-scrollbar-thumb {
  background: #253047;
  border-radius: 3px;
}
```

### 4.8 src/main.jsx
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## Step 5: Push to GitHub

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Football Team Manager"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/football-team-manager.git

# Push
git branch -M main
git push -u origin main
```

---

## Step 6: Deploy to Vercel

### 6.1 Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New...** → **Project**
3. Find and select your `football-team-manager` repository
4. Click **Import**

### 6.2 Configure Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `./` (leave default)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 6.3 Add Environment Variables
1. Expand **Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
3. Click **Deploy**

### 6.4 Get Your Live URL
After deployment (~1-2 minutes), you'll get a URL like:
`https://football-team-manager-xxxxx.vercel.app`

---

## Step 7: Configure Supabase Authentication

1. Go to your Supabase project
2. Go to **Authentication** → **URL Configuration**
3. Add your Vercel URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

---

## Step 8: Create First Admin User

### Option A: Via Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. After creating, go to **Table Editor** → **profiles**
5. Find the user and change `role` to `admin`

### Option B: Via SQL
```sql
-- After a user signs up, promote them to admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE name = 'Your Name';
```

---

## Continuous Deployment

Every time you push to `main` branch:
1. Vercel automatically detects changes
2. Builds the new version
3. Deploys to production

```bash
# Make changes, then:
git add .
git commit -m "Your update message"
git push
```

---

## Troubleshooting

### "Invalid API key"
- Check your `.env.local` file has correct Supabase keys
- Make sure environment variables are set in Vercel

### "RLS policy error"
- Check Row Level Security policies in Supabase
- Ensure user is authenticated before making requests

### "Build failed on Vercel"
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### Database not updating
- Check browser console for errors
- Verify Supabase connection in Network tab
- Check RLS policies aren't blocking the request

---

## Optional: Custom Domain

1. In Vercel, go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase URL Configuration with new domain

---

## Security Checklist

- [ ] Never commit `.env.local` file
- [ ] Use environment variables for all secrets
- [ ] Enable email confirmation in production
- [ ] Review RLS policies before going live
- [ ] Set up Supabase database backups
- [ ] Enable 2FA on GitHub, Vercel, and Supabase accounts
