import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

async function ai(title: string, content: string): Promise<any> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: 'Analista do Radar CI. Retorne APENAS JSON valido sem markdown: {"titlePtBr":"titulo 12 palavras","summaryCompact":"resumo 3 linhas","summaryExpanded":"analise 3-4 linhas","strategicAnalysis":"3 paragrafos","category":"ia-negocios","relevanceScore":75,"tags":["t1","t2"]}',
      messages: [{ role: 'user', content: 'TITULO: ' + title + '\nCONTEUDO: ' + content.slice(0, 1200) }]
    })
  })
  if (!r.ok) throw new Error('API ' + r.status + ': ' + (await r.text()).slice(0, 100))
  const d = await r.json()
  const t = (d.content?.[0]?.text || '').replace(/```json?\n?/g, '').replace(/```/g, '').trim()
  return JSON.parse(t)
}

async function feed(url: string): Promise<any[]> {
  const r = await fetch(url, {
    headers: { 'User-Agent': 'RadarCI/1.0' },
    signal: AbortSignal.timeout(7000)
  })
  if (!r.ok) {
    console.log('[FEED HTTP ERROR]', r.status, url)
    return []
  }
  const xml = await r.text()
  const out: any[] = []
  const re = /<item[^>]*>([\s\S]*?)<\/item>|<entry[^>]*>([\s\S]*?)<\/entry>/gi
  let m
  while ((m = re.exec(xml))) {
    const b = m[1] || m[2]
    const g = (tag: string) => {
      const x = b.match(new RegExp('<' + tag + '[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/' + tag + '>|<' + tag + '[^>]*>([^<]*)<\\/' + tag + '>', 'i'))
      return x ? (x[1] || x[2] || '').trim() : ''
    }
    const h = () => {
      const x = b.match(/<link[^>]*href="([^"]*)"[^>]*\/?>|<link[^>]*>([^<]+)<\/link>/i)
      return x ? (x[1] || x[2] || '').trim() : ''
    }
    const title = g('title')
    const link = h() || g('link')
    if (title && link) {
      out.push({
        title,
        link,
        content: g('description') || g('summary') || '',
        pubDate: g('pubDate') || g('published') || ''
      })
    }
  }
  console.log('[FEED PARSED]', url, 'items:', out.length, 'xml_size:', xml.length)
  return out
}

Deno.serve(async () => {
  console.log('[COLLECT START]', new Date().toISOString())
  const db = createClient(SUPABASE_URL, SUPABASE_KEY)
  const { data: sources } = await db.from('sources').select('*').eq('active', true)

  if (!sources || sources.length === 0) {
    console.log('[COLLECT END] no sources')
    return new Response(
      JSON.stringify({ message: 'no sources' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  console.log('[COLLECT] active sources:', sources.length)

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 15)

  let processed = 0
  let saved = 0
  let errors = 0
  let duplicates = 0
  let outOfDate = 0
  const log: string[] = []

  for (const src of sources) {
    try {
      log.push('> ' + src.name)
      const allItems = await feed(src.rss_url)
      const items = allItems
        .slice(0, 5)
        .filter((i: any) => {
          if (!i.pubDate) return true
          const isFresh = new Date(i.pubDate) > cutoff
          if (!isFresh) outOfDate++
          return isFresh
        })

      console.log('[SOURCE]', src.name, 'parsed:', allItems.length, 'fresh:', items.length)

      for (const item of items) {
        // FIX: maybeSingle nao lanca erro quando nao encontra registro
        const { data: ex, error: checkError } = await db
          .from('articles')
          .select('id')
          .eq('original_url', item.link)
          .maybeSingle()

        if (checkError) {
          console.log('[CHECK ERROR]', src.name, item.link, checkError.message)
          errors++
          log.push('  CHECK ERR: ' + checkError.message)
          continue
        }

        if (ex) {
          duplicates++
          continue
        }

        try {
          const a = await ai(item.title, item.content || item.title)
          processed++
          const score = a.relevanceScore || 50
          const level = score >= 75 ? 'alta' : score >= 40 ? 'media' : 'baixa'

          const { error: insertError } = await db.from('articles').insert({
            title: a.titlePtBr || item.title,
            title_original: item.title,
            summary_compact: a.summaryCompact || '',
            summary_expanded: a.summaryExpanded || '',
            strategic_analysis: a.strategicAnalysis || '',
            source_name: src.name,
            source_url: src.website_url || src.rss_url,
            original_url: item.link,
            category: a.category || 'ia-negocios',
            relevance_score: score,
            relevance_level: level,
            tags: a.tags || [],
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            type: 'auto',
            media_type: 'article'
          })

          if (insertError) {
            console.log('[INSERT ERROR]', src.name, insertError.message)
            errors++
            log.push('  INSERT ERR: ' + insertError.message)
          } else {
            saved++
            console.log('[SAVED]', src.name, 'score:', score, 'title:', (a.titlePtBr || item.title).slice(0, 60))
            log.push('  OK score=' + score + ': ' + (a.titlePtBr || item.title).slice(0, 60))
          }
        } catch (e: any) {
          errors++
          console.log('[AI ERROR]', src.name, e.message)
          log.push('  AI ERR: ' + e.message)
        }
      }

      await db.from('sources')
        .update({ last_fetched_at: new Date().toISOString() })
        .eq('id', src.id)

    } catch (e: any) {
      errors++
      console.log('[SOURCE ERROR]', src.name, e.message)
      log.push('ERRO fonte ' + src.name + ': ' + e.message)
    }
  }

  console.log('[COLLECT END]', JSON.stringify({ sources: sources.length, processed, saved, errors, duplicates, outOfDate }))

  return new Response(
    JSON.stringify({ processed, saved, errors, duplicates, outOfDate, log }, null, 2),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
