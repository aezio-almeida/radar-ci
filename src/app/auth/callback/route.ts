import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    console.error('Auth callback: no code in URL')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const supabase = await createServerSupabase()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('Auth callback exchange error:', exchangeError)
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  // Busca user fresh após sessão criada — evita estado parcial em OTP
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    console.error('Auth callback getUser error:', userError)
    return NextResponse.redirect(`${origin}/login?error=user_fetch_failed`)
  }

  const user = userData.user

  // Defesa: garante que email existe antes de tentar inserir profile
  if (!user.email) {
    console.error('Auth callback: user without email', { userId: user.id })
    return NextResponse.redirect(`${origin}/login?error=no_email`)
  }

  // Verifica se profile já existe — usa maybeSingle para retornar null em vez de erro
  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (selectError) {
    console.error('Auth callback profile select error:', selectError)
    return NextResponse.redirect(`${origin}/login?error=profile_check_failed`)
  }

  if (!existing) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email.split('@')[0],
      is_admin: false,
    })

    if (insertError) {
      console.error('Auth callback profile insert error:', insertError, {
        userId: user.id,
        email: user.email,
        provider: user.app_metadata?.provider,
      })
      return NextResponse.redirect(`${origin}/login?error=profile_create_failed`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
