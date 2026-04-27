import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Voce e um analista senior de inteligencia estrategica em negocios, inovacao e tecnologia. 
Sua funcao e analisar artigos e gerar curadoria estrategica em portugues brasileiro para executivos, founders, diretores e lideres senior.

Voce DEVE retornar APENAS um JSON valido (sem markdown, sem backticks) com esta estrutura exata:
{
  "titlePtBr": "titulo em PT-BR, maximo 15 palavras, impactante e informativo",
  "summaryCompact": "resumo de 30 palavras focado no impacto para negocios",
  "summaryExpanded": "analise de 3-6 linhas cobrindo: contexto, oportunidade de negocio, risco ou tendencia",
  "strategicAnalysis": "analise estrategica de 3-4 paragrafos conectando com frameworks de inovacao, impacto competitivo e acao pratica para lideres",
  "category": "uma das categorias: ia-negocios | empreendedorismo | inovacao-corporativa | estrategia-lideranca | mercados-investimentos | tecnologia-transformacao | cases-benchmarks | pdi-regulacao-fomentos",
  "relevanceScore": 0,
  "tags": ["array", "de", "3-6", "hashtags", "sem", "cerquilha"]
}`

export async function analyzeArticle(content: string, title: string, sourceUrl: string) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Analise este artigo e retorne o JSON estruturado:\n\nTITULO ORIGINAL: ${title}\nFONTE: ${sourceUrl}\nCONTEUDO: ${content.slice(0, 3000)}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text)
}
