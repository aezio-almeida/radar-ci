import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const CRON_SECRET = process.env.CRON_SECRET!

  if (!SUPABASE_URL || !CRON_SECRET) {
    return NextResponse.json(
      { error: 'Missing required environment variables' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/collect-articles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CRON_SECRET}`,
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
      discarded: result.discarded || 0,
      errors: result.errors || 0,
      sources_count: result.sources_count || 0,
      execution_time_seconds: result.execution_time_seconds || 0,
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
