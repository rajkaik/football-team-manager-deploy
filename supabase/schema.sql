-- ============================================================================
-- Football Team Manager - Supabase Database Schema
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor to set up the database
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('admin', 'manager', 'player')),
  player_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  position_preferences JSONB DEFAULT '[]',
  skill_ratings JSONB DEFAULT '{}',
  manager_preference JSONB DEFAULT '{}',
  fut_attributes JSONB DEFAULT '{"PAC": 50, "SHO": 50, "PAS": 50, "DRI": 50, "DEF": 50, "PHY": 50}',
  player_image TEXT,
  image_zoom DECIMAL DEFAULT 1,
  image_pos_x INTEGER DEFAULT 50,
  image_pos_y INTEGER DEFAULT 30,
  image_position TEXT DEFAULT 'center top',
  discord_name TEXT,
  gaming_id TEXT,
  unavailable BOOLEAN DEFAULT FALSE,
  removed_from_roster BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key from profiles to players
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_player 
FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE SET NULL;

-- Formations table
CREATE TABLE IF NOT EXISTS public.formations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slots JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table (trainings & matches)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('training', 'competitive')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT,
  attendees UUID[] DEFAULT '{}',
  confirmed_attendees UUID[] DEFAULT '{}',
  formation_id UUID REFERENCES public.formations(id) ON DELETE SET NULL,
  confirmed_lineup JSONB,
  game_completed BOOLEAN DEFAULT FALSE,
  match_confirmed BOOLEAN DEFAULT FALSE,
  match_result JSONB,
  performance_scores JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

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
  );

CREATE POLICY "Players can update own player record" ON public.players
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can delete players" ON public.players
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Formations policies
CREATE POLICY "Anyone can view formations" ON public.formations
  FOR SELECT USING (true);

CREATE POLICY "Admins and managers can insert formations" ON public.formations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update formations" ON public.formations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can delete formations" ON public.formations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Events policies
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins and managers can insert events" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Admins and managers can update events" ON public.events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Players can update event attendance" ON public.events
  FOR UPDATE USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins and managers can delete events" ON public.events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'player')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_formations_updated_at
  BEFORE UPDATE ON public.formations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

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
]'::jsonb),
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
]'::jsonb),
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
]'::jsonb),
('3-5-2', '[
  {"id":"s1","posType":"GK","label":"GK","x":50,"y":88},
  {"id":"s2","posType":"CB","label":"CB","x":25,"y":72},
  {"id":"s3","posType":"CB","label":"CB","x":50,"y":72},
  {"id":"s4","posType":"CB","label":"CB","x":75,"y":72},
  {"id":"s5","posType":"LWB","label":"LWB","x":8,"y":52},
  {"id":"s6","posType":"CDM","label":"CDM","x":30,"y":52},
  {"id":"s7","posType":"CM","label":"CM","x":50,"y":50},
  {"id":"s8","posType":"CDM","label":"CDM","x":70,"y":52},
  {"id":"s9","posType":"RWB","label":"RWB","x":92,"y":52},
  {"id":"s10","posType":"ST","label":"ST","x":35,"y":20},
  {"id":"s11","posType":"ST","label":"ST","x":65,"y":20}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- After running this schema:
-- 1. Go to Authentication > Settings and configure your auth settings
-- 2. Create your first admin user through the Supabase dashboard or sign up
-- 3. Manually update their role to 'admin' in the profiles table:
--    UPDATE public.profiles SET role = 'admin' WHERE id = 'your-user-id';
--
-- ============================================================================
