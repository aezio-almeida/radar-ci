import { createServerSupabase } from '@/lib/supabase'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createServerSupabase()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Cria profile na primeira vez que o usuário loga
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existing) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email!.split('@')[0],
          is_admin: false,
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }

    // Erro na troca de código — log e redireciona para login com erro
    console.error('Auth callback error:', error)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
