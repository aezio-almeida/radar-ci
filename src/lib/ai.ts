import Anthropic from '@anthropic-ai/sdk'
import { Category } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Você é um analista sênior de inteligência estratégica em negócios, inovação e tecnologia. 
Sua função é analisar artigos e gerar curadoria estratégica em português brasileiro para executivos, founders, diretores e líderes sênior.

Você DEVE retornar APENAS um JSON válido (sem markdown, sem backticks) com esta estrutura exata:
{
  "titlePtBr": "título em PT-BR, máximo 15 palavras, impactante e informativo",
  "summaryCompact": "resumo de ~30 palavras focado no impacto para negócios",
  "summaryExpanded": "análise de 3-6 linhas cobrindo: contexto, oportunidade de negócio, risco ou tendência",
  "strategicAnalysis": "análise estratégica de 3-4 parágrafos conectando com frameworks de inovação, impacto competitivo e ação prática para líderes",
  "category": "uma das categorias: ia-negocios | empreendedorismo | inovacao-corporativa | estrategia-lideranca | mercados-investimentos | tecnologia-transformacao | cases-benchmarks | pdi-regulacao-fomentos",
  "relevanceScore": número de 0 a 100,
  "tags": ["array", "de", "3-6", "hashtags", "sem", "cerquilha"]
}`

export async function analyzeArticle(content: string, title: string, sourceUrl: string) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Analise este artigo e retorne o JSON estruturado:

T�TULO ORIGINAL: ${title}
FONTE: ${sourceUrl}
CONTEÚDO: ${content.slice(0, 3000)}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text)
}
