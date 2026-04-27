'use client'
import { useState, useEffect } from 'react'
import { CATEGORIES } from '@/lib/types'

type Tab = 'curated' | 'sources' | 'collect'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('curated')
  const [curatedList, setCuratedList] = useState<any[]>([])
  const [sources, setSources] = useState<any[]>([])
  const [collectResult, setCollectResult] = useState<any>(null)
  const [collecting, setCollecting] = useState(false)

  // Curated form
  const [form, setForm] = useState({ title: '', summary_compact: '', strategic_analysis: '', original_url: '', source_name: '', category: 'ia-negocios', media_type: 'article', thumbnail_url: '', tags: '' })

  // Source form
  const [srcForm, setSrcForm] = useState({ name: '', rss_url: '', website_url: '', category: 'ia-negocios' })

  useEffect(() => {
    if (tab === 'curated') fetch('/api/admin/curated').then(r => r.json()).then(d => setCuratedList(d.articles || []))
    if (tab === 'sources') fetch('/api/admin/sources').then(r => r.json()).then(d => setSources(d.sources || []))
  }, [tab])

  async function submitCurated(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/admin/curated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) })
    })
    setForm({ title: '', summary_compact: '', strategic_analysis: '', original_url: '', source_name: '', category: 'ia-negocios', media_type: 'article', thumbnail_url: '', tags: '' })
    fetch('/api/admin/curated').then(r => r.json()).then(d => setCuratedList(d.articles || []))
  }

  async function deleteCurated(id: string) {
    await fetch('/api/admin/curated', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setCuratedList(prev => prev.filter(a => a.id !== id))
  }

  async function submitSource(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/admin/sources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(srcForm) })
    setSrcForm({ name: '', rss_url: '', website_url: '', category: 'ia-negocios' })
    fetch('/api/admin/sources').then(r => r.json()).then(d => setSources(d.sources || []))
  }

  async function toggleSource(id: string, active: boolean) {
    await fetch('/api/admin/sources', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, active: !active }) })
    setSources(prev => prev.map(s => s.id === id ? { ...s, active: !active } : s))
  }

  async function runCollect() {
    setCollecting(true)
    const res = await fetch('/api/admin/collect', { method: 'POST', headers: { authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || 'dev'}` } })
    const data = await res.json()
    setCollectResult(data)
    setCollecting(false)
  }

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', outline: 'none', marginBottom: 8 }
  const selectStyle = { ...inputStyle }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 32 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <span style={{ color: 'var(--accent)', fontSize: 24 }}>◈</span>
          <h1 className="font-display font-bold text-2xl">Painel Admin — Radar CI</h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {([['curated', '⭐ Curadoria'], ['sources', '📡 Fontes RSS'], ['collect', '🔄 Coleta IA']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: tab === key ? 'var(--accent)' : 'var(--surface)', color: tab === key ? '#0a0a0f' : 'var(--muted)', border: '1px solid var(--border)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* CURADORIA TAB */}
        {tab === 'curated' && (
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h2 className="font-display font-bold text-lg mb-4">Adicionar conteúdo curado</h2>
              <form onSubmit={submitCurated}>
                <input required placeholder="Título" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} style={inputStyle} />
                <textarea required placeholder="Resumo compacto (1-2 linhas)" value={form.summary_compact} onChange={e => setForm(p => ({...p, summary_compact: e.target.value}))} rows={2} style={{...inputStyle, resize: 'vertical'}} />
                <textarea placeholder="Análise estratégica (3-4 parágrafos)" value={form.strategic_analysis} onChange={e => setForm(p => ({...p, strategic_analysis: e.target.value}))} rows={4} style={{...inputStyle, resize: 'vertical'}} />
                <input required placeholder="URL do conteúdo (YouTube, Spotify, artigo...)" value={form.original_url} onChange={e => setForm(p => ({...p, original_url: e.target.value}))} style={inputStyle} />
                <input placeholder="Thumbnail URL (opcional)" value={form.thumbnail_url} onChange={e => setForm(p => ({...p, thumbnail_url: e.target.value}))} style={inputStyle} />
                <input required placeholder="Nome da fonte" value={form.source_name} onChange={e => setForm(p => ({...p, source_name: e.target.value}))} style={inputStyle} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} style={selectStyle}>
                    {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                  <select value={form.media_type} onChange={e => setForm(p => ({...p, media_type: e.target.value}))} style={selectStyle}>
                    <option value="article">📄 Artigo</option>
                    <option value="video">🎥 Vídeo/YouTube</option>
                    <option value="podcast">🎙️ Podcast</option>
                  </select>
                </div>
                <input placeholder="Tags (separadas por vírgula)" value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} style={inputStyle} />
                <button type="submit" style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--accent)', color: '#0a0a0f', fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 'none' }}>
                  + Publicar no Radar
                </button>
              </form>
            </div>

            <h3 className="font-display font-semibold mb-3">Conteúdos publicados ({curatedList.length})</h3>
            {curatedList.map(a => (
              <div key={a.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{a.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{a.media_type} · {a.source_name} · {CATEGORIES[a.category as keyof typeof CATEGORIES]?.label}</p>
                </div>
                <button onClick={() => deleteCurated(a.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* SOURCES TAB */}
        {tab === 'sources' && (
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h2 className="font-display font-bold text-lg mb-4">Adicionar fonte RSS</h2>
              <form onSubmit={submitSource}>
                <input required placeholder="Nome da fonte" value={srcForm.name} onChange={e => setSrcForm(p => ({...p, name: e.target.value}))} style={inputStyle} />
                <input required placeholder="URL do RSS (https://...)" value={srcForm.rss_url} onChange={e => setSrcForm(p => ({...p, rss_url: e.target.value}))} style={inputStyle} />
                <input placeholder="Website URL" value={srcForm.website_url} onChange={e => setSrcForm(p => ({...p, website_url: e.target.value}))} style={inputStyle} />
                <select value={srcForm.category} onChange={e => setSrcForm(p => ({...p, category: e.target.value}))} style={selectStyle}>
                  {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                </select>
                <button type="submit" style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--accent)', color: '#0a0a0f', fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 'none' }}>
                  + Adicionar fonte
                </button>
              </form>
            </div>

            <h3 className="font-display font-semibold mb-3">Fontes ativas ({sources.filter(s => s.active).length}/{sources.length})</h3>
            {sources.map(s => (
              <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.active ? 'var(--accent)' : '#6b7280', display: 'block' }}/>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--muted)' }}>{s.rss_url}</p>
                  </div>
                </div>
                <button onClick={() => toggleSource(s.id, s.active)}
                  style={{ padding: '4px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', background: s.active ? 'rgba(239,68,68,0.12)' : 'rgba(0,229,160,0.12)', color: s.active ? '#ef4444' : 'var(--accent)', border: 'none' }}>
                  {s.active ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* COLLECT TAB */}
        {tab === 'collect' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, textAlign: 'center' }}>
            <h2 className="font-display font-bold text-xl mb-2">Coleta Manual de Artigos</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>
              Aciona o motor de IA para coletar e processar artigos de todas as fontes ativas agora.
            </p>
            <button onClick={runCollect} disabled={collecting}
              style={{ padding: '12px 32px', borderRadius: 10, background: 'var(--accent)', color: '#0a0a0f', fontWeight: 700, fontSize: 14, cursor: collecting ? 'wait' : 'pointer', border: 'none', opacity: collecting ? 0.7 : 1 }}>
              {collecting ? '⏳ Coletando...' : '🚀 Iniciar Coleta'}
            </button>
            {collectResult && (
              <div style={{ marginTop: 24, padding: 20, background: 'var(--surface2)', borderRadius: 12, textAlign: 'left' }}>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 8 }}>✓ Coleta concluída</p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Artigos processados: <strong style={{color:'var(--text)'}}>{collectResult.processed}</strong></p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Artigos salvos: <strong style={{color:'var(--text)'}}>{collectResult.saved}</strong></p>
                <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Custo estimado: <strong style={{color:'var(--accent)'}}>{collectResult.estimated_cost}</strong></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
