import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { randomInt } from 'crypto'

export async function POST(req: NextRequest) {
  const { email, name, phone } = await req.json()
  if (!email || !name) return NextResponse.json({ error: 'Nome e email obrigatórios' }, { status: 400 })

  const admin = supabaseAdmin()

  // Cria usuário no Supabase Auth
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email, email_confirm: false,
    user_metadata: { name, phone }
  })

  if (authError && !authError.message.includes('already registered')) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  // Upsert profile
  const userId = authData?.user?.id
  if (userId) {
    await admin.from('profiles').upsert({ id: userId, email, name, phone }, { onConflict: 'id' })
  }

  // Gera e salva OTP
  const code = String(randomInt(100000, 999999))
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  await admin.from('otp_codes').insert({ email, code, expires_at })

  // Envia email com Resend (ou log em dev)
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Radar CI <noreply@codigointraempreendedor.com.br>',
      to: email,
      subject: `${code} — Seu código de acesso ao Radar CI`,
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #00e5a0; font-size: 24px; margin-bottom: 8px;">Radar CI</h1>
          <p style="color: #6b7280; margin-bottom: 24px;">Código Intraempreendedor</p>
          <p style="color: #e2e8f0; margin-bottom: 16px;">Olá, ${name}! Seu código de acesso é:</p>
          <div style="background: #111118; border: 1px solid #1e1e2e; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: bold; color: #00e5a0; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: #6b7280; font-size: 12px;">Válido por 10 minutos. Não compartilhe este código.</p>
        </div>
      `
    })
  } catch (e) {
    console.log('Email OTP code:', code) // Fallback para dev
  }

  return NextResponse.json({ success: true })
}
