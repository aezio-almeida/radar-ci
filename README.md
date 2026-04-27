# Radar CI — Código Intraempreendedor

Portal de inteligência estratégica sobre negócios, inovação, empreendedorismo e tecnologia.

## Stack
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Banco**: Supabase (PostgreSQL + Auth)
- **IA**: Anthropic Claude (análise e classificação)
- **Email**: Resend (OTP e notificações)
- **Deploy**: Vercel

## Setup rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie `.env.example` para `.env.local` e preencha:
```
NEXT_PUBLIC_SUPABASE_URL=https://aecxqwdedktqcznmmbav.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
ADMIN_EMAIL=aezio@codigointraempreendedor.com.br
CRON_SECRET=um-segredo-qualquer-aleatorio
```

### 3. Configurar banco de dados
- Abra o Supabase → SQL Editor
- Cole todo o conteúdo de `supabase-schema.sql` e execute

### 4. Rodar localmente
```bash
npm run dev
```

Acesse: http://localhost:3000

## URLs do sistema
- `/` → redireciona para /dashboard
- `/login` → cadastro e login
- `/dashboard` → feed principal
- `/admin` → painel administrativo (apenas você)

## Deploy na Vercel
1. Faça push do código para o GitHub
2. Importe o repositório na Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

## Adicionar subdomínio radar.codigointraempreendedor.com.br
No painel da Vercel → Settings → Domains → adicione o subdomínio
No seu provedor de DNS → adicione CNAME apontando para cname.vercel-dns.com
