'use client'
import { useState, useEffect, useCallback } from 'react'
import { CATEGORIES, Article, Category, RelevanceLevel } from '@/lib/types'

const RELEVANCE_FILTERS = [
  { key: 'todas', label: 'Todas' },
  { key: 'alta', label: 'Alta' },
  { key: 'media', label: 'Média' },
  { key: 'baixa', label: 'Baixa' },
]

const PAGE_SIZE = 20

function ScoreBadge({ level, score }: { level: string; score: number }) {
  return (
    <span className={`badge-${level} text-xs px-2 py-1 rounded-full font-semibold`}>
      ↑ {level.charAt(0).toUpperCase() + level.slice(1)} {score}%
    </span>
  )
}

function ArticleCard({ article, isFavorite, onFavorite }: {
  article: Article
  isFavorite: boolean
  onFavorite: (id: string, action: 'add' | 'remove') => void
}) {
  const [expanded, setExpanded] = useState(false)
  const cat = CATEGORIES[article.category as Category]

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash === `#article-${article.id}`) {
      setExpanded(true)
      setTimeout(() => {
        document.getElementById(`article-${article.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
    }
  }, [article.id])

  function generateLinkedInPost() {
    const radarLink = `https://radar.codigointraempreendedor.com.br/dashboard#article-${article.id}`
    const text = `💡 ${article.title}\n\n${article.summary_expanded}\n\nFonte: ${article.source_name}\n\nLeia a análise completa no Radar CI:\n${radarLink}\n\n#inovação #empreendedorismo #negócios #tecnologia #IA`
    navigator.clipboard.writeText(text)
    alert('Post copiado! Cole no LinkedIn.')
  }

  return (
    <div id={`article-${article.id}`} className="article-card rounded-xl p-5 mb-4" style={{background: 'var(--surface)', border: '1px solid var(--border)', scrollMarginTop: '80px'}}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">{cat?.icon}</span>
          <span className="text-xs font-medium" style={{color: 'var(--muted)'}}>{cat?.label}</span>
          {article.type === 'curated' && (
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)'}}>
              ⭐ Curadoria Aézio
            </span>
          )}
        </div>
        <ScoreBadge level={article.relevance_level} score={article.relevance_score} />
      </div>

      <h3 className="font-display font-bold text-base mb-2 leading-snug" style={{color: 'var(--text)'}}>
        {article.title}
        <span className="ml-2 inline-block w-2 h-2 rounded-full" style={{background: 'var(--accent)'}}/>
      </h3>

      <p className="text-sm leading-relaxed mb-3" style={{color: 'var(--text-dim)'}}>{article.summary_compact}</p>

      <div className="flex gap-6 mb-3">
        <div>
          <span className="block text-xs mb-0.5" style={{color: 'var(--muted)'}}>TIPO</span>
          <span className="text-xs font-medium" style={{color: 'var(--accent)'}}>{cat?.label}</span>
        </div>
        <div>
          <span className="block text-xs mb-0.5" style={{color: 'var(--muted)'}}>FONTE</span>
          <span className="text-xs font-medium" style={{color: 'var(--accent)'}}>{article.source_name}</span>
        </div>
        <div>
          <span className="block text-xs mb-0.5" style={{color: 'var(--muted)'}}>DATA</span>
          <span className="text-xs" style={{color: 'var(--text-dim)'}}>
            {new Date(article.published_at || article.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(article.tags || []).map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{background: 'var(--surface2)', color: 'var(--muted)'}}>
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => onFavorite(article.id, isFavorite ? 'remove' : 'add')}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{background: isFavorite ? 'rgba(0,229,160,0.12)' : 'var(--surface2)', color: isFavorite ? 'var(--accent)' : 'var(--muted)', border: `1px solid ${isFavorite ? 'rgba(0,229,160,0.25)' : 'transparent'}`}}>
          {isFavorite ? '★ Favoritado' : '☆ Favoritar'}
        </button>
        <button onClick={generateLinkedInPost}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{background: 'var(--surface2)', color: 'var(--muted)'}}>
          📋 Post LinkedIn
        </button>
        <a href={article.original_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{background: 'var(--surface2)', color: 'var(--muted)'}}>
          ↗ Ler original
        </a>
        <button onClick={() => setExpanded(!expanded)}
          className="ml-auto text-xs flex items-center gap-1" style={{color: 'var(--muted)'}}>
          {expanded ? '∧ Menos' : '∨ Mais'}
        </button>
      </div>

      {expanded && article.strategic_analysis && (
        <div className="mt-4 pt-4" style={{borderTop: '1px solid var(--border)'}}>
          <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{color: 'var(--accent)'}}>Análise Estratégica</h4>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{color: 'var(--text-dim)'}}>{article.strategic_analysis}</p>
          <div className="flex gap-3 mt-4">
            <a href={article.original_url} target="_blank" rel="noopener noreferrer"
              className="text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              style={{background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)'}}>
              ↗ Abrir artigo original
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function Pagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  // Lógica de páginas visíveis: sempre mostra primeira, última, atual e vizinhas
  const pages: (number | 'ellipsis')[] = []
  const showEllipsisStart = currentPage > 3
  const showEllipsisEnd = currentPage < totalPages - 2

  pages.push(1)
  if (showEllipsisStart) pages.push('ellipsis')
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i)
  }
  if (showEllipsisEnd) pages.push('ellipsis')
  if (totalPages > 1) pages.push(totalPages)

  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 32, marginBottom: 24, flexWrap: 'wrap'}}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          background: 'var(--surface)', border: '1px solid var(--border)',
          color: currentPage === 1 ? 'var(--muted)' : 'var(--text-dim)',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          opacity: currentPage === 1 ? 0.4 : 1
        }}>
        ← Anterior
      </button>

      {pages.map((p, idx) =>
        p === 'ellipsis' ? (
          <span key={`e-${idx}`} style={{padding: '6px 4px', color: 'var(--muted)', fontSize: 13}}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, minWidth: 36,
              background: p === currentPage ? 'var(--accent)' : 'var(--surface)',
              border: '1px solid var(--border)',
              color: p === currentPage ? '#0a0a0f' : 'var(--text-dim)',
              cursor: 'pointer'
            }}>
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          background: 'var(--surface)', border: '1px solid var(--border)',
          color: currentPage === totalPages ? 'var(--muted)' : 'var(--text-dim)',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          opacity: currentPage === totalPages ? 0.4 : 1
        }}>
        Próxima →
      </button>
    </div>
  )
}

