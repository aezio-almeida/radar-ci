import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const admin = supabaseAdmin()
  const { data } = await admin.from('sources').select('*').order('name')
  return NextResponse.json({ sources: data || [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const admin = supabaseAdmin()
  const { data, error } = await admin.from('sources').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ source: data })
}

export async function PATCH(req: NextRequest) {
  const { id, ...updates } = await req.json()
  const admin = supabaseAdmin()
  await admin.from('sources').update(updates).eq('id', id)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const admin = supabaseAdmin()
  await admin.from('sources').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
