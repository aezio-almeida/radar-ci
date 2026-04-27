import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { user_id, article_id, action } = await req.json()
  const admin = supabaseAdmin()

  if (action === 'add') {
    await admin.from('favorites').upsert({ user_id, article_id }, { onConflict: 'user_id,article_id' })
  } else {
    await admin.from('favorites').delete().eq('user_id', user_id).eq('article_id', article_id)
  }
  return NextResponse.json({ success: true })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')
  const admin = supabaseAdmin()
  const { data } = await admin
    .from('favorites')
    .select('article_id')
    .eq('user_id', user_id)
  return NextResponse.json({ favorites: data?.map(f => f.article_id) || [] })
}
