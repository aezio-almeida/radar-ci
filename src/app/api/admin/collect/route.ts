import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { analyzeArticle } from '@/lib/ai'

export async function POST(req: NextRequest) {
  // Segurança básica
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = supabaseAdmin()
  const Parser = (await import('rss-parser')).default
  const parser = new Parser({ timeout: 10000 })

  // Busca fontes ativas
  const { data: sources } = await admin.from('sources').select('*').eq('active', true)
  if (!sources?.length) return NextResponse.json({ message: 'No active sources' })

  // Config
  const { data: configs } = await admin.from('system_config').select('*')
  const config = Object.fromEntries((configs || []).map(c => [c.key, c.value]))
  const maxAge = parseInt(config.article_max_age_days || '15')
  const maxPerSource = parseInt(config.max_articles_per_source || '10')
  const minScore = parseInt(config.min_relevance_score || '0')

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - maxAge)

  let processed = 0, saved = 0, cost = 0

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.rss_url)
      const items = feed.items.slice(0, maxPerSource)

      for (const item of items) {
        if (!item.link || !item.title) continue

        const pubDate = new Date(item.pubDate || Date.now())
        if (pubDate < cutoffDate) continue

        // Verifica se já existe
        const { data: existing } = await admin
          .from('articles')
          .select('id')
          .eq('original_url', item.link)
          .single()
        if (existing) continue

        const content = item.contentSnippet || item.content || item.summary || item.title
        const analysis = await analyzeArticle(content, item.title, source.website_url || source.rss_url)
        processed++
        cost += 0.008 // estimativa por artigo

        if (analysis.relevanceScore < minScore) continue

        await admin.from('articles').insert({
          title: analysis.titlePtBr,
          title_original: item.title,
          summary_compact: analysis.summaryCompact,
          summary_expanded: analysis.summaryExpanded,
          strategic_analysis: analysis.strategicAnalysis,
          source_name: source.name,
          source_url: source.website_url,
          original_url: item.link,
          category: analysis.category,
          relevance_score: analysis.relevanceScore,
          relevance_level: analysis.relevanceScore >= 70 ? 'alta' : analysis.relevanceScore >= 40 ? 'media' : 'baixa',
          tags: analysis.tags || [],
          published_at: pubDate.toISOString(),
          type: 'auto',
          media_type: 'article'
        })
        saved++
      }

      await admin.from('sources')
        .update({ last_fetched_at: new Date().toISOString(), articles_count: saved })
        .eq('id', source.id)

    } catch (err: any) {
      console.error(`Error processing source ${source.name}:`, err.message)
    }
  }

  return NextResponse.json({ processed, saved, estimated_cost: `$${cost.toFixed(4)}` })
}
