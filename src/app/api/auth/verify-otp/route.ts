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

  if (!otpRecord) return NextResponse.json({ error: 'Código inválido ou expirado' }, { status: 400 })

  // Marca como usado
  await admin.from('otp_codes').update({ used: true }).eq('id', otpRecord.id)

  // Busca user id pelo email
  const { data: { users } } = await admin.auth.admin.listUsers()
  const user = users.find(u => u.email === email)
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  // Gera link mágico para logar
  const { data: sessionData } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  const response = NextResponse.json({ success: true })

  // Cria session via token
  const { data: signIn } = await admin.auth.admin.createSession({ user_id: user.id })
  if (signIn?.session) {
    response.cookies.set('sb-access-token', signIn.session.access_token, {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7
    })
    response.cookies.set('sb-refresh-token', signIn.session.refresh_token, {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30
    })
  }

  return response
}
