'use client'

import { useState, Suspense } from 'react'
import { createBrowserSupabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const errorParam = searchParams.get('error')
  const supabase = createBrowserSupabase()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    if (error) {
      setMessage({ type: 'error', text: error.message })
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({
        type: 'success',
        text: 'Link enviado. Verifique seu e-mail e clique para entrar.',
      })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl font-bold text-white mb-2">
            RADAR <span className="text-accent">CI</span>
          </h1>
          <p className="text-muted text-sm tracking-wider uppercase">
            Código Intraempreendedor
          </p>
          <p className="text-text mt-6 text-base">
            Inteligência que move decisões reais.
          </p>
        </div>

        {/* Card de login */}
        <div className="bg-surface border border-border rounded-2xl p-8">
          {/* Erro de URL (vindo de /auth/callback) */}
          {errorParam === 'auth_failed' && !message && (
            <div className="mb-6 p-4 rounded-lg text-sm bg-red-500/10 border border-red-500/30 text-red-400">
              Falha na autenticação. Tente novamente.
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 px-4 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Entrar com Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="px-4 text-muted text-xs uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Magic Link */}
          <form onSubmit={handleMagicLink}>
            <label className="block text-text text-sm mb-2">
              Receber link por e-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
              className="w-full bg-bg border border-border text-text rounded-lg px-4 py-3 focus:outline-none focus:border-accent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full mt-4 bg-accent text-black font-semibold py-3 px-4 rounded-lg hover:bg-accent-dim transition disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar link mágico'}
            </button>
          </form>

          {/* Mensagem dinâmica */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-accent/10 border border-accent/30 text-accent'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-muted text-xs mt-8 leading-relaxed">
          Você não tem tempo de ler tudo.<br />
          O Radar CI leu, filtrou e analisou — só para você decidir.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <LoginForm />
    </Suspense>
  )
}
