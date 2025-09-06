# Guia de Deploy - App de Controle Financeiro

## 📋 Pré-requisitos

1. **Conta no Supabase**: [https://supabase.com](https://supabase.com)
2. **Conta no Vercel**: [https://vercel.com](https://vercel.com)
3. **Node.js 18+** instalado localmente

## 🗄️ Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha um nome para o projeto (ex: "grocery-app")
4. Defina uma senha forte para o banco
5. Selecione a região mais próxima
6. Clique em "Create new project"

### 2. Configurar o Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Copie todo o conteúdo do arquivo `supabase-schema.sql`
3. Cole no editor SQL e execute o script
4. Verifique se todas as tabelas foram criadas em **Table Editor**

### 3. Configurar Autenticação

1. Vá para **Authentication > Settings**
2. Em **Site URL**, adicione: `http://localhost:3000` (desenvolvimento)
3. Em **Redirect URLs**, adicione:
   - `http://localhost:3000` (desenvolvimento)
   - `https://seu-app.vercel.app` (produção - adicionar após deploy)
4. Habilite **Email** como provider de autenticação
5. Configure o template de email se necessário

### 4. Obter Credenciais

1. Vá para **Settings > API**
2. Copie:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

## 🚀 Deploy no Vercel

### 1. Preparar o Repositório

```bash
# Clonar ou inicializar repositório Git
git init
git add .
git commit -m "Initial commit"

# Conectar ao GitHub (opcional mas recomendado)
git remote add origin https://github.com/seu-usuario/grocery-app.git
git push -u origin main
```

### 2. Deploy via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Seguir as instruções:
# - Set up and deploy? Yes
# - Which scope? Sua conta
# - Link to existing project? No
# - Project name? grocery-app
# - Directory? ./
# - Override settings? No
```

### 3. Deploy via Dashboard Vercel

1. Acesse [https://vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Selecione o repositório do projeto
5. Configure as variáveis de ambiente (ver seção abaixo)
6. Clique em "Deploy"

### 4. Configurar Variáveis de Ambiente

No painel do Vercel, vá para **Settings > Environment Variables** e adicione:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 5. Atualizar URLs no Supabase

Após o deploy, volte ao Supabase:

1. **Authentication > Settings**
2. Adicione a URL do Vercel em:
   - **Site URL**: `https://seu-app.vercel.app`
   - **Redirect URLs**: `https://seu-app.vercel.app`

## 🔧 Desenvolvimento Local

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local`:

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 📱 Configuração PWA (Progressive Web App)

Para tornar o app instalável no mobile:

### 1. Adicionar ao `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // PWA Configuration
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
```

### 2. Criar `public/manifest.json`:

```json
{
  "name": "Controle Financeiro",
  "short_name": "FinanceApp",
  "description": "App para controle de gastos do mercado e contas mensais",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🔍 Verificação do Deploy

### Checklist Pós-Deploy:

- [ ] App carrega corretamente
- [ ] Autenticação funciona (registro e login)
- [ ] Todas as páginas são acessíveis
- [ ] Dados são salvos no Supabase
- [ ] Responsividade funciona no mobile
- [ ] Gráficos são exibidos corretamente

### Comandos Úteis:

```bash
# Verificar logs do Vercel
vercel logs

# Fazer redeploy
vercel --prod

# Verificar build local
npm run build
npm start
```

## 🐛 Solução de Problemas

### Erro de Autenticação:
- Verificar se as URLs estão corretas no Supabase
- Confirmar se as variáveis de ambiente estão definidas
- Verificar se o RLS está habilitado nas tabelas

### Erro de CORS:
- Adicionar domínio do Vercel nas configurações do Supabase
- Verificar se as políticas RLS estão corretas

### Erro de Build:
- Verificar se todas as dependências estão instaladas
- Confirmar se não há erros de TypeScript
- Verificar se as importações estão corretas

## 📞 Suporte

Em caso de problemas:

1. Verificar logs no Vercel Dashboard
2. Verificar logs no Supabase Dashboard
3. Consultar documentação oficial:
   - [Next.js](https://nextjs.org/docs)
   - [Supabase](https://supabase.com/docs)
   - [Vercel](https://vercel.com/docs)