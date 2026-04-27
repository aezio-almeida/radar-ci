import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email, code } = await req.json()
  const admin = supabaseAdmin()

  const { data: otpRecord } = await admin
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!otpRecord) {
    return NextResponse.json({ error: 'Codigo invalido ou expirado' }, { status: 400 })
  }

  await admin.from('otp_codes').update({ used: true }).eq('id', otpRecord.id)

  const { data: { users } } = await admin.auth.admin.listUsers()
  const user = users.find((u: any) => u.email === email)
  if (!user) {
    return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
  }

  const { data: linkData } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  const response = NextResponse.json({ success: true, user_id: user.id })
  response.cookies.set('radar-ci-user', JSON.stringify({ id: user.id, email }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  })

  return response
}
