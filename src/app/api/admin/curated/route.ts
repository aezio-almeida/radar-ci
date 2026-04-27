import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, summary_compact, strategic_analysis, original_url, source_name, category, media_type, thumbnail_url, tags } = body

  const admin = supabaseAdmin()
  const { data, error } = await admin.from('articles').insert({
    title, summary_compact,
    summary_expanded: summary_compact,
    strategic_analysis,
    original_url, source_name,
    category, media_type: media_type || 'article',
    thumbnail_url, tags: tags || [],
    type: 'curated',
    relevance_score: 95,
    relevance_level: 'alta',
    published_at: new Date().toISOString()
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ article: data })
}

export async function GET() {
  const admin = supabaseAdmin()
  const { data } = await admin.from('articles')
    .select('*')
    .eq('type', 'curated')
    .order('created_at', { ascending: false })
  return NextResponse.json({ articles: data || [] })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const admin = supabaseAdmin()
  await admin.from('articles').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
