import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Missing Supabase credentials' },
      { status: 500 }
    )
  }

  try {
    // Chama a Edge Function do Supabase
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/collect-articles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({}),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        {
          error: 'Edge Function failed',
          status: response.status,
          details: errorText.slice(0, 500)
        },
        { status: response.status }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      processed: result.processed || 0,
      saved: result.saved || 0,
      errors: result.errors || 0,
      sources_count: result.sources_count || 0,
      estimated_cost: `$${((result.processed || 0) * 0.001).toFixed(4)}`,
      log: result.log || []
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    )
  }
}

// Permite GET também (para o cron da Vercel)
export async function GET(req: NextRequest) {
  return POST(req)
}
