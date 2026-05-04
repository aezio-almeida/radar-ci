import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()
  
  // Verifica se usuário está autenticado
  const { data: userData, error: userError } = await supabase.auth.getUser()
  
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  
  if (!body || !body.event_type) {
    return NextResponse.json({ error: 'event_type required' }, { status: 400 })
  }

  const { event_type, article_id, metadata } = body

  const { error: insertError } = await supabase.from('events').insert({
    user_id: userData.user.id,
    event_type,
    article_id: article_id || null,
    metadata: metadata || {}
  })

  if (insertError) {
    console.error('Event insert error:', insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
