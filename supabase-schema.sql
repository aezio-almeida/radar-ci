-- SCHEMA COMPLETO: Radar do Código Intraempreendedor
-- Execute no SQL Editor do Supabase

-- USERS (estende auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOURCES (fontes RSS)
CREATE TABLE IF NOT EXISTS public.sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rss_url TEXT NOT NULL UNIQUE,
  website_url TEXT,
  category TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  articles_count INTEGER DEFAULT 0,
  last_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ARTICLES
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_original TEXT,
  summary_compact TEXT,
  summary_expanded TEXT,
  strategic_analysis TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT,
  original_url TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  relevance_score INTEGER DEFAULT 0,
  relevance_level TEXT DEFAULT 'media',
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMPTZ,
  type TEXT DEFAULT 'auto',
  media_type TEXT DEFAULT 'article',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAVORITES
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- SYSTEM CONFIG
CREATE TABLE IF NOT EXISTS public.system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INSERT default config
INSERT INTO public.system_config (key, value) VALUES
  ('ai_prompt', 'Você é um analista sênior de inteligência estratégica em negócios, inovação e tecnologia para o público executivo brasileiro.'),
  ('max_cost_per_run', '2.00'),
  ('article_max_age_days', '15'),
  ('collect_hour', '7'),
  ('collect_minute', '0'),
  ('data_retention_days', '30'),
  ('min_relevance_score', '0'),
  ('max_articles_per_source', '10')
ON CONFLICT (key) DO NOTHING;

-- OTP CODES (para login por email)
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

-- Articles: todos logados podem ler
CREATE POLICY "articles_select" ON public.articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "articles_anon_select" ON public.articles FOR SELECT TO anon USING (true);

-- Sources: todos podem ler
CREATE POLICY "sources_select" ON public.sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "sources_anon_select" ON public.sources FOR SELECT TO anon USING (true);

-- Profiles: usuário vê só o seu
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Favorites: usuário gerencia os seus
CREATE POLICY "favorites_all_own" ON public.favorites FOR ALL USING (auth.uid() = user_id);

-- INDEXES para performance
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_relevance ON public.articles(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_articles_created ON public.articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_type ON public.articles(type);

COMMENT ON TABLE public.articles IS 'Artigos processados pelo Radar CI';
COMMENT ON TABLE public.sources IS 'Fontes RSS monitoradas';
COMMENT ON TABLE public.profiles IS 'Perfis de usuários cadastrados';
