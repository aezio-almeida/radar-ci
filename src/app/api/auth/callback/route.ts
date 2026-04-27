import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  if (code) {
    const admin = supabaseAdmin()
    await admin.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(new URL('/dashboard', req.url))
}