export default function DashboardPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<string>('todas')
  const [relevance, setRelevance] = useState<string>('todas')
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'feed' | 'favorites'>('feed')
  const [searchInput, setSearchInput] = useState('')
  const [stats, setStats] = useState({ articles: 0, sources: 0, categories: 8 })

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category !== 'todas') params.set('category', category)
    if (relevance !== 'todas') params.set('relevance', relevance)
    if (search) params.set('search', search)
    params.set('page', String(page))

    const res = await fetch(`/api/articles?${params}`)
    const data = await res.json()
    setArticles(data.articles || [])
    setTotal(data.total || 0)
    setStats(s => ({ ...s, articles: data.total || 0 }))
    setLoading(false)
  }, [category, relevance, search, page])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  // Reseta para página 1 quando filtros mudam
  useEffect(() => { setPage(1) }, [category, relevance, search])

  function handlePageChange(newPage: number) {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleFavorite(articleId: string, action: 'add' | 'remove') {
    setFavorites(prev =>
      action === 'add' ? [...prev, articleId] : prev.filter(id => id !== articleId)
    )
    fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_id: articleId, action, user_id: 'anon' })
    })
  }

  const displayedArticles = activeTab === 'favorites'
    ? articles.filter(a => favorites.includes(a.id))
    : articles

  return (
    <div style={{minHeight: '100vh', background: 'var(--bg)'}}>
      <nav style={{background: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50}}>
        <div style={{maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 8, height: 52}}>
          <span style={{color: 'var(--accent)', fontSize: 20, marginRight: 4}}>◈</span>
          <span className="font-display font-bold text-base" style={{color: 'var(--text)', marginRight: 24}}>Radar CI</span>

          {(['feed', 'favorites'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '4px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                background: activeTab === tab ? 'rgba(0,229,160,0.12)' : 'transparent',
                color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
                border: activeTab === tab ? '1px solid rgba(0,229,160,0.25)' : '1px solid transparent'
              }}>
              {tab === 'feed' ? '📊 Dashboard' : '★ Favoritos'}
            </button>
          ))}

          <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16}}>
            <span style={{fontSize: 12, color: 'var(--muted)'}}>
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
            <button onClick={fetchArticles}
              style={{fontSize: 12, color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 4}}>
              ↻ Atualizar
            </button>
          </div>
        </div>
      </nav>

      <div style={{textAlign: 'center', padding: '48px 24px 32px', borderBottom: '1px solid var(--border)'}}>
        <h1 className="font-display font-bold" style={{fontSize: 36, color: 'var(--text)', marginBottom: 8}}>
          Radar <span style={{color: 'var(--accent)'}}>CI</span>
        </h1>
        <p style={{fontSize: 14, color: 'var(--muted)'}}>Inteligência estratégica sobre negócios, inovação e tecnologia</p>
      </div>

      <div style={{maxWidth: 1200, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24}}>
        <aside>
          <div style={{marginBottom: 20}}>
            <form onSubmit={e => { e.preventDefault(); setSearch(searchInput) }}>
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                placeholder="Buscar artigos..."
                style={{width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none'}} />
            </form>
          </div>

          <div style={{marginBottom: 20}}>
            <p style={{fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8}}>Categorias</p>
            {[{ key: 'todas', label: 'Todas', icon: '◈' }, ...Object.entries(CATEGORIES).map(([k, v]) => ({ key: k, label: v.label, icon: v.icon }))].map(cat => (
              <button key={cat.key} onClick={() => setCategory(cat.key)}
                style={{
                  width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: 8, fontSize: 13, cursor: 'pointer', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8,
                  background: category === cat.key ? 'rgba(0,229,160,0.08)' : 'transparent',
                  color: category === cat.key ? 'var(--accent)' : 'var(--text-dim)',
                  border: 'none'
                }}>
                <span style={{fontSize: 14}}>{cat.icon}</span>
                <span style={{fontSize: 12}}>{cat.label}</span>
              </button>
            ))}
          </div>

          <div style={{background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16}}>
            <p style={{fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12}}>◉ Radar Stats</p>
            {[
              { label: 'Artigos', value: total },
              { label: 'Categorias', value: 8 },
            ].map(stat => (
              <div key={stat.label} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                <span style={{fontSize: 13, color: 'var(--text-dim)'}}>{stat.label}</span>
                <span style={{fontSize: 14, fontWeight: 700, color: 'var(--accent)'}}>{stat.value}</span>
              </div>
            ))}
          </div>
        </aside>

        <main>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap'}}>
            {RELEVANCE_FILTERS.map(f => (
              <button key={f.key} onClick={() => setRelevance(f.key)}
                style={{
                  padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: relevance === f.key ? 'var(--accent)' : 'var(--surface)',
                  color: relevance === f.key ? '#0a0a0f' : 'var(--text-dim)',
                  border: '1px solid var(--border)'
                }}>
                {f.label}
              </button>
            ))}
            <span style={{marginLeft: 'auto', fontSize: 13, color: 'var(--muted)'}}>
              {total} artigos
              {totalPages > 1 && <span style={{marginLeft: 8, color: 'var(--text-dim)'}}>· Página {page} de {totalPages}</span>}
            </span>
          </div>

          {loading ? (
            <div style={{textAlign: 'center', padding: 60, color: 'var(--muted)'}}>
              <div style={{width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'}}/>
              <p style={{fontSize: 13}}>Carregando inteligência...</p>
            </div>
          ) : displayedArticles.length === 0 ? (
            <div style={{textAlign: 'center', padding: 60, color: 'var(--muted)'}}>
              <p style={{fontSize: 32, marginBottom: 12}}>◈</p>
              <p style={{fontSize: 14}}>Nenhum artigo encontrado</p>
              <p style={{fontSize: 12, marginTop: 4}}>Tente ajustar os filtros ou aguarde a próxima coleta</p>
            </div>
          ) : (
            <>
              {displayedArticles.map(article => (
                <ArticleCard key={article.id} article={article}
                  isFavorite={favorites.includes(article.id)}
                  onFavorite={handleFavorite} />
              ))}
              {activeTab === 'feed' && (
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
