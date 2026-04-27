export type Category =
  | 'ia-negocios'
  | 'empreendedorismo'
  | 'inovacao-corporativa'
  | 'estrategia-lideranca'
  | 'mercados-investimentos'
  | 'tecnologia-transformacao'
  | 'cases-benchmarks'
  | 'pdi-regulacao-fomentos'

export const CATEGORIES: Record<Category, { label: string; icon: string }> = {
  'ia-negocios': { label: 'IA & Negócios', icon: '🤖' },
  'empreendedorismo': { label: 'Empreendedorismo & Startups', icon: '🚀' },
  'inovacao-corporativa': { label: 'Inovação Corporativa & CVC', icon: '🏢' },
  'estrategia-lideranca': { label: 'Estratégia & Liderança', icon: '♟️' },
  'mercados-investimentos': { label: 'Mercados & Investimentos', icon: '📈' },
  'tecnologia-transformacao': { label: 'Tecnologia & Transformação Digital', icon: '⚡' },
  'cases-benchmarks': { label: 'Cases & Benchmarks Globais', icon: '🌍' },
  'pdi-regulacao-fomentos': { label: 'P&D, Regulação & Fomentos', icon: '🔬' },
}

export type RelevanceLevel = 'alta' | 'media' | 'baixa'

export interface Article {
  id: string
  title: string
  summary_compact: string
  summary_expanded: string
  strategic_analysis: string
  source_name: string
  source_url: string
  original_url: string
  category: Category
  relevance_score: number
  relevance_level: RelevanceLevel
  tags: string[]
  published_at: string
  created_at: string
  type: 'auto' | 'curated'
  media_type?: 'article' | 'video' | 'podcast'
  thumbnail_url?: string
}

export interface Source {
  id: string
  name: string
  rss_url: string
  website_url: string
  category: Category
  active: boolean
  last_fetched_at?: string
  articles_count: number
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  created_at: string
  is_admin: boolean
}
