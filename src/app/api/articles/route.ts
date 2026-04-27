import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const relevance = searchParams.get('relevance')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  // Usa chave publica para leitura — RLS permite acesso publico a articles
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (category && category !== 'todas') query = query.eq('category', category)
  if (relevance && relevance !== 'todas') query = query.eq('relevance_level', relevance)
  if (search) query = query.or(`title.ilike.%${search}%,summary_compact.ilike.%${search}%`)

  const { data, error, count } = await query

  if (error) {
    console.error('Articles API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ articles: data || [], total: count || 0, page, limit })
}
