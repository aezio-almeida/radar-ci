import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { randomInt } from 'crypto'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const admin = supabaseAdmin()

  // Verifica se usuário existe
  const { data: profile } = await admin.from('profiles').select('name').eq('email', email).single()
  if (!profile) return NextResponse.json({ error: 'E-mail não cadastrado. Faça seu primeiro acesso.' }, { status: 404 })

  const code = String(randomInt(100000, 999999))
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  await admin.from('otp_codes').insert({ email, code, expires_at })

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Radar CI <noreply@codigointraempreendedor.com.br>',
      to: email,
      subject: `${code} — Seu código de acesso ao Radar CI`,
      html: `<div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:40px 20px"><h2 style="color:#00e5a0">Radar CI</h2><p>Seu código:</p><div style="background:#111118;border:1px solid #1e1e2e;border-radius:12px;padding:24px;text-align:center"><span style="font-size:36px;font-weight:bold;color:#00e5a0;letter-spacing:8px">${code}</span></div><p style="color:#6b7280;font-size:12px;margin-top:16px">Válido por 10 minutos.</p></div>`
    })
  } catch (e) {
    console.log('OTP:', code)
  }

  return NextResponse.json({ success: true })
}
